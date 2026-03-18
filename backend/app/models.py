from sqlalchemy import Column, String, Integer
from sqlalchemy.orm import declarative_base

Base = declarative_base()

class Photo(Base):
    __tablename__ = "photos"

    id = Column(String, primary_key=True)
    event_id = Column(String, index=True)
    image_url = Column(String)

class Face(Base):
    __tablename__ = "faces"

    id = Column(Integer, primary_key=True, autoincrement=True)
    photo_id = Column(String, index=True)
    event_id = Column(String, index=True)
    embedding_id = Column(Integer, unique=True, index=True)
    bbox = Column(String)
