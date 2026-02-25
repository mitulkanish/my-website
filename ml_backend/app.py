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

app = FastAPI(title="Academic Intelligence ML API")

# Define the path to the dataset dynamically
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATASET_PATH = os.path.join(os.path.dirname(BASE_DIR), "student dataset.csv")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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

    if request.password != "1234":
        return {"error": "Invalid password. The default password is 1234."}
        
    try:
        df = pd.read_csv(DATASET_PATH)
    except Exception as e:
        return {"error": "Could not read dataset."}

    # Clean the input
    search_id = str(request.student_id).strip().lower()
    
    # Handle potential nulls and match by S_NO or NAME
    df['NAME_CLEAN'] = df['NAME'].fillna('').astype(str).str.strip().str.lower()
    
    student_row = pd.DataFrame()
    
    # Try to match by S_NO if it's numeric
    if search_id.isdigit():
        student_row = df[df['S_NO'] == int(search_id)]
        
    # If not found, try to match by exact NAME
    if student_row.empty:
        student_row = df[df['NAME_CLEAN'] == search_id]
        
    # For MVP: If name is still not found or user types 'any', fallback to the first student 
    # so they can successfully login and fetch an account as promised by the UI.
    if student_row.empty:
        student_row = df.head(1)

    
    student = student_row.iloc[0].to_dict()
    
    # Structure the response for the frontend
    return {
        "success": True,
        "user": {
            "id": str(student['S_NO']),
            "name": student['NAME'],
            "course": "Electronics and Communication Engg.", # Defaulting for now
            "year": "1st year", # Defaulting for now
            "role": "student",
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
            # Including detailed scores for the subjects view
            "maths_score": row['MATHS_SCORE'],
            "ct_score": row['CT_SCORE'],
            "de_score": row['DE_SCORE'],
            "cpp_score": row['CPP_SCORE']
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
