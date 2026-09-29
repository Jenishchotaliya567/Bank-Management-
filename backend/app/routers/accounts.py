from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import AccountCreate, AccountUpdate, AccountResponse
from app.services.banking import BankingService
from app.services.auth import get_current_user
from app.models import User

router = APIRouter(prefix="/api/accounts", tags=["Bank Accounts"])

@router.post("", response_model=AccountResponse, status_code=status.HTTP_201_CREATED)
def create_account(
    account_in: AccountCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return BankingService.create_account(db, account_in)

@router.get("", response_model=List[AccountResponse])
def get_accounts(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return BankingService.get_accounts(db, skip=skip, limit=limit)

@router.get("/{account_number}", response_model=AccountResponse)
def get_account(
    account_number: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return BankingService.get_account_by_number(db, account_number)
