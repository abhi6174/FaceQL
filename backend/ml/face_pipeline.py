import cv2
from insightface.app import FaceAnalysis

app = FaceAnalysis(name = "buffalo_l")
app.prepare(ctx_id = -1)

def extract_face(path):

    img = cv2.imread(path)
    if img is None:
        raise ValueError("image is not loaded")
    faces = app.get(img)
    results = []

    for face in faces:
        embedding = face.embedding
        bbox = face.bbox.astype(int)

        results.append({
            "embedding":embedding,
            "bbox":bbox.tolist()
        })
    return results