import os
import json
import joblib
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    roc_auc_score, confusion_matrix
)
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
import xgboost as xgb

def run_ml_pipeline():
    print("=" * 60)
    print("BANK MARKETING MACHINE LEARNING TRAINING PIPELINE")
    print("=" * 60)

    # Base directory calculation (backend/)
    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

    # 1. Load Dataset
    dataset_path = os.path.join(base_dir, "dataset", "bank-full.csv")
    print(f"[1/7] Loading dataset from '{dataset_path}'...")
    df = pd.read_csv(dataset_path, sep=";")
    print(f"Dataset shape: {df.shape[0]} rows, {df.shape[1]} columns")

    # 2. Dataset Overview & Data Cleaning
    print("[2/7] Analyzing & Cleaning Data...")
    initial_rows = len(df)
    df = df.drop_duplicates()
    print(f"Removed {initial_rows - len(df)} duplicate rows.")

    # Target Column
    target_col = "y"
    df["target"] = (df[target_col] == "yes").astype(int)
    X = df.drop(columns=[target_col, "target"])
    y = df["target"]

    print(f"Target distribution: 0 (No): {(y==0).sum()} ({((y==0).mean()*100):.2f}%), 1 (Yes): {(y==1).sum()} ({((y==1).mean()*100):.2f}%)")

    # Feature Categorization
    num_features = ["age", "balance", "day", "duration", "campaign", "pdays", "previous"]
    cat_features = ["job", "marital", "education", "default", "housing", "loan", "contact", "month", "poutcome"]

    # Extract Categorical Options for Frontend dynamic form generation
    cat_options = {col: sorted(X[col].unique().tolist()) for col in cat_features}
    num_ranges = {col: {"min": float(X[col].min()), "max": float(X[col].max()), "median": float(X[col].median())} for col in num_features}

    # 3. Preprocessing Pipeline Definition
    print("[3/7] Setting up Preprocessing Pipeline...")
    preprocessor = ColumnTransformer(
        transformers=[
            ("num", StandardScaler(), num_features),
            ("cat", OneHotEncoder(handle_unknown="ignore", sparse_output=False), cat_features)
        ]
    )

    # 4. Train-Test Split (Stratified 80/20)
    print("[4/7] Splitting dataset into 80% train and 20% test sets...")
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )

    # 5. Define Candidate Models
    models = {
        "Logistic Regression": LogisticRegression(max_iter=1000, random_state=42, class_weight="balanced"),
        "Decision Tree": DecisionTreeClassifier(max_depth=10, random_state=42, class_weight="balanced"),
        "Random Forest": RandomForestClassifier(n_estimators=100, max_depth=12, random_state=42, class_weight="balanced", n_jobs=-1),
        "Gradient Boosting": GradientBoostingClassifier(n_estimators=100, learning_rate=0.1, max_depth=5, random_state=42),
        "XGBoost": xgb.XGBClassifier(n_estimators=100, learning_rate=0.1, max_depth=5, random_state=42, scale_pos_weight=((y==0).sum()/(y==1).sum()), eval_metric="logloss")
    }

    # 6. Model Training & Comparison
    print("[5/7] Training candidate models & evaluating metrics...")
    model_results = {}
    best_model_name = None
    best_f1_score = -1.0
    best_pipeline = None

    for name, model_inst in models.items():
        pipeline = Pipeline(steps=[
            ("preprocessor", preprocessor),
            ("classifier", model_inst)
        ])
        pipeline.fit(X_train, y_train)

        y_pred = pipeline.predict(X_test)
        y_prob = pipeline.predict_proba(X_test)[:, 1]

        acc = float(accuracy_score(y_test, y_pred))
        prec = float(precision_score(y_test, y_pred))
        rec = float(recall_score(y_test, y_pred))
        f1 = float(f1_score(y_test, y_pred))
        roc_auc = float(roc_auc_score(y_test, y_prob))
        cm = confusion_matrix(y_test, y_pred).tolist()

        model_results[name] = {
            "accuracy": round(acc, 4),
            "precision": round(prec, 4),
            "recall": round(rec, 4),
            "f1_score": round(f1, 4),
            "roc_auc": round(roc_auc, 4),
            "confusion_matrix": cm
        }

        print(f" -> {name:20s} | Acc: {acc:.4f} | Prec: {prec:.4f} | Rec: {rec:.4f} | F1: {f1:.4f} | ROC-AUC: {roc_auc:.4f}")

        if f1 > best_f1_score:
            best_f1_score = f1
            best_model_name = name
            best_pipeline = pipeline

    print(f"\n[6/7] Selected Best Model: '{best_model_name}' with F1-Score: {best_f1_score:.4f}")

    # Extract Feature Names & Feature Importances from Best Model if available
    preproc_obj = best_pipeline.named_steps["preprocessor"]
    cat_encoder = preproc_obj.named_transformers_["cat"]
    encoded_cat_names = cat_encoder.get_feature_names_out(cat_features).tolist()
    all_feature_names = num_features + encoded_cat_names

    classifier_obj = best_pipeline.named_steps["classifier"]
    feature_importances = []
    if hasattr(classifier_obj, "feature_importances_"):
        importances = classifier_obj.feature_importances_
        feature_importances = sorted(
            [{"feature": name, "importance": float(imp)} for name, imp in zip(all_feature_names, importances)],
            key=lambda x: x["importance"], reverse=True
        )[:15]
    elif hasattr(classifier_obj, "coef_"):
        coefs = np.abs(classifier_obj.coef_[0])
        feature_importances = sorted(
            [{"feature": name, "importance": float(c)} for name, c in zip(all_feature_names, coefs)],
            key=lambda x: x["importance"], reverse=True
        )[:15]

    # 7. Save Models and Metadata
    print("[7/7] Saving model artifacts...")
    trained_models_dir = os.path.join(base_dir, "trained_models")
    os.makedirs(trained_models_dir, exist_ok=True)
    model_save_path = os.path.join(trained_models_dir, "bank_marketing_model.joblib")
    joblib.dump(best_pipeline, model_save_path)

    metadata = {
        "problem_type": "Classification",
        "task_name": "Bank Term Deposit Subscription Prediction",
        "target_column": target_col,
        "target_mapping": {0: "No (Will not subscribe)", 1: "Yes (Will subscribe)"},
        "selected_model": best_model_name,
        "metrics": model_results[best_model_name],
        "all_models_evaluated": model_results,
        "total_records": int(len(df)),
        "num_features": num_features,
        "cat_features": cat_features,
        "cat_options": cat_options,
        "num_ranges": num_ranges,
        "feature_importances": feature_importances,
        "class_distribution": {"no": int((y==0).sum()), "yes": int((y==1).sum())}
    }

    metadata_path = os.path.join(trained_models_dir, "model_metadata.json")
    with open(metadata_path, "w") as f:
        json.dump(metadata, f, indent=4)

    print(f"Saved best model pipeline to: {model_save_path}")
    print(f"Saved metadata to: {metadata_path}")
    print("ML Pipeline execution completed successfully!")

if __name__ == "__main__":
    run_ml_pipeline()
