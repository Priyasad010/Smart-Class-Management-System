import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage/LandingPage';
import LoginPage from './pages/Login/LoginPage';
import Dashboard from './pages/Dashboard/Dashboard';
import CoursesPage from './pages/LandingPage/CoursesPage';
import TeachersPage from './pages/LandingPage/TeachersPage';
import QRVerifyPage from './pages/QRVerify/QRVerifyPage';
import { NotificationProvider } from './context/NotificationContext';

function App() {
  return (
    <NotificationProvider>
      <Router>
        <Routes>
          {/* Public Landing Page as the root */}
          <Route path="/" element={<LandingPage />} />
          
          {/* Public Courses Discovery Page */}
          <Route path="/courses" element={<CoursesPage />} />

          {/* Public Teachers Discovery Page */}
          <Route path="/teachers" element={<TeachersPage />} /> {/* Add route for TeachersPage */}

          {/* Dedicated Login Page */}
          <Route path="/login" element={<LoginPage />} />
          
          {/* Protected Dashboard Route */}
          <Route path="/dashboard/*" element={<Dashboard />} />
          
          {/* QR Attendance Verification — student phone flow */}
          <Route path="/attendance/verify/:sessionId" element={<QRVerifyPage />} />

          {/* Redirect any unknown routes back to home */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </NotificationProvider>
  );
}

export default App;