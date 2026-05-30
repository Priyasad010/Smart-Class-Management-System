import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { IoSchoolOutline, IoPeopleOutline, IoLibraryOutline, IoPersonAddOutline } from 'react-icons/io5';

import TeacherRegistrationForm from './TeacherRegistrationForm';
import TeacherList from './TeacherList';
import SubjectManagementForm from './SubjectManagementForm';

function TeacherManagementPage() {
  const [activeTab, setActiveTab] = useState('list'); // 'list' | 'register' | 'subjects'
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTeachers = async () => {
    try {
      const res = await axios.get('/api/teachers');
      if (res.data?.success) {
        setTeachers(res.data.data);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load teachers list.');
    }
  };

  const fetchSubjects = async () => {
    try {
      const res = await axios.get('/api/teachers/subjects');
      if (res.data?.success) {
        setSubjects(res.data.data);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load subjects catalog.');
    }
  };

  const loadData = async () => {
    setLoading(true);
    await Promise.all([fetchTeachers(), fetchSubjects()]);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-8 min-h-screen">
      
      {/* ─── 1. HEADER SECTION ──────────────────────────────────────────────── */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 border-slate-800 bg-slate-900/60 relative overflow-hidden select-none">
        
        {/* Glow Accent */}
        <div className="absolute top-[-50%] right-[-10%] w-[30%] h-[150%] bg-indigo-500/10 blur-[80px] rounded-full rotate-12 -z-10"></div>
        
        <div className="flex items-center gap-4 text-center md:text-left flex-col md:flex-row">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30 text-indigo-400">
            <IoSchoolOutline size={32} className="animate-pulse" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
              Teacher & Academic Hub
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-xl">
              Register active tutors, manage subject matrices, define curricula categories, and assign course responsibilities.
            </p>
          </div>
        </div>

      </div>

      {/* ─── 2. TAB TOGGLES ─────────────────────────────────────────────────── */}
      <div className="flex border-b border-slate-800 justify-start items-center gap-4 select-none">
        <button
          onClick={() => setActiveTab('list')}
          className={`pb-4 px-6 text-sm font-bold tracking-wide uppercase transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'list'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <IoPeopleOutline size={16} />
          <span>Teacher Directory ({teachers.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('register')}
          className={`pb-4 px-6 text-sm font-bold tracking-wide uppercase transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'register'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <IoPersonAddOutline size={16} />
          <span>Register Teacher</span>
        </button>
        <button
          onClick={() => setActiveTab('subjects')}
          className={`pb-4 px-6 text-sm font-bold tracking-wide uppercase transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'subjects'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <IoLibraryOutline size={16} />
          <span>Subject Matrix ({subjects.length})</span>
        </button>
      </div>

      {/* ─── 3. RENDERING ACTIVE VIEWS ───────────────────────────────────────── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-24 text-center">
          <div className="w-12 h-12 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin mb-4"></div>
          <span className="text-slate-400 font-medium text-sm">Synchronizing academic records...</span>
        </div>
      ) : (
        <div className="transition-all duration-300">
          {activeTab === 'list' && (
            <TeacherList
              teachers={teachers}
              fetchTeachers={fetchTeachers}
              subjects={subjects}
              fetchSubjects={fetchSubjects}
            />
          )}
          {activeTab === 'register' && (
            <TeacherRegistrationForm
              onRegisterSuccess={() => {
                fetchTeachers();
                setActiveTab('list');
              }}
            />
          )}
          {activeTab === 'subjects' && (
            <SubjectManagementForm
              subjects={subjects}
              fetchSubjects={fetchSubjects}
            />
          )}
        </div>
      )}

    </div>
  );
}

export default TeacherManagementPage;
