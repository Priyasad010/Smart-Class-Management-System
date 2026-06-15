import React, { useState } from 'react';
import PropTypes from 'prop-types';

const EnrollmentTab = ({ students, courses, onEnroll }) => {
  const [formData, setFormData] = useState({ student_id: '', course_id: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    onEnroll(formData);
  };

  const inputStyle = { width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', marginBottom: '15px', boxSizing: 'border-box' };

  return (
    <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', maxWidth: '500px' }}>
      <h3 style={{ color: '#1a237e', marginBottom: '20px' }}>🔗 පන්ති ලියාපදිංචිය (Course Enrollment)</h3>
      <form onSubmit={handleSubmit}>
        <label htmlFor="enrollStudent" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>ශිෂ්‍යයා තෝරන්න</label>
        <select id="enrollStudent" style={inputStyle} value={formData.student_id} onChange={(e) => setFormData({...formData, student_id: e.target.value})} required>
          <option value="">-- ශිෂ්‍යයා තෝරන්න --</option>
          {students.map(s => <option key={s._id} value={s._id}>{s.name} ({s.studentId})</option>)}
        </select>

        <label htmlFor="enrollCourse" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>පන්තිය තෝරන්න</label>
        <select id="enrollCourse" style={inputStyle} value={formData.course_id} onChange={(e) => setFormData({...formData, course_id: e.target.value})} required>
          <option value="">-- පන්තිය තෝරන්න --</option>
          {courses.map(c => <option key={c.course_id} value={c.course_id}>{c.course_name} - {c.teacher_name}</option>)}
        </select>

        <button type="submit" style={{ width: '100%', padding: '12px', backgroundColor: '#1a237e', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
          💾 ලියාපදිංචි කරන්න
        </button>
      </form>
    </div>
  );
};

EnrollmentTab.propTypes = {
  students: PropTypes.arrayOf(PropTypes.object).isRequired,
  courses: PropTypes.arrayOf(PropTypes.object).isRequired,
  onEnroll: PropTypes.func.isRequired,
};

export default EnrollmentTab;