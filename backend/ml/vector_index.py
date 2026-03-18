import faiss
import numpy as np
import os
from filelock import FileLock

dimension = 512
index_file = "faiss.index"
lock_file = "faiss.lock"

# FileLock ensures two concurrent Celery workers don't corrupt the FAISS index
lock = FileLock(lock_file, timeout=10)

def load_index():
    if os.path.exists(index_file):
        return faiss.read_index(index_file)
    return faiss.IndexIDMap(faiss.IndexFlatL2(dimension))

def save_index(idx):
    faiss.write_index(idx, index_file)

def add_embedding(embedding):
    vector = np.array(embedding).astype("float32").reshape(1, -1)
    
    with lock:
        index = load_index()
        
        # Determine the next available ID by checking the size of the index
        assigned_id = index.ntotal
        index.add_with_ids(vector, np.array([assigned_id]).astype("int64"))
        
        save_index(index)
        
    # Return the ID so we can link it in the Postgres Database
    return assigned_id

def search_embedding(query_embedding, k=5, threshold=500):
    query = np.array(query_embedding).astype("float32").reshape(1, -1)
    
    with lock:
        index = load_index()
        
    if index.ntotal == 0:
        return []
        
    distances, indices = index.search(query, k)
    
    result_ids = []
    for dist, i in zip(distances[0], indices[0]):
        # Filter by threshold and ignore -1 (happens if k > total items)
        if i != -1 and dist < threshold:
            result_ids.append(int(i))
            
    return result_ids
