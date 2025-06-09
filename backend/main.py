from fastapi import FastAPI, Request, HTTPException, Header, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import numpy as np
import cv2
import insightface
from typing import List, Dict
from pydantic import BaseModel
from pymongo import MongoClient
from bson import ObjectId
import json

app = FastAPI()

MONGODB_URI = "mongodb://localhost:27017/faceAttendanceDB"
client = MongoClient(MONGODB_URI)
db = client.get_database()
students_collection = db.students

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class EmbeddingRequest(BaseModel):
    embedding: List[float]

def cosine_similarity(a: List[float], b: List[float]) -> float:
    a = np.array(a)
    b = np.array(b)
    return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b)))

# Face Analysis Model
model = insightface.app.FaceAnalysis(name="buffalo_l", providers=["CPUExecutionProvider"])
model.prepare(ctx_id=0)

@app.post("/generate-embedding")
async def generate_embedding(
    request: Request,
    content_type: str = Header(default="application/octet-stream")
):
    try:
        # 1. Validate input
        if not content_type.startswith(("image/", "application/octet-stream")):
            raise HTTPException(400, "Content-Type must be image/* or application/octet-stream")

        # 2. Process image
        contents = await request.body()
        if len(contents) > 5 * 1024 * 1024:
            raise HTTPException(413, "Image too large (max 5MB)")
            
        nparr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if img is None:
            raise HTTPException(400, "Invalid image format (supported: JPEG, PNG, etc.)")

        # 3. Face detection
        faces = model.get(img)
        if not faces:
            raise HTTPException(400, "No face detected - ensure clear frontal face")
        if len(faces) > 1:
            raise HTTPException(400, "Multiple faces detected - submit one face only")

        # 4. Generate embedding
        embedding = faces[0].embedding
        embedding = embedding / np.linalg.norm(embedding)  # Normalize

        return {
            "success": True,
            "embedding": embedding.tolist(),
            "face_quality": float(faces[0].det_score)  # Confidence score
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, f"Face processing error: {str(e)}")

@app.post("/verify-attendance-image")
async def verify_attendance_image(file: UploadFile = File(...)):
    try:
        # 1. Generate embedding from image
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if img is None:
            raise HTTPException(400, "Invalid image format")

        faces = model.get(img)
        if not faces:
            raise HTTPException(400, "No face detected")
        
        query_embedding = faces[0].embedding
        query_embedding = query_embedding / np.linalg.norm(query_embedding)
        query_embedding = query_embedding.tolist()

        # 2. Verify against database
        verify_request = EmbeddingRequest(embedding=query_embedding)
        return await verify_attendance(verify_request)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, f"Error processing image: {str(e)}")

@app.post("/verify-attendance")
async def verify_attendance(request: EmbeddingRequest):
    try:
        query_embedding = np.array(request.embedding)
        query_embedding = query_embedding / np.linalg.norm(query_embedding)  # normalize

        best_score = 0.6  # threshold
        best_student = None

        # Search through all students in MongoDB
        for student in students_collection.find():
            embeddings_list = student.get('embeddings', [])
            if not embeddings_list:
                continue

            # Compare with all stored embeddings for this student
            max_score_for_student = 0
            for db_embedding in embeddings_list:
                score = cosine_similarity(query_embedding, db_embedding)
                if score > max_score_for_student:
                    max_score_for_student = score

            if max_score_for_student > best_score:
                best_score = max_score_for_student
                best_student = student

        if best_student:
            # Prepare student data response
            student_data = {
                "id": str(best_student['_id']),
                "name": best_student['name'],
                "rollNumber": best_student.get('rollNumber', ''),
                "branch": best_student.get('branch', ''),
                "year": best_student.get('year', ''),
                "email": best_student.get('email', '')
            }

            return {
                "success": True,
                "student": student_data,
                "confidence": best_score,
                "message": "Attendance verified successfully"
            }
        else:
            return {
                "success": False,
                "message": "No matching student found"
            }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)