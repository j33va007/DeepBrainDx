# 🧠 DeepBrainDx: Autonomous AI-Powered Neuro-Diagnostic & Telemetry Engine

DeepBrainDx is a high-fidelity, end-to-end clinical diagnostic platform combining deep neural networks, computer vision, and real-time EEG signal processing. Designed for radiologists and neurologists, it performs automated Multi-Expert Ensemble Brain MRI classification, U-Net voxel-level tumor segmentation, and streaming EEG paroxysmal activity detection.

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

- `backend/`: FastAPI-powered inference engine, PyTorch models, and database management.
- `frontend/`: React + Vite clinical interface with Framer Motion animations.
- `models/`: Pre-trained PyTorch expert models (`.pth`).
- `netlify.toml` / `vercel.json`: Production deployment configuration rules.

---

## ⚙️ Technology Stack

* **Frontend**: React 18, Vite, Framer Motion, Lucide React, Recharts, Axios, HTML2PDF.js
* **Backend**: FastAPI, Uvicorn, PyTorch (CUDA Enabled), MNE Python, OpenCV, Pillow
* **Database**: MongoDB 8.0, Beanie Async ODM, Motor AsyncIO Driver, GridFS Object Bucket
