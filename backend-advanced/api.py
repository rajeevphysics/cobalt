from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from joblib import load
import numpy as np
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


MODEL_PATH = "kepler_model.joblib"

model = load(MODEL_PATH)
print("Model loaded successfully!")

EXPECTED_FEATURES = [
    "orbital_period",
    "planet_radius",
    "stellar_effective_temperature",
    "stellar_radius",
    "transit_depth",
    "transit_duration",
    "apparent_brightness",
    "surface_gravity",
    "stellar_insolation",
    "transit_impact_parameter",
    "planet_equillibrium_temperature"
]

@app.get("/")
def home():
    return {"message": "Kepler AI Backend is running!"}

@app.post("/predict")
async def predict(data: dict):
    try:
        user_inputs = data.get("inputs", {})
        inputs_filled = []

        for feature in EXPECTED_FEATURES:
            value = user_inputs.get(feature, None)
            if value is None or value == "" or str(value).lower() == "nan":
                value = 0.0
            inputs_filled.append(float(value))

        inputs = np.array(inputs_filled).reshape(1, -1)
        pred_num = int(model.predict(inputs)[0])
        proba = model.predict_proba(inputs)[0]

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
            "overall_prediction": labels[pred_num],
            "prediction_numeric": pred_num,
            "prediction_confidence(%)": confidence,
            "probability_breakdown(%)": breakdown,
            "filled_inputs_used": dict(zip(EXPECTED_FEATURES, inputs_filled))
        }

    except Exception as e:
        return {"error": str(e)}
