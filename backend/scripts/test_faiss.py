from backend.ml.vector_index import add_embedding , search_embedding

import numpy as np

# create fake embeddings
vec1 = np.random.rand(512)
vec2 = np.random.rand(512)
vec3 = np.random.rand(512)

# add embeddings
add_embedding(vec1, {"photo": "person1.jpg"})
add_embedding(vec2, {"photo": "person2.jpg"})
add_embedding(vec3, {"photo": "person3.jpg"})

results = search_embedding(vec1,2)

print("Search results:")
print(results)