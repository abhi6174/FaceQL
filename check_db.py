from backend.app.db import SessionLocal
from backend.app.models import Photo

db = SessionLocal()
try:
    photos = db.query(Photo).limit(3).all()
    for p in photos:
        print(f"ID: {p.id}")
        print(f"URL: {p.image_url}")
        print("-" * 20)
finally:
    db.close()
