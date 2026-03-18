from fastapi import FastAPI, UploadFile, File, Form, HTTPException
import shutil
import uuid
import os
from backend.ml.face_search import search_face
from backend.app.s3_service import upload_file
from backend.worker.tasks import process_photo_task
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

upload_dir = "uploads"

os.makedirs(upload_dir, exist_ok=True)

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.post("/index-photo")
async def upload_photo(
    file: UploadFile = File(...),
    event_id: str = Form(...) # New Form parameter
):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    file_id = str(uuid.uuid4())
    file_path = f"{upload_dir}/{file_id}.jpg"
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        with open(file_path, "rb") as f:
            image_url = upload_file(f)
            
        # Dispatch to celery worker, passing the event ID
        process_photo_task.delay(file_path, image_url, event_id)
        
        return {
            "message": "Processing started",
            "image_url": image_url,
            "event_id": event_id
        }
    except Exception as e:
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/search-face")
async def search(
    file: UploadFile = File(...),
    event_id: str = Form(...) # Enable scoping the search to an event
):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
        
    file_id = str(uuid.uuid4())
    file_path = f"{upload_dir}/{file_id}.jpg"
    
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        result = search_face(file_path, event_id)
        return {
            "search_results": result
        }
    finally:
        if os.path.exists(file_path):
            os.remove(file_path)
