from fastapi import APIRouter, Depends
from sqlalchemy import select, func
from typing import List
from datetime import datetime, timedelta
from app.database import get_db
from app import models, schemas
from app.auth import get_current_user

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])
LABELS = {"bank_account":"Comptes bancaires","savings":"Épargne","stocks":"Actions / ETF","crypto":"Crypto-monnaies","real_estate":"Immobilier","bonds":"Obligations"}

@router.get("/summary", response_model=schemas.DashboardSummary)
async def get_summary(db=Depends(get_db), user=Depends(get_current_user)):
    r = await db.execute(select(models.Asset.category, func.sum(models.Asset.value)).where(models.Asset.user_id == user.id).group_by(models.Asset.category))
    by_cat = {row[0]: row[1] for row in r.all()}
    total_assets = sum(by_cat.values()) if by_cat else 0.0
    r2 = await db.execute(select(func.sum(models.Liability.remaining_amount)).where(models.Liability.user_id == user.id))
    total_liabilities = r2.scalar() or 0.0
    r3 = await db.execute(select(func.sum(models.Liability.monthly_payment)).where(models.Liability.user_id == user.id))
    monthly = r3.scalar() or 0.0
    cats = []
    for cat, label in LABELS.items():
        total = by_cat.get(cat, 0.0)
        r4 = await db.execute(select(func.count(models.Asset.id)).where(models.Asset.user_id == user.id, models.Asset.category == cat))
        count = r4.scalar() or 0
        cats.append(schemas.CategorySummary(category=cat, label=label, total=total, percentage=round((total/total_assets*100) if total_assets>0 else 0, 1), count=count))
    return schemas.DashboardSummary(total_assets=total_assets, total_liabilities=total_liabilities, net_worth=total_assets-total_liabilities, assets_by_category=cats, monthly_payments=monthly)

@router.get("/networth-history", response_model=List[schemas.NetWorthPoint])
async def get_history(days: int = 180, db=Depends(get_db), user=Depends(get_current_user)):
    since = datetime.utcnow() - timedelta(days=days)
    r = await db.execute(select(models.NetWorthHistory).where(models.NetWorthHistory.user_id == user.id, models.NetWorthHistory.recorded_at >= since).order_by(models.NetWorthHistory.recorded_at))
    return [schemas.NetWorthPoint(date=h.recorded_at.strftime("%Y-%m-%d"), total_assets=h.total_assets, total_liabilities=h.total_liabilities, net_worth=h.net_worth) for h in r.scalars().all()]

@router.post("/snapshot", status_code=201)
async def snapshot(db=Depends(get_db), user=Depends(get_current_user)):
    r1 = await db.execute(select(func.sum(models.Asset.value)).where(models.Asset.user_id == user.id))
    r2 = await db.execute(select(func.sum(models.Liability.remaining_amount)).where(models.Liability.user_id == user.id))
    ta = r1.scalar() or 0.0; tl = r2.scalar() or 0.0
    db.add(models.NetWorthHistory(user_id=user.id, total_assets=ta, total_liabilities=tl, net_worth=ta-tl))
    return {"message": "Snapshot enregistré", "net_worth": ta-tl}
