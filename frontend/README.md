# 🏦 ApexBank - Intelligent Bank Management & Machine Learning Platform

ApexBank is an enterprise full-stack Bank Management System integrated with an AI/ML predictive analytics engine. It enables financial institutions to manage customer demographics, deposit accounts, fund transfers, and predict client propensity to subscribe to long-term financial products (**Term Deposits**) in real time using high-performance Machine Learning (**XGBoost Classifier**).

---

## 📁 Clean Project Structure (`backend/` & `frontend/`)

```
Ml project/
│
├── backend/                          # COMPLETE BACKEND & ML PIPELINE
│   ├── app/                          # FastAPI Web Application & REST Routers
│   │   ├── main.py                   # App entrypoint, CORS & DB Seeding
│   │   ├── database.py               # SQLAlchemy SQLite Engine & Session
│   │   ├── models/                   # DB Schema Models (User, Customer, Account, Transaction, PredictionLog)
│   │   ├── schemas/                  # Pydantic Schemas for Validation
│   │   ├── services/                 # Auth (JWT), Banking Logic & ML Predictor Services
│   │   └── routers/                  # API Controllers (auth, customers, accounts, transactions, dashboard, ml)
│   ├── dataset/
│   │   └── bank-full.csv             # Cleaned UCI Bank Marketing Dataset
│   ├── ml/
│   │   ├── train_model.py            # Automated ML Training, Tuning & Evaluation Pipeline
│   │   └── predict.py                # Reusable XGBoost Inference Engine
│   ├── trained_models/
│   │   ├── bank_marketing_model.joblib # Trained XGBoost Pipeline Model
│   │   └── model_metadata.json       # Feature Schema & Metrics Metadata
│   ├── bank_system.db                # SQLite Database File
│   ├── requirements.txt              # Python Dependencies
│   └── .env.example                  # Environment Configuration Template
│
├── frontend/                         # MODERN REACT VITE FRONTEND
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   └── src/
│       ├── main.jsx                  # React Entry Point
│       ├── App.jsx                   # React Router & Protected Layout
│       ├── index.css                 # Custom Glassmorphic Design System
│       ├── components/               # Reusable UI (Navbar, Sidebar, StatCard, Modal, Toast, Charts)
│       ├── context/                  # AuthContext for JWT State
│       ├── services/                 # Centralized Axios API Client
│       └── pages/                    # Login, Register, Dashboard, Customers, CustomerDetails,
│                                     # Accounts, Transactions, MLPrediction, MLResults, Analytics, Profile
│
└── README.md                         # Comprehensive System Documentation
```

---

## 📊 Dataset Analysis & ML Problem Identification

### 1. Dataset Overview
- **Dataset Location**: `backend/dataset/bank-full.csv` (UCI Bank Marketing Dataset)
- **Total Rows**: `45,211`
- **Total Columns**: `17`
- **Duplicate Records**: `0`
- **Missing Values**: `0` nulls (`unknown` categorical values handled as informative categories)
- **PII Check**: Clean anonymized bank customer marketing dataset.

### 2. ML Target & Problem Type
- **Target Column**: `y` (Term Deposit Subscription: `yes` / `no`)
- **Problem Type**: **Binary Classification**
- **Justification**: Target is binary (`yes`/`no`). Classification enables the bank to evaluate customer subscription propensity, optimize marketing ROI, and assign client lead priority.

---

## 🤖 ML Pipeline & Model Benchmarks

Evaluation results on 80% train / 20% test stratified split:

| Model Architecture | Accuracy | Precision | Recall | F1-Score | ROC-AUC | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **XGBoost (SELECTED)** | **85.15%** | **43.33%** | **87.52%** | **0.5797** | **93.01%** | **Selected Best** |
| Random Forest | 84.46% | 41.96% | 85.54% | 0.5630 | 92.46% | Evaluated |
| Gradient Boosting | 91.02% | 66.80% | 46.22% | 0.5464 | 93.22% | Evaluated |
| Logistic Regression | 84.57% | 41.82% | 81.47% | 0.5527 | 90.79% | Evaluated |
| Decision Tree | 83.01% | 39.34% | 83.36% | 0.5345 | 86.44% | Evaluated |

---

## ⚡ How to Run

### 1. Train / Re-train ML Model
```bash
python backend/ml/train_model.py
```

### 2. Run Backend REST API Server
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```
*API docs: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)*

### 3. Run Frontend Dev Server
```bash
cd frontend
npm install
npm run dev
```
*Web Portal: [http://localhost:5173](http://localhost:5173)*

### 🔑 Manager Login Credentials
- **Email**: `admin@bank.com`
- **Password**: `Admin123!`
