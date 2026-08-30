# 🧠 DeepBrainDx: Autonomous AI-Powered Neuro-Diagnostic & Telemetry Engine

[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Python](https://img.shields.io/badge/Python-3.11-green.svg)](https://python.org)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB.svg)](https://react.dev)
[![PyTorch](https://img.shields.io/badge/AI-PyTorch%20CUDA-EE4C2C.svg)](https://pytorch.org)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB%20%2B%20Beanie-47A248.svg)](https://www.mongodb.com)

**DeepBrainDx** is a high-fidelity, end-to-end clinical diagnostic platform combining deep neural networks, computer vision, and real-time EEG signal processing. Designed for radiologists and neurologists, it performs automated Multi-Expert Ensemble Brain MRI classification, U-Net voxel-level tumor segmentation, and streaming EEG paroxysmal activity detection.

---

## 🌟 Key Features

* **🧠 Multi-Expert Ensemble Classification**: Routes incoming MRI DICOM/Image scans through 5 specialized Swin-Transformer neural models (Aneurysm, Glioma, Ischemic Stroke, Meningioma, Pituitary Tumor).
* **🔬 Volumetric U-Net Segmentation**: Voxel-level mask generation for quantitative tumor volume measurement ($mm^3$) and brain-to-lesion area ratio calculations.
* **⚡ Neural EEG Analysis Engine**: Real-time streaming analysis of multi-channel EDF signals for paroxysmal seizure activity detection powered by `EEGNet`.
* **📊 Interactive Clinical Dashboard**: A React 18 + Vite interface with Framer Motion animations, interactive Recharts telemetry, and live diagnostic monitoring.
* **🛡️ Security & Role-Based Access (RBAC)**: Role-gated security levels (`Admin`, `Doctor`, `Intern`, `User`), JWT session validation, and full clinical audit trail compliance.
* **📄 Automated Report Generation**: Single-click PDF diagnostic report generation (`html2pdf`) complete with XAI heatmaps, volumetric metrics, and physician approval workflow.

---

## 📂 Project Structure

```directory
deepbraindx/
├── backend/                  # FastAPI Inference Server & Database Layer
│   ├── models/               # Pre-trained PyTorch Model Weights (.pth)
│   │   ├── aneurysm.pth
│   │   ├── best_eegnet.pth
│   │   ├── best_tumor_unet.pth
│   │   ├── glioma.pth
│   │   ├── ischemic.pth
│   │   ├── meningioma.pth
│   │   └── pituitary.pth
│   ├── main.py               # Main FastAPI Application & Neural Pipeline
│   ├── database.py           # MongoDB ODM (Beanie + Motor) & GridFS Storage
│   ├── eeg_engine.py         # MNE Signal Processing & EEGNet Model Pipeline
│   ├── check_db.py           # Database Infrastructure Audit Script
│   └── test_bi.py            # Business Intelligence & Latency Diagnostic Test
├── frontend/                 # React 18 + Vite Web Application
│   ├── src/
│   │   ├── components/       # Clinical Telemetry & Portal Components
│   │   ├── views/            # Authentication & Role Views
│   │   ├── data/             # System Constants & API Endpoints
│   │   ├── App.jsx           # Main Declarative Router & Navigation
│   │   └── main.jsx          # React Root with Error Boundary Protection
│   ├── public/               # Static Assets & SPA Redirect Rules (_redirects)
│   ├── package.json          # Node Dependencies
│   └── vite.config.js        # Vite Build Configuration
├── netlify.toml              # Netlify Production Deploy & SPA Configuration
├── vercel.json               # Vercel Production Deploy Configuration
└── package.json              # Root Build Orchestration Script
```

---

## ⚙️ Technology Stack

* **Frontend**: React 18, Vite, Framer Motion, Lucide React, Recharts, Axios, HTML2PDF.js
* **Backend**: FastAPI, Uvicorn, PyTorch (CUDA Enabled), MNE Python, OpenCV, Pillow, PyPDF2
* **Database**: MongoDB 8.0, Beanie Async ODM, Motor AsyncIO Driver, GridFS Object Bucket
* **Authentication**: OAuth 2.0 / Google Auth, JWT Bearer Tokens, Bcrypt Password Hashing

---

## 🚀 Quick Start & Local Setup

### 1. Prerequisites
* **Python**: 3.11+
* **Node.js**: 18+
* **MongoDB**: Local Server / Home Server or MongoDB Atlas Cloud URL

### 2. Backend Setup
```bash
cd backend
python -m pip install -r requirements.txt
python main.py
```
*(The API server runs at `http://localhost:8000` with interactive Swagger docs at `http://localhost:8000/docs`)*

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
*(The development server runs at `http://localhost:3000`)*

---

## 🌐 Production Deployment

### Deploying Frontend to Netlify or Vercel
1. Connect your repository to **Netlify** or **Vercel**.
2. Set **Base Directory** to `frontend`.
3. Set **Build Command** to `npm run build`.
4. Set **Publish Directory** to `dist`.

---

## 🛡️ License & Attributions

© 2026 DeepBrainDx AI Team. Developed for clinical research and automated neuro-diagnostic telemetry.
