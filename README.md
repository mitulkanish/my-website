# INTERVENIX: Intelligent Academic Risk & Success Platform

INTERVENIX is a full-stack, AI-powered web platform designed to analyze, track, and predict student academic health based on attendance, test scores, and practical skills. It provides distinct views and analytics for both Students and Administrators.

## 🚀 Technology Stack

### Frontend (Client-Side)
- **Framework:** React 19 + Vite
- **Language:** JavaScript (ES6+), JSX
- **Styling:** Custom CSS (glassmorphism UI, CSS variables for theming)
- **Routing:** React Router DOM (v7)
- **Charting & Visualization:** Recharts
- **Icons:** Lucide-React

### Backend (Server-Side API)
- **Framework:** FastAPI
- **Language:** Python 3
- **Data Processing:** Pandas, NumPy
- **Machine Learning:** Scikit-learn (Random Forest Classifier), Joblib
- **PDF Processing:** PyPDF2 (for automated question generation)
- **Server:** Uvicorn

---

## 🏗️ Architecture & Core Components

### 1. Frontend Architecture
The frontend is built using a component-based architecture in React.

*   **`src/App.jsx`**: The root component handling the routing logic (`<BrowserRouter>`) and global context providers.
*   **`src/context/AuthContext.jsx`**: A global state manager that handles user login state, role-based access (admin vs. student), and stores the currently logged-in user's profile and analytics.
*   **Student Views:**
    *   `Dashboard (`/`):` Main landing page showing basic stats and the "Academic Health Growth" graph.
    *   `Subjects.jsx`: Displays attendance percentages and performance metrics.
    *   `TestsQuizzes.jsx`: Uploads PDFs to generate quizzes using the backend AI.
    *   `Predictions.jsx`: Interacts with the Python ML model to display strengths, weaknesses, and a dynamic student profile (e.g., "Theoretical Learner", "Excellent All-Rounder").
*   **Admin Views:**
    *   `AdminStudents.jsx`: A data table listing all students globally.
    *   `AdminStudentDetail.jsx`: Deep-dive into an individual student's ML predictions and grades.
    *   `AdminPredictions.jsx`: High-level dashboard showing global averages, profile distribution, and identifying "At-Risk" vs "Top Performing" students.

### 2. Backend Architecture
The backend serves as a RESTful API built with FastAPI. It handles data fetching, authentication, and passing parameters to the ML model.

*   **`ml_backend/app.py`**: The core API server.
    *   `/login`: Reads the dataset, validates the student ID, and returns the user object.
    *   `/predict`: Takes in attendance and score data, passes it through the `.pkl` model, and returns customized insights based on the prediction.
    *   `/admin/stats` & `/admin/students`: Aggregates Pandas dataframe metrics to serve global statistics to the administrator dashboard.
    *   `/upload-pdf`: Uses PyPDF2 to extract text from a document and basic NLP rules (regex) to generate fill-in-the-blank questions on the fly.

### 3. Machine Learning Pipeline
The machine learning aspect determines a student's archetype to provide customized feedback.

*   **`generate_data.py`**: A script that creates thousands of rows of synthetic student data (`student dataset.csv`), calculating composite scores and assigning a ground-truth "Student Profile".
*   **`train_model.py`**: Analyzes the generated `.csv`, selects features (Attendance & Scores), and trains a `RandomForestClassifier`. The trained model is then serialized and saved as `knowledge_model.pkl`.
*   **Inference (`app.py`)**: The FastAPI server loads `knowledge_model.pkl` into memory. When the frontend hits the `/predict` endpoint, the API passes the JSON data array into the `.predict()` method.

---

## 🛠️ Step-by-Step Creation Guide

This section outlines every step taken to build INTERVENIX from scratch.

### Step 1: Frontend Initialization
1.  **Create the Vite Project:** 
    ```bash
    npm create vite@latest website -- --template react
    cd website
    npm install
    ```
2.  **Install Dependencies:** 
    Installed Recharts for graphs, Lucide-React for UI icons, and React Router for navigation.
    ```bash
    npm install recharts lucide-react react-router-dom
    ```
3.  **UI/UX Design Initialization:** 
    Created a highly customized `index.css` applying a modern dark theme, CSS variables for consistent coloring (blue/indigo gradients), and `.glass-panel` classes for translucent, blurred backgrounds.

### Step 2: Machine Learning Foundation
1.  **Set up the Python Environment:** Created the `ml_backend` directory and installed data science libraries.
    ```bash
    pip install pandas numpy scikit-learn joblib fastapi uvicorn python-multipart pydantic PyPDF2
    ```
2.  **Generate Dataset:** Wrote `generate_data.py` to simulate realistic student subjects (Maths, CT, DE, CPP) and practical (COE) attendance alongside test scores.
3.  **Train the Model:** Wrote `train_model.py` to create the predictive engine that categorizes student academic health, saving it as `knowledge_model.pkl`.

### Step 3: Fast API Backend Creation
1.  **Routing & Logic:** Created `app.py`. Built GET/POST endpoints ensuring CORS middleware (`CORSMiddleware`) was enabled so the local React frontend could fetch data without cross-origin errors.
2.  **Authentication:** Implemented a simple data-matching login system. It compares the frontend input against the `NAME` or `S_NO` fields in the generated CSV using Pandas (`df[df['NAME_CLEAN'] == search_id]`).
3.  **Dynamic AI Quiz:** Created the `/upload-pdf` endpoint, calculating word lengths to intelligently strip keywords and offer multi-choice distractor answers.

### Step 4: Connecting the Frontend to Backend
1.  **Environment Variables:** Created a `.env` file in the root Vite directory specifying the API target `VITE_API_BASE_URL=http://localhost:8000`.
2.  **`AuthContext` Implementation:** Built React Context to wrap the application, allowing any component to call `login(user)` or `logout()`.
3.  **Data Fetching:** Implemented asynchronous `fetch()` API calls inside `useEffect` hooks across various pages (like `Predictions.jsx`) to await backend JSON responses and update local state (`useState`).

### Step 5: Final Polish & Deployment
1.  **Admin Hierarchy:** Segmented React Router paths to allow only the `user.role === 'admin'` to access the high-level analytics pages. All unauthorized attempts default back to the student view.
2.  **GitHub Hosting:** Initialized a local Git repository, committed the files, and pushed to a remote GitHub repository.
3.  **Production Deployment:** (Pending execution) 
    *   Deploy `ml_backend` to Render via a Web Service.
    *   Change the frontend `.env` to the Render URL.
    *   Deploy the Vite frontend to Vercel/Netlify.

---

## 💻 How to Run Locally

To run the full stack locally on your machine:

**1. Start the Machine Learning Backend**
Ensure you have Python installed.
```bash
cd ml_backend
pip install -r requirements.txt
python -m uvicorn app:app --reload --port 8000
```
*(Or simply double click on `start_ml_backend.bat` in the root folder).*

**2. Start the React Frontend**
Open a new terminal window in the root directory.
```bash
npm install
npm run dev
```

Visit the displayed `localhost` URL in your web browser.
