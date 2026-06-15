import React, { useState } from 'react';
import PropTypes from 'prop-types';

const ClassTab = ({ courses, lecturers, subjects, halls, classSchedules, onCreateClass, onUpdateClass, onDeleteClass }) => {
  const [formData, setFormData] = useState({
    course_id: '',
    subject_id: '',
    lecturer_id: '',
    hall_id: '',
    day_of_week: [],
    start_time: '',
    end_time: '',
    class_name: '',
    capacity: ''
  });
  const [editingScheduleId, setEditingScheduleId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const handleDayChange = (day) => {
    setFormData(prev => ({
      ...prev,
      day_of_week: prev.day_of_week.includes(day)
        ? prev.day_of_week.filter(d => d !== day)
        : [...prev.day_of_week, day]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingScheduleId) {
      await onUpdateClass(editingScheduleId, formData);
      setEditingScheduleId(null);
    } else {
      await onCreateClass(formData);
    }
    // Reset form after submission
    setFormData({
      course_id: '',
      subject_id: '',
      lecturer_id: '',
      hall_id: '',
      day_of_week: [],
      start_time: '',
      end_time: '',
      class_name: '',
      capacity: ''
    });
  };

  const handleEditClick = (schedule) => {
    setEditingScheduleId(schedule.schedule_id);
    setFormData({
      course_id: schedule.course_id,
      subject_id: schedule.subject_id,
      lecturer_id: schedule.lecturer_id,
      hall_id: schedule.hall_id,
      day_of_week: schedule.day_of_week,
      start_time: schedule.start_time,
      end_time: schedule.end_time,
      class_name: schedule.class_name,
      capacity: schedule.capacity
    });
  };

  const processDelete = async () => {
    if (!confirmDeleteId) return;
    try {
      await onDeleteClass(confirmDeleteId);
      setConfirmDeleteId(null);
    } catch (err) {
      console.error('Error deleting class schedule:', err);
      // Notification handled by Dashboard
    }
  };

  const filteredSchedules = classSchedules.filter(schedule =>
    schedule.class_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    schedule.course_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    schedule.lecturer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    schedule.hall_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const inputStyle = { width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', marginBottom: '15px', boxSizing: 'border-box' };

  return (
    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
      {/* LEFT: Create Class Form */}
      <div style={{ flex: 1, minWidth: '400px', backgroundColor: 'white', padding: '25px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ color: '#1a237e', margin: 0 }}>
            {editingScheduleId ? '🔄 කාලසටහන සංස්කරණය' : '📚 නව පන්ති කාලසටහනක්'}
          </h3>
          {editingScheduleId && (
            <button onClick={() => { setEditingScheduleId(null); setFormData({ course_id: '', subject_id: '', lecturer_id: '', hall_id: '', day_of_week: [], start_time: '', end_time: '', class_name: '', capacity: '' }); }} style={{ background: 'none', border: 'none', color: '#d32f2f', cursor: 'pointer', fontSize: '14px', textDecoration: 'underline' }}>අවලංගු කරන්න</button>
          )}
        </div>
        <form onSubmit={handleSubmit}>
          <label htmlFor="className" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>පන්තියේ නම</label>
          <input id="className" type="text" placeholder="Grade 11 Science - Batch A" style={inputStyle} value={formData.class_name} onChange={(e) => setFormData({...formData, class_name: e.target.value})} required />

          <label htmlFor="courseSelect" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>පාඨමාලාව</label>
          <select id="courseSelect" style={inputStyle} value={formData.course_id} onChange={(e) => setFormData({...formData, course_id: e.target.value})} required>
            <option value="">-- පාඨමාලාවක් තෝරන්න --</option>
            {courses.map(c => <option key={c.course_id} value={c.course_id}>{c.course_name}</option>)}
          </select>

          <label htmlFor="subjectSelect" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>විෂය</label>
          <select id="subjectSelect" style={inputStyle} value={formData.subject_id} onChange={(e) => setFormData({...formData, subject_id: e.target.value})} required>
            <option value="">-- විෂයක් තෝරන්න --</option>
            {subjects.map(s => <option key={s.subject_id} value={s.subject_id}>{s.subject_name}</option>)}
          </select>

          <label htmlFor="lecturerSelect" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>දේශකයා</label>
          <select id="lecturerSelect" style={inputStyle} value={formData.lecturer_id} onChange={(e) => setFormData({...formData, lecturer_id: e.target.value})} required>
            <option value="">-- දේශකයෙක් තෝරන්න --</option>
            {lecturers.map(l => <option key={l.lecturer_id} value={l.lecturer_id}>{l.lecturer_name}</option>)}
          </select>

          <label htmlFor="hallSelect" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>ශාලාව</label>
          <select id="hallSelect" style={inputStyle} value={formData.hall_id} onChange={(e) => setFormData({...formData, hall_id: e.target.value})} required>
            <option value="">-- ශාලාවක් තෝරන්න --</option>
            {halls.map(h => <option key={h.hall_id} value={h.hall_id}>{h.hall_name} (Capacity: {h.capacity})</option>)}
          </select>

          <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
            <legend style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>සතියේ දින</legend>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '15px' }}>
            {daysOfWeek.map(day => (
              <label key={day} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '14px' }}>
                <input
                  type="checkbox"
                  value={day}
                  checked={formData.day_of_week.includes(day)}
                  onChange={() => handleDayChange(day)}
                />
                {day}
              </label>
            ))}
            </div>
          </fieldset>

          <div style={{ display: 'flex', gap: '15px' }}>
            <div style={{ flex: 1 }}>
              <label htmlFor="startTime" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>ආරම්භක වේලාව</label>
              <input id="startTime" type="time" style={inputStyle} value={formData.start_time} onChange={(e) => setFormData({...formData, start_time: e.target.value})} required />
            </div>
            <div style={{ flex: 1 }}>
              <label htmlFor="endTime" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>අවසන් වේලාව</label>
              <input id="endTime" type="time" style={inputStyle} value={formData.end_time} onChange={(e) => setFormData({...formData, end_time: e.target.value})} required />
            </div>
          </div>

          <label htmlFor="capacity" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>ශිෂ්‍ය ධාරිතාව</label>
          <input id="capacity" type="number" placeholder="50" style={inputStyle} value={formData.capacity} onChange={(e) => setFormData({...formData, capacity: e.target.value})} required />

          <button type="submit" style={{ width: '100%', padding: '12px', backgroundColor: '#1a237e', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
            {editingScheduleId ? '💾 වෙනස්කම් සුරකින්න' : '💾 කාලසටහන සුරකින්න'}
          </button>
        </form>
      </div>

      {/* RIGHT: Existing Class Schedules */}
      <div style={{ flex: 2, minWidth: '500px', backgroundColor: 'white', padding: '25px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
        <h3 style={{ color: '#1a237e', marginBottom: '20px' }}>🗓️ පවතින පන්ති කාලසටහන් (Existing Schedules)</h3>
        <input 
          type="text" 
          placeholder="පන්තියේ නම, දේශකයා, හෝ ශාලාව අනුව සොයන්න..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ ...inputStyle, marginBottom: '15px' }}
        />
        <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f5f5f5', textAlign: 'left' }}>
                <th style={{ padding: '12px' }}>පන්තිය</th>
                <th style={{ padding: '12px' }}>දේශකයා</th>
                <th style={{ padding: '12px' }}>ශාලාව</th>
                <th style={{ padding: '12px' }}>වේලාව</th>
                <th style={{ padding: '12px' }}>දින</th>
                <th style={{ padding: '12px' }}>ධාරිතාව</th>
                <th style={{ padding: '12px' }}>ක්‍රියාමාර්ග</th>
              </tr>
            </thead>
            <tbody>
              {filteredSchedules.map(schedule => (
                <tr key={schedule.schedule_id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '12px' }}>{schedule.class_name}<br/><small>{schedule.course_name} - {schedule.subject_name}</small></td>
                  <td style={{ padding: '12px' }}>{schedule.lecturer_name}</td>
                  <td style={{ padding: '12px' }}>{schedule.hall_name}</td>
                  <td style={{ padding: '12px' }}>{schedule.start_time} - {schedule.end_time}</td>
                  <td style={{ padding: '12px' }}>{schedule.day_of_week.join(', ')}</td>
                  <td style={{ padding: '12px' }}>{schedule.capacity}</td>
                  <td style={{ padding: '12px' }}>
                    <button 
                      onClick={() => handleEditClick(schedule)}
                      style={{ padding: '4px 8px', backgroundColor: '#fff8e1', color: '#f57f17', border: '1px solid #ffecb3', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => setConfirmDeleteId(schedule.schedule_id)}
                      style={{ padding: '4px 8px', backgroundColor: '#ffebee', color: '#d32f2f', border: '1px solid #ffcdd2', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', marginLeft: '5px' }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {filteredSchedules.length === 0 && (
                <tr><td colSpan="7" style={{ padding: '20px', textAlign: 'center', color: '#666' }}>කාලසටහන් හමුවුනේ නැත.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Custom Confirmation Modal */}
        {confirmDeleteId && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1200 }}>
            <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', width: '400px', textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
              <div style={{ fontSize: '40px', color: '#d32f2f', marginBottom: '15px' }}>⚠️</div>
              <h3 style={{ margin: '0 0 10px 0', color: '#1a237e' }}>කාලසටහන ඉවත් කිරීම ස්ථිරද?</h3>
              <p style={{ color: '#666', fontSize: '14px', lineHeight: '1.5' }}>
                මෙම ක්‍රියාව ආපසු හැරවිය නොහැක. මෙම කාලසටහනට අදාළ සියලුම දත්ත පද්ධතියෙන් ඉවත් වනු ඇත.
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '25px' }}>
                <button onClick={() => setConfirmDeleteId(null)} style={{ flex: 1, padding: '10px', border: '1px solid #ccc', background: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}>අවලංගු කරන්න</button>
                <button onClick={processDelete} style={{ flex: 1, padding: '10px', backgroundColor: '#d32f2f', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>ඔව්, ඉවත් කරන්න</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

ClassTab.propTypes = {
  courses: PropTypes.array.isRequired,
  lecturers: PropTypes.array.isRequired,
  subjects: PropTypes.array.isRequired,
  halls: PropTypes.array.isRequired,
  classSchedules: PropTypes.array.isRequired,
  onCreateClass: PropTypes.func.isRequired,
  onUpdateClass: PropTypes.func.isRequired,
  onDeleteClass: PropTypes.func.isRequired,
};

export default ClassTab;