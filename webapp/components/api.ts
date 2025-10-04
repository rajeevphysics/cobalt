// components/api.ts
export async function getPrediction(inputs: number[]) {
  const res = await fetch("https://YOUR-BACKEND-URL.onrender.com/predict", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ inputs })
  });

  if (!res.ok) {
    throw new Error("API request failed");
  }

  const data = await res.json();
  return data; // returns { prediction_label, confidence_percent, breakdown_percent, ... }
}
