from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=True)
    hashed_password = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    assets = relationship("Asset", back_populates="owner", cascade="all, delete-orphan")
    liabilities = relationship("Liability", back_populates="owner", cascade="all, delete-orphan")
    connectors = relationship("Connector", back_populates="owner", cascade="all, delete-orphan")


class Asset(Base):
    __tablename__ = "assets"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String(200), nullable=False)
    category = Column(String(50), nullable=False)
    value = Column(Float, nullable=False, default=0.0)
    currency = Column(String(10), default="EUR")
    institution = Column(String(200), nullable=True)
    description = Column(Text, nullable=True)
    isin = Column(String(20), nullable=True)
    quantity = Column(Float, nullable=True)
    purchase_price = Column(Float, nullable=True)
    is_manual = Column(Boolean, default=True)
    last_sync = Column(DateTime, nullable=True)
    connector_id = Column(Integer, ForeignKey("connectors.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    owner = relationship("User", back_populates="assets")
    history = relationship("AssetHistory", back_populates="asset", cascade="all, delete-orphan")


class Liability(Base):
    __tablename__ = "liabilities"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String(200), nullable=False)
    category = Column(String(50), nullable=False)
    initial_amount = Column(Float, nullable=False)
    remaining_amount = Column(Float, nullable=False)
    monthly_payment = Column(Float, nullable=True)
    interest_rate = Column(Float, nullable=True)
    start_date = Column(DateTime, nullable=True)
    end_date = Column(DateTime, nullable=True)
    institution = Column(String(200), nullable=True)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    owner = relationship("User", back_populates="liabilities")


class AssetHistory(Base):
    __tablename__ = "asset_history"
    id = Column(Integer, primary_key=True, index=True)
    asset_id = Column(Integer, ForeignKey("assets.id"), nullable=False)
    value = Column(Float, nullable=False)
    recorded_at = Column(DateTime, default=datetime.utcnow)
    asset = relationship("Asset", back_populates="history")


class NetWorthHistory(Base):
    __tablename__ = "networth_history"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    total_assets = Column(Float, nullable=False)
    total_liabilities = Column(Float, nullable=False)
    net_worth = Column(Float, nullable=False)
    recorded_at = Column(DateTime, default=datetime.utcnow)


class Connector(Base):
    __tablename__ = "connectors"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    provider = Column(String(50), nullable=False)
    display_name = Column(String(100), nullable=True)
    encrypted_token = Column(Text, nullable=True)
    phone_number = Column(String(20), nullable=True)
    is_active = Column(Boolean, default=True)
    last_sync = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    owner = relationship("User", back_populates="connectors")
