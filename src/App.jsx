import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import './App.css';

import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import Attendance from './pages/Attendance';
import Subjects from './pages/Subjects';
import TestsQuizzes from './pages/TestsQuizzes';
import Projects from './pages/Projects';
import Predictions from './pages/Predictions';

// Admin Expand Views
import AdminStudents from './pages/AdminStudents';
import AdminStudentDetail from './pages/AdminStudentDetail';
import AdminSubjects from './pages/AdminSubjects';
import AdminTestsQuizzes from './pages/AdminTestsQuizzes';
import AdminProjects from './pages/AdminProjects';
import AdminPredictions from './pages/AdminPredictions';
import AdminPredictionDetail from './pages/AdminPredictionDetail';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Role-Based Home Component
const HomeDashboard = () => {
  const { user } = useAuth();

  if (user?.role === 'admin') {
    return <AdminDashboard />;
  }

  return <Dashboard />;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route path="/" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<HomeDashboard />} />
        <Route path="attendance" element={<Attendance />} />
        <Route path="subjects" element={<Subjects />} />
        <Route path="tests-quizzes" element={<TestsQuizzes />} />
        <Route path="projects" element={<Projects />} />
        <Route path="predictions" element={<Predictions />} />

        {/* Admin Specific Routes */}
        <Route path="admin/students" element={<AdminStudents />} />
        <Route path="admin/student/:id" element={<AdminStudentDetail />} />
        <Route path="admin/subjects" element={<AdminSubjects />} />
        <Route path="admin/tests-quizzes" element={<AdminTestsQuizzes />} />
        <Route path="admin/projects" element={<AdminProjects />} />
        <Route path="admin/predictions" element={<AdminPredictions />} />
        <Route path="admin/prediction/:id" element={<AdminPredictionDetail />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
