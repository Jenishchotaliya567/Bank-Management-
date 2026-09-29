import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, EmailStr, Field

# --- AUTH SCHEMAS ---
class UserCreate(BaseModel):
    full_name: str
    email: EmailStr
    password: str
    role: Optional[str] = "bank_manager"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    full_name: str
    email: str
    role: str
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

# --- CUSTOMER SCHEMAS ---
class CustomerBase(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    phone: Optional[str] = None
    age: int = Field(..., ge=18, le=100)
    job: str
    marital: str
    education: str
    default_status: str = "no"
    balance: float = 0.0
    housing_loan: str = "no"
    personal_loan: str = "no"
    contact_type: str = "cellular"

class CustomerCreate(CustomerBase):
    pass

class CustomerUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    age: Optional[int] = None
    job: Optional[str] = None
    marital: Optional[str] = None
    education: Optional[str] = None
    default_status: Optional[str] = None
    balance: Optional[float] = None
    housing_loan: Optional[str] = None
    personal_loan: Optional[str] = None
    contact_type: Optional[str] = None

class CustomerResponse(CustomerBase):
    id: int
    created_at: datetime.datetime

    class Config:
        from_attributes = True

# --- ACCOUNT SCHEMAS ---
class AccountCreate(BaseModel):
    customer_id: int
    account_type: str = "Savings" # Savings, Checking, Term Deposit
    initial_deposit: float = Field(0.0, ge=0.0)

class AccountUpdate(BaseModel):
    account_type: Optional[str] = None
    status: Optional[str] = None

class AccountResponse(BaseModel):
    id: int
    account_number: str
    customer_id: int
    account_type: str
    balance: float
    status: str
    created_at: datetime.datetime

    class Config:
        from_attributes = True

# --- TRANSACTION SCHEMAS ---
class DepositRequest(BaseModel):
    account_number: str
    amount: float = Field(..., gt=0.0)
    description: Optional[str] = "Deposit transaction"

class WithdrawalRequest(BaseModel):
    account_number: str
    amount: float = Field(..., gt=0.0)
    description: Optional[str] = "Withdrawal transaction"

class TransferRequest(BaseModel):
    sender_account_number: str
    recipient_account_number: str
    amount: float = Field(..., gt=0.0)
    description: Optional[str] = "Fund transfer"

class TransactionResponse(BaseModel):
    id: int
    transaction_number: str
    account_id: int
    type: str
    amount: float
    post_balance: float
    description: Optional[str]
    timestamp: datetime.datetime

    class Config:
        from_attributes = True

# --- ML SCHEMAS ---
class MLPredictionInput(BaseModel):
    customer_id: Optional[int] = None
    age: int = Field(35, ge=18, le=100)
    job: str = "management"
    marital: str = "married"
    education: str = "tertiary"
    default: str = "no"
    balance: float = 1000.0
    housing: str = "no"
    loan: str = "no"
    contact: str = "cellular"
    day: int = Field(15, ge=1, le=31)
    month: str = "may"
    duration: int = Field(300, ge=0)
    campaign: int = Field(1, ge=1)
    pdays: int = Field(-1)
    previous: int = Field(0, ge=0)
    poutcome: str = "unknown"

class MLPredictionResponse(BaseModel):
    prediction: int
    prediction_label: str
    probability_yes: float
    probability_no: float
    confidence_percentage: float
    risk_level: str
    key_factors: List[str]
    model_name: str

class ModelInfoResponse(BaseModel):
    problem_type: str
    task_name: str
    target_column: str
    selected_model: str
    metrics: Dict[str, Any]
    all_models_evaluated: Dict[str, Any]
    total_records: int
    feature_importances: List[Dict[str, Any]]

class ModelFeaturesResponse(BaseModel):
    num_features: List[str]
    cat_features: List[str]
    cat_options: Dict[str, List[str]]
    num_ranges: Dict[str, Dict[str, float]]
