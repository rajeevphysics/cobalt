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
    dataset["Overall Prediction"] = prophecy

    # Add per-class breakdown columns
    dataset["Candidate Planet (%)"] = [round(float(prob[0]) * 100, 2) for prob in probabilities]
    dataset["Confirmed Planet (%)"] = [round(float(prob[1]) * 100, 2) for prob in probabilities]
    dataset["False Positive (%)"]  = [round(float(prob[2]) * 100, 2) for prob in probabilities]

    # Compute prediction confidence
    confidences = [round(float(max(prob)) * 100, 2) for prob in probabilities]
    dataset["Prediction Confidence (%)"] = confidences

    # Map numeric classes to readable labels
    dataset["Overall Prediction"] = dataset["Overall Prediction"].map({
        0: "Candidate Planet",
        1: "Confirmed Planet",
        2: "False Positive"
    })

    # --- SUMMARY STATS ---
    summary = {
        "Candidate Planets": int((dataset["Overall Prediction"] == "Candidate Planet").sum()),
        "Confirmed Planets": int((dataset["Overall Prediction"] == "Confirmed Planet").sum()),
        "False Positives": int((dataset["Overall Prediction"] == "False Positive").sum()),
        "Average Confidence (%)": float(round(dataset["Prediction Confidence (%)"].mean(), 2))
    }

    # Reorder columns neatly
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

    # Convert DataFrame to CSV (as text)
    output = io.StringIO()
    dataset.to_csv(output, index=False)
    output.seek(0)
    csv_text = output.getvalue()

    # Return JSON summary + CSV text
    return JSONResponse(content={
        "summary": summary,
        "csv": str(csv_text)
    })
