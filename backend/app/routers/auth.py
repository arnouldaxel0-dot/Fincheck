from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app import models, schemas
from app.auth import hash_password, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/api/auth", tags=["auth"])

@router.post("/register", response_model=schemas.UserOut, status_code=201)
async def register(payload: schemas.UserCreate, db: AsyncSession = Depends(get_db)):
    r = await db.execute(select(models.User).where(models.User.username == payload.username))
    if r.scalar_one_or_none():
        raise HTTPException(400, "Nom d'utilisateur déjà pris")
    user = models.User(username=payload.username, email=payload.email, hashed_password=hash_password(payload.password))
    db.add(user)
    await db.flush()
    await db.refresh(user)
    return user

@router.post("/login", response_model=schemas.Token)
async def login(payload: schemas.LoginRequest, db: AsyncSession = Depends(get_db)):
    r = await db.execute(select(models.User).where(models.User.username == payload.username))
    user = r.scalar_one_or_none()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Identifiant ou mot de passe incorrect")
    return {"access_token": create_access_token({"sub": user.username}), "token_type": "bearer"}

@router.get("/me", response_model=schemas.UserOut)
async def me(current_user: models.User = Depends(get_current_user)):
    return current_user
