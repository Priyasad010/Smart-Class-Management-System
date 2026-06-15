import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { request } from '../../services/api';

const AttendanceTab = ({ students, courses, selectedCourse, onCourseChange, attendanceRecords, onCheckboxChange, onSave, loading }) => {
  const [aiData, setAiData] = useState(null);
  const [viewMode, setViewMode] = useState('marking'); // 'marking' or 'logs'

  // Fetch AI Verification data when course changes
  useEffect(() => {
    if (selectedCourse) {
      request(`/attendance/master/${selectedCourse}`)
      .then(data => setAiData(data || null))
      .catch(err => console.error('AI Fetch Error:', err));

      // Fetch historical logs for this course (kept for side-effects if needed)
      // Note: response isn't stored locally in this component to avoid unused variable warnings
      // If you need to use logs in this component, reintroduce state and set it here.
      request(`/attendance/logs/${selectedCourse}`)
      .catch(err => console.error('Logs Fetch Error:', err));
    }
  }, [selectedCourse]);

  return (
    <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ color: '#1a237e', margin: 0 }}>📝 පැමිණීම කළමනාකරණය (Attendance)</h3>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={() => setViewMode('marking')}
            style={{ padding: '8px 15px', borderRadius: '5px', border: 'none', cursor: 'pointer', backgroundColor: viewMode === 'marking' ? '#1a237e' : '#eee', color: viewMode === 'marking' ? 'white' : '#333' }}
          >Marking</button>
          <button 
            onClick={() => setViewMode('logs')}
            style={{ padding: '8px 15px', borderRadius: '5px', border: 'none', cursor: 'pointer', backgroundColor: viewMode === 'logs' ? '#1a237e' : '#eee', color: viewMode === 'logs' ? 'white' : '#333' }}
          >History Logs</button>
        </div>
      </div>

      {/* Smart Verification Alert */}
      {aiData?.mismatch_detected && (
        <div style={{ padding: '15px', backgroundColor: '#fff3e0', borderLeft: '5px solid #ff9800', marginBottom: '20px', borderRadius: '4px' }}>
          <strong style={{ color: '#e65100' }}>⚠️ පැමිණීමේ නොගැලපීමක් හඳුනාගෙන ඇත! (AI Mismatch)</strong>
          <p style={{ margin: '5px 0 0 0', fontSize: '14px' }}>
            QR මගින් සටහන් වූ සංඛ්‍යාව: <strong>{aiData.qr_count}</strong> | 
            කැමරාව මගින් හඳුනාගත් සංඛ්‍යාව: <strong>{aiData.ai_headcount}</strong>
          </p>
          <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#666' }}>
            කරුණාකර පන්තියේ සිටින ශිෂ්‍ය සංඛ්‍යාව නැවත පරීක්ෂා කරන්න.
          </p>
        </div>
      )}
      
      {/* Course Selection Dropdown */}
      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
        <label htmlFor="attendanceCourse" style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>පන්තිය තෝරන්න (Select Class)</label>
        <select 
          id="attendanceCourse"
          value={selectedCourse} 
          onChange={(e) => onCourseChange(e.target.value)}
          style={{ width: '100%', maxWidth: '400px', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
        >
          <option value="">-- සියලුම සිසුන් (All Students) --</option>
          {courses.map(c => <option key={c.course_id} value={c.course_id}>{c.course_name} - {c.teacher_name}</option>)}
        </select>
      </div>

      <p style={{ fontSize: '14px', color: '#666', marginBottom: '20px' }}>අද දින පැමිණ සිටින සිසුන් ඉදිරියෙන් ඇති කොටුව සලකුණු කරන්න.</p>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: '#f5f5f5', textAlign: 'left' }}>
            <th style={{ padding: '12px' }}>Student ID</th>
            <th style={{ padding: '12px' }}>ශිෂ්‍යයාගේ නම</th>
            <th style={{ padding: '12px', textAlign: 'center' }}>පැමිණීම (Status)</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student, index) => {
            const studentKey = student._id || student.studentId;
            return (
              <tr key={studentKey || index} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '12px', fontWeight: 'bold' }}>{student.studentId || 'N/A'}</td>
                <td style={{ padding: '12px' }}>{student.name}</td>
                <td style={{ padding: '12px', textAlign: 'center' }}>
                  <input 
                    type="checkbox" 
                    checked={!!attendanceRecords[studentKey]} 
                    onChange={() => onCheckboxChange(studentKey)}
                    style={{ width: '20px', height: '20px', cursor: 'pointer' }} 
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {students.length > 0 && (
        <button 
          type="button" 
          onClick={onSave}
          disabled={loading}
          style={{ marginTop: '20px', padding: '12px 25px', backgroundColor: '#2e7d32', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', float: 'right' }}
        >
          {loading ? 'සුරකිමින්...' : '💾 පැමිණීම සුරකින්න'}
        </button>
      )}
    </div>
  );
};

AttendanceTab.propTypes = {
  students: PropTypes.arrayOf(PropTypes.object).isRequired,
  courses: PropTypes.arrayOf(PropTypes.object).isRequired,
  selectedCourse: PropTypes.string.isRequired,
  onCourseChange: PropTypes.func.isRequired,
  attendanceRecords: PropTypes.object.isRequired,
  onCheckboxChange: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
};

export default AttendanceTab;