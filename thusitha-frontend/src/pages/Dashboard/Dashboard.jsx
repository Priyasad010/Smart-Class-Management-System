import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
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
import PunctualityReportTab from '../../components/Dashboard/PunctualityReportTab';
import AuditLogTab from '../../components/Dashboard/AuditLogTab';
import ClassTab from '../../components/Dashboard/ClassTab';
import HallUtilizationTab from '../../components/Dashboard/HallUtilizationTab';
import TimetableTab from '../../components/Dashboard/TimetableTab';
import SettingsTab from '../../components/Dashboard/SettingsTab';
import SuspiciousActivityTab from '../../components/Dashboard/SuspiciousActivityTab';
import TeacherPerformanceTab from '../../components/Dashboard/TeacherPerformanceTab';
import CameraConfigTab from '../../components/Dashboard/CameraConfigTab';
import AttendanceValidationTab from '../../components/Dashboard/AttendanceValidationTab';
import PromotionTab from '../../components/Dashboard/PromotionTab';
import AIHealthTab from '../../components/Dashboard/AIHealthTab';

const Dashboard = () => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const userData = localStorage.getItem('user');
  const user = userData ? JSON.parse(userData) : null;

  console.log('Dashboard Component Rendered. User:', user);

  const [activeTab, setActiveTab] = useState('home');
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [realCourses, setRealCourses] = useState([]);
  const [studySeats, setStudySeats] = useState([]);
  const [lecturers, setLecturers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [halls, setHalls] = useState([]);
  const [parents, setParents] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [attendanceStats, setAttendanceStats] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [smsLogs, setSmsLogs] = useState([]);
  const [punctualityReport, setPunctualityReport] = useState([]);
  const [classSchedules, setClassSchedules] = useState([]);
  const [hallUtilization, setHallUtilization] = useState([]);
  const [myTimetable, setMyTimetable] = useState([]);
  const [punctualityStartDate, setPunctualityStartDate] = useState('');
  const [punctualityEndDate, setPunctualityEndDate] = useState('');
  const [punctualityCourse, setPunctualityCourse] = useState('');
  const [pendingStudents, setPendingStudents] = useState([]);
  const [systemSettings, setSystemSettings] = useState([]);
  const [suspiciousLogs, setSuspiciousLogs] = useState([]);
  const [resolutionSummary, setResolutionSummary] = useState({ pending: 0, resolved: 0 });
  const [teacherPerformanceData, setTeacherPerformanceData] = useState([]); // New state for teacher performance
  const [aiHealthStats, setAiHealthStats] = useState({ total_sessions: 0, success_count: 0, mismatch_count: 0, success_rate: '100' });
  const [promotions, setPromotions] = useState([]);
  const [correlationData, setCorrelationData] = useState([]);
  const [occupancyData, setOccupancyData] = useState([]);
  const [activeCongestions] = useState([]);
  const [predictiveData] = useState([]);
  const [hallOccupancyData] = useState([]);
  const [suspiciousStartDate, setSuspiciousStartDate] = useState('');
  const [hallDiscrepancyData, setHallDiscrepancyData] = useState([]); // New state for hall discrepancy data
  const [suspiciousEndDate, setSuspiciousEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Add Student States
  const [showAddModal, setShowAddModal] = useState(false);
  const [studentId, setStudentId] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [selectedParent, setSelectedParent] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);

  // Attendance States
  const [attendanceRecords, setAttendanceRecords] = useState({});
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [selectedAttendanceCourse, setSelectedAttendanceCourse] = useState('');

  // සජීවීව දත්ත ඇදගන්නා පොදු Function එක
  const fetchDatabaseData = async () => {
    setLoading(true);
    setError('');
    try {
      console.log('Fetching database data...');
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
        auditData,
        schedulesData,
        promoData,
        correlationRes,
        occuData
      ] = await Promise.all([
        studentService.getAllStudents(), // studentService will use the updated request helper
        classService.getAllClasses(), // classService will use the updated request helper
        request('/parents'),
        request('/courses'),
        request('/lecturers'),
        request('/subjects'),
        request('/halls'),
        request('/reports/revenue'),
        request('/reports/attendance-stats'),
        request('/contact/messages'),
        request('/study-area/seats'),
        request('/sms/logs'),
        request('/audit/logs'),
        request('/classes/schedules'),
        request('/promos'),
        request('/reports/student-correlation'),
        request('/attendance/occupancy-stats')
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
      setAuditLogs(auditData || []);
      setClassSchedules(schedulesData || []);
      setPromotions(promoData || []);
      setCorrelationData(correlationRes || []);
      setOccupancyData(occuData || []);

      // 💡 Mock Teacher Performance Data for PDF Report
      // In a real system, this would come from a backend endpoint like /reports/teacher-performance
      setTeacherPerformanceData([
        { teacher_name: 'Mr. Perera', classes_taught: 15, avg_punctuality: '95%', avg_exam_pass: '88%' },
        { teacher_name: 'Ms. Silva', classes_taught: 12, avg_punctuality: '92%', avg_exam_pass: '91%' },
        { teacher_name: 'Mr. Fernando', classes_taught: 10, avg_punctuality: '98%', avg_exam_pass: '85%' },
      ]);


      // ශාලා භාවිතය (Admin Only)
      if (user.role === 'Admin') {
        const hallUtilData = await request('/reports/hall-utilization');
        setHallUtilization(hallUtilData || []);
        // Assuming hallUtilData contains mismatch_count for discrepancy chart
        setHallDiscrepancyData(hallUtilData || []);
      }

      // පද්ධති සැකසුම් (Admin Only)
      if (user.role === 'Admin') {
        const settings = await request('/settings');
        setSystemSettings(settings || []);

        const sLogs = await request(`/attendance/suspicious-logs?startDate=${suspiciousStartDate}&endDate=${suspiciousEndDate}`);
        setSuspiciousLogs(sLogs || []);

        // Total Suspicious Incidents for HomeTab
        const totalSuspicious = await request('/attendance/total-suspicious');
        setResolutionSummary(totalSuspicious || { pending: 0, resolved: 0 });

        const hStats = await request('/attendance/health-stats');
        setAiHealthStats(hStats || { total_sessions: 0, success_count: 0, mismatch_count: 0, success_rate: '100' });
      }

      // පෞද්ගලික කාලසටහන (Teacher/Student)
      const timetableData = await request('/classes/my-timetable');
      setMyTimetable(timetableData || []);

      // වේලානුරූපීභාවය වාර්තාව
      const punctualityData = await request(`/reports/punctuality?startDate=${punctualityStartDate}&endDate=${punctualityEndDate}&courseId=${punctualityCourse}`);
      setPunctualityReport(punctualityData || []);

      // අනුමැතිය සඳහා සිටින සිසුන්
      const pendingData = await request('/students/pending');
      setPendingStudents(pendingData || []);

      if (studentData) {
        const initialAttendance = {};
        studentData.forEach(student => {
          const studentKey = student._id || student.studentId;
          initialAttendance[studentKey] = true;
        });
        setAttendanceRecords(initialAttendance);
      }
    } catch (err) {
      console.error('Dashboard Fetch Error:', err);
      console.log('Setting error state:', err.message);
      setError('දත්ත ලබා ගැනීමේදී දෝෂයක් සිදුවිය. කරුණාකර පසුව නැවත උත්සාහ කරන්න.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      console.log('User detected in useEffect, initiating data fetch.');
      console.log('Token in localStorage at Dashboard useEffect:', localStorage.getItem('token')); // Corrected typo: aconsole to console
      fetchDatabaseData();
    } else {
      console.log('No user detected in useEffect, redirecting to login.');
    }
  }, [activeTab, punctualityStartDate, punctualityEndDate, punctualityCourse, suspiciousStartDate, suspiciousEndDate]); // Re-fetch when filters change

  if (!user) {
    console.log('User is null, navigating to /');
    return <Navigate to="/" />;
  }

  // ශිෂ්‍යයෙක් එකතු කිරීමේ Handler එක
  const handleAddStudent = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    try {
      await studentService.createStudent({ 
        username: studentId, 
        password: Math.random().toString(36).slice(-8), 
        student_name: name, 
        school: email, 
        grade: 'Grade 12', 
        qr_code_key: studentId, 
        parent_id: selectedParent 
      });
      setShowAddModal(false);
      setStudentId('');
      setName('');
      setEmail('');
      fetchDatabaseData();
      showNotification('ශිෂ්‍යයා සාර්ථකව ඇතුළත් කළා!');
    } catch (err) {
      console.error('Add Student Error:', err);
      showNotification(err.message, 'error');
    } finally {
      setSubmitLoading(false);
    }
  };

  // 🆔 Student ID Card Generator Logic
  const handleDownloadIDCard = async (student) => {
    try {
      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: [85, 55] }); // Standard CR80 size
      const qrDataUrl = await QRCode.toDataURL(student.studentId);

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

  const handleCreatePromo = async (formData) => {
    try {
      await request('/promos', { method: 'POST', body: formData, isFormData: true });
      fetchDatabaseData();
      showNotification('ප්‍රවර්ධන දත්ත සාර්ථකව උඩුගත කළා!');
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
        body: JSON.stringify(settingData)
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
        body: JSON.stringify({ phone: message.sender_phone, message: text })
      });
      showNotification('Quick Reply SMS එක සාර්ථකව යවන ලදී!');
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

  // ශිෂ්‍ය අනුමැතිය ලබා දීමේ Handler එක
  const handleApproveStudent = async (pendingId, qrKey) => {
    try {
      await request('/students/approve', {
        method: 'POST',
        body: JSON.stringify({ pending_id: pendingId, qr_code_key: qrKey })
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
        body: JSON.stringify(enrollData)
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
        body: JSON.stringify(examData)
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
        body: JSON.stringify({ student_id: studentId, session_id: sessionId })
      });
      showNotification('මව්පියන්ට දැනුම් දීමේ SMS පණිවිඩය සාර්ථකව යවන ලදී.');
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  // පෙරාගත් සියලුම සිසුන්ගේ මව්පියන්ට දැනුම් දීමේ Handler එක (Bulk)
  const handleBulkDiscrepancyAlert = async (studentIds, sessionId) => {
    try {
      const response = await request('/attendance/bulk-discrepancy-alert', {
        method: 'POST',
        body: JSON.stringify({ student_ids: studentIds, session_id: sessionId })
      });
      showNotification(response.message);
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  // වාර්තා තොග වශයෙන් නිරාකරණය කිරීමේ Handler එක
  const handleBulkResolveLogs = async (logIds, comment) => {
    try {
      await request('/attendance/bulk-resolve', {
        method: 'PATCH',
        body: JSON.stringify({ logIds, comment })
      });
      showNotification('තෝරාගත් වාර්තා සියල්ල සාර්ථකව නිරාකරණය කළා!');
      fetchDatabaseData();
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  // Safety Drill ආරම්භ කිරීමේ Handler එක
  const handleTriggerSafetyDrill = async () => {
    if (!globalThis.confirm('Safety Drill එකක් ආරම්භ කිරීමට ඔබ වග බලා ගන්න. සියලුම කාර්ය මණ්ඩලයට SMS යවනු ලැබේ.')) return;
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

  // සැකසුමක් යාවත්කාලීන කිරීමේ Handler එක
  const handleUpdateSetting = async (key, value) => {
    try {
      await request('/settings/update', {
        method: 'POST',
        body: JSON.stringify({ key, value })
      });
      showNotification('සැකසුම සාර්ථකව සුරැකුණි!');
      fetchDatabaseData();
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  // විසංවාදයක් නිරාකරණය කිරීමේ Handler එක
  const handleResolveLog = async (logId, comment) => {
    try {
      await request(`/attendance/resolve-log/${logId}`, {
        method: 'PATCH',
        body: JSON.stringify({ comment })
      });
      showNotification('විසංවාදය සාර්ථකව නිරාකරණය කළා!');
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
        body: JSON.stringify(classData)
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
        body: JSON.stringify(classData)
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

  const handleCheckOutSeat = async (bookingId) => {
    try {
      await request(`/study-area/check-out/${bookingId}`, { method: 'PATCH' });
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
        body: JSON.stringify(bookingData)
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
        body: JSON.stringify(reminderData)
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
        body: JSON.stringify(paymentData)
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
        body: JSON.stringify(examData)
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
      showNotification('පණිවිඩය සාර්ථකව නැවත යවන ලදී!');
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
        body: JSON.stringify({ date })
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
        body: JSON.stringify({ ids })
      });
      showNotification(`${ids.length} පණිවිඩ නැවත යැවීම ආරම්භ කරන ලදී.`);
      fetchDatabaseData();
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

  //Filtering students based on enrollment (Simulated for now, usually done via API)
  const getFilteredStudents = () => {
    if (!selectedAttendanceCourse) return students;
    // In a real system, you would fetch only enrolled students for this courseId
    // For now, we return the full list until we implement the Enrollment Filter API
    return students;
  };

  // පැමිණීම ඩේටාබේස් එකට යැවීම
  const handleSaveAttendance = async () => {
    setAttendanceLoading(true);
    try {
      const records = Object.keys(attendanceRecords).map(id => ({
        student: id,
        status: attendanceRecords[id] ? 'Present' : 'Absent'
      }));

      await attendanceService.saveAttendance({
        date: new Date().toISOString().split('T')[0],
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

  // Define discrepancyChartData for HomeTab
  const discrepancyChartData = {
    labels: (hallDiscrepancyData || []).map(h => h.hall_name),
    datasets: [
      {
        label: 'විසංවාද සංඛ්‍යාව (Discrepancy Count)',
        data: (hallDiscrepancyData || []).map(h => h.mismatch_count || 0),
        backgroundColor: 'rgba(211, 47, 47, 0.5)',
        borderColor: '#d32f2f',
        borderWidth: 2,
        fill: true,
        tension: 0.4
      }
    ]
  };

  const handleLogout = () => {
    localStorage.removeItem('token'); // Remove token from localStorage
    localStorage.clear();
    navigate('/');
  };

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'Segoe UI', backgroundColor: '#f5f7fa', margin: 0 }}>
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLogout={handleLogout} 
        role={user.role} 
      />

      {/* MAIN CONTENT */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
        <div style={{ height: '60px', backgroundColor: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 30px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          <span style={{ fontWeight: 'bold', color: '#333' }}>
            {activeTab === 'home' && '📊 Dashboard Overview'}
            {activeTab === 'students' && '🧑‍🎓 Student Management'}
            {activeTab === 'classes' && '📚 Class & User Management'}
            {activeTab === 'attendance' && '📝 Attendance Management'}
          </span>
          <div style={{ fontSize: '14px', color: '#555' }}>පරිශීලක: <strong>{user.username}</strong></div>
        </div>

        <div style={{ padding: '30px', flex: 1 }}>
          {console.log('Dashboard Main Content - Loading:', loading, 'Error:', error, 'Active Tab:', activeTab)}
          {error && <div style={{ color: '#d32f2f', backgroundColor: '#ffebee', padding: '10px', borderRadius: '5px', marginBottom: '15px' }}>{error}</div>}
          {loading && <div style={{ color: '#1a237e', fontWeight: 'bold' }}>දත්ත පූරණය වෙමින් පවතී...</div>}

          {/* HOME TAB */}
          {!loading && activeTab === 'home' && (
            <HomeTab 
              username={user.username} 
              studentCount={students.length} 
              userCount={classes.length} 
              revenueData={revenueData} 
              attendanceData={attendanceStats}
              resolutionSummary={resolutionSummary}
              occupancyData={occupancyData}
              activeCongestions={activeCongestions}
              predictiveOccupancyData={predictiveData}
              correlationData={correlationData}
              discrepancyChartData={discrepancyChartData} // Pass the new prop here
              hallOccupancyData={hallOccupancyData}
              hallUtilization={hallUtilization}
            />
          )}

          {/* STUDENTS TAB */}
          {!loading && activeTab === 'students' && (
            <>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
                <button 
                  onClick={handleBulkEncode}
                  style={{ padding: '10px 20px', backgroundColor: '#455a64', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  ⚙️ සියලුම සිසුන් Encode කරන්න (Bulk Encode)
                </button>
              </div>
              <StudentTab students={students} onAddClick={() => setShowAddModal(true)} onEncode={handleGenerateEncoding} onDownloadIDCard={handleDownloadIDCard} />
            </>
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
            />
          )}
          {/* CLASSES TAB */}
          {!loading && activeTab === 'classes' && (
            <UserTab users={classes} onResetPassword={handleResetPassword} />
          )}

          {/* ATTENDANCE TAB */}
          {!loading && activeTab === 'attendance' && (
            <AttendanceTab 
              students={getFilteredStudents()} 
              courses={realCourses}
              selectedCourse={selectedAttendanceCourse}
              onCourseChange={setSelectedAttendanceCourse}
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
            <StudyAreaTab students={students} seats={studySeats} onBook={handleBookSeat} onCheckIn={handleCheckInSeat} onCheckOut={handleCheckOutSeat} />
          )}

          {/* EXAMS TAB */}
          {!loading && activeTab === 'exams' && (
            <ExamTab courses={realCourses} onCreateExam={handleCreateExam} onUpdateExam={handleUpdateExam} onDeleteExam={handleDeleteExam} />
          )}

          {/* INQUIRIES TAB */}
          {!loading && activeTab === 'inquiries' && (
            <ContactTab 
              messages={inquiries} 
              onMarkRead={handleMarkRead} 
              onMarkSpam={handleMarkSpam} 
              onRecoverFromSpam={handleRecoverFromSpam} 
              onMarkAllRead={handleMarkAllRead}
              templates={systemSettings.filter(s => s.setting_key.startsWith('sms_tpl_')).map(s => s.setting_value)}
              onToggleImportant={handleToggleImportant}
              onQuickReply={handleQuickReply}
            />
          )}

          {/* SMS LOGS TAB */}
          {!loading && activeTab === 'sms_logs' && (
            <SMSLogTab 
              logs={smsLogs} 
              onResend={handleResendSMS} 
              onDelete={handleDeleteSMSLog}
              onBulkResend={handleBulkResendSMS}
              onResendFilteredFailed={handleResendFilteredFailed}
            />
          )}

          {/* MATERIALS TAB */}
          {!loading && activeTab === 'materials' && (
            <MaterialTab courses={realCourses} />
          )}

          {/* AUDIT LOGS TAB */}
          {!loading && activeTab === 'audit_logs' && (
            <AuditLogTab logs={auditLogs} />
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

          {/* PUNCTUALITY REPORT TAB */}
          {!loading && activeTab === 'punctuality_report' && (
            <PunctualityReportTab 
              reportData={punctualityReport} 
              startDate={punctualityStartDate}
              endDate={punctualityEndDate}
              courses={realCourses}
              selectedCourse={punctualityCourse}
              onCourseChange={setPunctualityCourse}
              onStartDateChange={setPunctualityStartDate}
              onEndDateChange={setPunctualityEndDate}
            />
          )}

          {/* AI VALIDATION TAB */}
          {!loading && activeTab === 'ai_validation' && (
            <AttendanceValidationTab 
              halls={halls} 
              activeSessions={classSchedules} 
              onSendAlert={handleSendDiscrepancySMS}
              onBulkNotify={handleBulkDiscrepancyAlert}
            />
          )}

          {/* HALL UTILIZATION TAB */}
          {!loading && activeTab === 'hall_reports' && (
            <HallUtilizationTab data={hallUtilization} />
          )}

          {/* MY TIMETABLE TAB */}
          {!loading && activeTab === 'my_timetable' && (
            <TimetableTab schedules={myTimetable} role={user.role} />
          )}

          {/* CAMERA CONFIG TAB */}
          {!loading && activeTab === 'camera_config' && (
            <CameraConfigTab halls={halls} />
          )}

          {/* SUSPICIOUS LOGS TAB */}
          {!loading && activeTab === 'suspicious_logs' && (
            <SuspiciousActivityTab 
              logs={suspiciousLogs} 
              startDate={suspiciousStartDate} 
              endDate={suspiciousEndDate}
              onStartDateChange={setSuspiciousStartDate}
              onEndDateChange={setSuspiciousEndDate}
              onResolve={handleResolveLog}
              onBulkResolve={handleBulkResolveLogs}
            />
          )}

          {/* SYSTEM HEALTH TAB */}
          {!loading && activeTab === 'system_health' && (
            <AIHealthTab stats={aiHealthStats} />
          )}

          {/* PROMOTIONS TAB */}
          {!loading && activeTab === 'promos' && (
            <PromotionTab promos={promotions} onCreate={handleCreatePromo} onDelete={handleDeletePromo} />
          )}

          {/* TEACHER PERFORMANCE TAB */}
          {!loading && activeTab === 'teacher_performance' && (
            <TeacherPerformanceTab performanceData={teacherPerformanceData} />
          )}

          {/* SETTINGS TAB */}
          {!loading && activeTab === 'settings' && (
            <SettingsTab 
              settings={systemSettings} 
              onUpdate={handleUpdateSetting} 
              onCreate={handleCreateSetting}
              onDelete={handleDeleteSetting}
              onTriggerDrill={handleTriggerSafetyDrill}
            />
          )}

        </div>
      </div>

      {/* ADD STUDENT MODAL */}
      {showAddModal && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <h3 style={{ margin: '0 0 20px 0', color: '#1a237e', textAlign: 'center' }}>අලුත් ශිෂ්‍යයෙක් ඇතුළත් කිරීම</h3>
            <form onSubmit={handleAddStudent}>
              <div style={{ marginBottom: '15px' }}>
                <label htmlFor="modal-student-id" style={modalLabelStyle}>Student ID</label>
                <input id="modal-student-id" type="text" placeholder="ST001" value={studentId} onChange={(e) => setStudentId(e.target.value)} required style={modalInputSelectStyle} />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label htmlFor="modal-student-name" style={modalLabelStyle}>ශිෂ්‍යයාගේ නම</label>
                <input id="modal-student-name" type="text" placeholder="Dilini Kawshalya" value={name} onChange={(e) => setName(e.target.value)} required style={modalInputSelectStyle} />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label htmlFor="modal-student-email" style={modalLabelStyle}>ඊමේල් ලිපිනය</label>
                <input id="modal-student-email" type="email" placeholder="dilini@gmail.com" value={email} onChange={(e) => setEmail(e.target.value)} required style={modalInputSelectStyle} />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label htmlFor="modal-student-parent" style={modalLabelStyle}>මව්පියන් තෝරන්න</label>
                <select id="modal-student-parent" value={selectedParent} onChange={(e) => setSelectedParent(e.target.value)} style={modalInputSelectStyle}>
                  <option value="">-- මව්පියන් තෝරන්න --</option>
                  {parents.map(p => (
                    <option key={p.parent_id} value={p.parent_id}>{p.parent_name}</option>
                  ))}
                </select>
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