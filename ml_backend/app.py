from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import pandas as pd
import io
import re
import random
import PyPDF2
import os
import sqlite3
import datetime
import base64
import numpy as np
import cv2
try:
    from deepface import DeepFace
    DEEPFACE_AVAILABLE = True
except ImportError:
    DEEPFACE_AVAILABLE = False

# SQLite Setup
def get_db():
    db_path = os.path.join(BASE_DIR, 'webcam_attendance.db')
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn

app = FastAPI(title="Academic Intelligence ML API")

# Define the path to the dataset dynamically
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATASET_PATH = os.path.join(os.path.dirname(BASE_DIR), "student dataset.csv")
FACES_DIR = os.path.join(BASE_DIR, "reference_faces")
os.makedirs(FACES_DIR, exist_ok=True)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event('startup')
def startup_db():
    conn = get_db()
    conn.execute('''CREATE TABLE IF NOT EXISTS Webcam_Attendance (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        user_id TEXT,
                        student_name TEXT,
                        date TEXT,
                        time_marked DATETIME,
                        teacher_id TEXT,
                        subject TEXT
                    )''')
                    
    conn.execute('''CREATE TABLE IF NOT EXISTS Student_Voice_Logs (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        student_email TEXT NOT NULL,
                        student_name TEXT NOT NULL,
                        subject TEXT NOT NULL,
                        raw_text TEXT NOT NULL,
                        ai_mindset TEXT NOT NULL,
                        ai_response TEXT NOT NULL,
                        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
                    )''')
    conn.commit()
    conn.close()

try:
    model = joblib.load("knowledge_model.pkl")
except Exception as e:
    model = None
    print("Warning: Model not found. Run train_model.py first.")

class StudentData(BaseModel):
    maths_att: float
    ct_att: float
    de_att: float
    cpp_att: float
    coe_att: float
    maths_score: float
    ct_score: float
    de_score: float
    cpp_score: float

class LoginRequest(BaseModel):
    student_id: str
    password: str

class StartSessionRequest(BaseModel):
    teacher_id: str
    password: str

class MarkAttendanceRequest(BaseModel):
    student_id: str
    student_name: str
    teacher_id: str
    subject: str

class RecognizeFrameRequest(BaseModel):
    teacher_id: str
    subject: str
    frame_base64: str

class ChatRequest(BaseModel):
    message: str
    user_role: str

class StudentVoiceRequest(BaseModel):
    student_email: str
    student_name: str
    subject: str
    text: str

class CreateStudentRequest(BaseModel):
    name: str
    department: str
    maths_att: int
    ct_att: int
    de_att: int
    cpp_att: int
    coe_att: int
    maths_score: int
    ct_score: int
    de_score: int
    cpp_score: int

class UpdateStudentRequest(BaseModel):
    name: str | None = None
    department: str | None = None
    maths_att: int | None = None
    ct_att: int | None = None
    de_att: int | None = None
    cpp_att: int | None = None
    coe_att: int | None = None
    maths_score: int | None = None
    ct_score: int | None = None
    de_score: int | None = None
    cpp_score: int | None = None


@app.post("/attendance/secure_start")
def secure_start_session(request: StartSessionRequest):
    teachers = {
        "teacher_maths": "maths",
        "teacher_ct": "ct",
        "teacher_de": "de",
        "teacher_cpp": "cpp",
        "teacher_coe": "coe",
    }
    
    if request.teacher_id.lower() in teachers:
        if request.password == "teacher123":
            return {
                "success": True, 
                "session_token": f"token_{request.teacher_id}_{datetime.datetime.now().timestamp()}",
                "subject": teachers[request.teacher_id.lower()]
            }
        return {"error": "Invalid password for this teacher account."}
        
    return {"error": "Invalid teacher ID."}

@app.post("/attendance/mark")
def mark_attendance(request: MarkAttendanceRequest):
    conn = get_db()
    now = datetime.datetime.now()
    today_str = now.strftime("%Y-%m-%d")
    
    existing = conn.execute("""
        SELECT * FROM Webcam_Attendance 
        WHERE user_id = ? AND date = ? AND subject = ?
    """, (request.student_id, today_str, request.subject)).fetchone()
    
    if existing:
        conn.close()
        return {"success": False, "message": f"{request.student_name} is already marked present for {request.subject} today."}
        
    conn.execute("""
        INSERT INTO Webcam_Attendance (user_id, student_name, date, time_marked, teacher_id, subject)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (request.student_id, request.student_name, today_str, now, request.teacher_id, request.subject))
    
    conn.commit()
    conn.close()
    
    return {"success": True, "attendance": formatted}

@app.post("/chat")
def curo_chat(request: ChatRequest):
    msg = request.message.lower()
    role = request.user_role.lower()
    
    response = "I am Curo, your INTERVENIX Academic AI! How can I help you today?"
    
    # Keyword detection and context routing
    if any(word in msg for word in ["hello", "hi", "hey"]):
        response = "Hello there! I'm Curo, the INTERVENIX AI. I can guide you to your classes, check your attendance, or analyze your predictions. What do you need?"
    elif any(word in msg for word in ["attendance", "present", "absent"]):
        if role in ["admin", "coordinator", "teacher"]:
            response = "As an instructor, you can mark live attendance using the **Start Webcam Tracker** or view records in the **Daily Attendance Sheet** from the sidebar. You can also see overall metrics in **Class Attendance**."
        else:
            response = "You can view your current attendance metrics by clicking on **My Attendance** in the left sidebar."
    elif any(word in msg for word in ["predict", "intelligence", "success", "future"]):
        if role in ["admin", "coordinator", "teacher"]:
            response = "To see the success predictions for your entire class, navigate to **Class Intelligence** in the sidebar."
        else:
            response = "Want to know how you're tracking? Check out your personalized forecast under **Success Intelligence** on the left."
    elif any(word in msg for word in ["test", "quiz", "exam", "marks", "score"]):
        if role in ["admin", "coordinator", "teacher"]:
            response = "You can manage, assign, and review class assessments in the **Class Tests & Quizzes** section."
        else:
            response = "You can view your scores and upcoming assessments in the **Tests & Quizzes** tab located in the sidebar."
    elif any(word in msg for word in ["project", "skill", "assignment"]):
        response = "Skill projects and assignments are located in the **Skill Projects** area on the sidebar. Keep building those practical skills!"
    elif any(word in msg for word in ["subject", "course", "syllabus"]):
        response = "Detailed subject analysis is available in the **Subjects Analysis** section. You can find it right below Attendance in the menu."
    elif "who are you" in msg or "what are you" in msg or "name" in msg:
        response = "I am Curo, a custom-built AI designed specifically for the INTERVENIX platform! I'm here to ensure you get the most out of your academic experience."
    elif "help" in msg or "guide" in msg:
        response = "I can guide you! Try asking me about ' attendance', 'tests', 'projects', or 'predictions'. For example: *'Where do I find my recent quiz marks?'*"
    else:
        response = "I'm still learning! While I might not understand that specific question yet, you can always ask me about navigating Attendance, Tests, Projects, or AI Predictions."
        
    return {"success": True, "response": response, "sender": "curo"}

@app.post("/attendance/recognize_frame")
def recognize_frame(request: RecognizeFrameRequest):
    if not DEEPFACE_AVAILABLE:
        return {"success": False, "message": "ML Face Engine is not installed on the server."}
        
    try:
        # Decode base64 frame from React webcam
        # Format: "data:image/jpeg;base64,/9j/4AAQ..."
        encoded_data = request.frame_base64.split(',')[1] if ',' in request.frame_base64 else request.frame_base64
        nparr = np.frombuffer(base64.b64decode(encoded_data), np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        # Save temporary frame to disk for DeepFace
        # (DeepFace works best with filepaths in its current iteration)
        temp_path = os.path.join(BASE_DIR, "temp_frame.jpg")
        cv2.imwrite(temp_path, img)
        
        # Look for the faces folder
        if not os.path.exists(FACES_DIR) or not os.listdir(FACES_DIR):
            return {"success": False, "message": "No reference faces uploaded."}
            
        # Run recognition
        # Find matches from temp_path against all images in FACES_DIR
        dfs = DeepFace.find(img_path=temp_path, db_path=FACES_DIR, enforce_detection=False, silent=True)
        
        if len(dfs) > 0 and len(dfs[0]) > 0:
            # We found a match
            matched_row = dfs[0].iloc[0]
            # matched_row['identity'] will be the absolute path to the reference image, e.g. "C:/.../Mitul50.jpg"
            matched_file_path = matched_row['identity']
            matched_filename = os.path.basename(matched_file_path) # e.g. "Mitul50.jpg"
            student_name = os.path.splitext(matched_filename)[0] # e.g. "Mitul50"
            
            # Map name back to an ID if possible, otherwise use name as ID
            student_id = f"ID_{student_name}" 
            
            # Record attendance in DB
            conn = get_db()
            now = datetime.datetime.now()
            today_str = now.strftime("%Y-%m-%d")
            
            existing = conn.execute("""
                SELECT * FROM Webcam_Attendance 
                WHERE user_id = ? AND date = ? AND subject = ?
            """, (student_id, today_str, request.subject)).fetchone()
            
            if not existing:
                conn.execute("""
                    INSERT INTO Webcam_Attendance (user_id, student_name, date, time_marked, teacher_id, subject)
                    VALUES (?, ?, ?, ?, ?, ?)
                """, (student_id, student_name, today_str, now, request.teacher_id, request.subject))
                conn.commit()
                conn.close()
                return {"success": True, "message": f"Facial Match: {student_name} marked present."}
            else:
                conn.close()
                return {"success": True, "message": f"{student_name} is already marked for today."}
                
        return {"success": False, "message": "No recognized students found in frame."}
        
    except Exception as e:
        print(f"Face recognition error: {e}")
        return {"success": False, "message": "Frame processing failed.", "error": str(e)}

@app.get("/attendance/daily")
def get_daily_attendance(date: str = None, subject: str = None):
    conn = get_db()
    
    query = "SELECT * FROM Webcam_Attendance WHERE 1=1"
    params = []
    
    if date:
        query += " AND date = ?"
        params.append(date)
        
    if subject and subject.lower() != 'all':
        query += " AND subject = ?"
        params.append(subject)
        
    query += " ORDER BY time_marked DESC"
    
    records = conn.execute(query, params).fetchall()
    conn.close()
    
    history = []
    for r in records:
        history.append({
            "id": r["id"],
            "user_id": r["user_id"],
            "student_name": r["student_name"],
            "date": r["date"],
            "time_marked": r["time_marked"],
            "teacher_id": r["teacher_id"],
            "subject": r["subject"]
        })
        
    return {"success": True, "records": history}

@app.post("/login")
def login(request: LoginRequest):
    # Admin Override
    if request.student_id.lower() == "admin":
        if request.password == "admin123":
            return {
                "success": True,
                "user": {
                    "id": "admin-001",
                    "name": "System Administrator",
                    "role": "admin",
                }
            }
        return {"error": "Invalid admin password."}
        
    # Coordinator Role
    if request.student_id.lower() == "coordinator":
        if request.password == "coord123":
            return {
                "success": True,
                "user": {
                    "id": "coord-001",
                    "name": "System Coordinator",
                    "role": "coordinator",
                }
            }
        return {"error": "Invalid coordinator password."}

    # Teacher Roles (mapped to subjects)
    teachers = {
        "teacher_maths": {"name": "Maths Teacher", "subject": "maths"},
        "teacher_ct": {"name": "CT Teacher", "subject": "ct"},
        "teacher_de": {"name": "DE Teacher", "subject": "de"},
        "teacher_cpp": {"name": "C++ Teacher", "subject": "cpp"},
        "teacher_coe": {"name": "COE Teacher", "subject": "coe"},
    }
    
    if request.student_id.lower() in teachers:
        if request.password == "teacher123":
            teacher_info = teachers[request.student_id.lower()]
            return {
                "success": True,
                "user": {
                    "id": request.student_id.lower(),
                    "name": teacher_info["name"],
                    "role": "teacher",
                    "subject": teacher_info["subject"]
                }
            }
        return {"error": f"Invalid password for {request.student_id}."}


        
    try:
        df = pd.read_csv(DATASET_PATH)
    except Exception as e:
        return {"error": "Could not read dataset."}

    # Clean the input
    search_id = str(request.student_id).strip().lower()
    search_pass = str(request.password).strip()
    
    # Handle potential nulls and match by S_NO or NAME
    df['NAME_CLEAN'] = df['NAME'].fillna('').astype(str).str.strip().str.lower()
    df['PARENT_ID_CLEAN'] = df['PARENT_ID'].fillna('').astype(str).str.strip().str.lower()
    
    student_row = pd.DataFrame()
    is_parent = False
    
    # 1. First check if it's a Parent Login
    parent_match = df[df['PARENT_ID_CLEAN'] == search_id]
    if not parent_match.empty:
        if str(parent_match.iloc[0]['PARENT_PASSWORD']).strip() == search_pass:
            student_row = parent_match
            is_parent = True
        else:
            return {"error": "Invalid parent password."}
            
    # 2. If not a parent, try matching as a Student by S_NO
    elif search_id.isdigit():
        student_row = df[df['S_NO'] == int(search_id)]
        
    # 3. If not found by S_NO, try matching exact Student Name
    if student_row.empty and not is_parent:
        student_row = df[df['NAME_CLEAN'] == search_id]
        
    # 4. If name is still not found or user types 'any' for MVP
    if student_row.empty and not is_parent:
        student_row = df.head(1)

    # 5. Verify Student Password (if it's not a parent login)
    if not is_parent:
        if search_pass != "1234":
            return {"error": "Invalid password. The default password is 1234."}

    student = student_row.iloc[0].to_dict()
    
    # Structure the response for the frontend
    return {
        "success": True,
        "user": {
            "id": str(student.get('PARENT_ID')) if is_parent else str(student.get('S_NO')),
            "name": f"Parent of {student['NAME']}" if is_parent else student['NAME'],
            "course": student.get('DEPARTMENT', "Engineering"),
            "year": "1st year", 
            "role": "parent" if is_parent else "student",
            "data": student
        }
    }

@app.post("/predict")
def predict_knowledge(data: StudentData):
    if model is None:
        return {"error": "Model not trained yet."}
        
    features = [[
        data.maths_att, data.ct_att, data.de_att, data.cpp_att, data.coe_att,
        data.maths_score, data.ct_score, data.de_score, data.cpp_score
    ]]
    
    prediction = model.predict(features)[0]
    
    avg_att = (data.maths_att + data.ct_att + data.de_att + data.cpp_att) / 4.0
    avg_score = (data.maths_score + data.ct_score + data.de_score + data.cpp_score) / 4.0

    # 1. What needs improvement?
    improvement_areas = []
    if avg_att < 75:
        improvement_areas.append("Classroom attentiveness and attendance must improve to grasp fundamental theory.")
    if avg_score < 70:
        improvement_areas.append("Academic test scores show a deprovement; more focus on exam preparation is needed.")
    if data.coe_att < 70:
        improvement_areas.append("Center of Excellence (COE) participation is low; you are missing out on vital practical skills.")
    if not improvement_areas:
        improvement_areas.append("Keep pushing limits; explore advanced topics beyond the syllabus.")

    # 2. What is going correct?
    correct_procedure = []
    if avg_att >= 80:
        correct_procedure.append("Consistent class attendance demonstrates great dedication and attentiveness.")
    if avg_score >= 80:
        correct_procedure.append("Excellent academic scoring strategy; your theoretical foundation is solid.")
    if data.coe_att >= 80:
        correct_procedure.append("High COE attendance shows you are actively building industry-relevant practical knowledge.")
    if not correct_procedure:
        correct_procedure.append("You are attending college, but consistency across the board is needed to highlight strengths.")

    # 3. Academic Performance Analysis
    if avg_score >= 85:
        academic_perf = f"Outstanding academic performance (Avg: {avg_score:.1f}%). Test scores reflect continuous improvement."
    elif avg_score >= 70:
        academic_perf = f"Good academic performance (Avg: {avg_score:.1f}%). You are maintaining a steady level, but there's room to grow."
    else:
        academic_perf = f"Academic performance is a concern (Avg: {avg_score:.1f}%). There is a noticeable drop in test scores."

    # 4. COE Performance Analysis
    if data.coe_att >= 85:
        coe_perf = f"Exceptional practical skill development (COE Att: {data.coe_att}%). You are highly engaged in hands-on learning."
    elif data.coe_att >= 70:
        coe_perf = f"Moderate practical engagement (COE Att: {data.coe_att}%). Try to spend more time in the COE to sharpen skills."
    else:
        coe_perf = f"Poor COE performance (COE Att: {data.coe_att}%). Lack of practical exposure will hinder real-world skill readiness."

    return {
        "profile": prediction,
        "insights": {
            "improvement_areas": " ".join(improvement_areas),
            "correct_procedure": " ".join(correct_procedure),
            "academic_performance": academic_perf,
            "coe_performance": coe_perf
        }
    }

@app.get("/admin/stats")
def get_admin_stats():
    try:
        df = pd.read_csv(DATASET_PATH)
    except Exception as e:
        return {"error": "Could not read dataset."}

    total_students = len(df)
    
    # Calculate global averages
    avg_maths_score = df['MATHS_SCORE'].mean()
    avg_ct_score = df['CT_SCORE'].mean()
    avg_de_score = df['DE_SCORE'].mean()
    avg_cpp_score = df['CPP_SCORE'].mean()
    
    overall_avg_score = (avg_maths_score + avg_ct_score + avg_de_score + avg_cpp_score) / 4.0
    
    avg_maths_att = df['MATHS_ATT'].mean()
    avg_ct_att = df['CT_ATT'].mean()
    avg_de_att = df['DE_ATT'].mean()
    avg_cpp_att = df['CPP_ATT'].mean()
    
    overall_avg_att = (avg_maths_att + avg_ct_att + avg_de_att + avg_cpp_att) / 4.0
    
    overall_avg_coe = df['COE_ATT'].mean()
    
    # Profile Breakdown (using the existing target column from dataset for analytics)
    # If we wanted live predictions, we would run the model, but for 1000 rows, 
    # relying on the generated ground truth or existing profile is much faster for a dashboard MVP.
    profile_counts = df['STUDENT_PROFILE'].value_counts().to_dict()
    
    # Identify At-Risk Students (just taking top 10 lowest scoring students)
    # Calculate a composite score for each row
    df['Composite'] = (df['MATHS_SCORE'] + df['CT_SCORE'] + df['DE_SCORE'] + df['CPP_SCORE']) / 4.0
    at_risk_df = df.nsmallest(10, 'Composite')
    
    at_risk_students = []
    for _, row in at_risk_df.iterrows():
        at_risk_students.append({
            "id": row['S_NO'],
            "name": row['NAME'],
            "avg_score": round(row['Composite'], 1),
            "profile": row['STUDENT_PROFILE']
        })

    # Identify Top Performing Students (taking top 10 highest scoring students)
    top_df = df.nlargest(10, 'Composite')
    top_students = []
    for _, row in top_df.iterrows():
        top_students.append({
            "id": row['S_NO'],
            "name": row['NAME'],
            "avg_score": round(row['Composite'], 1),
            "profile": row['STUDENT_PROFILE']
        })

    return {
        "success": True,
        "metrics": {
            "total_students": total_students,
            "overall_avg_score": round(overall_avg_score, 1),
            "overall_avg_attendance": round(overall_avg_att, 1),
            "overall_avg_coe": round(overall_avg_coe, 1),
            "profile_distribution": profile_counts,
            "at_risk_students": at_risk_students,
            "top_students": top_students
        }
    }

@app.get("/admin/students")
def get_all_students():
    try:
        df = pd.read_csv(DATASET_PATH)
    except Exception as e:
        return {"error": "Could not read dataset."}
        
    df['CompositeScore'] = (df['MATHS_SCORE'] + df['CT_SCORE'] + df['DE_SCORE'] + df['CPP_SCORE']) / 4.0
    df['CompositeAtt'] = (df['MATHS_ATT'] + df['CT_ATT'] + df['DE_ATT'] + df['CPP_ATT']) / 4.0
    
    students_list = []
    # Sending up the basic profile parameters for the data table
    for _, row in df.iterrows():
        students_list.append({
            "id": row['S_NO'],
            "name": row['NAME'],
            "avg_score": round(row['CompositeScore'], 1),
            "avg_att": round(row['CompositeAtt'], 1),
            "profile": row['STUDENT_PROFILE'],
            "department": row.get('DEPARTMENT', 'Unknown'),
            # Including detailed scores for the subjects view
            "maths_score": row['MATHS_SCORE'],
            "ct_score": row['CT_SCORE'],
            "de_score": row['DE_SCORE'],
            "cpp_score": row['CPP_SCORE'],
            "maths_att": row['MATHS_ATT'],
            "ct_att": row['CT_ATT'],
            "de_att": row['DE_ATT'],
            "cpp_att": row['CPP_ATT'],
            "coe_att": row['COE_ATT']
        })
        
    return {
        "success": True,
        "students": students_list
    }

@app.get("/admin/student/{student_id}")
def get_student_detail(student_id: int):
    try:
        df = pd.read_csv(DATASET_PATH)
    except Exception as e:
        return {"error": "Could not read dataset."}
        
    student_row = df[df['S_NO'] == student_id]
    
    if student_row.empty:
        return {"error": f"Student with ID {student_id} not found."}
        
    student = student_row.iloc[0].to_dict()
    
    # We will compute their live model prediction specifically for the admin breakdown view
    try:
        data = StudentData(
            maths_att=float(student['MATHS_ATT']),
            ct_att=float(student['CT_ATT']),
            de_att=float(student['DE_ATT']),
            cpp_att=float(student['CPP_ATT']),
            coe_att=float(student['COE_ATT']),
            maths_score=float(student['MATHS_SCORE']),
            ct_score=float(student['CT_SCORE']),
            de_score=float(student['DE_SCORE']),
            cpp_score=float(student['CPP_SCORE'])
        )
        prediction_result = predict_knowledge(data)
    except Exception as e:
        prediction_result = {"error": "Prediction model failed to run on this student."}
    
    return {
        "success": True,
        "student": {
            "id": student['S_NO'],
            "name": student['NAME'],
            "data": student,
            "prediction": prediction_result
        }
    }

@app.post("/admin/student")
def create_student(request: CreateStudentRequest):
    try:
        df = pd.read_csv(DATASET_PATH)
    except Exception as e:
        return {"error": "Could not read dataset."}
        
    new_id = int(df['S_NO'].max()) + 1 if not df.empty else 1
    parent_id = f"p_{request.name.lower().replace(' ', '')}"
    parent_pass = f"pass_{random.randint(1000, 9999)}"
    
    # Calculate Profile
    data_for_pred = StudentData(
        maths_att=float(request.maths_att),
        ct_att=float(request.ct_att),
        de_att=float(request.de_att),
        cpp_att=float(request.cpp_att),
        coe_att=float(request.coe_att),
        maths_score=float(request.maths_score),
        ct_score=float(request.ct_score),
        de_score=float(request.de_score),
        cpp_score=float(request.cpp_score)
    )
    
    try:
        prediction_result = predict_knowledge(data_for_pred)
        profile = prediction_result.get('profile', 'Unknown Learner')
    except:
        profile = 'Unknown Learner'
        
    new_row = pd.DataFrame([{
        "S_NO": new_id,
        "NAME": request.name,
        "DEPARTMENT": request.department,
        "MATHS_ATT": request.maths_att,
        "CT_ATT": request.ct_att,
        "DE_ATT": request.de_att,
        "CPP_ATT": request.cpp_att,
        "COE_ATT": request.coe_att,
        "MATHS_SCORE": request.maths_score,
        "CT_SCORE": request.ct_score,
        "DE_SCORE": request.de_score,
        "CPP_SCORE": request.cpp_score,
        "STUDENT_PROFILE": profile,
        "PARENT_ID": parent_id,
        "PARENT_PASSWORD": parent_pass
    }])
    
    df = pd.concat([df, new_row], ignore_index=True)
    df.to_csv(DATASET_PATH, index=False)
    
    return {"success": True, "message": f"Student {request.name} created successfully.", "id": new_id}

@app.put("/admin/student/{student_id}")
def update_student(student_id: int, request: UpdateStudentRequest):
    try:
        df = pd.read_csv(DATASET_PATH)
    except Exception as e:
        return {"error": "Could not read dataset."}
        
    if student_id not in df['S_NO'].values:
        return {"error": f"Student with ID {student_id} not found."}
        
    idx = df[df['S_NO'] == student_id].index[0]
    
    update_data = request.dict(exclude_unset=True)
    for key, value in update_data.items():
        if value is not None:
            col_name = key.upper()
            if col_name in df.columns:
                df.at[idx, col_name] = value
                
    # Recalculate Profile
    student = df.loc[idx]
    data_for_pred = StudentData(
        maths_att=float(student['MATHS_ATT']),
        ct_att=float(student['CT_ATT']),
        de_att=float(student['DE_ATT']),
        cpp_att=float(student['CPP_ATT']),
        coe_att=float(student['COE_ATT']),
        maths_score=float(student['MATHS_SCORE']),
        ct_score=float(student['CT_SCORE']),
        de_score=float(student['DE_SCORE']),
        cpp_score=float(student['CPP_SCORE'])
    )
    
    try:
        prediction_result = predict_knowledge(data_for_pred)
        df.at[idx, 'STUDENT_PROFILE'] = prediction_result.get('profile', 'Unknown Learner')
    except:
        pass
                
    df.to_csv(DATASET_PATH, index=False)
    return {"success": True, "message": f"Student {student_id} updated successfully."}

@app.delete("/admin/student/{student_id}")
def delete_student(student_id: int):
    try:
        df = pd.read_csv(DATASET_PATH)
    except Exception as e:
        return {"error": "Could not read dataset."}
        
    if student_id not in df['S_NO'].values:
        return {"error": f"Student with ID {student_id} not found."}
        
    df = df[df['S_NO'] != student_id]
    df.to_csv(DATASET_PATH, index=False)
    
    return {"success": True, "message": f"Student {student_id} deleted successfully."}

@app.post("/upload-pdf")
async def extract_pdf_questions(file: UploadFile = File(...)):
    try:
        content = await file.read()
        try:
            pdf_reader = PyPDF2.PdfReader(io.BytesIO(content))
        except Exception as pdf_err:
            return {"success": False, "error": "Invalid PDF file. The file may be corrupted, encrypted, or not a true PDF document."}
        
        text = ""
        for page in pdf_reader.pages:
            extracted = page.extract_text()
            if extracted:
                text += extracted + "\n"
            
        if not text.strip():
            return {"success": False, "error": "No text could be extracted from the PDF."}
            
        # Basic NLP Question Generation
        sentences = re.split(r'(?<=[.!?]) +', text.replace('\n', ' '))
        valid_sentences = [s.strip() for s in sentences if 40 < len(s) < 200]
        
        if len(valid_sentences) < 5:
            # Fallback if text is too short or unstructured
            valid_sentences = [s.strip() for s in re.split(r'[,;\n]', text) if len(s.strip()) > 30]
            
        num_questions = min(10, len(valid_sentences))
        if num_questions == 0:
             return {"success": False, "error": "Not enough structured text to generate questions."}
             
        selected = random.sample(valid_sentences, num_questions)
        words = re.findall(r'\b[A-Za-z]{5,}\b', text)
        unique_words = list(set(w.lower() for w in words))
        
        questions = []
        for i, sentence in enumerate(selected):
            s_words = re.findall(r'\b[A-Za-z]{5,}\b', sentence)
            if not s_words:
                continue
            target = max(s_words, key=len)
            
            q_text = re.sub(rf'\b{target}\b', '________', sentence, count=1)
            
            # Generate distractors
            if len(unique_words) > 3:
                distractors = random.sample([w for w in unique_words if w.lower() != target.lower()], 3)
            else:
                distractors = ["Parameter", "Interface", "Algorithm"]
                
            options = [target] + distractors
            random.shuffle(options)
            answer_idx = options.index(target)
            
            questions.append({
                "id": i + 1,
                "text": f"Q{len(questions)+1}: {q_text}",
                "options": options,
                "answer": answer_idx
            })
            
        return {
            "success": True, 
            "questions": questions, 
            "title": file.filename.replace('.pdf', '')
        }
    except Exception as e:
        return {"success": False, "error": str(e)}

@app.get("/")
def read_root():
    return {"message": "Academic Health ML API is running v2!"}

# Mock AI Sentiment Engine Context rules
MINDSET_RULES = {
    "optimistic": ["optimistic", "hopeful", "better", "improving", "bright", "positive", "future", "looking forward"],
    "stressed": ["stress", "anxious", "pressure", "overwhelmed", "backlog", "exams", "worried", "tense"],
    "curious": ["curious", "interested", "tell me more", "how", "why", "want to know", "explore", "discover"],
    "depressed": ["depressed", "sad", "hopeless", "failing", "give up", "tired", "exhausted", "bad", "struggle"],
    "confused": ["confused", "don't understand", "hard", "lost", "difficult", "stuck", "help", "complex", "unclear"],
    "motivated": ["motivated", "great", "easy", "love", "excited", "happy", "good", "interesting", "confident", "fun", "enjoy"]
}

@app.post("/student-voice")
def submit_student_voice(request: StudentVoiceRequest):
    text_lower = request.text.lower()
    
    # Simple Keyword-Based Mock AI Sentiment Analysis
    mindset = "Neutral"
    advice = f"AI Insight: {request.student_name} has provided standard feedback. Review their notes for any subtle context."
    
    for category, keywords in MINDSET_RULES.items():
        if any(keyword in text_lower for keyword in keywords):
            mindset = category.capitalize()
            break
            
    if mindset == "Depressed":
        advice = f"AI Insight: {request.student_name} is expressing signs of exhaustion or depression regarding {request.subject}. It is highly recommended that you reach out to them personally or schedule a 1-on-1 session to offer support and discuss their workload."
    elif mindset == "Confused":
        advice = f"AI Insight: {request.student_name} is struggling with the recent material in {request.subject}. You should review their recent quiz scores and consider providing additional resources or practice problems to help them bridge their knowledge gap."
    elif mindset == "Motivated":
        advice = f"AI Insight: {request.student_name} is highly engaged and confident in {request.subject}. Consider challenging them with advanced {request.subject} skill projects or interactive assignments to keep their momentum going!"
    elif mindset == "Optimistic":
        advice = f"AI Insight: {request.student_name} is feeling optimistic and positive about their progress! This is a great time to encourage them to mentor others or lead a group discussion to reinforce their positive mindset."
    elif mindset == "Stressed":
        advice = f"AI Insight: {request.student_name} is feeling overwhelmed or stressed. Check their recent workload and see if any deadlines can be adjusted or if they need stress-management resources from the counseling department."
    elif mindset == "Curious":
        advice = f"AI Insight: {request.student_name} is showing a high level of curiosity. Provide them with extra-curricular reading material or advanced research topics to satisfy their intellectual hunger!"

    conn = get_db()
    conn.execute('''
        INSERT INTO Student_Voice_Logs (student_email, student_name, subject, raw_text, ai_mindset, ai_response)
        VALUES (?, ?, ?, ?, ?, ?)
    ''', (request.student_email, request.student_name, request.subject, request.text, mindset, advice))
    conn.commit()
    conn.close()
    
    return {"success": True, "message": "Your voice has been recorded and submitted for review. Thank you!"}

@app.get("/admin/student-voices")
def get_student_voices():
    conn = get_db()
    
    records = conn.execute('''
        SELECT id, student_email, student_name, subject, raw_text, ai_mindset, ai_response, timestamp
        FROM Student_Voice_Logs
        ORDER BY timestamp DESC
    ''').fetchall()
    conn.close()
    
    voices = []
    for r in records:
        voices.append({
            "id": r["id"],
            "student_email": r["student_email"],
            "student_name": r["student_name"],
            "subject": r["subject"],
            "raw_text": r["raw_text"],
            "ai_mindset": r["ai_mindset"],
            "ai_response": r["ai_response"],
            "timestamp": r["timestamp"]
        })
        
    return {"success": True, "data": voices}

if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
