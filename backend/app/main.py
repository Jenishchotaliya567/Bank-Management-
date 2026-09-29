import sys
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

# Add backend root directory to sys.path
sys.path.append(os.path.abspath(os.path.dirname(__file__)))

from app.database import engine, Base, SessionLocal
import app.models as models
from app.routers import auth, customers, accounts, transactions, dashboard, ml
from app.services.auth import get_password_hash
from app.services.banking import generate_account_number, generate_tx_number

# Create Database Tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Bank Management System & ML Analytics API",
    description="Full-stack FastAPI backend for Bank Management, Customer Accounts, Transactions, and Term Deposit Subscriptions ML Prediction.",
    version="1.0.0"
)

# CORS Middleware
origins = os.getenv("CORS_ORIGINS", "*").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router)
app.include_router(customers.router)
app.include_router(accounts.router)
app.include_router(transactions.router)
app.include_router(dashboard.router)
app.include_router(ml.router)

@app.on_event("startup")
def seed_initial_data():
    db = SessionLocal()
    try:
        # Check if Admin User exists
        admin = db.query(models.User).filter(models.User.email == "admin@bank.com").first()
        if not admin:
            print("[Startup] Seeding initial Admin User...")
            admin = models.User(
                full_name="Chief Executive Officer",
                email="admin@bank.com",
                hashed_password=get_password_hash("Admin123!"),
                role="admin"
            )
            db.add(admin)
            db.commit()

        # Check if sample customers exist
        customer_count = db.query(models.Customer).count()
        if customer_count == 0:
            print("[Startup] Seeding sample banking customers, accounts, and transactions...")
            sample_customers = [
                {
                    "first_name": "Eleanor", "last_name": "Vance", "email": "eleanor.vance@example.com",
                    "phone": "+1-555-0192", "age": 42, "job": "management", "marital": "married",
                    "education": "tertiary", "default_status": "no", "balance": 18450.0,
                    "housing_loan": "no", "personal_loan": "no", "contact_type": "cellular"
                },
                {
                    "first_name": "Marcus", "last_name": "Sterling", "email": "marcus.sterling@example.com",
                    "phone": "+1-555-0143", "age": 35, "job": "technician", "marital": "single",
                    "education": "secondary", "default_status": "no", "balance": 6200.0,
                    "housing_loan": "yes", "personal_loan": "no", "contact_type": "cellular"
                },
                {
                    "first_name": "Sophia", "last_name": "Chen", "email": "sophia.chen@example.com",
                    "phone": "+1-555-0188", "age": 58, "job": "retired", "marital": "married",
                    "education": "tertiary", "default_status": "no", "balance": 45100.0,
                    "housing_loan": "no", "personal_loan": "no", "contact_type": "telephone"
                },
                {
                    "first_name": "David", "last_name": "Miller", "email": "david.miller@example.com",
                    "phone": "+1-555-0122", "age": 29, "job": "blue-collar", "marital": "single",
                    "education": "secondary", "default_status": "no", "balance": 1450.0,
                    "housing_loan": "yes", "personal_loan": "yes", "contact_type": "cellular"
                }
            ]

            for c_data in sample_customers:
                cust = models.Customer(**c_data)
                db.add(cust)
                db.commit()
                db.refresh(cust)

                acc = models.Account(
                    account_number=generate_account_number(),
                    customer_id=cust.id,
                    account_type="Savings",
                    balance=cust.balance,
                    status="Active"
                )
                db.add(acc)
                db.commit()
                db.refresh(acc)

                tx = models.Transaction(
                    transaction_number=generate_tx_number(),
                    account_id=acc.id,
                    type="Deposit",
                    amount=cust.balance,
                    post_balance=cust.balance,
                    description="Initial balance setup"
                )
                db.add(tx)
                db.commit()

            print("[Startup] Initial dataset seeding completed successfully!")
    except Exception as e:
        print(f"[Startup] Error seeding data: {e}")
    finally:
        db.close()

@app.get("/")
def root():
    return {
        "status": "online",
        "system": "Bank Management System & ML Analytics API",
        "docs_url": "/docs"
    }
