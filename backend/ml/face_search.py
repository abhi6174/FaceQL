import json
from backend.ml.face_pipeline import extract_face
from backend.ml.vector_index import add_embedding, search_embedding
from backend.app.db import SessionLocal
from backend.app.models import Photo, Face

def index_photo(image_path, image_url, event_id):
    faces = extract_face(image_path)
    
    if len(faces) == 0:
        return 0

    db = SessionLocal()
    try:
        # Generate a unique string relative to the photo file
        photo_id = image_url.split("/")[-1].split(".")[0]
        
        # 1. Save the Photo record to Postgres
        new_photo = Photo(id=photo_id, event_id=event_id, image_url=image_url)
        db.add(new_photo)

        # 2. Save each Face
        for face in faces:
            embedding = face["embedding"]
            bbox = face["bbox"]

            # Save math vector to FAISS and get mathematical ID back
            embedding_id = add_embedding(embedding)

            # Save relational data to Postgres, including the FAISS embedding_id
            face_row = Face(
                photo_id=photo_id,
                event_id=event_id,
                embedding_id=embedding_id,
                bbox=json.dumps(bbox)
            )
            db.add(face_row)
            
        db.commit()
    except Exception as e:
        db.rollback()
        raise e
    finally:
        db.close()
        
    return len(faces)

from backend.app.s3_service import generate_presigned_url

def search_face(query_image, event_id):
    faces = extract_face(query_image)
    if len(faces) == 0:
        return []
        
    query_embedding = faces[0]["embedding"]
    
    # 1. Search Vector DB for closest IDs first
    embedding_ids = search_embedding(query_embedding)
    
    if not embedding_ids:
        return []
        
    # 2. Query Postgres using the IDs from FAISS & Apply Event Filter
    db = SessionLocal()
    try:
        results = db.query(Face, Photo).join(Photo, Face.photo_id == Photo.id).filter(
            Face.embedding_id.in_(embedding_ids),
            Face.event_id == event_id
        ).all()
        
        # Format the response list
        formatted_results = []
        for face, photo in results:
            formatted_results.append({
                "photo_id": face.photo_id,
                "image_url": generate_presigned_url(photo.image_url),
                "event_id": face.event_id,
                "embedding_id": face.embedding_id,
                "bbox": json.loads(face.bbox)
            })
            
        return formatted_results
    finally:
        db.close()
