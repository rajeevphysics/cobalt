from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from joblib import load
import numpy as np
import os
from pydantic import BaseModel

class InputData(BaseModel):
    orbital_period: float = 0.0
    planet_radius: float = 0.0
    stellar_effective_temperature: float = 0.0
    stellar_radius: float = 0.0
    transit_depth: float = 0.0
    transit_duration: float = 0.0
    apparent_brightness: float = 0.0
    surface_gravity: float = 0.0
    stellar_insolation: float = 0.0
    transit_impact_parameter: float = 0.0
    planet_equillibrium_temperature: float = 0.0
    signal_noise_ratio: float | None = None

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MODEL_PATH = os.getenv("MODEL_PATH", "kepler_model.joblib")

if not os.path.exists(MODEL_PATH):
    raise FileNotFoundError(f"Model file not found: {MODEL_PATH}")

model = load(MODEL_PATH)
print(f"Model loaded successfully from {MODEL_PATH}")

BASE_FEATURES = [
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
async def predict(data: InputData):
    try:
        vals = data.dict()
        for feature in BASE_FEATURES:
            val = vals.get(feature, 0.0)
            if val is None or str(val).lower() == "nan":
                vals[feature] = 0.0
            else:
                vals[feature] = float(val)

        stellar_radius = vals["stellar_radius"] + 1e-6
        transit_duration = vals["transit_duration"] + 1e-6
        signal_noise_ratio = vals.get("signal_noise_ratio") or vals["apparent_brightness"]

        vals["radius_ratio"] = vals["planet_radius"] / stellar_radius
        vals["depth_duration_ratio"] = vals["transit_depth"] / transit_duration
        vals["snr_radius_product"] = signal_noise_ratio * vals["planet_radius"]

        EXPECTED_FEATURES = BASE_FEATURES + [
            "radius_ratio",
            "depth_duration_ratio",
            "snr_radius_product"
        ]

        inputs = np.array([vals[f] for f in EXPECTED_FEATURES]).reshape(1, -1)

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
            "calculated_features": {
                "radius_ratio": vals["radius_ratio"],
                "depth_duration_ratio": vals["depth_duration_ratio"],
                "snr_radius_product": vals["snr_radius_product"]
            },
            "filled_inputs_used": vals
        }

    except Exception as e:
        return {"error": str(e)}
