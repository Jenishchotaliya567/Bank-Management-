import os
import sys
from sqlalchemy.orm import Session
from app.models import PredictionLog, Customer
from app.schemas import MLPredictionInput, MLPredictionResponse

# Add backend root directory to sys.path to import ml package cleanly
backend_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
if backend_root not in sys.path:
    sys.path.insert(0, backend_root)

from ml.predict import BankingPredictor

try:
    predictor = BankingPredictor(model_dir=os.path.join(backend_root, "trained_models"))
except Exception as e:
    print(f"Warning loading ML predictor: {e}")
    predictor = None

class MLService:
    @staticmethod
    def get_model_info():
        if not predictor:
            raise RuntimeError("ML model is not loaded.")
        return predictor.get_metadata()

    @staticmethod
    def get_model_features():
        if not predictor:
            raise RuntimeError("ML model is not loaded.")
        meta = predictor.get_metadata()
        return {
            "num_features": meta["num_features"],
            "cat_features": meta["cat_features"],
            "cat_options": meta["cat_options"],
            "num_ranges": meta["num_ranges"]
        }

    @staticmethod
    def predict(db: Session, input_data: MLPredictionInput, user_id: int = None) -> MLPredictionResponse:
        if not predictor:
            raise RuntimeError("ML model is not loaded.")
            
        input_dict = input_data.model_dump(exclude={"customer_id"})
        result = predictor.predict_single(input_dict)

        try:
            log_entry = PredictionLog(
                user_id=user_id,
                customer_id=input_data.customer_id,
                input_features=input_dict,
                prediction_result=result["prediction"],
                prediction_label=result["prediction_label"],
                probability=result["probability_yes"],
                confidence=result["confidence_percentage"],
                risk_level=result["risk_level"]
            )
            db.add(log_entry)
            db.commit()
        except Exception as e:
            print(f"Error logging prediction: {e}")

        return MLPredictionResponse(**result)
