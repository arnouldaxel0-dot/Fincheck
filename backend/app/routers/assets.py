from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from datetime import datetime
from app.database import get_db
from app import models, schemas
from app.auth import get_current_user

router = APIRouter(prefix="/api/assets", tags=["assets"])
VALID = {"bank_account","savings","stocks","crypto","real_estate","bonds"}

@router.get("", response_model=List[schemas.AssetOut])
async def list_assets(db=Depends(get_db), user=Depends(get_current_user)):
    r = await db.execute(select(models.Asset).where(models.Asset.user_id == user.id))
    return r.scalars().all()

@router.post("", response_model=schemas.AssetOut, status_code=201)
async def create_asset(payload: schemas.AssetCreate, db=Depends(get_db), user=Depends(get_current_user)):
    if payload.category not in VALID: raise HTTPException(400, "Catégorie invalide")
    asset = models.Asset(user_id=user.id, **payload.model_dump())
    db.add(asset)
    await db.flush()
    db.add(models.AssetHistory(asset_id=asset.id, value=asset.value))
    await db.refresh(asset)
    return asset

@router.put("/{aid}", response_model=schemas.AssetOut)
async def update_asset(aid: int, payload: schemas.AssetUpdate, db=Depends(get_db), user=Depends(get_current_user)):
    asset = await _get(aid, user.id, db)
    old = asset.value
    for k, v in payload.model_dump(exclude_unset=True).items(): setattr(asset, k, v)
    asset.updated_at = datetime.utcnow()
    if payload.value is not None and payload.value != old:
        db.add(models.AssetHistory(asset_id=asset.id, value=asset.value))
    await db.refresh(asset)
    return asset

@router.delete("/{aid}", status_code=204)
async def delete_asset(aid: int, db=Depends(get_db), user=Depends(get_current_user)):
    await db.delete(await _get(aid, user.id, db))

@router.get("/{aid}/history", response_model=List[schemas.AssetHistoryOut])
async def get_history(aid: int, db=Depends(get_db), user=Depends(get_current_user)):
    await _get(aid, user.id, db)
    r = await db.execute(select(models.AssetHistory).where(models.AssetHistory.asset_id == aid).order_by(models.AssetHistory.recorded_at))
    return r.scalars().all()

async def _get(aid, uid, db):
    r = await db.execute(select(models.Asset).where(models.Asset.id == aid, models.Asset.user_id == uid))
    a = r.scalar_one_or_none()
    if not a: raise HTTPException(404, "Actif introuvable")
    return a
