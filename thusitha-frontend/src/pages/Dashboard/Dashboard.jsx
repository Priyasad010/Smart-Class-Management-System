import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { studentService } from '../../services/studentService';
import { classService } from '../../services/classService';
import { attendanceService } from '../../services/attendanceService';
import { request } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import jsPDF from 'jspdf';
import QRCode from 'qrcode';

// Modular Components
import Sidebar from '../../components/Dashboard/Sidebar';
import StudentTab from '../../components/Dashboard/StudentTab';
import TeacherTab from '../../components/Dashboard/TeacherTab';
import AttendanceTab from '../../components/Dashboard/AttendanceTab';
import PaymentTab from '../../components/Dashboard/PaymentTab';
import EnrollmentTab from '../../components/Dashboard/EnrollmentTab';
import UserTab from '../../components/Dashboard/UserTab';
import ApprovalTab from '../../components/Dashboard/ApprovalTab';
import HomeTab from '../../components/Dashboard/HomeTab';
import StudyAreaTab from '../../components/Dashboard/StudyAreaTab';
import ExamTab from '../../components/Dashboard/ExamTab';
import ContactTab from '../../components/Dashboard/ContactTab';
import SMSLogTab from '../../components/Dashboard/SMSLogTab';
import MaterialTab from '../../components/Dashboard/MaterialTab';
import ClassTab from '../../components/Dashboard/ClassTab';
import TimetableTab from '../../components/Dashboard/TimetableTab';
import SettingsTab from '../../components/Dashboard/SettingsTab';
import AttendanceValidationTab from '../../components/Dashboard/AttendanceValidationTab';
import PromotionTab from '../../components/Dashboard/PromotionTab';
import SmartAttendanceLivePanel from '../../components/Dashboard/SmartAttendanceLivePanel';
import AuditLogTab from '../../components/Dashboard/AuditLogTab';
import AdminHubTab from '../../components/Dashboard/AdminHubTab';

import AnnouncementTab from '../../components/Dashboard/Tabs/AnnouncementTab';
import AchievementTab from '../../components/Dashboard/Tabs/AchievementTab';
import TeacherClassesTab from '../../components/Dashboard/TeacherClassesTab';

import { createPortal } from 'react-dom';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const modalOverlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  backgroundColor: 'rgba(0,0,0,0.5)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 9999
};

const modalContentStyle = {
  backgroundColor: 'white',
  padding: '30px',
  borderRadius: '12px',
  width: '450px',
  maxHeight: '90vh',
  overflowY: 'auto',
  boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
};

const modalLabelStyle = {
  display: 'block',
  marginBottom: '5px',
  fontWeight: 'bold',
  fontSize: '14px',
  color: '#333'
};

const modalInputSelectStyle = {
  width: '100%',
  padding: '10px',
  borderRadius: '5px',
  border: '1px solid #ddd',
  boxSizing: 'border-box',
  fontSize: '14px'
};

const modalButtonBaseStyle = {
  padding: '10px 20px',
  borderRadius: '6px',
  cursor: 'pointer',
  fontWeight: 'bold',
  fontSize: '14px'
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const userData = localStorage.getItem('user');
  const user = userData ? JSON.parse(userData) : null;

  const [activeTab, setActiveTab] = useState('home');
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [realCourses, setRealCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [studySeats, setStudySeats] = useState([]);
  const [lecturers, setLecturers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [halls, setHalls] = useState([]);
  const [parents, setParents] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [attendanceStats, setAttendanceStats] = useState([]);
  const [smsLogs, setSmsLogs] = useState([]);
  const [classSchedules, setClassSchedules] = useState([]);
  const [courseEnrolledStudents, setCourseEnrolledStudents] = useState([]);
  const [myTimetable, setMyTimetable] = useState([]);
  const [pendingStudents, setPendingStudents] = useState([]);
  const [systemSettings, setSystemSettings] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [aiHealthStats, setAiHealthStats] = useState({});
  const [congestionData, setCongestionData] = useState([]);
  const [hallUtilData, setHallUtilData] = useState([]);
  const [punctualityData, setPunctualityData] = useState([]);
  const [teacherPerfData, setTeacherPerfData] = useState([]);
  const [suspiciousLogs, setSuspiciousLogs] = useState([]);
  const [suspiciousStartDate, setSuspiciousStartDate] = useState('');
  const [suspiciousEndDate, setSuspiciousEndDate] = useState('');
  const [punctualityStartDate, setPunctualityStartDate] = useState('');
  const [punctualityEndDate, setPunctualityEndDate] = useState('');
  const [punctualityCourse, setPunctualityCourse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Add Student States
  const [showAddModal, setShowAddModal] = useState(false);
  const [studentId, setStudentId] = useState('');
  const [name, setName] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [studentGrade, setStudentGrade] = useState('');
  const [selectedParent, setSelectedParent] = useState('');
  const [parentName, setParentName] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);

  // Attendance States
  const [attendanceRecords, setAttendanceRecords] = useState({});
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [selectedAttendanceCourse, setSelectedAttendanceCourse] = useState('');
  const [selectedAttendanceDate, setSelectedAttendanceDate] = useState(new Date().toISOString().split('T')[0]);

  // Role-based permission helpers
  const isAdmin = user?.role === 'Admin';
  const isTeacher = user?.role === 'Teacher';
  const isCounterPerson = user?.role === 'Counter Person';
  const isStudent = user?.role === 'Student';
  const isAdminOrTeacher = isAdmin || isTeacher;
  const isAdminOrCounterPerson = isAdmin || isCounterPerson;
  const isAdminOrTeacherOrCounterPerson = isAdmin || isTeacher || isCounterPerson;
  const isStaff = isAdmin || isTeacher || isCounterPerson;

  // සජීවීව දත්ත ඇදගන්නා Role-Aware Function එක
  const fetchDatabaseData = async (isInitial = false) => {
    if (isInitial) setLoading(true);
    setError('');
    try {
      // Student role: only fetch what they are allowed
      if (isStudent) {
        // Students only need their enrolled courses & timetable
        const [courseData, enrolledData, timetableData, seatData, promoData] = await Promise.all([
          request('/courses').catch(() => []),
          request('/enrollments/my-courses').catch(() => []),
          request('/classes/my-timetable').catch(() => []),
          request('/study-area/seats').catch(() => []),
          request('/promos').catch(() => []),
        ]);
        setRealCourses(courseData || []);
        setEnrolledCourses(enrolledData || []);
        setMyTimetable(timetableData || []);
        setStudySeats(seatData || []);
        setPromotions(promoData || []);
        // Clear all admin-only state
        setAuditLogs([]);
        setAiHealthStats({});
        setCongestionData([]);
        setHallUtilData([]);
        setPunctualityData([]);
        setTeacherPerfData([]);
        setSuspiciousLogs([]);
        setStudents([]);
        setClasses([]);
        setParents([]);
        setLecturers([]);
        setSubjects([]);
        setHalls([]);
        setRevenueData([]);
        setAttendanceStats([]);
        setInquiries([]);
        setSmsLogs([]);
        setClassSchedules([]);
        setPendingStudents([]);
        setSystemSettings([]);
        return;
      }

      // Staff roles: fetch based on their specific permissions
      const [
        studentData,
        classData,
        parentData,
        courseData,
        lecturerData,
        subjectData,
        hallData,
        revData,
        attData,
        msgData,
        seatData,
        smsData,
        schedulesData,
        promoData,
        auditData,
        healthData,
        congestionInfo,
        hallUtilInfo,
        punctualityInfo,
        teacherPerfInfo
      ] = await Promise.all([
        // Students list: Admin, Counter Person, Teacher
        isStaff
          ? studentService.getAllStudents().catch(e => { console.error('Students error:', e); return []; })
          : Promise.resolve([]),
        // Classes/Users: Admin only
        isAdmin
          ? classService.getAllClasses().catch(e => { console.error('Classes error:', e); return []; })
          : Promise.resolve([]),
        // Parents: Admin or Counter Person
        isAdminOrCounterPerson
          ? request('/parents').catch(e => { console.error('Parents error:', e); return []; })
          : Promise.resolve([]),
        // Courses: All roles
        request('/courses').catch(e => { console.error('Courses error:', e); return []; }),
        // Teachers: Admin or Teacher
        isAdminOrTeacher
          ? request('/teachers').catch(e => { console.error('Teachers error:', e); return []; })
          : Promise.resolve([]),
        // Subjects: Admin or Teacher
        isAdminOrTeacher
          ? request('/subjects').catch(e => { console.error('Subjects error:', e); return []; })
          : Promise.resolve([]),
        // Halls: Admin, Teacher, Counter Person
        isAdminOrTeacherOrCounterPerson
          ? request('/halls').catch(e => { console.error('Halls error:', e); return []; })
          : Promise.resolve([]),
        // Revenue: Admin only
        isAdmin
          ? request('/reports/revenue').catch(e => { console.error('Revenue error:', e); return []; })
          : Promise.resolve([]),
        // Attendance stats: Admin or Teacher
        isAdminOrTeacher
          ? request('/reports/attendance-stats').catch(e => { console.error('Attendance error:', e); return []; })
          : Promise.resolve([]),
        // Contact messages: Admin only
        isAdmin
          ? request('/contact/messages').catch(e => { console.error('Messages error:', e); return []; })
          : Promise.resolve([]),
        // Study area seats: All staff
        request('/study-area/seats').catch(e => { console.error('Seats error:', e); return []; }),
        // SMS logs: Admin only
        isAdmin
          ? request('/sms/logs').catch(e => { console.error('SMS error:', e); return []; })
          : Promise.resolve([]),
        // Class schedules: Admin, Teacher, Counter Person
        isAdminOrTeacherOrCounterPerson
          ? request('/classes/schedules').catch(e => { console.error('Schedules error:', e); return []; })
          : Promise.resolve([]),
        // Promos: All
        request('/promos').catch(e => { console.error('Promos error:', e); return []; }),
        // Audit Logs: Admin
        isAdmin ? request('/audit/logs').catch(e => { console.error('Audit error:', e); return []; }) : Promise.resolve([]),
        // AI Health: Admin
        isAdmin ? request('/attendance/health-stats').catch(e => { console.error('Health error:', e); return {}; }) : Promise.resolve({}),
        // Congestion: Admin
        isAdmin ? request('/reports/congestion-history').catch(e => { console.error('Congestion error:', e); return []; }) : Promise.resolve([]),
        // Hall Utilization: Admin
        isAdmin ? request('/reports/hall-utilization').catch(e => { console.error('Hall util error:', e); return []; }) : Promise.resolve([]),
        // Punctuality: Admin/Teacher
        isAdminOrTeacher ? request('/reports/punctuality').catch(e => { console.error('Punctuality error:', e); return []; }) : Promise.resolve([]),
        // Teacher Performance: Admin
        isAdmin ? request('/reports/teacher-performance').catch(e => { console.error('Teacher perf error:', e); return []; }) : Promise.resolve([])
      ]);

      setStudents(studentData || []);
      setClasses(classData || []);
      setParents(parentData || []);
      setRealCourses(courseData || []);
      setLecturers(lecturerData || []);
      setSubjects(subjectData || []);
      setHalls(hallData || []);
      setRevenueData(revData || []);
      setAttendanceStats(attData || []);
      setInquiries(msgData || []);
      setStudySeats(seatData || []);
      setSmsLogs(smsData || []);
      setClassSchedules(schedulesData || []);
      setPromotions(promoData || []);
      setAuditLogs(auditData || []);
      setAiHealthStats(healthData || {});
      setCongestionData(congestionInfo || []);
      setHallUtilData(hallUtilInfo || []);
      setPunctualityData(punctualityInfo || []);
      setTeacherPerfData(teacherPerfInfo || []);

      // Suspicious Logs (Admin only)
      if (isAdmin) {
        const suspData = await request('/attendance/suspicious-logs').catch(e => { console.error('Suspicious logs error:', e); return []; });
        setSuspiciousLogs(suspData || []);
      } else {
        setSuspiciousLogs([]);
      }

      // පද්ධති සැකසුම් (Admin Only)
      if (isAdmin) {
        const settings = await request('/settings').catch(e => {
          console.error('Settings error:', e);
          return [];
        });
        setSystemSettings(settings || []);
      } else {
        setSystemSettings([]);
      }

      // පෞද්ගලික කාලසටහන (Teacher only for staff - student handled above)
      if (isTeacher) {
        const timetableData = await request('/classes/my-timetable').catch(e => {
          console.error('Timetable error:', e);
          return [];
        });
        setMyTimetable(timetableData || []);
      } else {
        setMyTimetable([]);
      }

      // අනුමැතිය සඳහා සිටින සිසුන් (Admin and Counter Person only)
      if (isAdminOrCounterPerson) {
        const pendingData = await request('/students/pending').catch(e => {
          console.error('Pending students error:', e);
          return [];
        });
        setPendingStudents(pendingData || []);
      } else {
        setPendingStudents([]);
      }

      setEnrolledCourses([]);

      if (studentData && studentData.length > 0) {
        const initialAttendance = {};
        studentData.forEach(student => {
          const studentKey = student._id || student.studentId;
          initialAttendance[studentKey] = true;
        });
        setAttendanceRecords(initialAttendance);
      }
    } catch (err) {
      console.error('Dashboard Fetch Error:', err);
      setError('දත්ත ලබා ගැනීමේදී දෝෂයක් සිදුවිය. කරුණාකර පසුව නැවත උත්සාහ කරන්න.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDatabaseData(true);
    }
  }, []); // Run once on mount only - tab changes don't need full re-fetch

  // 📋 Fetch enrolled students when attendance course changes
  useEffect(() => {
    if (selectedAttendanceCourse) {
      request(`/enrollments/course/${selectedAttendanceCourse}`)
        .then(data => setCourseEnrolledStudents(data || []))
        .catch(() => setCourseEnrolledStudents([]));
    } else {
      setCourseEnrolledStudents([]);
    }
  }, [selectedAttendanceCourse]);

  // 🕒 Attendance Sync: Fetches current attendance status for the selected course
  useEffect(() => {
    if (selectedAttendanceCourse && students.length > 0 && selectedAttendanceDate) {
      request(`/attendance/logs/${selectedAttendanceCourse}?date=${selectedAttendanceDate}`)
        .then(logs => {
          const records = {};
          // Default all students to false (absent)
          students.forEach(student => {
            const studentKey = student._id || student.studentId;
            records[studentKey] = false;
          });
          // Check present students based on fetched logs
          if (logs && Array.isArray(logs)) {
            logs.forEach(log => {
              records[log.student_id] = true;
            });
          }
          setAttendanceRecords(records);
        })
        .catch(err => {
          console.error('Error fetching course logs:', err);
          showNotification('පැමිණීමේ දත්ත ලබා ගැනීම අසාර්ථකයි.', 'error');
        });
    } else {
      // Reset all to false if no course selected
      const records = {};
      students.forEach(student => {
        const studentKey = student._id || student.studentId;
        records[studentKey] = false;
      });
      setAttendanceRecords(records);
    }
  }, [selectedAttendanceCourse, students, selectedAttendanceDate]);

  if (!user) {
    return <Navigate to="/" />;
  }

  const handleOpenAddStudentModal = () => {
    let nextIdStr = 'ST001';
    if (students && students.length > 0) {
      let maxIdNum = 0;
      students.forEach(s => {
        if (s.studentId) {
          const numMatch = s.studentId.match(/\d+/);
          if (numMatch) {
            const num = parseInt(numMatch[0], 10);
            if (num > maxIdNum) maxIdNum = num;
          }
        }
      });
      const nextNum = maxIdNum + 1;
      nextIdStr = `ST${nextNum.toString().padStart(3, '0')}`;
    }
    setStudentId(nextIdStr);
    setShowAddModal(true);
  };

  // ශිෂ්‍යයින් සඳහා Modal Handler ටික
  const handleAddStudent = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    try {
      await studentService.createStudent({
        username: studentId,
        password: 'Thusitha@123',
        student_name: name,
        school: schoolName,
        grade: studentGrade,
        qr_code_key: studentId,
        parent_id: selectedParent,
        parent_name: parentName,
        parent_phone: parentPhone
      });
      setShowAddModal(false);
      setStudentId('');
      setName('');
      setSchoolName('');
      setStudentGrade('');
      setParentName('');
      setParentPhone('');
      setSelectedParent('');
      fetchDatabaseData();
      showNotification('ශිෂ්‍යයා සාර්ථකව ඇතුළත් කළා!');
    } catch (err) {
      console.error('Add Student Error:', err);
      showNotification(err.message, 'error');
    } finally {
      setSubmitLoading(false);
    }
  };

  // ශිෂ්‍යයෙක් සංස්කරණය කිරීමේ Handler එක
  const handleEditStudent = async (id, studentData) => {
    try {
      await studentService.updateStudent(id, studentData);
      showNotification('ශිෂ්‍ය දත්ත සාර්ථකව යාවත්කාලීන කළා!');
      fetchDatabaseData();
    } catch (err) {
      console.error('Edit Student Error:', err);
      showNotification(err.message, 'error');
      throw err;
    }
  };

  // ශිෂ්‍යයෙක් ඉවත් කිරීමේ Handler එක
  const handleDeleteStudent = async (id) => {
    try {
      await studentService.deleteStudent(id);
      showNotification('ශිෂ්‍යයා පද්ධතියෙන් ඉවත් කළා!');
      fetchDatabaseData();
    } catch (err) {
      console.error('Delete Student Error:', err);
      showNotification(err.message, 'error');
      throw err;
    }
  };

  // ගුරුවරයෙක් එකතු කිරීමේ Handler එක
  const handleAddTeacher = async (teacherData) => {
    try {
      await request('/teachers/register', {
        method: 'POST',
        body: teacherData
      });
      showNotification('ගුරුවරයා සාර්ථකව ඇතුළත් කළා!');
      fetchDatabaseData();
    } catch (err) {
      console.error('Add Teacher Error:', err);
      showNotification(err.message, 'error');
      throw err;
    }
  };

  // ගුරුවරයෙක් සංස්කරණය කිරීමේ Handler එක
  const handleEditTeacher = async (id, teacherData) => {
    try {
      await request(`/teachers/${id}`, {
        method: 'PUT',
        body: teacherData
      });
      showNotification('ගුරු දත්ත සාර්ථකව යාවත්කාලීන කළා!');
      fetchDatabaseData();
    } catch (err) {
      console.error('Edit Teacher Error:', err);
      showNotification(err.message, 'error');
      throw err;
    }
  };

  // ගුරුවරයෙක් ඉවත් කිරීමේ Handler එක
  const handleDeleteTeacher = async (id) => {
    try {
      await request(`/teachers/${id}`, {
        method: 'DELETE'
      });
      showNotification('ගුරුවරයා පද්ධතියෙන් ඉවත් කළා!');
      fetchDatabaseData();
    } catch (err) {
      console.error('Delete Teacher Error:', err);
      showNotification(err.message, 'error');
      throw err;
    }
  };

  // 🆔 Student ID Card Generator Logic
  const handleDownloadIDCard = async (student) => {
    try {
      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: [85, 55] }); // Standard CR80 size
      const qrDataUrl = await QRCode.toDataURL(String(student.studentId));

      // Background & Style
      doc.setFillColor(26, 35, 126); // Thusitha Navy Blue
      doc.rect(0, 0, 85, 15, 'F');

      doc.setFontSize(12);
      doc.setTextColor(255);
      doc.text('THUSITHA SMART CLASS', 42.5, 10, { align: 'center' });

      doc.setTextColor(0);
      doc.setFontSize(10);
      doc.text(`Name: ${student.name}`, 5, 25);
      doc.text(`ID: ${student.studentId}`, 5, 32);
      doc.text(`School: ${student.email || 'N/A'}`, 5, 39);

      // Add QR Code
      doc.addImage(qrDataUrl, 'PNG', 55, 20, 25, 25);

      doc.save(`ID_Card_${student.studentId}.pdf`);
      showNotification('ID පත සාර්ථකව නිර්මාණය කළා!');
    } catch (err) {
      console.error('ID Card generation error:', err);
      showNotification('ID පත සැකසීම අසාර්ථකයි.', 'error');
    }
  };

  // --- Class Management Handlers ---

  const handleCreateCourse = async (courseData) => {
    try {
      await request('/courses', { method: 'POST', body: courseData });
      showNotification('පාඨමාලාව සාර්ථකව එකතු කළා!');
      fetchDatabaseData();
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  const handleDeleteCourse = async (id) => {
    try {
      await request(`/courses/${id}`, { method: 'DELETE' });
      showNotification('පාඨමාලාව ඉවත් කළා!');
      fetchDatabaseData();
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  const handleCreateSubject = async (subjectData) => {
    try {
      await request('/subjects', { method: 'POST', body: subjectData });
      showNotification('විෂය සාර්ථකව එකතු කළා!');
      fetchDatabaseData();
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  const handleDeleteSubject = async (id) => {
    try {
      await request(`/subjects/${id}`, { method: 'DELETE' });
      showNotification('විෂය ඉවත් කළා!');
      fetchDatabaseData();
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  const handleCreateHall = async (hallData) => {
    try {
      await request('/halls', { method: 'POST', body: hallData });
      showNotification('ශාලාව සාර්ථකව එකතු කළා!');
      fetchDatabaseData();
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  const handleDeleteHall = async (id) => {
    try {
      await request(`/halls/${id}`, { method: 'DELETE' });
      showNotification('ශාලාව ඉවත් කළා!');
      fetchDatabaseData();
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  // ---------------------------------

  const handleCreatePromo = async (formData) => {
    try {
      await request('/promos', { method: 'POST', body: formData, isFormData: true });
      fetchDatabaseData();
      showNotification('ප්‍රවර්ධන දත්ත සාර්ථකව උඩුගත කළා!');
    } catch (err) { showNotification(err.message, 'error'); }
  };

  const handleUpdatePromo = async (id, formData) => {
    try {
      await request(`/promos/${id}`, { method: 'PUT', body: formData, isFormData: true });
      fetchDatabaseData();
    } catch (err) { showNotification(err.message, 'error'); }
  };

  const handleDeletePromo = async (id) => {
    try {
      await request(`/promos/${id}`, { method: 'DELETE' });
      fetchDatabaseData();
    } catch (err) { showNotification(err.message, 'error'); }
  };

  // නව සැකසුමක් (Template) එකතු කිරීමේ Handler එක
  const handleCreateSetting = async (settingData) => {
    try {
      await request('/settings/create', {
        method: 'POST',
        body: settingData
      });
      showNotification('නව සැකසුම සාර්ථකව එක් කළා!');
      fetchDatabaseData();
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  // සැකසුමක් ඉවත් කිරීමේ Handler එක
  const handleDeleteSetting = async (key) => {
    if (!globalThis.confirm('මෙම සැකසුම ඉවත් කිරීම ස්ථිරද?')) return;
    try {
      await request(`/settings/delete/${key}`, {
        method: 'DELETE'
      });
      showNotification('සැකසුම සාර්ථකව ඉවත් කළා!');
      fetchDatabaseData();
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  // පණිවිඩයක් වැදගත් ලෙස සලකුණු කිරීමේ Handler එක
  const handleToggleImportant = async (id) => {
    try {
      await request(`/contact/important/${id}`, { method: 'PATCH' });
      fetchDatabaseData();
    } catch (err) {
      console.error('Error toggling importance:', err);
      showNotification(err.message, 'error');
    }
  };

  // Quick Reply SMS Handler
  const handleQuickReply = async (message, text) => {
    if (!message.sender_phone) return showNotification('මෙම විමසීමේ දුරකථන අංකයක් නොමැත.', 'error');
    try {
      await request('/sms/send-custom', {
        method: 'POST',
        body: { phone: message.sender_phone, message: text }
      });
      showNotification('Quick Reply WhatsApp පණිවිඩය සාර්ථකව යවන ලදී!');
      handleMarkRead(message.message_id); // Auto mark as read
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  // සියලුම පණිවිඩ කියවූ බව සටහන් කිරීමේ Handler එක
  const handleMarkAllRead = async () => {
    try {
      await request('/contact/mark-all-read', { method: 'PATCH' });
      showNotification('සියලුම පණිවිඩ කියවූ බව සටහන් කළා!');
      fetchDatabaseData();
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  const handleBulkDeleteSpam = async () => {
    if (!window.confirm("Are you sure you want to delete all Spam messages?")) return;
    try {
      await request('/contact/bulk-delete-spam', { method: 'DELETE' });
      showNotification('සියලුම Spam පණිවිඩ මකා දමන ලදී!');
      fetchDatabaseData();
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  // ශිෂ්‍ය අනුමැතිය ලබා දීමේ Handler එක
  const handleApproveStudent = async (pendingId, qrKey) => {
    try {
      await request('/students/approve', {
        method: 'POST',
        body: { pending_id: pendingId, qr_code_key: qrKey }
      });
      showNotification('ශිෂ්‍යයා සාර්ථකව අනුමත කර ගිණුම සක්‍රිය කළා!');
      fetchDatabaseData(); // Refresh all lists
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  // පන්ති ලියාපදිංචි කිරීමේ Handler එක
  const handleEnroll = async (enrollData) => {
    try {
      await request('/enrollments/enroll', {
        method: 'POST',
        body: enrollData
      });
      showNotification('ශිෂ්‍යයා පන්තියට සාර්ථකව ඇතුළත් කළා!');
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  // පණිවිඩයක් කියවූ බව සටහන් කිරීමේ Handler එක
  const handleMarkRead = async (id) => {
    try {
      await request(`/contact/read/${id}`, { method: 'PATCH' });
      fetchDatabaseData();
      showNotification('පණිවිඩය කියවූ බව සටහන් කළා!');
    } catch (err) {
      console.error('Error marking message as read:', err);
      showNotification(err.message, 'error');
    }
  };

  // පණිවිඩයක් Spam ලෙස සටහන් කිරීමේ Handler එක
  const handleMarkSpam = async (id) => {
    try {
      await request(`/contact/spam/${id}`, { method: 'PATCH' });
      fetchDatabaseData();
      showNotification('පණිවිඩය Spam ලෙස සටහන් කළා!');
    } catch (err) {
      console.error('Error marking message as spam:', err);
      showNotification(err.message, 'error');
    }
  };

  // පණිවිඩයක් Spam වලින් ඉවත් කිරීමේ Handler එක
  const handleRecoverFromSpam = async (id) => {
    try {
      await request(`/contact/recover/${id}`, { method: 'PATCH' });
      fetchDatabaseData();
      showNotification('පණිවිඩය Spam වලින් සාර්ථකව ඉවත් කළා!');
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  // විභාගයක් ඇතුළත් කිරීමේ Handler එක
  const handleCreateExam = async (examData) => {
    try {
      await request('/exams', {
        method: 'POST',
        body: examData
      });
      showNotification('විභාගය සාර්ථකව ඇතුළත් කළා!');
      fetchDatabaseData();
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  // සියලුම සිසුන් Encode කිරීමේ Handler එක
  const handleBulkEncode = async () => {
    try {
      const response = await request('/students/bulk-encode', { method: 'POST' });
      showNotification(response.message);
      fetchDatabaseData();
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  // පැමිණීමේ විසංවාදයක් පිළිබඳ මව්පියන්ට දැනුම් දීමේ Handler එක
  const handleSendDiscrepancySMS = async (studentId, sessionId) => {
    try {
      await request('/attendance/discrepancy-alert', {
        method: 'POST',
        body: { student_id: studentId, session_id: sessionId }
      });
      showNotification('මව්පියන්ට දැනුම් දීමේ WhatsApp පණිවිඩය සාර්ථකව යවන ලදී.');
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  // පෙරාගත් සියලුම සිසුන්ගේ මව්පියන්ට දැනුම් දීමේ Handler එක (Bulk)
  const handleBulkDiscrepancyAlert = async (studentIds, sessionId) => {
    try {
      const response = await request('/attendance/bulk-discrepancy-alert', {
        method: 'POST',
        body: { student_ids: studentIds, session_id: sessionId }
      });
      showNotification(response.message);
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  // Safety Drill ආරම්භ කිරීමේ Handler එක
  const handleTriggerSafetyDrill = async () => {
    if (!globalThis.confirm('Safety Drill එකක් ආරම්භ කිරීමට ඔබ වග බලා ගන්න. සියලුම කාර්ය මණ්ඩලයට WhatsApp පණිවිඩ යවනු ලැබේ.')) return;
    try {
      const response = await request('/attendance/safety-drill', { method: 'POST' });
      showNotification(response.message);
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  // මුහුණේ දත්ත ගණනය කිරීමේ Handler එක (Optimization)
  const handleGenerateEncoding = async (studentId) => {
    try {
      await request(`/students/encode/${studentId}`, { method: 'POST' });
      showNotification('ශිෂ්‍යයාගේ මුහුණේ දත්ත සාර්ථකව ගණනය කළා!');
      fetchDatabaseData();
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  // 🛡️ Upload student profile photo
  const handleUploadPhoto = async (studentId, file) => {
    const formData = new FormData();
    formData.append('photo', file);
    try {
      await studentService.uploadStudentPhoto(studentId, formData);
      showNotification('ඡායාරූපය සාර්ථකව උඩුගත කළා!');
      fetchDatabaseData();
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  // සැකසුමක් යාවත්කාලීන කිරීමේ Handler එක
  const handleUpdateSetting = async (key, value) => {
    try {
      await request('/settings/update', {
        method: 'POST',
        body: { key, value }
      });
      showNotification('සැකසුම සාර්ථකව සුරැකුණි!');
      fetchDatabaseData();
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  // නව පන්ති කාලසටහනක් නිර්මාණය කිරීමේ Handler එක
  const handleCreateClass = async (classData) => {
    try {
      await request('/classes/schedule', {
        method: 'POST',
        body: classData
      });
      showNotification('පන්ති කාලසටහන සාර්ථකව සුරැකුණි!');
      fetchDatabaseData(); // Refresh schedules
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  // පන්ති කාලසටහනක් යාවත්කාලීන කිරීමේ Handler එක
  const handleUpdateClass = async (id, classData) => {
    try {
      await request(`/classes/schedule/${id}`, {
        method: 'PUT',
        body: classData
      });
      showNotification('පන්ති කාලසටහන සාර්ථකව යාවත්කාලීන කළා!');
      fetchDatabaseData();
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  // පන්ති කාලසටහනක් ඉවත් කිරීමේ Handler එක
  const handleDeleteClass = async (id) => {
    try {
      await request(`/classes/schedule/${id}`, { method: 'DELETE' });
      showNotification('පන්ති කාලසටහන සාර්ථකව ඉවත් කළා!');
      fetchDatabaseData();
    } catch (err) {
      showNotification(err.message, 'error');
      throw err;
    }
  };

  const handleResetPassword = async (userId) => {
    try {
      await request(`/users/reset-password/${userId}`, { method: 'POST' });
      showNotification('Password reset request sent successfully.');
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  const handleCreateUser = async (userData) => {
    try {
      await request('/users', {
        method: 'POST',
        body: userData
      });
      showNotification('නව පරිශීලකයා සාර්ථකව ඇතුළත් කළා!');
      fetchDatabaseData();
    } catch (err) {
      showNotification(err.message, 'error');
      throw err;
    }
  };

  const handleDeleteUser = async (id) => {
    try {
      await request(`/users/${id}`, { method: 'DELETE' });
      showNotification('පරිශීලකයා සාර්ථකව ඉවත් කළා!');
      fetchDatabaseData();
    } catch (err) {
      showNotification(err.message, 'error');
      throw err;
    }
  };

  const handleCheckOutSeat = async (bookingId, seatId) => {
    try {
      await request(`/study-area/check-out/${bookingId}`, { 
        method: 'POST',
        body: { seat_id: seatId } 
      });
      showNotification('අසුනින් පිටවීම සාර්ථකයි!');
      fetchDatabaseData();
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  // අසුනකට පැමිණීම සටහන් කිරීම (Check-in)
  const handleCheckInSeat = async (bookingId) => {
    try {
      await request(`/study-area/check-in/${bookingId}`, {
        method: 'PATCH'
      });
      showNotification('පැමිණීම සාර්ථකව සටහන් කළා! පැය 4ක කාලය ආරම්භ විය.');
      fetchDatabaseData();
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  // අසුන් වෙන් කිරීමේ Handler එක
  const handleBookSeat = async (bookingData) => {
    try {
      await request('/study-area/book', {
        method: 'POST',
        body: bookingData
      });
      showNotification('අසුන සාර්ථකව වෙන් කළා!');
      fetchDatabaseData(); // Refresh seat availability
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  // හිඟ මුදල් මතක් කිරීමේ Handler එක
  const handleSendReminders = async (reminderData) => {
    try {
      const response = await request('/payments/remind', {
        method: 'POST',
        body: reminderData
      });
      showNotification(response.message);
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  // ගෙවීම් සටහන් කිරීමේ Handler එක
  const handleRecordPayment = async (paymentData) => {
    try {
      await request('/payments', {
        method: 'POST',
        body: paymentData
      });
      showNotification('ගෙවීම සාර්ථකව සුරැකුණි!');
      fetchDatabaseData();
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  // විභාගයක් යාවත්කාලීන කිරීමේ Handler එක
  const handleUpdateExam = async (id, examData) => {
    try {
      await request(`/exams/${id}`, {
        method: 'PUT',
        body: examData
      });
      showNotification('විභාගය සාර්ථකව යාවත්කාලීන කළා!');
      fetchDatabaseData();
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  // විභාගයක් ඉවත් කිරීමේ Handler එක
  const handleDeleteExam = async (id) => {
    try {
      await request(`/exams/${id}`, { method: 'DELETE' });
      showNotification('විභාගය පද්ධතියෙන් ඉවත් කළා!');
    } catch (err) {
      showNotification(err.message, 'error');
      throw err;
    }
  };

  // SMS පණිවිඩයක් නැවත යැවීමේ Handler එක
  const handleResendSMS = async (logId) => {
    try {
      await request(`/sms/resend/${logId}`, { method: 'POST' });
      showNotification('WhatsApp පණිවිඩය සාර්ථකව නැවත යවන ලදී!');
      fetchDatabaseData(); // වාර්තා නැවත පූරණය කිරීම
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  // SMS වාර්තාව UI එකෙන් පමණක් ඉවත් කිරීම (UI Only Delete)
  const handleDeleteSMSLog = (id) => {
    setSmsLogs(prev => prev.filter(log => log.log_id !== id));
  };

  // පණිවිඩ තොග වශයෙන් නැවත යැවීම (Bulk Resend)
  const handleBulkResendSMS = async (date) => {
    if (!date) return showNotification('කරුණාකර දිනයක් තෝරන්න.', 'error');
    try {
      await request('/sms/bulk-resend', {
        method: 'POST',
        body: { date }
      });
      showNotification('තෝරාගත් දිනට අදාළ පණිවිඩ නැවත යැවීම ආරම්භ කරන ලදී.');
      fetchDatabaseData();
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  // පෙරාගත් අසාර්ථක පණිවිඩ සියල්ල නැවත යැවීම
  const handleResendFilteredFailed = async (ids) => {
    try {
      await request('/sms/bulk-resend-ids', {
        method: 'POST',
        body: { ids }
      });
      showNotification(`${ids.length} පණිවිඩ නැවත යැවීම ආරම්භ කරන ලදී.`);
      fetchDatabaseData();
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  // සැකසහිත ක්‍රියාකාරකම් ලොගයක් නිරාකරණය කිරීමේ Handler
  const handleResolveSuspiciousLog = async (logId, comment) => {
    try {
      await request(`/attendance/resolve-log/${logId}`, {
        method: 'PATCH',
        body: { resolution_comment: comment }
      });
      showNotification('ලොගය සාර්ථකව නිරාකරණය කළා!');
      const suspData = await request('/attendance/suspicious-logs').catch(() => []);
      setSuspiciousLogs(suspData || []);
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  const handleCheckboxChange = (id) => {
    setAttendanceRecords(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };



  // Filtering students based on enrollment
  const getFilteredStudents = () => {
    if (!selectedAttendanceCourse) return students;
    // Map enrolled student IDs to full student objects
    const enrolledIds = new Set(courseEnrolledStudents.map(e => String(e.student_id)));
    return students.filter(student => enrolledIds.has(String(student._id)));
  };

  // පැමිණීම ඩේටාබේස් එකට යැවීම
  const handleSaveAttendance = async () => {
    if (!selectedAttendanceCourse) {
      showNotification('කරුණාකර පන්තියක් (Class) තෝරන්න.', 'warning');
      return;
    }
    setAttendanceLoading(true);
    try {
      const records = Object.keys(attendanceRecords).map(id => ({
        student: id,
        status: attendanceRecords[id] ? 'Present' : 'Absent'
      }));

      await attendanceService.saveAttendance({
        date: selectedAttendanceDate,
        course_id: selectedAttendanceCourse,
        records: records
      });
      showNotification('අද දින පැමිණීම සාර්ථකව සුරැකුණි!');
    } catch (err) {
      console.error('Save Attendance Error:', err);
      showNotification(err.message, 'error');
    } finally {
      setAttendanceLoading(false);
    }
  };



  const handleLogout = () => {
    localStorage.removeItem('token'); // Remove token from localStorage
    localStorage.clear();
    navigate('/');
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden font-sans relative selection:bg-secondary-light selection:text-white">
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-secondary/5 rounded-full blur-[100px] pointer-events-none"></div>

      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
        role={user.role}
      />

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col overflow-y-auto relative z-10 custom-scrollbar">
        {/* Dynamic Topbar with Glassmorphism */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="sticky top-0 z-30 h-20 bg-white/60 backdrop-blur-xl border-b border-white/50 flex items-center justify-between px-10 shadow-glass"
        >
          <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-dark to-secondary-dark flex items-center gap-3 text-2xl tracking-tight">
            {activeTab === 'home' && '📊 Dashboard Overview'}
            {activeTab === 'students' && '🧑‍🎓 Student Management'}
            {activeTab === 'classes' && '📚 Class & User Management'}
            {activeTab === 'attendance' && '📝 Attendance Management'}
            {activeTab === 'study_area' && '📖 Study Area Booking'}
            {activeTab === 'exams' && '📝 Exams & Results'}
            {activeTab === 'payments' && '💰 Payment Management'}
            {activeTab === 'approvals' && '⏳ Student Approvals'}
            {activeTab === 'ai_panel' && '🎥 AI නිරීක්ෂණය සහ පරීක්ෂාව'}
          </span>
          <div className="flex items-center gap-6">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="text-sm text-gray-700 bg-white/80 backdrop-blur-md px-5 py-2.5 rounded-full shadow-glass border border-white/50 font-semibold flex items-center gap-2"
            >
              පරිශීලක: <span className="text-secondary font-bold bg-secondary/10 px-2 py-0.5 rounded-md">{user.username}</span>
            </motion.div>
          </div>
        </motion.div>

        <div className="p-10 flex-1 w-full max-w-7xl mx-auto relative z-0">
          {error && (
            <motion.div initial={{ opacity: 0, y: -20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} className="text-rose-700 bg-rose-50/80 backdrop-blur-md p-5 rounded-2xl mb-8 shadow-glass border border-rose-200 flex items-center gap-3 font-bold text-lg">
              ⚠️ {error}
            </motion.div>
          )}
          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-4 text-primary-dark font-extrabold text-xl animate-pulse bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-glass border border-white/50 w-max mb-8">
              <span className="loader"></span> දත්ත පූරණය වෙමින් පවතී...
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -30, filter: 'blur(10px)' }}
              transition={{ type: 'spring', stiffness: 250, damping: 25 }}
              className="w-full"
            >

              {/* HOME TAB */}
              {!loading && activeTab === 'home' && (
                <HomeTab
                  username={user.username}
                  role={user.role}
                  studentCount={students.length}
                  userCount={classes.length}
                  enrolledCourses={enrolledCourses}
                  revenueData={revenueData}
                  attendanceData={attendanceStats}
                />
              )}

              {/* STUDENTS TAB */}
              {!loading && activeTab === 'students' && (
                <>
                  {isAdmin && (
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
                      <button
                        onClick={handleBulkEncode}
                        style={{ padding: '10px 20px', backgroundColor: '#455a64', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}
                      >
                        ⚙️ සියලුම සිසුන් Encode කරන්න (Bulk Encode)
                      </button>
                    </div>
                  )}
                  <StudentTab students={students} onAddClick={handleOpenAddStudentModal} onEditClick={handleEditStudent} onDeleteClick={handleDeleteStudent} onEncode={handleGenerateEncoding} onUploadPhoto={handleUploadPhoto} onDownloadIDCard={handleDownloadIDCard} role={user.role} />
                </>
              )}

              {/* TEACHERS TAB */}
              {!loading && activeTab === 'teachers' && isAdmin && (
                <TeacherTab 
                  teachers={lecturers} 
                  onAdd={handleAddTeacher} 
                  onEdit={handleEditTeacher} 
                  onDelete={handleDeleteTeacher} 
                />
              )}

              {/* APPROVALS TAB */}
              {!loading && activeTab === 'approvals' && (
                <ApprovalTab pendingStudents={pendingStudents} onApprove={handleApproveStudent} />
              )}

              {/* CLASS MANAGEMENT TAB */}
              {!loading && activeTab === 'class_management' && (
                <ClassTab
                  courses={realCourses}
                  lecturers={lecturers}
                  subjects={subjects}
                  halls={halls}
                  classSchedules={classSchedules}
                  onCreateClass={handleCreateClass}
                  onUpdateClass={handleUpdateClass}
                  onDeleteClass={handleDeleteClass}
                  onCreateCourse={handleCreateCourse}
                  onDeleteCourse={handleDeleteCourse}
                  onCreateSubject={handleCreateSubject}
                  onDeleteSubject={handleDeleteSubject}
                  onCreateHall={handleCreateHall}
                  onDeleteHall={handleDeleteHall}
                />
              )}
              {/* CLASSES TAB */}
              {!loading && activeTab === 'classes' && (
                <UserTab 
                  users={classes} 
                  onResetPassword={handleResetPassword} 
                  onCreateUser={handleCreateUser} 
                  onDeleteUser={handleDeleteUser} 
                />
              )}

              {/* ATTENDANCE TAB */}
              {!loading && activeTab === 'attendance' && (
                <AttendanceTab
                  students={getFilteredStudents()}
                  courses={realCourses}
                  selectedCourse={selectedAttendanceCourse}
                  onCourseChange={setSelectedAttendanceCourse}
                  selectedDate={selectedAttendanceDate}
                  onDateChange={setSelectedAttendanceDate}
                  attendanceRecords={attendanceRecords}
                  onCheckboxChange={handleCheckboxChange}
                  onSave={handleSaveAttendance}
                  loading={attendanceLoading}
                />
              )}

              {/* ENROLLMENT TAB */}
              {!loading && activeTab === 'enrollment' && (
                <EnrollmentTab students={students} courses={realCourses} onEnroll={handleEnroll} />
              )}

              {/* STUDY AREA TAB */}
              {!loading && activeTab === 'study_area' && (
                <StudyAreaTab
                  students={students}
                  seats={studySeats}
                  onBook={handleBookSeat}
                  onCheckIn={handleCheckInSeat}
                  onCheckOut={handleCheckOutSeat}
                  currentUser={isStudent ? user : null}
                />
              )}

              {/* EXAMS TAB */}
              {!loading && activeTab === 'exams' && (
                <ExamTab
                  courses={isStudent ? enrolledCourses : realCourses}
                  role={user.role}
                  onCreateExam={handleCreateExam}
                  onUpdateExam={handleUpdateExam}
                  onDeleteExam={handleDeleteExam}
                />
              )}

              {/* ADMIN HUB TAB (Inquiries + SMS + Settings) */}
              {!loading && activeTab === 'admin_hub' && (
                <AdminHubTab
                  inquiries={inquiries}
                  onMarkRead={handleMarkRead}
                  onMarkSpam={handleMarkSpam}
                  onRecoverFromSpam={handleRecoverFromSpam}
                  onMarkAllRead={handleMarkAllRead}
                  onToggleImportant={handleToggleImportant}
                  onQuickReply={handleQuickReply}
                  onBulkDeleteSpam={handleBulkDeleteSpam}
                  smsLogs={smsLogs}
                  onResendSMS={handleResendSMS}
                  onDeleteSMSLog={handleDeleteSMSLog}
                  onBulkResendSMS={handleBulkResendSMS}
                  onResendFilteredFailed={handleResendFilteredFailed}
                  systemSettings={systemSettings}
                  onUpdateSetting={handleUpdateSetting}
                  onCreateSetting={handleCreateSetting}
                  onDeleteSetting={handleDeleteSetting}
                  onTriggerDrill={handleTriggerSafetyDrill}
                />
              )}

              {/* MATERIALS TAB */}
              {!loading && activeTab === 'materials' && (
                <MaterialTab courses={user.role === 'Student' ? enrolledCourses : realCourses} />
              )}

              {/* PAYMENTS TAB */}
              {!loading && activeTab === 'payments' && (
                <PaymentTab
                  students={students}
                  courses={realCourses}
                  onRecordPayment={handleRecordPayment}
                  onSendReminders={handleSendReminders}
                />
              )}

              {/* AI PANEL (MERGED LIVE PANEL & VALIDATION) */}
              {!loading && activeTab === 'ai_panel' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <SmartAttendanceLivePanel
                    halls={halls}
                    activeSessions={classSchedules}
                  />
                  <AttendanceValidationTab
                    halls={halls}
                    activeSessions={classSchedules}
                    onSendAlert={handleSendDiscrepancySMS}
                    onBulkNotify={handleBulkDiscrepancyAlert}
                  />
                </div>
              )}

              {/* MY TIMETABLE TAB */}
              {!loading && activeTab === 'my_timetable' && (
                <TimetableTab schedules={myTimetable} role={user.role} />
              )}

              {/* TEACHER CLASSES TAB */}
              {!loading && activeTab === 'teacher_classes' && (
                <TeacherClassesTab 
                  courses={realCourses} 
                  lecturers={lecturers} 
                  currentUser={user} 
                  classSchedules={classSchedules} 
                />
              )}

              {/* PROMOTIONS TAB */}
              {!loading && activeTab === 'promos' && (
                <PromotionTab promos={promotions} onCreate={handleCreatePromo} onUpdate={handleUpdatePromo} onDelete={handleDeletePromo} />
              )}

              {/* ANNOUNCEMENTS TAB */}
              {!loading && activeTab === 'announcements' && (
                <AnnouncementTab />
              )}

              {/* ACHIEVEMENTS TAB */}
              {!loading && activeTab === 'achievements' && (
                <AchievementTab students={students} />
              )}

              {/* AUDIT LOGS TAB */}
              {!loading && activeTab === 'audit_logs' && (
                <AuditLogTab logs={auditLogs} />
              )}

            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* ADD STUDENT MODAL */}
      {showAddModal && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <h3 style={{ margin: '0 0 20px 0', color: '#1a237e', textAlign: 'center' }}>අලුත් ශිෂ්‍යයෙක් ඇතුළත් කිරීම</h3>
            <form onSubmit={handleAddStudent}>
              <div style={{ marginBottom: '15px' }}>
                <label htmlFor="modal-student-id" style={modalLabelStyle}>ශිෂ්‍ය අංකය (Student ID / Username)</label>
                <input id="modal-student-id" type="text" placeholder="ST001" value={studentId} onChange={(e) => setStudentId(e.target.value)} required style={modalInputSelectStyle} />
                <small style={{ color: '#888', fontSize: '11px' }}>මෙය Login Username ලෙසත් QR Code Key ලෙසත් භාවිතා වේ. Default Password: Thusitha@123</small>
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label htmlFor="modal-student-name" style={modalLabelStyle}>ශිෂ්‍යයාගේ නම</label>
                <input id="modal-student-name" type="text" placeholder="Dilini Kawshalya" value={name} onChange={(e) => setName(e.target.value)} required style={modalInputSelectStyle} />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label htmlFor="modal-student-school" style={modalLabelStyle}>පාසල</label>
                <input id="modal-student-school" type="text" placeholder="Ananda College, Colombo" value={schoolName} onChange={(e) => setSchoolName(e.target.value)} style={modalInputSelectStyle} />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label htmlFor="modal-student-grade" style={modalLabelStyle}>ශ්‍රේණිය</label>
                <input id="modal-student-grade" type="text" placeholder="Grade 12" value={studentGrade} onChange={(e) => setStudentGrade(e.target.value)} style={modalInputSelectStyle} />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label htmlFor="modal-parent-name" style={modalLabelStyle}>මව්පියන්ගේ නම</label>
                <input id="modal-parent-name" type="text" placeholder="Parent Name" value={parentName} onChange={(e) => setParentName(e.target.value)} style={modalInputSelectStyle} />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label htmlFor="modal-parent-phone" style={modalLabelStyle}>මව්පියන්ගේ දුරකථන අංකය</label>
                <input id="modal-parent-phone" type="text" placeholder="0712345678" value={parentPhone} onChange={(e) => setParentPhone(e.target.value)} style={modalInputSelectStyle} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setShowAddModal(false)} style={{ ...modalButtonBaseStyle, border: '1px solid #ccc', background: 'none' }}>අවලංගු කරන්න</button>
                <button type="submit" disabled={submitLoading} style={{ ...modalButtonBaseStyle, background: '#1a237e', color: 'white', border: 'none' }}>
                  {submitLoading ? 'සුරකිමින්...' : 'සුරකින්න'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
