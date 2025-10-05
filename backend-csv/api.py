from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
import pandas as pd
import io
from joblib import load
import numpy as np

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

model = load("ExoPlanet_ClassifierXGBoost.joblib")
print("✅ XGBoost model loaded successfully!")

@app.get("/")
def home():
    return {"message": "Backend is running"}

@app.post("/predict_csv")
async def predict_csv(file: UploadFile = File(...)):
    # --- read CSV ---
    dataset = pd.read_csv(file.file)

    params = [
        "orbital_period",
        "planet_radius",
        "stellar_effective_temperature",
        "stellar_radius",
        "transit_depth",
        "transit_duration"
    ]
    X = dataset.reindex(columns=params, fill_value=0)

    # --- predictions ---
    probabilities = model.predict_proba(X)
    prophecy = model.predict(X)

    dataset["predictions"] = prophecy
    confidences, breakdowns = [], []

    for prob in probabilities:
        conf = round(float(max(prob)) * 100, 2)
        confidences.append(conf)
        breakdowns.append(
            f"{round(float(prob[0]) * 100, 2)}%, {round(float(prob[1]) * 100, 2)}%, {round(float(prob[2]) * 100, 2)}%"
        )

    dataset["confidence(%)"] = confidences
    dataset["probability_breakdown"] = breakdowns
    dataset["predictions"] = dataset["predictions"].map({
        0: "Candidate Planet",
        1: "Confirmed Planet",
        2: "False Positive"
    })

    summary = {
        "Candidate Planets": int((dataset["predictions"] == "Candidate Planet").sum()),
        "Confirmed Planets": int((dataset["predictions"] == "Confirmed Planet").sum()),
        "False Positives": int((dataset["predictions"] == "False Positive").sum()),
        "Average Confidence (%)": float(round(dataset["confidence(%)"].mean(), 2))
    }

    # --- save CSV to memory for later download ---
    output = io.StringIO()
    dataset.to_csv(output, index=False)
    output.seek(0)

    # store for /download_csv
    global last_csv
    last_csv = output.getvalue()

    return JSONResponse(content={"summary": summary, "message": "Prediction complete. Use /download_csv to get the file."})

@app.get("/download_csv")
def download_csv():
    """Downloads the most recently generated predictions CSV"""
    global last_csv
    if not last_csv:
        return JSONResponse(content={"error": "No CSV generated yet."}, status_code=400)

    return StreamingResponse(
        io.BytesIO(last_csv.encode()),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=predictions.csv"}
    )
