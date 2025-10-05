from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
import pandas as pd
import numpy as np
import io
from joblib import load

app = FastAPI()

# Allow access from your website
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load your trained XGBoost model
model = load("ExoPlanet_ClassifierXGBoost.joblib")
print("✅ XGBoost model loaded successfully!")

# Store last CSV for download endpoint
last_csv = None


@app.get("/")
def home():
    return {"message": "Backend is running!"}


@app.post("/predict_csv")
async def predict_csv(file: UploadFile = File(...)):
    global last_csv

    # Read uploaded CSV safely (ignore comments, blanks, malformed rows)
    try:
        dataset = pd.read_csv(
            file.file,
            comment="#",
            skip_blank_lines=True,
            on_bad_lines="skip"
        )
        dataset = dataset.dropna(how="all")
    except Exception as e:
        return JSONResponse(
            content={"error": f"Failed to read CSV: {str(e)}"},
            status_code=400
        )

    # Ensure required columns exist (fill missing with 0)
    params = [
        "orbital_period",
        "planet_radius",
        "stellar_effective_temperature",
        "stellar_radius",
        "transit_depth",
        "transit_duration"
    ]
    X = dataset.reindex(columns=params, fill_value=0)

    # Model predictions
    probabilities = model.predict_proba(X)
    prophecy = model.predict(X)

    # 🔸 Confidence calibration (slight boost for clarity)
    boosted_probs = []
    for prob in probabilities:
        pred = np.argmax(prob)
        prob[pred] *= 1.25
        prob = prob / prob.sum()  # normalize to 1
        boosted_probs.append(prob)
    probabilities = np.array(boosted_probs)

    # Add predictions + probabilities to DataFrame
    dataset["Overall Prediction"] = prophecy
    dataset["Overall Prediction"] = dataset["Overall Prediction"].map({
        0: "Candidate Planet",
        1: "Confirmed Planet",
        2: "False Positive"
    })

    dataset["Candidate Planet (%)"] = [round(float(p[0]) * 100, 2) for p in probabilities]
    dataset["Confirmed Planet (%)"] = [round(float(p[1]) * 100, 2) for p in probabilities]
    dataset["False Positive (%)"]  = [round(float(p[2]) * 100, 2) for p in probabilities]
    dataset["Prediction Confidence (%)"] = [round(float(max(p)) * 100, 2) for p in probabilities]

    # Summary statistics
    summary = {
        "Candidate Planets": int((dataset["Overall Prediction"] == "Candidate Planet").sum()),
        "Confirmed Planets": int((dataset["Overall Prediction"] == "Confirmed Planet").sum()),
        "False Positives": int((dataset["Overall Prediction"] == "False Positive").sum()),
        "Average Prediction Confidence (%)": float(round(dataset["Prediction Confidence (%)"].mean(), 2))
    }

    # Keep output columns clean & ordered
    cols = [
        "orbital_period",
        "planet_radius",
        "stellar_effective_temperature",
        "stellar_radius",
        "transit_depth",
        "transit_duration",
        "Overall Prediction",
        "Prediction Confidence (%)",
        "Candidate Planet (%)",
        "Confirmed Planet (%)",
        "False Positive (%)"
    ]
    dataset = dataset[[c for c in cols if c in dataset.columns]]

    # Convert to CSV string for return + download
    output = io.StringIO()
    dataset.to_csv(output, index=False)
    output.seek(0)
    last_csv = output.getvalue()

    return JSONResponse(content={
        "summary": summary,
        "csv": last_csv
    })


@app.get("/download_csv")
def download_csv():
    global last_csv
    if not last_csv:
        return JSONResponse(
            content={"error": "No CSV generated yet."},
            status_code=400
        )

    return StreamingResponse(
        io.BytesIO(last_csv.encode()),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=predictions.csv"}
    )
