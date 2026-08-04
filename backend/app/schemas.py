from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class UserCreate(BaseModel):
    username: str
    email: Optional[str] = None
    password: str

class UserOut(BaseModel):
    id: int
    username: str
    email: Optional[str]
    created_at: datetime
    model_config = {"from_attributes": True}

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class LoginRequest(BaseModel):
    username: str
    password: str

class AssetCreate(BaseModel):
    name: str
    category: str
    value: float
    currency: str = "EUR"
    institution: Optional[str] = None
    description: Optional[str] = None
    isin: Optional[str] = None
    quantity: Optional[float] = None
    purchase_price: Optional[float] = None

class AssetUpdate(BaseModel):
    name: Optional[str] = None
    value: Optional[float] = None
    currency: Optional[str] = None
    institution: Optional[str] = None
    description: Optional[str] = None
    isin: Optional[str] = None
    quantity: Optional[float] = None
    purchase_price: Optional[float] = None

class AssetOut(BaseModel):
    id: int
    name: str
    category: str
    value: float
    currency: str
    institution: Optional[str]
    description: Optional[str]
    isin: Optional[str]
    quantity: Optional[float]
    purchase_price: Optional[float]
    is_manual: bool
    last_sync: Optional[datetime]
    created_at: datetime
    updated_at: datetime
    model_config = {"from_attributes": True}

class LiabilityCreate(BaseModel):
    name: str
    category: str
    initial_amount: float
    remaining_amount: float
    monthly_payment: Optional[float] = None
    interest_rate: Optional[float] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    institution: Optional[str] = None
    description: Optional[str] = None

class LiabilityUpdate(BaseModel):
    name: Optional[str] = None
    remaining_amount: Optional[float] = None
    monthly_payment: Optional[float] = None
    interest_rate: Optional[float] = None
    end_date: Optional[datetime] = None
    institution: Optional[str] = None
    description: Optional[str] = None

class LiabilityOut(BaseModel):
    id: int
    name: str
    category: str
    initial_amount: float
    remaining_amount: float
    monthly_payment: Optional[float]
    interest_rate: Optional[float]
    start_date: Optional[datetime]
    end_date: Optional[datetime]
    institution: Optional[str]
    description: Optional[str]
    created_at: datetime
    updated_at: datetime
    model_config = {"from_attributes": True}

class CategorySummary(BaseModel):
    category: str
    label: str
    total: float
    percentage: float
    count: int

class DashboardSummary(BaseModel):
    total_assets: float
    total_liabilities: float
    net_worth: float
    assets_by_category: List[CategorySummary]
    monthly_payments: float

class NetWorthPoint(BaseModel):
    date: str
    total_assets: float
    total_liabilities: float
    net_worth: float

class TRInitRequest(BaseModel):
    phone_number: str

class TROTPRequest(BaseModel):
    phone_number: str
    otp_code: str

class ConnectorOut(BaseModel):
    id: int
    provider: str
    display_name: Optional[str]
    is_active: bool
    last_sync: Optional[datetime]
    created_at: datetime
    model_config = {"from_attributes": True}

class AssetHistoryOut(BaseModel):
    id: int
    asset_id: int
    value: float
    recorded_at: datetime
    model_config = {"from_attributes": True}
