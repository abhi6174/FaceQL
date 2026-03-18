# FaceQL

FaceQL is a powerful full-stack application that enables high-performance face detection, extraction, and vector similarity search. It uses state-of-the-art machine learning models to index facial feature embeddings (using InsightFace) and query them in real-time (using FAISS).

## 🚀 Tech Stack

### Frontend
- **React 18** (with TypeScript)
- **Vite** (Build Tool)

### Backend & Machine Learning
- **FastAPI**: Asynchronous Python web framework for blazing-fast APIs.
- **SQLAlchemy & PostgreSQL**: Relational database for face metadata and application data.
- **InsightFace & OpenCV**: Face detection and high-accuracy facial feature extraction.
- **FAISS**: Facebook AI Similarity Search for sub-millisecond vector indexing and matching.
- **Celery & Redis**: Distributed background task queue for asynchronous image processing.
- **Boto3 (AWS S3)**: Cloud data storage for preserving uploaded photos and individual extracted faces.

## 📂 Architecture Overview

When a user uploads a photo:
1. The backend receives the full image and securely uploads it to an S3 Bucket.
2. A background Celery worker task is triggered to process the photo asynchronously.
3. **InsightFace** detects all faces present in the image, crops them, and generates high-dimensional mathematical vector embeddings for each face.
4. Extracted face thumbnails are uploaded to S3, and standard metadata is saved to PostgreSQL.
5. The facial embeddings are inserted into a **FAISS** index.
6. When querying/searching, an input search face is embedded into a vector, and FAISS compares it against the entire index using L2 distance/Cosine similarity to return the closest matching known faces instantly.

## 🛠 Prerequisites

Make sure you have the following installed on your machine:
- Python 3.9+
- Node.js 18+ and `npm`
- PostgreSQL server (running)
- Redis server (running, used as the Celery message broker)

## ⚙️ Setup Instructions

### 1. Clone the repository
```bash
git clone https://github.com/abhi6174/FaceQL.git
cd FaceQL
```

### 2. Backend Setup
```bash
# Create and activate a Python virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install required Python packages
pip install -r requirements.txt
```

Create a `.env` file in the project's root directory with your infrastructure secrets:
```env
S3_BUCKET_NAME=your-s3-bucket-name
DATABASE_URL=postgresql://postgres:password@localhost/faceql
# AWS Credentials should also be configured using aws-cli or explicitly defined here.
```

Initialize your PostgreSQL database tables:
```bash
python -m backend.scripts.init_db
```

### 3. Frontend Setup
```bash
cd frontend
npm install
```

## 🏃‍♂️ Running the Application

You will need multiple terminal windows/tabs to run all the microservices locally.

**1. Start Redis Server** (if not running globally in the background)
```bash
redis-server
```

**2. Start the Celery Worker** (from the root directory, with venv activated)
```bash
celery -A backend.worker.celery_app worker --loglevel=info
```

**3. Start the FastAPI Backend** (from the root directory, with venv activated)
```bash
uvicorn backend.app.main:app --reload --host 0.0.0.0 --port 8000
```

**4. Start the React Frontend**
```bash
cd frontend
npm run dev
```

The frontend will be accessible at `http://localhost:5173`, and the backend API Swagger documentation will be available at `http://localhost:8000/docs`.

## 📜 License
This project is licensed under the MIT License.
