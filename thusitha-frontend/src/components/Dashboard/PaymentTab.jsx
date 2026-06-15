import React, { useState } from 'react';
import PropTypes from 'prop-types';

const PaymentTab = ({ students, courses, onRecordPayment, onSendReminders }) => {
  const [formData, setFormData] = useState({
    student_id: '',
    course_id: '',
    amount_paid: '',
    for_month: '',
    receipt_number: '',
    payment_method: 'Cash'
  });

  const [reminderData, setReminderData] = useState({
    course_id: '',
    for_month: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onRecordPayment(formData);
  };

  const handleReminderSubmit = (e) => {
    e.preventDefault();
    onSendReminders(reminderData);
  };

  const inputStyle = { width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', marginBottom: '15px', boxSizing: 'border-box' };

  return (
    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
      <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', maxWidth: '600px', flex: 1.5 }}>
      <h3 style={{ color: '#1a237e', marginBottom: '20px' }}>💰 ගෙවීම් සටහන් කිරීම (Record Payment)</h3>
      <form onSubmit={handleSubmit}>
        <label htmlFor="studentSelect" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>ශිෂ්‍යයා තෝරන්න</label>
        <select id="studentSelect" style={inputStyle} value={formData.student_id} onChange={(e) => setFormData({...formData, student_id: e.target.value})} required>
          <option value="">-- ශිෂ්‍යයා තෝරන්න --</option>
          {students.map(s => <option key={s._id} value={s._id}>{s.name} ({s.studentId})</option>)}
        </select>

        <label htmlFor="courseSelect" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>පන්තිය තෝරන්න</label>
        <select id="courseSelect" style={inputStyle} value={formData.course_id} onChange={(e) => setFormData({...formData, course_id: e.target.value})} required>
          <option value="">-- පන්තිය තෝරන්න --</option>
          {courses.map(c => <option key={c.course_id} value={c.course_id}>{c.course_name} - {c.teacher_name}</option>)}
        </select>

        <div style={{ display: 'flex', gap: '15px' }}>
          <div style={{ flex: 1 }}>
            <label htmlFor="amountPaid" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>මුදල (Rs.)</label>
            <input id="amountPaid" type="number" style={inputStyle} value={formData.amount_paid} onChange={(e) => setFormData({...formData, amount_paid: e.target.value})} required />
          </div>
          <div style={{ flex: 1 }}>
            <label htmlFor="forMonth" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>අදාළ මාසය</label>
            <input id="forMonth" type="text" placeholder="January" style={inputStyle} value={formData.for_month} onChange={(e) => setFormData({...formData, for_month: e.target.value})} required />
          </div>
        </div>

        <label htmlFor="receiptNumber" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>රසීදු අංකය (Receipt No)</label>
        <input id="receiptNumber" type="text" style={inputStyle} value={formData.receipt_number} onChange={(e) => setFormData({...formData, receipt_number: e.target.value})} required />

        <button 
          type="submit" 
          style={{ width: '100%', padding: '12px', backgroundColor: '#1a237e', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }}
        >
          💾 ගෙවීම සුරකින්න
        </button>
      </form>
      </div>

      <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', maxWidth: '400px', flex: 1, height: 'fit-content' }}>
        <h3 style={{ color: '#d32f2f', marginBottom: '20px' }}>🔔 හිඟ මුදල් මතක් කිරීම</h3>
        <p style={{ fontSize: '14px', color: '#666', marginBottom: '20px' }}>තෝරාගත් පන්තියේ අදාළ මාසය සඳහා ගෙවීම් නොකළ සිසුන්ගේ මව්පියන්ට SMS පණිවිඩ යැවීම.</p>
        <form onSubmit={handleReminderSubmit}>
          <label htmlFor="reminderCourse" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>පන්තිය තෝරන්න</label>
          <select id="reminderCourse" style={inputStyle} value={reminderData.course_id} onChange={(e) => setReminderData({...reminderData, course_id: e.target.value})} required>
            <option value="">-- පන්තිය තෝරන්න --</option>
            {courses.map(c => <option key={c.course_id} value={c.course_id}>{c.course_name}</option>)}
          </select>

          <label htmlFor="reminderMonth" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>අදාළ මාසය</label>
          <input id="reminderMonth" type="text" placeholder="January" style={inputStyle} value={reminderData.for_month} onChange={(e) => setReminderData({...reminderData, for_month: e.target.value})} required />

          <button 
            type="submit" 
            style={{ width: '100%', padding: '12px', backgroundColor: '#d32f2f', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            📤 මතක් කිරීම් SMS යවන්න
          </button>
        </form>
      </div>
    </div>
  );
};

PaymentTab.propTypes = {
  students: PropTypes.arrayOf(PropTypes.object).isRequired,
  courses: PropTypes.arrayOf(PropTypes.object).isRequired,
  onRecordPayment: PropTypes.func.isRequired,
  onSendReminders: PropTypes.func.isRequired,
};

export default PaymentTab;