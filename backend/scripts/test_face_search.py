from backend.ml.face_search import index_photo, search_face

# index photos
# print("Indexing photos...")

# index_photo("1.jpg", "photo_1_abhishek_old")
# index_photo("2.jpg", "photo_2_abhinand")
# index_photo("3.jpg", "photo_3_abhinand")
# index_photo("4.jpeg", "photo_4_abhishek_passport")

# print("Indexing complete")


print("\nSearching with query image...")

results = search_face("query.jpg")

print("Results:")
print(results)