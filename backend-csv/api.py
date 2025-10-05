from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import pandas as pd
import io
from joblib import load
import numpy as np

app = FastAPI()

# Allow access from your website
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # allow all origins for now
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load your XGBoost model (scikit-learn wrapper)
model = load("ExoPlanet_ClassifierXGBoost.joblib")
print("✅ XGBoost model loaded successfully!")

@app.get("/")
def home():
    return {"message": "Backend is running"}

@app.post("/predict_csv")
async def predict_csv(file: UploadFile = File(...)):
    dataset = pd.read_csv(file.file)

    # Columns expected by the model
    params = [
        "orbital_period",
        "planet_radius",
        "stellar_effective_temperature",
        "stellar_radius",
        "transit_depth",
        "transit_duration"
    ]

    # Safely select expected columns (fill missing ones with 0)
    X = dataset.reindex(columns=params, fill_value=0)

    # Model predictions
    probabilities = model.predict_proba(X)
    prophecy = model.predict(X)

    # Add predictions to dataset
    dataset["predictions"] = prophecy
    confidences = []
    breakdowns = []

    for prob in probabilities:
        conf = round(float(max(prob)) * 100, 2)
        confidences.append(conf)
        breakdowns.append(
            f"{round(float(prob[0]) * 100, 2)}%, {round(float(prob[1]) * 100, 2)}%, {round(float(prob[2]) * 100, 2)}%"
        )

    dataset["confidence(%)"] = confidences
    dataset["probability breakdown (Candidate, Confirmed, False Positive)"] = breakdowns
    dataset["predictions"] = dataset["predictions"].map({
        0: "Candidate Planet",
        1: "Confirmed Planet",
        2: "False Positive"
    })

    # --- SUMMARY STATS ---
    summary = {
        "Candidate Planets": int((dataset["predictions"] == "Candidate Planet").sum()),
        "Confirmed Planets": int((dataset["predictions"] == "Confirmed Planet").sum()),
        "False Positives": int((dataset["predictions"] == "False Positive").sum()),
        "Average Confidence (%)": float(round(dataset["confidence(%)"].mean(), 2))
    }

    # Convert DataFrame to CSV (as text)
    output = io.StringIO()
    dataset.to_csv(output, index=False)
    output.seek(0)
    csv_text = output.getvalue()

    # Return both summary + CSV safely
    return JSONResponse(content={
        "summary": summary,
        "csv": str(csv_text)
    })

