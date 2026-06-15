import React, { useState } from 'react';
import PropTypes from 'prop-types';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useNotification } from '../../context/NotificationContext';

const PunctualityReportTab = ({
  reportData,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  courses,
  selectedCourse,
  onCourseChange,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const { showNotification } = useNotification();

  const filteredReport = reportData.filter(student =>
    student.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.student_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const inputStyle = { padding: '10px', borderRadius: '5px', border: '1px solid #ddd', boxSizing: 'border-box' };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const courseName = selectedCourse ? courses.find(c => c.course_id === Number(selectedCourse))?.course_name : 'All Courses';
    
    // Header
    doc.setFontSize(18);
    doc.setTextColor(26, 35, 126); // Thusitha Navy Blue
    doc.text('Thusitha Smart Class - Punctuality Report', 14, 20);
    
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Course: ${courseName}`, 14, 30);
    doc.text(`Period: ${startDate || 'Start'} to ${endDate || 'Today'}`, 14, 37);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 44);

    // Table
    const tableColumn = ["Student ID", "Student Name", "Late Count", "Total Arrivals", "Late %"];
    const tableRows = filteredReport.map(s => [
      s.student_id,
      s.student_name,
      s.late_count,
      s.total_attendance,
      `${((s.late_count / s.total_attendance) * 100).toFixed(2)}%`
    ]);

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 50,
      theme: 'grid',
      headStyles: { fillColor: [26, 35, 126] }
    });

    doc.save(`Punctuality_Report_${courseName.replace(/\s+/g, '_')}.pdf`);
    showNotification('වාර්තාව සාර්ථකව බාගත කළා!');
  };

  return (
    <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '15px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ color: '#1a237e', margin: 0 }}>⏰ වේලානුරූපීභාවය වාර්තාව (Punctuality Report)</h3>
        <button 
          onClick={handleDownloadPDF}
          disabled={filteredReport.length === 0}
          style={{ padding: '10px 20px', backgroundColor: '#455a64', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          🖨️ PDF වාර්තාව ලබාගන්න
        </button>
      </div>
      
      <input 
        type="text" 
        placeholder="ශිෂ්‍යයාගේ නම හෝ ID මගින් සොයන්න..." 
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={inputStyle}
      />

      <div style={{ marginBottom: '20px' }}>
        <label htmlFor="courseFilter" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>පන්තිය අනුව පෙරීම (Filter by Course)</label>
        <select 
          id="courseFilter"
          value={selectedCourse}
          onChange={(e) => onCourseChange(e.target.value)}
          style={{ ...inputStyle, width: '100%' }}
        >
          <option value="">-- සියලුම පන්ති (All Courses) --</option>
          {courses.map(c => <option key={c.course_id} value={c.course_id}>{c.course_name}</option>)}
        </select>
      </div>

      <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '150px' }}>
          <label htmlFor="startDate" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>සිට (From)</label>
          <input 
            id="startDate"
            type="date" 
            value={startDate} 
            onChange={(e) => onStartDateChange(e.target.value)} 
            style={{ ...inputStyle, width: '100%' }}
          />
        </div>
        <div style={{ flex: 1, minWidth: '150px' }}>
          <label htmlFor="endDate" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>දක්වා (To)</label>
          <input 
            id="endDate"
            type="date" 
            value={endDate} 
            onChange={(e) => onEndDateChange(e.target.value)} 
            style={{ ...inputStyle, width: '100%' }}
          />
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f5f5f5', textAlign: 'left' }}>
              <th style={{ padding: '12px' }}>ශිෂ්‍ය ID</th>
              <th style={{ padding: '12px' }}>ශිෂ්‍යයාගේ නම</th>
              <th style={{ padding: '12px', textAlign: 'center' }}>ප්‍රමාද වූ වාර ගණන</th>
              <th style={{ padding: '12px', textAlign: 'center' }}>මුළු පැමිණීම්</th>
              <th style={{ padding: '12px', textAlign: 'center' }}>ප්‍රමාද %</th>
            </tr>
          </thead>
          <tbody>
            {filteredReport.map(student => (
              <tr key={student.student_id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '12px' }}>{student.student_id}</td>
                <td style={{ padding: '12px' }}>{student.student_name}</td>
                <td style={{ padding: '12px', textAlign: 'center', color: '#d32f2f', fontWeight: 'bold' }}>{student.late_count}</td>
                <td style={{ padding: '12px', textAlign: 'center' }}>{student.total_attendance}</td>
                <td style={{ padding: '12px', textAlign: 'center' }}>
                  {((student.late_count / student.total_attendance) * 100).toFixed(2)}%
                </td>
              </tr>
            ))}
            {filteredReport.length === 0 && (
              <tr><td colSpan="5" style={{ padding: '20px', textAlign: 'center', color: '#666' }}>වාර්තා හමුවුනේ නැත.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

PunctualityReportTab.propTypes = {
  reportData: PropTypes.array.isRequired,
  startDate: PropTypes.string.isRequired,
  endDate: PropTypes.string.isRequired,
  onStartDateChange: PropTypes.func.isRequired,
  onEndDateChange: PropTypes.func.isRequired,
  courses: PropTypes.array.isRequired,
  selectedCourse: PropTypes.string.isRequired,
  onCourseChange: PropTypes.func.isRequired,
};

export default PunctualityReportTab;