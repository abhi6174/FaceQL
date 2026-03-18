from backend.ml.face_pipeline import extract_face
path = "/home/abhi/projects/Faceql/test.png"
faces = extract_face(path)

print("Faces detected:", len(faces))

for i, face in enumerate(faces):

    print("Face", i+1)
    print("Embedding length:", len(face["embedding"]))
    print("Bounding box:", face["bbox"])

#run the below command in root folder to run this file
#python -m backend.scripts.test_face_pipeline