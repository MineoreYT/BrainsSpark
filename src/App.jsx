import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { App as CapacitorApp } from '@capacitor/app';
import { AuthProvider } from './context/AuthContext';
import LandingPage from './components/LandingPage';
import Register from './components/auth/Register';
import Login from './components/auth/Login';
import TeacherDashboard from './components/teacher/TeacherDashboard';
import StudentDashboard from './components/student/StudentDashboard';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  useEffect(() => {
    // Handle Android back button
    const handleBackButton = CapacitorApp.addListener('backButton', ({ canGoBack }) => {
      if (!canGoBack) {
        // If we can't go back, show exit confirmation
        if (window.confirm('Do you want to exit the app?')) {
          CapacitorApp.exitApp();
        }
      } else {
        // Let the browser handle the back navigation
        window.history.back();
      }
    });

    // Cleanup listener on unmount
    return () => {
      handleBackButton.remove();
    };
  }, []);

  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          
          <Route 
            path="/teacher/dashboard" 
            element={
              <ProtectedRoute requiredRole="teacher">
                <TeacherDashboard />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/student/dashboard" 
            element={
              <ProtectedRoute requiredRole="student">
                <StudentDashboard />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;