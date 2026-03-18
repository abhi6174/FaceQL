# run the below command to make the file executable
# chmod +x cleanup.sh

rm -f faiss.index metadata.pkl dump.rdb
rm -rf uploads/*

echo "cleanup complete"