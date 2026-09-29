from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Transaction, User
from app.schemas import DepositRequest, WithdrawalRequest, TransferRequest, TransactionResponse
from app.services.banking import BankingService
from app.services.auth import get_current_user

router = APIRouter(prefix="/api/transactions", tags=["Banking Transactions"])

@router.post("/deposit", response_model=TransactionResponse)
def deposit(
    req: DepositRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return BankingService.process_deposit(db, req)

@router.post("/withdrawal", response_model=TransactionResponse)
def withdrawal(
    req: WithdrawalRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return BankingService.process_withdrawal(db, req)

@router.post("/transfer", response_model=TransactionResponse)
def transfer(
    req: TransferRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return BankingService.process_transfer(db, req)

@router.get("", response_model=List[TransactionResponse])
def get_transactions(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Transaction).order_by(Transaction.timestamp.desc()).offset(skip).limit(limit).all()
