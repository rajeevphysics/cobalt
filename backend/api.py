from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from joblib import load
import numpy as np

app = FastAPI()

# Allow website access (CORS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all for now
    allow_methods=["*"],
    allow_headers=["*"],
)

import os
import requests
from joblib import load

MODEL_URL = "https://drive.google.com/uc?export=download&id=12rjb9yNzg1Jw8mFY22VXS4nEcbx_1Znw"
MODEL_PATH = "ExoPlanet_Classifier.joblib"

# Download model if not present locally
if not os.path.exists(MODEL_PATH):
    print("📦 Downloading model from Google Drive...")
    response = requests.get(MODEL_URL)
    response.raise_for_status()
    with open(MODEL_PATH, "wb") as f:
        f.write(response.content)
    print("✅ Model downloaded!")

# Load the model
model = load(MODEL_PATH)
print("✅ Model loaded successfully!")


@app.get("/")
def home():
    return {"message": "Backend is running!"}

@app.post("/predict")
async def predict(data: dict):
    # Extract inputs
    inputs = np.array(data["inputs"]).reshape(1, -1)

    # Make prediction
    pred_num = int(model.predict(inputs)[0])
    proba = model.predict_proba(inputs)[0]  # probability breakdown

    # Label mapping
    labels = {
        0: "Candidate Planet",
        1: "Confirmed Planet",
        2: "False Positive"
    }

    # Confidence for the predicted class
    confidence = round(float(proba[pred_num]) * 100, 2)

    # Build a breakdown dictionary
    breakdown = {
        "Candidate Planet": round(float(proba[0]) * 100, 2),
        "Confirmed Planet": round(float(proba[1]) * 100, 2),
        "False Positive": round(float(proba[2]) * 100, 2)
    }
    message = f"Your ExoPlanet is a {labels[pred_num]} ({confidence}% confident)."

    return {
        "prediction_label": labels[pred_num],
        "prediction_numeric": pred_num,
        "confidence_percent": confidence,
        "breakdown_percent": breakdown
    }


