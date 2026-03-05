import time
from deepface import DeepFace
import os

FACES_DIR = "reference_faces"
TEST_IMG = os.path.join(FACES_DIR, "Mitul50.jpg")

print("Initializing DeepFace test...")

# First run: Should build representations.pkl
start_time = time.time()
try:
    dfs = DeepFace.find(img_path=TEST_IMG, db_path=FACES_DIR, enforce_detection=False, silent=True)
    end_time = time.time()
    
    print(f"Initial run building Cache took: {end_time - start_time:.2f} seconds")
    if len(dfs) > 0 and len(dfs[0]) > 0:
        print(f"Match found: {dfs[0].iloc[0]['identity']}")
    else:
        print("No match found.")
        
    # Second run: Should use cache and be much faster
    start_time = time.time()
    dfs2 = DeepFace.find(img_path=TEST_IMG, db_path=FACES_DIR, enforce_detection=False, silent=True)
    end_time = time.time()
    
    print(f"Subsequent cached run took: {end_time - start_time:.2f} seconds")
    
except Exception as e:
    print(f"Error during DeepFace inference: {e}")
