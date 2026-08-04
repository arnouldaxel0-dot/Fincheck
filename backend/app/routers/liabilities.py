from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from datetime import datetime
from app.database import get_db
from app import models, schemas
from app.auth import get_current_user

router = APIRouter(prefix="/api/liabilities", tags=["liabilities"])
VALID = {"mortgage","consumer_loan","auto_loan","student_loan","other_loan"}

@router.get("", response_model=List[schemas.LiabilityOut])
async def list_liabilities(db=Depends(get_db), user=Depends(get_current_user)):
    r = await db.execute(select(models.Liability).where(models.Liability.user_id == user.id))
    return r.scalars().all()

@router.post("", response_model=schemas.LiabilityOut, status_code=201)
async def create_liability(payload: schemas.LiabilityCreate, db=Depends(get_db), user=Depends(get_current_user)):
    if payload.category not in VALID: raise HTTPException(400, "Catégorie invalide")
    item = models.Liability(user_id=user.id, **payload.model_dump())
    db.add(item)
    await db.flush()
    await db.refresh(item)
    return item

@router.put("/{lid}", response_model=schemas.LiabilityOut)
async def update_liability(lid: int, payload: schemas.LiabilityUpdate, db=Depends(get_db), user=Depends(get_current_user)):
    item = await _get(lid, user.id, db)
    for k, v in payload.model_dump(exclude_unset=True).items(): setattr(item, k, v)
    item.updated_at = datetime.utcnow()
    await db.refresh(item)
    return item

@router.delete("/{lid}", status_code=204)
async def delete_liability(lid: int, db=Depends(get_db), user=Depends(get_current_user)):
    await db.delete(await _get(lid, user.id, db))

async def _get(lid, uid, db):
    r = await db.execute(select(models.Liability).where(models.Liability.id == lid, models.Liability.user_id == uid))
    item = r.scalar_one_or_none()
    if not item: raise HTTPException(404, "Crédit introuvable")
    return item
