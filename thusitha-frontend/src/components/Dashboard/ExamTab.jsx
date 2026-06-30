import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { request } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';

const ExamTab = ({ courses, role, onCreateExam, onUpdateExam, onDeleteExam }) => {
  const isStudent = role === 'Student';
  const [formData, setFormData] = useState({ course_id: '', exam_name: '', exam_date: '', total_marks: 100, pass_percentage: 50 });
  const [exams, setExams] = useState([]);
  const [selectedExamForMarks, setSelectedExamForMarks] = useState('');
  const [excelFile, setExcelFile] = useState(null);
  const [googleSheetUrl, setGoogleSheetUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [editingExamId, setEditingExamId] = useState(null);
  const [examResults, setExamResults] = useState([]);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [viewingExamName, setViewingExamName] = useState('');
  const [viewingExamTotalMarks, setViewingExamTotalMarks] = useState(100); // To calculate pass/fail
  const [viewingExamPassPercentage, setViewingExamPassPercentage] = useState(50);
  const [examSearchTerm, setExamSearchTerm] = useState('');
  const { showNotification } = useNotification();

  const fetchExams = async (courseId = formData.course_id) => {
    if (courseId) {
      try {
        const data = await request(`/exams/course/${courseId}`);
        setExams(data || []);
      } catch (err) {
        console.error('Error fetching exams:', err);
      }
    }
  };

  // Fetch exams when course is selected
  useEffect(() => {
    fetchExams();
  }, [formData.course_id]);

  // Function to download sample template
  const downloadTemplate = () => {
    const csvContent = "data:text/csv;charset=utf-8,student_id,marks\nST001,85\nST002,92";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "exam_marks_template.csv");
    document.body.appendChild(link);
    link.click();
    // Use Element.remove() instead of parent.removeChild(child)
    link.remove();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.pass_percentage < 0 || formData.pass_percentage > 100) {
      return showNotification('සමත් ප්‍රතිශතය 0 ත් 100 ත් අතර විය යුතුය.', 'error');
    }

    if (editingExamId) {
      await onUpdateExam(editingExamId, formData);
      setEditingExamId(null);
    } else {
      await onCreateExam(formData);
    }
    setFormData(prev => ({ ...prev, exam_name: '', exam_date: '', total_marks: 100, pass_percentage: 50 }));
    await fetchExams(formData.course_id); // Refresh list after creation
  };

  const handleEditClick = (ex) => {
    setEditingExamId(ex.exam_id);
    setFormData({
      course_id: ex.course_id,
      exam_name: ex.exam_name,
      exam_date: new Date(ex.exam_date).toISOString().split('T')[0],
      total_marks: ex.total_marks,
      pass_percentage: ex.pass_percentage || 50
    });
  };

  const handleViewResults = async (ex) => {
    try {
      const data = await request(`/exams/results/${ex.exam_id}`);
      setExamResults(data || []);
      setViewingExamName(ex.exam_name);
      setViewingExamTotalMarks(ex.total_marks); // Store total marks for pass/fail calculation
      setViewingExamPassPercentage(ex.pass_percentage || 50);
      setShowResultsModal(true);
    } catch (err) {
      console.error('Error fetching exam results:', err);
      showNotification('ලකුණු ලබා ගැනීමට නොහැකි විය.', 'error');
    }
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    
    // Title & Header
    doc.setFontSize(18);
    doc.text('Thusitha Smart Class - Exam Results', 14, 20);
    doc.setFontSize(12);
    doc.text(`Exam: ${viewingExamName}`, 14, 30);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 37);

    // Table Data
    const tableColumn = ["Student ID", "Student Name", "Marks"];
    const tableRows = examResults.map(res => [
      res.student_id,
      res.student_name || 'N/A',
      res.marks
    ]);

    doc.autoTable(tableColumn, tableRows, { startY: 45 });
    doc.save(`${viewingExamName}_results.pdf`);
    showNotification('වාර්තාව සාර්ථකව බාගත කළා!');
  };

  const processDelete = async () => {
    if (!confirmDeleteId) return;
    
    try {
      await onDeleteExam(confirmDeleteId);
      fetchExams(); // Refresh list after deletion
      if (selectedExamForMarks === confirmDeleteId.toString()) setSelectedExamForMarks('');
      setConfirmDeleteId(null);
      showNotification('විභාගය සාර්ථකව ඉවත් කළා!');
    } catch (err) {
      console.error('Error deleting exam:', err);
      showNotification(err.message || 'විභාග මකා දැමීමේදී දෝෂයක් ඇතිවිය.', 'error');
    }
  };

  const handleExcelUpload = async (e) => {
    e.preventDefault();
    if (!selectedExamForMarks || !excelFile) return showNotification('කරුණාකර විභාගය සහ ගොනුව තෝරන්න.', 'error');

    setUploading(true);
    const uploadData = new FormData();
    uploadData.append('exam_id', selectedExamForMarks);
    uploadData.append('file', excelFile);

    try {
      await request('/exams/upload-marks', {
        method: 'POST',
        body: uploadData,
        isFormData: true
      });
      showNotification('ලකුණු සාර්ථකව ඇතුළත් කළා!');
      fetchExams();
    } catch (err) {
      showNotification(err.message, 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleGoogleSheetsUpload = async (e) => {
    e.preventDefault();
    if (!selectedExamForMarks || !googleSheetUrl) return showNotification('කරුණාකර විභාගය සහ Google Sheet URL එක ලබාදෙන්න.', 'error');

    setUploading(true);
    try {
      // Extract sheet ID from URL (e.g. https://docs.google.com/spreadsheets/d/1BxiMVs.../edit)
      const match = googleSheetUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
      const sheet_id = match ? match[1] : googleSheetUrl;

      await request('/exams/pull-sheet-marks', {
        method: 'POST',
        body: {
          exam_id: selectedExamForMarks,
          sheet_id: sheet_id
        }
      });
      showNotification('Google Sheet එක හරහා ලකුණු සාර්ථකව ඇතුළත් කළා!');
      fetchExams();
    } catch (err) {
      showNotification(err.message, 'error');
    } finally {
      setUploading(false);
      setGoogleSheetUrl('');
    }
  };

  const inputStyle = { width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', marginBottom: '15px', boxSizing: 'border-box' };

  return (
    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
      {/* STUDENT VIEW: Only show results lookup, hide admin forms */}
      {isStudent ? (
        <div style={{ flex: 1, minWidth: '350px', backgroundColor: 'white', padding: '25px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
          <h3 style={{ color: '#1a237e', marginBottom: '20px' }}>📊 විභාග ප්‍රතිඵල (Exam Results)</h3>
          <div>
            <label htmlFor="student_course_id" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>පන්තිය තෝරන්න</label>
            <select
              id="student_course_id"
              style={inputStyle}
              value={formData.course_id}
              onChange={(e) => setFormData({...formData, course_id: e.target.value})}
            >
              <option value="">-- පන්තිය තෝරන්න --</option>
              {courses.map(c => <option key={c.course_id} value={c.course_id}>{c.course_name}</option>)}
            </select>
          </div>

          {exams.length === 0 && formData.course_id ? (
            <p style={{ fontSize: '14px', color: '#888', textAlign: 'center', padding: '20px' }}>
              🔍 මෙම පන්තිය සඳහා විභාග ලැයිස්තුවක් නොමැත.
            </p>
          ) : exams.length === 0 ? (
            <p style={{ fontSize: '14px', color: '#888', textAlign: 'center', padding: '20px' }}>
              📚 ඔබේ ප්‍රතිඵල බැලීමට පන්තිය තෝරන්න.
            </p>
          ) : (
            <div style={{ marginTop: '15px' }}>
              <h4 style={{ color: '#1a237e', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>විභාග ලැයිස්තුව</h4>
              {exams.map(ex => (
                <div key={ex.exam_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f9f9f9' }}>
                  <div style={{ fontSize: '14px' }}>
                    <strong>{ex.exam_name}</strong><br />
                    <small style={{ color: '#666' }}>{new Date(ex.exam_date).toLocaleDateString()} | {ex.total_marks} Marks</small>
                  </div>
                  <button
                    onClick={() => handleViewResults(ex)}
                    style={{ padding: '6px 14px', backgroundColor: '#1a237e', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}
                  >
                    📊 ප්‍රතිඵල
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <>
          {/* LEFT: Create Exam (Admin/Teacher only) */}
      <div style={{ flex: 1, minWidth: '350px', backgroundColor: 'white', padding: '25px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ color: '#1a237e', margin: 0 }}>
            {editingExamId ? '🔄 විභාගය සංස්කරණය' : '📝 අලුත් විභාගයක්'}
          </h3>
          {editingExamId && (
            <button onClick={() => { setEditingExamId(null); setFormData({...formData, exam_name: '', exam_date: '', total_marks: 100, pass_percentage: 50}); }} style={{ background: 'none', border: 'none', color: '#d32f2f', cursor: 'pointer', fontSize: '14px', textDecoration: 'underline' }}>අවලංගු කරන්න</button>
          )}
        </div>
        <form onSubmit={handleSubmit}>
          <label htmlFor="course_id" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>පන්තිය</label>
          <select id="course_id" style={inputStyle} value={formData.course_id} onChange={(e) => setFormData({...formData, course_id: e.target.value})} required>
            <option value="">-- පන්තිය තෝරන්න --</option>
            {courses.map(c => <option key={c.course_id} value={c.course_id}>{c.course_name}</option>)}
          </select>
          
          <label htmlFor="exam_name" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>විභාගයේ නම</label>
          <input id="exam_name" type="text" placeholder="Monthly Test - Jan" style={inputStyle} value={formData.exam_name} onChange={(e) => setFormData({...formData, exam_name: e.target.value})} required />
          
          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ flex: 1 }}>
              <label htmlFor="exam_date" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>දිනය</label>
              <input id="exam_date" type="date" style={inputStyle} value={formData.exam_date} onChange={(e) => setFormData({...formData, exam_date: e.target.value})} required />
            </div>
            <div style={{ flex: 1 }}>
              <label htmlFor="total_marks" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>මුළු ලකුණු</label>
              <input id="total_marks" type="number" style={inputStyle} value={formData.total_marks} onChange={(e) => setFormData({...formData, total_marks: e.target.value})} required />
            </div>
            <div style={{ flex: 1 }}>
              <label htmlFor="pass_percentage" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>සමත් %</label>
              <input id="pass_percentage" type="number" min="0" max="100" style={inputStyle} value={formData.pass_percentage} onChange={(e) => setFormData({...formData, pass_percentage: e.target.value})} required />
            </div>
          </div>
          <button type="submit" style={{ width: '100%', padding: '12px', backgroundColor: '#1a237e', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
            {editingExamId ? '💾 වෙනස්කම් සුරකින්න' : '💾 විභාගය සුරකින්න'}
          </button>
        </form>

        <div style={{ marginTop: '30px' }}>
          <h4 style={{ color: '#1a237e', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>පවතින විභාග (Existing Exams)</h4>
          
          {exams.length > 0 && (
            <input 
              type="text" 
              placeholder="විභාග නමෙන් සොයන්න..." 
              value={examSearchTerm}
              onChange={(e) => setExamSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd', marginBottom: '15px', fontSize: '13px' }}
            />
          )}

          {exams.length === 0 ? (
            <p style={{ fontSize: '14px', color: '#888' }}>පන්තිය තෝරා විභාග ලැයිස්තුව බලන්න.</p>
          ) : (
            <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
              {exams.filter(ex => ex.exam_name.toLowerCase().includes(examSearchTerm.toLowerCase())).map(ex => (
                <div key={ex.exam_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f9f9f9' }}>
                  <div style={{ fontSize: '14px' }}>
                    <strong>{ex.exam_name}</strong><br />
                    <small style={{ color: '#666' }}>{new Date(ex.exam_date).toLocaleDateString()} | {ex.total_marks} Marks | Pass: {ex.pass_percentage}%</small>
                  </div>
                  <div style={{ display: 'flex', gap: '5px' }}>
                    <button 
                      onClick={() => handleViewResults(ex)}
                      style={{ padding: '4px 8px', backgroundColor: '#e3f2fd', color: '#1565c0', border: '1px solid #bbdefb', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                    >
                      ලකුණු
                    </button>
                    <button 
                      onClick={() => handleEditClick(ex)}
                      style={{ padding: '4px 8px', backgroundColor: '#fff8e1', color: '#f57f17', border: '1px solid #ffecb3', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => setConfirmDeleteId(ex.exam_id)}
                      style={{ padding: '4px 8px', backgroundColor: '#ffebee', color: '#d32f2f', border: '1px solid #ffcdd2', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                    >
                      මකන්න
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT: Upload Marks */}
      <div style={{ flex: 1, minWidth: '350px', backgroundColor: 'white', padding: '25px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
        <h3 style={{ color: '#2e7d32', marginBottom: '20px' }}>📊 ලකුණු ඇතුළත් කිරීම (Excel Upload)</h3>
        <div>
          <label htmlFor="course_for_marks" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>පන්තිය තෝරන්න (Select Class)</label>
          <select 
            id="course_for_marks" 
            style={inputStyle} 
            value={formData.course_id} 
            onChange={(e) => {
              setFormData(prev => ({ ...prev, course_id: e.target.value }));
              setSelectedExamForMarks('');
            }} 
          >
            <option value="">-- පන්තිය තෝරන්න --</option>
            {courses.map(c => <option key={c.course_id} value={c.course_id}>{c.course_name}</option>)}
          </select>

          <label htmlFor="exam_for_marks" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>පවතින විභාගයක් තෝරන්න</label>
          <select id="exam_for_marks" style={inputStyle} value={selectedExamForMarks} onChange={(e) => setSelectedExamForMarks(e.target.value)}>
            <option value="">-- විභාගය තෝරන්න --</option>
            {exams.map(ex => <option key={ex.exam_id} value={ex.exam_id}>{ex.exam_name} ({new Date(ex.exam_date).toLocaleDateString()})</option>)}
          </select>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
            <label htmlFor="marks_file" style={{ fontWeight: 'bold' }}>Excel ගොනුව (student_id, marks)</label>
            <button 
              type="button" 
              onClick={downloadTemplate}
              style={{ fontSize: '12px', color: '#2e7d32', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
            >
              📥 Template එක බාගත කරන්න
            </button>
          </div>
          <input id="marks_file" type="file" accept=".xlsx, .xls" style={inputStyle} onChange={(e) => setExcelFile(e.target.files[0])} />
          
          <button 
            type="button" 
            disabled={uploading} 
            onClick={(e) => {
              if (!formData.course_id) return showNotification('කරුණාකර පන්තිය තෝරන්න.', 'error');
              handleExcelUpload(e);
            }}
            style={{ width: '100%', padding: '12px', backgroundColor: '#2e7d32', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
            {uploading ? 'පූරණය වෙමින්...' : '📤 ලකුණු ඇතුළත් කරන්න (Excel)'}
          </button>
        </div>

        <hr style={{ margin: '20px 0', border: 'none', borderTop: '1px solid #eee' }} />

        <h3 style={{ color: '#0f9d58', marginBottom: '10px', fontSize: '16px' }}>🔗 Google Sheets හරහා ඇතුළත් කිරීම</h3>
        <div>
           <label htmlFor="google_sheet" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Google Sheet URL (Public)</label>
           <input id="google_sheet" type="url" placeholder="https://docs.google.com/spreadsheets/d/..." style={inputStyle} value={googleSheetUrl} onChange={(e) => setGoogleSheetUrl(e.target.value)} />
           
           <button 
            type="button" 
            disabled={uploading} 
            onClick={(e) => {
              if (!formData.course_id) return showNotification('කරුණාකර පන්තිය තෝරන්න.', 'error');
              handleGoogleSheetsUpload(e);
            }}
            style={{ width: '100%', padding: '12px', backgroundColor: '#0f9d58', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
            {uploading ? 'පූරණය වෙමින්...' : '☁️ Google Sheet Import කරන්න'}
          </button>
        </div>
      </div>

      {/* Custom Confirmation Modal */}
      {confirmDeleteId && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1200 }}>
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', width: '400px', textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: '40px', color: '#d32f2f', marginBottom: '15px' }}>⚠️</div>
            <h3 style={{ margin: '0 0 10px 0', color: '#1a237e' }}>විභාගය ඉවත් කිරීම ස්ථිරද?</h3>
            <p style={{ color: '#666', fontSize: '14px', lineHeight: '1.5' }}>
              මෙම ක්‍රියාව ආපසු හැරවිය නොහැක. මෙම විභාගයට අදාළව පද්ධතියට ඇතුළත් කර ඇති සියලුම සිසුන්ගේ ලකුණු ද මෙහිදී මැකී යනු ඇත.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '25px' }}>
              <button onClick={() => setConfirmDeleteId(null)} style={{ flex: 1, padding: '10px', border: '1px solid #ccc', background: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}>අවලංගු කරන්න</button>
              <button onClick={processDelete} style={{ flex: 1, padding: '10px', backgroundColor: '#d32f2f', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>ඔව්, ඉවත් කරන්න</button>
            </div>
          </div>
        </div>
      )}

      {/* Results View Modal */}
      {showResultsModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1200 }}>
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', width: '600px', maxHeight: '80vh', overflowY: 'auto', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
              <h3 style={{ margin: 0, color: '#1a237e' }}>📊 {viewingExamName} - ප්‍රතිඵල</h3>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <button 
                  onClick={handleDownloadPDF}
                  style={{ padding: '6px 12px', backgroundColor: '#455a64', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
                >
                  📥 PDF එක ලබාගන්න
                </button>
                <button onClick={() => setShowResultsModal(false)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#666' }}>&times;</button>
              </div>
            </div>
            
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f5f5f5', textAlign: 'left' }}>
                  <th style={{ padding: '12px' }}>ශිෂ්‍ය අංකය</th>
                  <th style={{ padding: '12px' }}>නම</th>
                  <th style={{ padding: '12px', textAlign: 'center' }}>ලකුණු</th>
                  <th style={{ padding: '12px', textAlign: 'center' }}>තත්ත්වය</th>
                </tr>
              </thead>
              <tbody>
                {examResults.length === 0 ? (
                  <tr><td colSpan="4" style={{ textAlign: 'center', padding: '20px', color: '#888' }}>මෙම විභාගය සඳහා ලකුණු ඇතුළත් කර නැත.</td></tr>
                ) : (
                  examResults.map((res) => (
                    <tr key={res.student_id || `${res.student_name}-${res.marks}`} style={{ borderBottom: '1px solid #eee', backgroundColor: (res.marks / viewingExamTotalMarks * 100 < viewingExamPassPercentage) ? '#ffebee' : 'inherit' }}>
                      <td style={{ padding: '12px' }}>{res.student_id}</td>
                      <td style={{ padding: '12px' }}>{res.student_name || 'N/A'}</td>
                      <td style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold' }}>{res.marks}</td>
                      <td style={{ padding: '12px', textAlign: 'center', color: (res.marks / viewingExamTotalMarks * 100 < viewingExamPassPercentage) ? '#d32f2f' : '#2e7d32', fontWeight: 'bold' }}>
                        {(res.marks / viewingExamTotalMarks * 100 < viewingExamPassPercentage) ? 'අසමත්' : 'සමත්'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            <button onClick={() => setShowResultsModal(false)} style={{ marginTop: '20px', width: '100%', padding: '10px', backgroundColor: '#1a237e', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>වසන්න (Close)</button>
          </div>
        </div>
      )}

        </>
      )}

    </div>
  );
};

ExamTab.propTypes = {
  courses: PropTypes.arrayOf(
    PropTypes.shape({
      course_id: PropTypes.number.isRequired,
      course_name: PropTypes.string.isRequired,
      teacher_name: PropTypes.string,
    })
  ).isRequired,
  role: PropTypes.string,
  onCreateExam: PropTypes.func.isRequired,
  onUpdateExam: PropTypes.func.isRequired,
  onDeleteExam: PropTypes.func.isRequired,
};

export default ExamTab;