from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models import Customer, Account, Transaction, PredictionLog, User
from app.services.auth import get_current_user

router = APIRouter(prefix="/api/dashboard", tags=["Banking Dashboard"])

@router.get("/stats")
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    total_customers = db.query(func.count(Customer.id)).scalar() or 0
    total_accounts = db.query(func.count(Account.id)).scalar() or 0
    total_balance = db.query(func.sum(Account.balance)).scalar() or 0.0

    total_deposits = db.query(func.sum(Transaction.amount)).filter(Transaction.type == "Deposit").scalar() or 0.0
    total_withdrawals = db.query(func.sum(Transaction.amount)).filter(Transaction.type == "Withdrawal").scalar() or 0.0

    recent_transactions = db.query(Transaction).order_by(Transaction.timestamp.desc()).limit(8).all()
    
    # Account type breakdown
    account_types = db.query(Account.account_type, func.count(Account.id)).group_by(Account.account_type).all()
    account_breakdown = {acc_type: count for acc_type, count in account_types}

    # Job distribution
    job_types = db.query(Customer.job, func.count(Customer.id)).group_by(Customer.job).all()
    job_breakdown = {j: c for j, c in job_types}

    # Prediction conversions
    total_predictions = db.query(func.count(PredictionLog.id)).scalar() or 0
    positive_predictions = db.query(func.count(PredictionLog.id)).filter(PredictionLog.prediction_result == 1).scalar() or 0

    return {
        "summary": {
            "total_customers": total_customers,
            "total_accounts": total_accounts,
            "total_balance": round(total_balance, 2),
            "total_deposits": round(total_deposits, 2),
            "total_withdrawals": round(total_withdrawals, 2),
            "total_predictions": total_predictions,
            "high_potential_subscribers": positive_predictions
        },
        "account_breakdown": account_breakdown,
        "job_breakdown": job_breakdown,
        "recent_transactions": [
            {
                "id": t.id,
                "transaction_number": t.transaction_number,
                "type": t.type,
                "amount": t.amount,
                "post_balance": t.post_balance,
                "description": t.description,
                "timestamp": t.timestamp.isoformat()
            } for t in recent_transactions
        ]
    }
