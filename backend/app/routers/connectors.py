from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from typing import List
from datetime import datetime
from app.database import get_db
from app import models, schemas
from app.auth import get_current_user
from app.config import settings
from app.connectors.trade_republic import TradeRepublicConnector, get_tr_connector, encrypt_token, decrypt_token

router = APIRouter(prefix="/api/connectors", tags=["connectors"])

@router.get("", response_model=List[schemas.ConnectorOut])
async def list_connectors(db=Depends(get_db), user=Depends(get_current_user)):
    r = await db.execute(select(models.Connector).where(models.Connector.user_id == user.id))
    return r.scalars().all()

@router.post("/trade-republic/init")
async def tr_init(payload: schemas.TRInitRequest, user=Depends(get_current_user)):
    result = await get_tr_connector(user.id).init_session(payload.phone_number, "")
    if result["status"] == "error": raise HTTPException(400, result["message"])
    return result

@router.post("/trade-republic/confirm-otp")
async def tr_confirm_otp(payload: schemas.TROTPRequest, db=Depends(get_db), user=Depends(get_current_user)):
    result = await get_tr_connector(user.id).confirm_otp(payload.otp_code)
    if result["status"] == "error": raise HTTPException(400, result["message"])
    enc = encrypt_token(result["credentials"], settings.SECRET_KEY)
    r = await db.execute(select(models.Connector).where(models.Connector.user_id == user.id, models.Connector.provider == "trade_republic"))
    conn = r.scalar_one_or_none()
    if conn:
        conn.encrypted_token = enc; conn.is_active = True; conn.last_sync = datetime.utcnow()
    else:
        db.add(models.Connector(user_id=user.id, provider="trade_republic", display_name="Trade Republic", encrypted_token=enc, phone_number=payload.phone_number, is_active=True, last_sync=datetime.utcnow()))
    return {"status": "success", "message": "Trade Republic connecté"}

@router.post("/trade-republic/sync")
async def tr_sync(db=Depends(get_db), user=Depends(get_current_user)):
    r = await db.execute(select(models.Connector).where(models.Connector.user_id == user.id, models.Connector.provider == "trade_republic", models.Connector.is_active == True))
    conn = r.scalar_one_or_none()
    if not conn or not conn.encrypted_token: raise HTTPException(404, "Trade Republic non connecté")
    try: creds = decrypt_token(conn.encrypted_token, settings.SECRET_KEY)
    except: raise HTTPException(400, "Session expirée, reconnectez-vous")
    result = await TradeRepublicConnector().fetch_portfolio(creds)
    if result["status"] == "error": raise HTTPException(400, result["message"])
    data = result.get("data", {})
    count = 0
    for pos in (data.get("positions", []) if isinstance(data, dict) else []):
        isin = pos.get("isin")
        ra = await db.execute(select(models.Asset).where(models.Asset.user_id == user.id, models.Asset.isin == isin))
        a = ra.scalar_one_or_none()
        if a: a.value = float(pos.get("netValue",0)); a.updated_at = a.last_sync = datetime.utcnow()
        else: db.add(models.Asset(user_id=user.id, name=pos.get("name","Inconnu"), category="stocks", value=float(pos.get("netValue",0)), isin=isin, institution="Trade Republic", is_manual=False, connector_id=conn.id, last_sync=datetime.utcnow()))
        count += 1
    conn.last_sync = datetime.utcnow()
    return {"status": "success", "synced": count}

@router.delete("/trade-republic")
async def tr_disconnect(db=Depends(get_db), user=Depends(get_current_user)):
    r = await db.execute(select(models.Connector).where(models.Connector.user_id == user.id, models.Connector.provider == "trade_republic"))
    conn = r.scalar_one_or_none()
    if conn: conn.encrypted_token = None; conn.is_active = False
    return {"status": "success"}
