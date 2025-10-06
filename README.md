# Eukleídes — Team Cobalt  
### *NASA Space Apps Challenge 2025: “A World Away – Hunting for Exoplanets with AI”*

---

## 🧭 Overview  
**Eukleídes** is an AI-powered web application built by **Team Cobalt** for the NASA Space Apps Challenge 2025.  
Our mission is to **streamline exoplanet classification** using **machine learning** and **interactive visualizations**. Making it easier for researchers and astronomy enthusiasts to identify potentially habitable worlds.

---

## 🧠 What It Does  
- 🪐 **Exoplanet Classification** — Uses a trained ML model to determine whether a candidate is a confirmed exoplanet.  
- 📊 **Geometric Visualizations** — Transforms prediction results into intuitive, interactive visuals inspired by orbital geometry.  
- ⚙️ **Two Modes:**  
  1. **Single Exoplanet Analysis** — Quick lookup for a single candidate.  
  2. **Dataset Upload** — Bulk classification for research teams.  
- 🛰️ **Responsive, Accessible Web UI** — Optimized for both researchers and public outreach.

---

## 🧩 How It Works  
1. **Frontend (Landing App)**  
   - Built with **HTML, CSS, TypeScript**, and hosted on **Vercel** or **GitHub Pages**  
   - Features: video background, smooth-scroll, interactive hero section  

2. **Backend (API)**  
   - Built with **FastAPI (Python)**  
   - Receives planetary parameters  
   - Runs inference using trained ML model  
   - Returns probability and classification result  

3. **Deployment**  
   - Frontend deployed via **Vercel** or **GitHub Pages**  
   - Backend hosted on **Render** (`/predict` endpoint)

---

## 🧰 Tech Stack  
| Layer | Tools Used |
|-------|-------------|
| **Frontend** | HTML, CSS, TypeScript, React, 3JS, NextJS |
| **Backend** | Python, FastAPI, scikit-learn, Pandas |
| **AI/ML** | RandomForestClassifier trained on NASA Exoplanet Archive |
| **Hosting** | Vercel (UI), Render (API) |

---

## ⚗️ Model Input Parameters  
The model uses six numerical features per exoplanet:
1. Orbital Period  
2. Planet Radius  
3. Stellar Effective Temperature  
4. Stellar Radius  
5. Transit Depth  
6. Transit Duration  


### Frontend (Static Site)
```bash
git clone https://github.com/rajeevphysics/cobalt.git
cd lander
npm install
npm run dev
# or open dist/index.html after build
