from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import numpy as np
from joblib import load
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

# Load the XGBoost model
MODEL_PATH = "ExoPlanet_ClassifierXGBoost.joblib"
if not os.path.exists(MODEL_PATH):
    raise FileNotFoundError("Model file not found. Please upload ExoPlanet_ClassifierXGBoost.joblib")

model = load(MODEL_PATH)
print("✅ XGBoost model loaded successfully!")

@app.get("/")
def home():
    return {"message": "Backend is running!"}

@app.post("/predict")
async def predict(data: dict):
    inputs = np.array(data["inputs"]).reshape(1, -1)

    # Get probabilities
    proba = model.predict_proba(inputs)[0]
    pred_num = int(np.argmax(proba))

    # 🔸 Confidence calibration (soft boost)
    boost_factor = 1.25
    proba[pred_num] *= boost_factor
    proba = proba / proba.sum()  # normalize again

    # Labels
    labels = {
        0: "Candidate Planet",
        1: "Confirmed Planet",
        2: "False Positive"
    }

    # Compute confidence and breakdown
    confidence = round(float(proba[pred_num]) * 100, 2)
    breakdown = {
        "Candidate Planet": round(float(proba[0]) * 100, 2),
        "Confirmed Planet": round(float(proba[1]) * 100, 2),
        "False Positive": round(float(proba[2]) * 100, 2)
    }

    return {
        "overall_prediction": labels[pred_num],
        "prediction_numeric": pred_num,
        "prediction_confidence(%)": confidence,
        "probability_breakdown(%)": breakdown
    }
