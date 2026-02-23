# DeepBrainDx: AI-Powered Medical Diagnostic Platform

DeepBrainDx is a high-fidelity, end-to-end medical diagnostic platform combining cutting-edge artificial intelligence with clinical workflows. It specializes in brain MRI classification, tumor segmentation, and EEG paroxysmal activity detection.

## 🌟 Key Features

- **Multi-Expert Ensemble**: Routes MRI scans through specialized Swin Transformer models (Aneurysm, Glioma, Meningioma, Pituitary, Stroke, etc.).
- **U-Net Precision Segmentation**: Voxel-level mapping of tumor boundaries with volumetric analysis.
- **Neural Analysis Engine**: Real-time EEG telemetry analysis with paroxysmal event detection.
- **Clinical Interface**: A premium React-based dashboard for radiologists and neurologists.
- **Audit & Analytics**: Comprehensive audit trails, patient history, and real-time diagnostic feeds.

## 📂 Project Structure

- `backend/`: FastAPI-powered inference engine and database management.
- `frontend/`: React + Vite clinical interface with Framer Motion animations.
- `models/`: Pre-trained PyTorch expert models (`.pth`).
- `tools/`: Utility scripts for system verification, database auditing, and maintenance.
- `docker-compose.yml`: Orchestration for the full stack (including MongoDB).

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Python 3.10+ (for local development)
- Node.js 18+ (for local development)

### Deployment via Docker
```bash
docker-compose up --build
```

### Local Development

#### 1. Backend Setup
```bash
cd backend
pip install -r requirements.txt
python main.py
```

#### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## 🧠 Model Experts
The system utilizes the following pre-trained experts:
- `alzheimer's_refined.pth`
- `aneuryms_seizure_model.pth`
- `tumor_segmentation.pth`
- (And more located in the `models/` directory)

## 🛡️ Clinical Security
DeepBrainDx implements role-based access control (RBAC), secure session management, and encrypted data handling to ensure compliance with clinical standards.

---
© 2026 DeepBrainDx AI Team. All Rights Reserved.
