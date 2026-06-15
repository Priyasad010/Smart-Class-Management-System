import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage/LandingPage';
import LoginPage from './pages/Login/LoginPage';
import Dashboard from './pages/Dashboard/Dashboard';
import { NotificationProvider } from './context/NotificationContext';

function App() {
  return (
    <NotificationProvider>
      <Router>
        <Routes>
          {/* Public Landing Page as the root */}
          <Route path="/" element={<LandingPage />} />
          
          {/* Dedicated Login Page */}
          <Route path="/login" element={<LoginPage />} />
          
          {/* Protected Dashboard Route */}
          <Route path="/dashboard/*" element={<Dashboard />} />
          
          {/* Redirect any unknown routes back to home */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </NotificationProvider>
  );
}

export default App;