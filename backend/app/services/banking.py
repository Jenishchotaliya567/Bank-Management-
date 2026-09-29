import random
import datetime
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models import Customer, Account, Transaction
from app.schemas import CustomerCreate, CustomerUpdate, AccountCreate, DepositRequest, WithdrawalRequest, TransferRequest

def generate_account_number() -> str:
    return "ACC" + "".join([str(random.randint(0, 9)) for _ in range(10)])

def generate_tx_number() -> str:
    return "TXN" + datetime.datetime.utcnow().strftime("%Y%m%d%H%M%S") + str(random.randint(100, 999))

class BankingService:
    @staticmethod
    def create_customer(db: Session, customer_in: CustomerCreate) -> Customer:
        existing = db.query(Customer).filter(Customer.email == customer_in.email).first()
        if existing:
            raise HTTPException(status_code=400, detail="Customer with this email already exists.")
            
        customer = Customer(**customer_in.model_dump())
        db.add(customer)
        db.commit()
        db.refresh(customer)

        # Create a default Savings account for the new customer
        default_account = Account(
            account_number=generate_account_number(),
            customer_id=customer.id,
            account_type="Savings",
            balance=customer_in.balance,
            status="Active"
        )
        db.add(default_account)
        db.commit()
        db.refresh(default_account)

        if customer_in.balance > 0:
            tx = Transaction(
                transaction_number=generate_tx_number(),
                account_id=default_account.id,
                type="Deposit",
                amount=customer_in.balance,
                post_balance=customer_in.balance,
                description="Initial account deposit"
            )
            db.add(tx)
            db.commit()

        return customer

    @staticmethod
    def get_customers(db: Session, skip: int = 0, limit: int = 100):
        return db.query(Customer).offset(skip).limit(limit).all()

    @staticmethod
    def get_customer_by_id(db: Session, customer_id: int) -> Customer:
        customer = db.query(Customer).filter(Customer.id == customer_id).first()
        if not customer:
            raise HTTPException(status_code=404, detail="Customer not found.")
        return customer

    @staticmethod
    def update_customer(db: Session, customer_id: int, customer_in: CustomerUpdate) -> Customer:
        customer = BankingService.get_customer_by_id(db, customer_id)
        update_data = customer_in.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(customer, key, value)
        db.commit()
        db.refresh(customer)
        return customer

    @staticmethod
    def delete_customer(db: Session, customer_id: int):
        customer = BankingService.get_customer_by_id(db, customer_id)
        db.delete(customer)
        db.commit()
        return {"detail": "Customer deleted successfully."}

    # ACCOUNT SERVICES
    @staticmethod
    def create_account(db: Session, account_in: AccountCreate) -> Account:
        customer = BankingService.get_customer_by_id(db, account_in.customer_id)
        account = Account(
            account_number=generate_account_number(),
            customer_id=customer.id,
            account_type=account_in.account_type,
            balance=account_in.initial_deposit,
            status="Active"
        )
        db.add(account)
        db.commit()
        db.refresh(account)

        if account_in.initial_deposit > 0:
            tx = Transaction(
                transaction_number=generate_tx_number(),
                account_id=account.id,
                type="Deposit",
                amount=account_in.initial_deposit,
                post_balance=account_in.initial_deposit,
                description=f"Initial deposit for new {account_in.account_type} account"
            )
            db.add(tx)
            # Update overall customer balance
            customer.balance += account_in.initial_deposit
            db.commit()

        return account

    @staticmethod
    def get_accounts(db: Session, skip: int = 0, limit: int = 100):
        return db.query(Account).offset(skip).limit(limit).all()

    @staticmethod
    def get_account_by_number(db: Session, account_number: str) -> Account:
        account = db.query(Account).filter(Account.account_number == account_number).first()
        if not account:
            raise HTTPException(status_code=404, detail=f"Account '{account_number}' not found.")
        return account

    # TRANSACTION OPERATIONS
    @staticmethod
    def process_deposit(db: Session, req: DepositRequest) -> Transaction:
        account = BankingService.get_account_by_number(db, req.account_number)
        if account.status != "Active":
            raise HTTPException(status_code=400, detail="Cannot deposit into an inactive or closed account.")

        account.balance += req.amount
        # Also update customer's total aggregate balance
        if account.customer:
            account.customer.balance += req.amount

        tx = Transaction(
            transaction_number=generate_tx_number(),
            account_id=account.id,
            type="Deposit",
            amount=req.amount,
            post_balance=account.balance,
            description=req.description
        )
        db.add(tx)
        db.commit()
        db.refresh(tx)
        return tx

    @staticmethod
    def process_withdrawal(db: Session, req: WithdrawalRequest) -> Transaction:
        account = BankingService.get_account_by_number(db, req.account_number)
        if account.status != "Active":
            raise HTTPException(status_code=400, detail="Account is not active.")
        if account.balance < req.amount:
            raise HTTPException(status_code=400, detail="Insufficient account funds.")

        account.balance -= req.amount
        if account.customer:
            account.customer.balance -= req.amount

        tx = Transaction(
            transaction_number=generate_tx_number(),
            account_id=account.id,
            type="Withdrawal",
            amount=req.amount,
            post_balance=account.balance,
            description=req.description
        )
        db.add(tx)
        db.commit()
        db.refresh(tx)
        return tx

    @staticmethod
    def process_transfer(db: Session, req: TransferRequest):
        if req.sender_account_number == req.recipient_account_number:
            raise HTTPException(status_code=400, detail="Sender and recipient accounts cannot be identical.")

        sender_acc = BankingService.get_account_by_number(db, req.sender_account_number)
        recipient_acc = BankingService.get_account_by_number(db, req.recipient_account_number)

        if sender_acc.status != "Active" or recipient_acc.status != "Active":
            raise HTTPException(status_code=400, detail="Both accounts must be active for fund transfer.")

        if sender_acc.balance < req.amount:
            raise HTTPException(status_code=400, detail="Insufficient funds in sender account.")

        sender_acc.balance -= req.amount
        if sender_acc.customer:
            sender_acc.customer.balance -= req.amount

        recipient_acc.balance += req.amount
        if recipient_acc.customer:
            recipient_acc.customer.balance += req.amount

        tx_sender = Transaction(
            transaction_number=generate_tx_number(),
            account_id=sender_acc.id,
            type="Transfer Out",
            amount=req.amount,
            post_balance=sender_acc.balance,
            description=f"Transfer to {recipient_acc.account_number}: {req.description}"
        )
        tx_recipient = Transaction(
            transaction_number=generate_tx_number(),
            account_id=recipient_acc.id,
            type="Transfer In",
            amount=req.amount,
            post_balance=recipient_acc.balance,
            description=f"Transfer from {sender_acc.account_number}: {req.description}"
        )
        db.add(tx_sender)
        db.add(tx_recipient)
        db.commit()
        db.refresh(tx_sender)
        return tx_sender
