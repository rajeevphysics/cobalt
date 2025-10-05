    # Build a breakdown dictionary
    breakdown = {
        "Candidate Planet": round(float(proba[0]) * 100, 2),
        "Confirmed Planet": round(float(proba[1]) * 100, 2),
        "False Positive": round(float(proba[2]) * 100, 2)
    }

    # Construct the response message
    message = f"Your ExoPlanet is a {labels[pred_num]} ({confidence}% confident)."

    return {
        "prediction_label": labels[pred_num],
        "prediction_numeric": pred_num,
        "confidence_percent": confidence,
        "breakdown_percent": breakdown,
        "message": message
    }
