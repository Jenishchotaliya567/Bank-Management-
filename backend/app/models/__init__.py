import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(20), default="bank_manager")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String(50), nullable=False)
    last_name = Column(String(50), nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    phone = Column(String(20), nullable=True)
    age = Column(Integer, nullable=False)
    job = Column(String(50), nullable=False)
    marital = Column(String(20), nullable=False)
    education = Column(String(30), nullable=False)
    default_status = Column(String(5), default="no") # credit default status ('yes'/'no')
    balance = Column(Float, default=0.0) # total aggregate customer balance
    housing_loan = Column(String(5), default="no")
    personal_loan = Column(String(5), default="no")
    contact_type = Column(String(20), default="cellular")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    accounts = relationship("Account", back_populates="customer", cascade="all, delete-orphan")
    predictions = relationship("PredictionLog", back_populates="customer", cascade="all, delete-orphan")

class Account(Base):
    __tablename__ = "accounts"

    id = Column(Integer, primary_key=True, index=True)
    account_number = Column(String(20), unique=True, index=True, nullable=False)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False)
    account_type = Column(String(30), default="Savings") # Savings, Checking, Term Deposit
    balance = Column(Float, default=0.0)
    status = Column(String(20), default="Active") # Active, Inactive, Closed
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    customer = relationship("Customer", back_populates="accounts")
    transactions = relationship("Transaction", back_populates="account", cascade="all, delete-orphan")

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    transaction_number = Column(String(30), unique=True, index=True, nullable=False)
    account_id = Column(Integer, ForeignKey("accounts.id"), nullable=False)
    type = Column(String(20), nullable=False) # Deposit, Withdrawal, Transfer
    amount = Column(Float, nullable=False)
    post_balance = Column(Float, nullable=False)
    description = Column(String(255), nullable=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

    account = relationship("Account", back_populates="transactions")

class PredictionLog(Base):
    __tablename__ = "prediction_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=True)
    input_features = Column(JSON, nullable=False)
    prediction_result = Column(Integer, nullable=False)
    prediction_label = Column(String(50), nullable=False)
    probability = Column(Float, nullable=False)
    confidence = Column(Float, nullable=False)
    risk_level = Column(String(100), nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    customer = relationship("Customer", back_populates="predictions")
