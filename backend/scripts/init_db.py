from backend.app.db import engine
from backend.app.models import Base

# This will create all tables defined in models.py that don't already exist
Base.metadata.create_all(bind=engine)

print("Tables created successfully!")
