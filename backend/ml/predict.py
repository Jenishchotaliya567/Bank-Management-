import os
import json
import joblib
import pandas as pd
import numpy as np

class BankingPredictor:
    def __init__(self, model_dir: str = None):
        if model_dir is None:
            model_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "trained_models"))
            
        self.model_path = os.path.join(model_dir, "bank_marketing_model.joblib")
        self.metadata_path = os.path.join(model_dir, "model_metadata.json")
        
        if not os.path.exists(self.model_path) or not os.path.exists(self.metadata_path):
            raise FileNotFoundError(f"Model or metadata files not found in {model_dir}")
            
        self.pipeline = joblib.load(self.model_path)
        with open(self.metadata_path, "r") as f:
            self.metadata = json.load(f)
            
    def get_metadata(self):
        return self.metadata

    def predict_single(self, input_data: dict) -> dict:
        df_input = pd.DataFrame([input_data])
        
        expected_cols = self.metadata["num_features"] + self.metadata["cat_features"]
        for col in expected_cols:
            if col not in df_input.columns:
                if col in self.metadata["num_features"]:
                    df_input[col] = self.metadata["num_ranges"][col]["median"]
                else:
                    df_input[col] = self.metadata["cat_options"][col][0]
                    
        df_input = df_input[expected_cols]
        
        pred_class = int(self.pipeline.predict(df_input)[0])
        probabilities = self.pipeline.predict_proba(df_input)[0]
        prob_yes = float(probabilities[1])
        prob_no = float(probabilities[0])
        
        if prob_yes >= 0.7:
            risk_level = "High Potential (Strong Suscriber candidate)"
        elif prob_yes >= 0.4:
            risk_level = "Medium Potential (Moderate Suscriber candidate)"
        else:
            risk_level = "Low Potential (Unlikely Suscriber)"
            
        key_factors = []
        if input_data.get("poutcome") == "success":
            key_factors.append("Previous campaign outcome was successful (+Strong Positive)")
        if input_data.get("duration", 0) > 300:
            key_factors.append("High call duration (>5 mins) indicates high interest")
        if input_data.get("housing") == "no":
            key_factors.append("No existing housing loan increases term deposit likelihood")
        if input_data.get("balance", 0) > 2000:
            key_factors.append("High account balance increases deposit potential")

        if not key_factors:
            key_factors.append("Standard demographic & behavioral profile")

        return {
            "prediction": pred_class,
            "prediction_label": "Yes (Subscribe)" if pred_class == 1 else "No (Do Not Subscribe)",
            "probability_yes": round(prob_yes, 4),
            "probability_no": round(prob_no, 4),
            "confidence_percentage": round(prob_yes * 100 if pred_class == 1 else prob_no * 100, 2),
            "risk_level": risk_level,
            "key_factors": key_factors,
            "model_name": self.metadata["selected_model"]
        }

if __name__ == "__main__":
    predictor = BankingPredictor()
    sample_data = {
        "age": 45, "job": "management", "marital": "married", "education": "tertiary",
        "default": "no", "balance": 5000, "housing": "no", "loan": "no",
        "contact": "cellular", "day": 15, "month": "may", "duration": 450,
        "campaign": 1, "pdays": -1, "previous": 0, "poutcome": "unknown"
    }
    result = predictor.predict_single(sample_data)
    print("Sample Prediction Result:", json.dumps(result, indent=2))
