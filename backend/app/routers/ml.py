from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import MLPredictionInput, MLPredictionResponse, ModelInfoResponse, ModelFeaturesResponse
from app.services.ml_service import MLService
from app.services.auth import get_current_user
from app.models import User, PredictionLog

router = APIRouter(prefix="/api/ml", tags=["Machine Learning"])

@router.post("/predict", response_model=MLPredictionResponse)
def predict_subscription(
    input_data: MLPredictionInput,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return MLService.predict(db, input_data, user_id=current_user.id)

@router.get("/model-info", response_model=ModelInfoResponse)
def get_model_information():
    return MLService.get_model_info()

@router.get("/features", response_model=ModelFeaturesResponse)
def get_model_features():
    return MLService.get_model_features()

@router.get("/history")
def get_prediction_history(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    logs = db.query(PredictionLog).order_by(PredictionLog.created_at.desc()).offset(skip).limit(limit).all()
    return [
        {
            "id": log.id,
            "customer_id": log.customer_id,
            "prediction_label": log.prediction_label,
            "confidence": log.confidence,
            "risk_level": log.risk_level,
            "input_features": log.input_features,
            "created_at": log.created_at.isoformat()
        }
        for log in logs
    ]
