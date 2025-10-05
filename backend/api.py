from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import xgboost as xgb
import numpy as np
import os

app = FastAPI()

# Allow website access (CORS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the XGBoost model (scikit-learn wrapper)
MODEL_PATH = "ExoPlanet_ClassifierXGBoost.joblib"

if not os.path.exists(MODEL_PATH):
    raise FileNotFoundError("Model file not found. Please upload ExoPlanet_Classifier.joblib")

from joblib import load
model = load(MODEL_PATH)
print("✅ XGBoost model loaded successfully!")

@app.get("/")
def home():
    return {"message": "Backend is running!"}

@app.post("/predict")
async def predict(data: dict):
    # Extract and reshape inputs
    inputs = np.array(data["inputs"]).reshape(1, -1)

    # Predictions
    pred_num = int(model.predict(inputs)[0])
    proba = model.predict_proba(inputs)[0]

    # Labels
    labels = {
        0: "Candidate Planet",
        1: "Confirmed Planet",
        2: "False Positive"
    }

    confidence = round(float(proba[pred_num]) * 100, 2)

    breakdown = {
        "Candidate Planet": round(float(proba[0]) * 100, 2),
        "Confirmed Planet": round(float(proba[1]) * 100, 2),
        "False Positive": round(float(proba[2]) * 100, 2)
    }

    return {
        "prediction_label": labels[pred_num],
        "prediction_numeric": pred_num,
        "confidence_percent": confidence,
        "breakdown_percent": breakdown
    }
