import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { IoAddOutline, IoSearchOutline, IoFilterOutline, IoRefreshOutline, IoSchoolOutline, IoPeopleOutline, IoCheckmarkCircleOutline, IoCloseCircleOutline, IoStatsChartOutline } from 'react-icons/io5';

import StudentList from './StudentList';
import StudentFormModal from './StudentFormModal';
import StudentDetailModal from './StudentDetailModal';

function StudentDashboard() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [selectedGender, setSelectedGender] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('');
  const [enrollmentYear, setEnrollmentYear] = useState('');

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentToEdit, setStudentToEdit] = useState(null);

  // Statistics
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    uniqueClasses: 0,
  });

  const fetchStudents = async () => {
    setLoading(true);
    try {
      // Build API query parameters
      const params = {};
      if (search) params.search = search;
      if (selectedGender) params.gender = selectedGender;
      if (selectedStatus) params.is_active = selectedStatus;
      if (selectedGrade) params.grade_class = selectedGrade;
      if (enrollmentYear) params.enrollment_year = enrollmentYear;

      const res = await axios.get('/api/students', { params });
      if (res.data?.success) {
        const studentList = res.data.data;
        setStudents(studentList);
        calculateStats(studentList);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load students database.');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (list) => {
    const total = list.length;
    const active = list.filter((s) => s.is_active).length;
    const inactive = total - active;
    
    // Calculate unique grades/classes
    const uniqueGrades = new Set(
      list
        .map((s) => s.grade_class?.trim().toLowerCase())
        .filter(Boolean)
    );

    setStats({
      total,
      active,
      inactive,
      uniqueClasses: uniqueGrades.size,
    });
  };

  useEffect(() => {
    fetchStudents();
  }, [search, selectedGender, selectedStatus, selectedGrade, enrollmentYear]);

  // Extract all unique grade strings from current dataset for the grade filter drop down
  const getUniqueGradesList = () => {
    // We want to extract this from a fresh full fetch, but using the local state is fine for simple view.
    // For robust filtering, we can maintain a static or full set of grades.
    const grades = new Set(students.map((s) => s.grade_class).filter(Boolean));
    return Array.from(grades).sort();
  };

  const handleToggleStatus = async (student) => {
    try {
      const res = await axios.patch(`/api/students/${student.id}/status`);
      if (res.data?.success) {
        const statusMsg = res.data.data.is_active ? 'Activated' : 'Deactivated';
        toast.success(`${student.first_name} is now ${statusMsg}!`);
        
        // Refresh local student database
        fetchStudents();
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to update student active status.');
    }
  };

  const handleResetFilters = () => {
    setSearch('');
    setSelectedGender('');
    setSelectedStatus('');
    setSelectedGrade('');
    setEnrollmentYear('');
    toast.success('Filters cleared successfully');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-8 min-h-screen">
      
      {/* ========================================== */}
      {/* 1. HEADER SECTION (Glassmorphic Accent)    */}
      {/* ========================================== */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 border-slate-800 bg-slate-900/60 relative overflow-hidden select-none">
        
        {/* Glow Accent inside Header */}
        <div className="absolute top-[-50%] right-[-10%] w-[30%] h-[150%] bg-indigo-500/10 blur-[80px] rounded-full rotate-12 -z-10"></div>
        
        <div className="flex items-center gap-4 text-center md:text-left flex-col md:flex-row">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30 text-indigo-400">
            <IoSchoolOutline size={32} className="animate-pulse" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
              Student Management
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-xl">
              Register students, track academic details, auto-generate unique ID credentials & interactive QR codes, and link parental notification details.
            </p>
          </div>
        </div>

        {/* Action Button: Register Student */}
        <button
          onClick={() => {
            setStudentToEdit(null);
            setIsFormOpen(true);
          }}
          className="glass-btn bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold px-6 py-3.5 shadow-glow hover:shadow-indigo-500/30 flex items-center gap-2 group shrink-0"
        >
          <IoAddOutline size={22} className="group-hover:rotate-90 transition-transform duration-200" />
          <span>Register Student</span>
        </button>

      </div>

      {/* ========================================== */}
      {/* 2. STATS OVERVIEW METRICS                  */}
      {/* ========================================== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 select-none">
        
        {/* Total Students Card */}
        <div className="glass-panel bg-slate-900/40 border border-slate-800/40 rounded-2xl p-5 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Enrolled</span>
            <h3 className="text-3xl font-extrabold text-white mt-1">{stats.total}</h3>
          </div>
          <div className="w-11 h-11 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <IoPeopleOutline size={22} />
          </div>
        </div>

        {/* Active Students Card */}
        <div className="glass-panel bg-slate-900/40 border border-slate-800/40 rounded-2xl p-5 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Active Profiles</span>
            <h3 className="text-3xl font-extrabold text-emerald-400 mt-1">{stats.active}</h3>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <IoCheckmarkCircleOutline size={22} />
          </div>
        </div>

        {/* Inactive Students Card */}
        <div className="glass-panel bg-slate-900/40 border border-slate-800/40 rounded-2xl p-5 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Inactive Profiles</span>
            <h3 className="text-3xl font-extrabold text-rose-400 mt-1">{stats.inactive}</h3>
          </div>
          <div className="w-11 h-11 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
            <IoCloseCircleOutline size={22} />
          </div>
        </div>

        {/* Classes Card */}
        <div className="glass-panel bg-slate-900/40 border border-slate-800/40 rounded-2xl p-5 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Unique Classes</span>
            <h3 className="text-3xl font-extrabold text-sky-400 mt-1">{stats.uniqueClasses}</h3>
          </div>
          <div className="w-11 h-11 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
            <IoStatsChartOutline size={22} />
          </div>
        </div>

      </div>

      {/* ========================================== */}
      {/* 3. ADVANCED SEARCH & FILTRATION PANEL      */}
      {/* ========================================== */}
      <div className="glass-panel bg-slate-900/50 border border-slate-800/60 rounded-3xl p-5 sm:p-6 space-y-4 shadow-md select-none">
        
        <div className="flex items-center justify-between gap-4 border-b border-slate-800/60 pb-3">
          <div className="flex items-center gap-2">
            <IoFilterOutline size={20} className="text-indigo-400" />
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Search & Filter Criteria</h3>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={fetchStudents}
              className="p-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors border border-slate-800"
              title="Refresh database"
            >
              <IoRefreshOutline size={18} />
            </button>
            <button
              onClick={handleResetFilters}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-bold underline underline-offset-4"
            >
              Reset Filters
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          
          {/* Search Field */}
          <div className="lg:col-span-2 relative">
            <IoSearchOutline className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input
              type="text"
              placeholder="Search by first, last name or ID code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="glass-input w-full pl-11 py-2.5 text-sm bg-slate-950/40"
            />
          </div>

          {/* Grade/Class Dropdown */}
          <div>
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="glass-input w-full py-2.5 text-sm bg-slate-950/40 text-slate-300"
            >
              <option value="">All Classes</option>
              {getUniqueGradesList().map((grade) => (
                <option key={grade} value={grade} className="bg-slate-900">
                  {grade}
                </option>
              ))}
            </select>
          </div>

          {/* Gender Filter */}
          <div>
            <select
              value={selectedGender}
              onChange={(e) => setSelectedGender(e.target.value)}
              className="glass-input w-full py-2.5 text-sm bg-slate-950/40 text-slate-300"
            >
              <option value="">All Genders</option>
              <option value="Male" className="bg-slate-900">Male</option>
              <option value="Female" className="bg-slate-900">Female</option>
              <option value="Other" className="bg-slate-900">Other</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="glass-input w-full py-2.5 text-sm bg-slate-950/40 text-slate-300"
            >
              <option value="">All Statuses</option>
              <option value="true" className="bg-slate-900">Active Only</option>
              <option value="false" className="bg-slate-900">Inactive Only</option>
            </select>
          </div>

        </div>

      </div>

      {/* ========================================== */}
      {/* 4. STUDENT CARDS LIST VIEW                 */}
      {/* ========================================== */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-24 text-center select-none">
          <div className="w-12 h-12 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin mb-4"></div>
          <span className="text-slate-400 font-medium text-sm">Querying Database...</span>
        </div>
      ) : (
        <StudentList
          students={students}
          onViewDetails={(student) => {
            setSelectedStudent(student);
            setIsDetailOpen(true);
          }}
          onEdit={(student) => {
            setStudentToEdit(student);
            setIsFormOpen(true);
          }}
          onToggleStatus={handleToggleStatus}
        />
      )}

      {/* ========================================== */}
      {/* 5. MODAL POPUPS INTEGRATION                */}
      {/* ========================================== */}
      
      {/* Student Form Wizard Modal */}
      <StudentFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        studentToEdit={studentToEdit}
        onSuccess={fetchStudents}
      />

      {/* Student Detail View Modal */}
      <StudentDetailModal
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedStudent(null);
        }}
        student={selectedStudent}
      />

    </div>
  );
}

export default StudentDashboard;
