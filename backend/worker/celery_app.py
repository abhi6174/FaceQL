from celery import Celery

celery_app = Celery(
    "faceql",
    broker="redis://localhost:6379/0",
    backend="redis://localhost:6379/0"
)

celery_app.autodiscover_tasks(["backend.worker"])