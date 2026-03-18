from backend.worker.celery_app import celery_app
from backend.ml.face_search import index_photo
import os

@celery_app.task
def process_photo_task(image_path, image_url, event_id):
    try:
        faces_detected = index_photo(image_path, image_url, event_id)
        return {
            "image_url": image_url,
            "faces_detected": faces_detected,
            "event_id": event_id
        }
    finally:
        if os.path.exists(image_path):
            os.remove(image_path)
