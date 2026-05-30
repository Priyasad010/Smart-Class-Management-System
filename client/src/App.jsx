import React, { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { IoSchoolOutline, IoNotificationsOutline, IoBookOutline } from 'react-icons/io5';

import StudentDashboard from './components/StudentManagement/StudentDashboard';
import ParentNotificationDashboard from './components/ParentNotification/ParentNotificationDashboard';
import TeacherManagementPage from './components/TeacherManagement/TeacherManagementPage';

function App() {
  const [currentView, setCurrentView] = useState('students'); // 'students' | 'notifications' | 'teachers'

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100 font-sans antialiased">
      
      {/* 🔮 Decorative Gradient Background Glowing Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-glow-purple -z-10 rounded-full blur-[120px] opacity-70"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-glow-sky -z-10 rounded-full blur-[120px] opacity-70"></div>

      {/* ─── 1. GLOBAL NAVIGATION BAR ────────────────────────────────────── */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Brand Logo Header */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <IoSchoolOutline size={22} />
            </div>
            <div>
              <span className="font-extrabold text-base text-white tracking-tight uppercase block leading-none">SmartClass</span>
              <span className="text-[10px] text-slate-400 font-medium tracking-widest uppercase block mt-1">Management Hub</span>
            </div>
          </div>

          {/* Module View Select Navigation */}
          <nav className="flex items-center gap-2">
            <button
              onClick={() => setCurrentView('students')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${
                currentView === 'students'
                  ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400 shadow-sm'
                  : 'bg-transparent border-transparent text-slate-455 hover:text-slate-200 hover:bg-slate-900/40'
              }`}
            >
              <IoSchoolOutline size={16} />
              <span>Student Module</span>
            </button>
            <button
              onClick={() => setCurrentView('notifications')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${
                currentView === 'notifications'
                  ? 'bg-violet-500/10 border-violet-500/30 text-violet-400 shadow-sm'
                  : 'bg-transparent border-transparent text-slate-455 hover:text-slate-200 hover:bg-slate-900/40'
              }`}
            >
              <IoNotificationsOutline size={16} />
              <span>SMS Notifications</span>
            </button>
            <button
              onClick={() => setCurrentView('teachers')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${
                currentView === 'teachers'
                  ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400 shadow-sm'
                  : 'bg-transparent border-transparent text-slate-455 hover:text-slate-200 hover:bg-slate-900/40'
              }`}
            >
              <IoBookOutline size={16} />
              <span>Teacher Hub</span>
            </button>
          </nav>

        </div>
      </header>

      {/* ─── 2. ACTIVE SYSTEM DASHBOARD RENDER ────────────────────────────── */}
      <main className="relative z-10 transition-all duration-300">
        {currentView === 'students' && <StudentDashboard />}
        {currentView === 'notifications' && <ParentNotificationDashboard />}
        {currentView === 'teachers' && <TeacherManagementPage />}
      </main>

      {/* ─── 3. NOTIFICATION TOAST COMPONENT ──────────────────────────────── */}
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#1e293b',
            color: '#f8fafc',
            border: '1px solid rgba(51, 65, 85, 0.5)',
            borderRadius: '16px',
            backdropFilter: 'blur(12px)',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#1e293b',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#1e293b',
            },
          },
        }}
      />

    </div>
  );
}

export default App;

