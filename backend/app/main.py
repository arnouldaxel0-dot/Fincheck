from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.database import init_db
from app.config import settings
from app.routers import auth, assets, liabilities, dashboard, connectors

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield

app = FastAPI(title="Fincheck API", version="1.0.0", lifespan=lifespan)
app.add_middleware(CORSMiddleware, allow_origins=settings.origins, allow_credentials=True, allow_methods=["*"], allow_headers=["*"])
app.include_router(auth.router)
app.include_router(assets.router)
app.include_router(liabilities.router)
app.include_router(dashboard.router)
app.include_router(connectors.router)

@app.get("/")
async def root():
    return {"message": "Fincheck API en ligne", "docs": "/docs"}
