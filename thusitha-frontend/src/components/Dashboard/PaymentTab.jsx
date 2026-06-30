import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { request } from '../../services/api';
import { SearchableSelect } from './Tabs/AchievementTab';

const PaymentTab = ({ students, courses, onRecordPayment, onSendReminders }) => {
  const [formData, setFormData] = useState({
    student_id: '',
    course_id: '',
    amount_paid: '',
    for_month: '',
    receipt_number: '',
    payment_method: 'Cash'
  });

  const [enrolledStudents, setEnrolledStudents] = useState([]);

  // Admin/Counter Verification & Single Reminder States
  const [searchParams, setSearchParams] = useState({
    course_id: '',
    for_month: ''
  });
  const [paymentStatuses, setPaymentStatuses] = useState([]);
  const [loadingStatuses, setLoadingStatuses] = useState(false);
  const [selectedSlip, setSelectedSlip] = useState(null); // { payment_id, url, student_name }
  const [verificationComments, setVerificationComments] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [reminderSendingId, setReminderSendingId] = useState(null); // Track single reminder sending
  const [bulkSending, setBulkSending] = useState(false);
  const [actionFeedback, setActionFeedback] = useState('');

  const handleCourseChange = (e) => {
    const selectedCourseId = e.target.value;
    const selectedCourse = courses.find(c => String(c.course_id) === String(selectedCourseId));
    
    setFormData({
      ...formData,
      course_id: selectedCourseId,
      student_id: '',
      amount_paid: selectedCourse ? (selectedCourse.monthly_fee || selectedCourse.fee || '') : ''
    });
  };

  useEffect(() => {
    if (formData.course_id) {
      request(`/enrollments/course/${formData.course_id}`)
        .then(data => setEnrolledStudents(data))
        .catch(err => console.error('Failed to fetch enrolled students:', err));
    } else {
      setEnrolledStudents([]);
    }
  }, [formData.course_id]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onRecordPayment(formData);
  };

  // Fetch payment status of all students for selected course/month
  const handleFetchStatuses = async () => {
    if (!searchParams.course_id || !searchParams.for_month) return;
    setLoadingStatuses(true);
    setActionFeedback('');
    try {
      const data = await request(`/payments/course-status?course_id=${searchParams.course_id}&for_month=${searchParams.for_month}`);
      setPaymentStatuses(data || []);
    } catch (err) {
      console.error(err);
      setActionFeedback('⚠️ ගෙවීම් තත්ත්ව ලැයිස්තුව ලබා ගැනීමට නොහැකි විය.');
    } finally {
      setLoadingStatuses(false);
    }
  };

  // Trigger loading list when search parameters change
  useEffect(() => {
    if (searchParams.course_id && searchParams.for_month) {
      handleFetchStatuses();
    }
  }, [searchParams.course_id, searchParams.for_month]);

  // Approve or Reject Bank Slip
  const handleVerifySlip = async (status) => {
    if (!selectedSlip) return;
    setVerifying(true);
    try {
      const response = await fetch(`http://localhost:5000/api/payments/${selectedSlip.payment_id}/verify`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          status: status,
          comments: verificationComments
        })
      });
      const result = await response.json();
      if (response.ok) {
        setActionFeedback(`✅ ගෙවීම ${status === 'Completed' ? 'තහවුරු කරන ලදී' : 'ප්‍රතික්ෂේප කරන ලදී'}.`);
        setSelectedSlip(null);
        setVerificationComments('');
        handleFetchStatuses();
      } else {
        alert(result.message || 'සත්‍යාපනය අසාර්ථකයි.');
      }
    } catch (err) {
      console.error(err);
      alert('ජාල සන්නිවේදන දෝෂයකි.');
    } finally {
      setVerifying(false);
    }
  };

  // Send Single WhatsApp Reminder
  const handleSendSingleReminder = async (studentId) => {
    setReminderSendingId(studentId);
    setActionFeedback('');
    try {
      const response = await fetch('http://localhost:5000/api/payments/remind-single', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          student_id: studentId,
          course_id: searchParams.course_id,
          for_month: searchParams.for_month
        })
      });
      const result = await response.json();
      if (response.ok) {
        setActionFeedback(`📲 ${result.message}`);
      } else {
        setActionFeedback(`❌ මතක් කිරීම යැවීමට නොහැකි විය: ${result.message}`);
      }
    } catch (err) {
      console.error(err);
      setActionFeedback('❌ WhatsApp මතක් කිරීම් යැවීමේ දෝෂයකි.');
    } finally {
      setReminderSendingId(null);
    }
  };

  // Send Bulk Reminders (Overriding existing to add loading status)
  const handleSendBulkReminders = async (e) => {
    e.preventDefault();
    if (!searchParams.course_id || !searchParams.for_month) {
      alert('කරුණාකර පන්තිය සහ මාසය තෝරන්න.');
      return;
    }
    setBulkSending(true);
    setActionFeedback('');
    try {
      const response = await fetch('http://localhost:5000/api/payments/remind', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          course_id: searchParams.course_id,
          for_month: searchParams.for_month
        })
      });
      const result = await response.json();
      if (response.ok) {
        setActionFeedback(`🔔 ${result.message}`);
        handleFetchStatuses();
      } else {
        setActionFeedback(`❌ මතක් කිරීම් යැවීමට නොහැකි විය: ${result.message}`);
      }
    } catch (err) {
      console.error(err);
      setActionFeedback('❌ WhatsApp bulk මතක් කිරීම් යැවීමේ දෝෂයකි.');
    } finally {
      setBulkSending(false);
    }
  };

  // Pre-fill cash record payment form for a student
  const handlePreFillCashPayment = (studentId, amount) => {
    setFormData({
      student_id: studentId,
      course_id: searchParams.course_id,
      amount_paid: amount || '',
      for_month: searchParams.for_month,
      receipt_number: 'REC-' + Date.now(),
      payment_method: 'Cash'
    });
    // Show alert and scroll smoothly to form
    alert('කරුණාකර ඉහළ ඇති ෆෝරමයෙන් ගෙවීම තහවුරු කරන්න.');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const inputStyle = { width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', marginBottom: '15px', boxSizing: 'border-box' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      
      {actionFeedback && (
        <div style={{ padding: '15px', backgroundColor: '#e8eaf6', borderLeft: '5px solid #1a237e', borderRadius: '4px', fontWeight: 'bold', fontSize: '14px', color: '#1a237e' }}>
          {actionFeedback}
        </div>
      )}

      {/* Row 1: Record payment and send reminder panels */}
      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        
        {/* Record Payment Form */}
        <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', maxWidth: '600px', flex: 1.5 }}>
          <h3 style={{ color: '#1a237e', marginBottom: '20px' }}>💰 ගෙවීම් සටහන් කිරීම (Record Payment)</h3>
          <form onSubmit={handleSubmit}>
            <label htmlFor="courseSelect" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>පන්තිය තෝරන්න</label>
            <select id="courseSelect" style={inputStyle} value={formData.course_id} onChange={handleCourseChange} required>
              <option value="">-- පන්තිය තෝරන්න --</option>
              {courses.map(c => <option key={c.course_id} value={c.course_id}>{c.course_name} - {c.teacher_name}</option>)}
            </select>

            <label htmlFor="studentSelect" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>ශිෂ්‍යයා තෝරන්න</label>
            <SearchableSelect 
              options={enrolledStudents.map(s => ({ value: s.student_id, label: `${s.student_name} (${s.qr_code_key})` }))}
              value={formData.student_id}
              onChange={(val) => setFormData({...formData, student_id: val})}
            />

            <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
              <div style={{ flex: 1 }}>
                <label htmlFor="amountPaid" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>මුදල (Rs.)</label>
                <input id="amountPaid" type="number" style={inputStyle} value={formData.amount_paid} onChange={(e) => setFormData({...formData, amount_paid: e.target.value})} required />
              </div>
              <div style={{ flex: 1 }}>
                <label htmlFor="forMonth" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>අදාළ මාසය</label>
                <select id="forMonth" style={inputStyle} value={formData.for_month} onChange={(e) => setFormData({...formData, for_month: e.target.value})} required>
                  <option value="">-- මාසය තෝරන්න --</option>
                  {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
            </div>

            <label htmlFor="receiptNumber" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Receipt No</label>
            <input id="receiptNumber" type="text" style={inputStyle} value={formData.receipt_number} onChange={(e) => setFormData({...formData, receipt_number: e.target.value})} required />

            <button 
              type="submit" 
              style={{ width: '100%', padding: '12px', backgroundColor: '#1a237e', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }}
            >
              💾 ගෙවීම සුරකින්න
            </button>
          </form>
        </div>

        {/* late payment bulk panel */}
        <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', maxWidth: '400px', flex: 1, height: 'fit-content' }}>
          <h3 style={{ color: '#d32f2f', marginBottom: '20px' }}>🔔 හිඟ මුදල් මතක් කිරීම (Bulk)</h3>
          <p style={{ fontSize: '14px', color: '#666', marginBottom: '20px' }}>තෝරාගත් පන්තියේ අදාළ මාසය සඳහා ගෙවීම් නොකළ සියලුම සිසුන්ගේ මව්පියන්ට WhatsApp පණිවිඩ යැවීම.</p>
          <form onSubmit={handleSendBulkReminders}>
            <label htmlFor="reminderCourse" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>පන්තිය තෝරන්න</label>
            <select id="reminderCourse" style={inputStyle} value={searchParams.course_id} onChange={(e) => setSearchParams({...searchParams, course_id: e.target.value})} required>
              <option value="">-- පන්තිය තෝරන්න --</option>
              {courses.map(c => <option key={c.course_id} value={c.course_id}>{c.course_name}</option>)}
            </select>

            <label htmlFor="reminderMonth" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>අදාළ මාසය</label>
            <select id="reminderMonth" style={inputStyle} value={searchParams.for_month} onChange={(e) => setSearchParams({...searchParams, for_month: e.target.value})} required>
              <option value="">-- මාසය තෝරන්න --</option>
              {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>

            <button 
              type="submit" 
              disabled={bulkSending}
              style={{ width: '100%', padding: '12px', backgroundColor: bulkSending ? '#ccc' : '#d32f2f', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              {bulkSending ? '📤 යවමින් පවතී...' : '📤 Bulk WhatsApp යවන්න'}
            </button>
          </form>
        </div>

      </div>

      {/* Row 2: Status check and Verification panel */}
      {searchParams.course_id && searchParams.for_month && (
        <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '15px', marginBottom: '20px' }}>
            <h3 style={{ color: '#1a237e', margin: 0 }}>🔍 ගෙවීම් තත්ත්ව ලේඛනය (Payment Status Ledger)</h3>
            <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#666' }}>
              පන්තිය: {courses.find(c => String(c.course_id) === String(searchParams.course_id))?.course_name} | මාසය: {searchParams.for_month}
            </span>
          </div>

          {loadingStatuses ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
              <div style={{ border: '4px solid #f3f3f3', borderTop: '4px solid #1a237e', borderRadius: '50%', width: '30px', height: '30px', animation: 'spin 1s linear infinite', margin: '0 auto 15px auto' }}></div>
              පූරණය වෙමින්...
            </div>
          ) : paymentStatuses.length === 0 ? (
            <div style={{ padding: '30px', textAlign: 'center', color: '#999' }}>
              මෙම පන්තියට ලියාපදිංචි වූ සිසුන් කිසිවෙකු හමු නොවීය.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f5f5f5', borderBottom: '2px solid #ddd' }}>
                    <th style={{ padding: '12px' }}>ශිෂ්‍යයා (Student)</th>
                    <th style={{ padding: '12px' }}>මව්පියන් සහ දුරකථනය (Parent & Phone)</th>
                    <th style={{ padding: '12px' }}>ගෙවීම් ක්‍රමය (Method)</th>
                    <th style={{ padding: '12px' }}>ගෙවූ මුදල (Amount)</th>
                    <th style={{ padding: '12px' }}>තත්ත්වය (Status)</th>
                    <th style={{ padding: '12px', textAlign: 'right' }}>ක්‍රියාකාරකම් (Actions)</th>
                  </tr>
                </thead>
                <tbody>
                  {paymentStatuses.map((s) => {
                    const hasPaid = s.payment_status === 'Completed' || s.payment_status === 'Paid';
                    const isPending = s.payment_status === 'Pending Verification';
                    const isRejected = s.payment_status === 'Rejected';
                    const isUnpaid = !s.payment_status;

                    return (
                      <tr key={s.student_id} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '12px', fontWeight: 'bold' }}>
                          {s.student_name} <br />
                          <span style={{ fontSize: '11px', color: '#888', fontWeight: 'normal' }}>({s.qr_code_key})</span>
                        </td>
                        <td style={{ padding: '12px' }}>
                          {s.parent_name} <br />
                          <span style={{ fontSize: '12px', color: '#555' }}>{s.parent_phone}</span>
                        </td>
                        <td style={{ padding: '12px' }}>
                          {s.payment_method ? (
                            <span style={{ padding: '2px 6px', fontSize: '11px', backgroundColor: '#e0e0e0', borderRadius: '3px' }}>
                              {s.payment_method}
                            </span>
                          ) : '-'}
                        </td>
                        <td style={{ padding: '12px', fontWeight: 'bold', color: '#1a237e' }}>
                          {s.amount_paid ? `Rs. ${parseFloat(s.amount_paid).toFixed(2)}` : '-'}
                        </td>
                        <td style={{ padding: '12px' }}>
                          {hasPaid && (
                            <span style={{ padding: '3px 8px', fontSize: '11px', fontWeight: 'bold', backgroundColor: '#e8f5e9', color: '#2e7d32', borderRadius: '10px' }}>
                              ✅ Paid
                            </span>
                          )}
                          {isPending && (
                            <span style={{ padding: '3px 8px', fontSize: '11px', fontWeight: 'bold', backgroundColor: '#fff8e1', color: '#f57f17', borderRadius: '10px' }}>
                              ⏳ Verification Pending
                            </span>
                          )}
                          {isRejected && (
                            <span style={{ padding: '3px 8px', fontSize: '11px', fontWeight: 'bold', backgroundColor: '#ffebee', color: '#c62828', borderRadius: '10px' }}>
                              ❌ Rejected
                            </span>
                          )}
                          {isUnpaid && (
                            <span style={{ padding: '3px 8px', fontSize: '11px', fontWeight: 'bold', backgroundColor: '#ffebee', color: '#c62828', borderRadius: '10px' }}>
                              🔴 Unpaid
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '12px', textAlign: 'right' }}>
                          {isPending && (
                            <button
                              onClick={() => setSelectedSlip({ payment_id: s.payment_id, url: s.confirmation_url, student_name: s.student_name })}
                              style={{ padding: '6px 12px', backgroundColor: '#f57f17', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px', marginRight: '5px' }}
                            >
                              📂 රිසිට්පත බලන්න
                            </button>
                          )}
                          {isUnpaid && (
                            <>
                              <button
                                onClick={() => handleSendSingleReminder(s.student_id)}
                                disabled={reminderSendingId === s.student_id}
                                style={{ padding: '6px 12px', backgroundColor: '#075e54', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px', marginRight: '5px' }}
                              >
                                {reminderSendingId === s.student_id ? '📲 යවමින්...' : '📲 WhatsApp මතක්'}
                              </button>
                              <button
                                onClick={() => handlePreFillCashPayment(s.student_id, courses.find(c => String(c.course_id) === String(searchParams.course_id))?.monthly_fee || courses.find(c => String(c.course_id) === String(searchParams.course_id))?.fee)}
                                style={{ padding: '6px 12px', backgroundColor: '#1a237e', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}
                              >
                                💰 Cash Record
                              </button>
                            </>
                          )}
                          {isRejected && (
                            <button
                              onClick={() => handleSendSingleReminder(s.student_id)}
                              disabled={reminderSendingId === s.student_id}
                              style={{ padding: '6px 12px', backgroundColor: '#d32f2f', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}
                            >
                              {reminderSendingId === s.student_id ? '📲 යවමින්...' : '📲 WhatsApp යළි මතක්'}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Verification overlay modal */}
      {selectedSlip && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '10px', maxWidth: '500px', width: '90%', textAlign: 'center', boxShadow: '0 5px 15px rgba(0,0,0,0.3)', position: 'relative' }}>
            <button 
              onClick={() => setSelectedSlip(null)} 
              style={{ position: 'absolute', top: '10px', right: '15px', background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', fontWeight: 'bold', color: '#666' }}
            >
              &times;
            </button>
            <h3 style={{ color: '#1a237e', marginTop: 0, marginBottom: '15px' }}>ගෙවීම් රිසිට්පත පරීක්ෂා කිරීම (Slip Verification)</h3>
            <p style={{ fontSize: '14px', color: '#555', marginBottom: '15px' }}>ශිෂ්‍යයා: <strong>{selectedSlip.student_name}</strong></p>
            
            <div style={{ border: '1px solid #ddd', padding: '10px', borderRadius: '5px', marginBottom: '15px', backgroundColor: '#f9f9f9', display: 'flex', justifyContent: 'center' }}>
              {selectedSlip.url.toLowerCase().endsWith('.pdf') ? (
                <a 
                  href={`http://localhost:5000${selectedSlip.url}`} 
                  target="_blank" 
                  rel="noreferrer"
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '15px', backgroundColor: '#d32f2f', color: 'white', borderRadius: '5px', textDecoration: 'none', fontWeight: 'bold' }}
                >
                  📄 PDF රිසිට්පත විවෘත කරන්න
                </a>
              ) : (
                <img 
                  src={`http://localhost:5000${selectedSlip.url}`} 
                  alt="Payment Receipt" 
                  style={{ maxWidth: '100%', maxHeight: '350px', objectFit: 'contain', borderRadius: '5px' }} 
                />
              )}
            </div>

            <label htmlFor="comments" style={{ display: 'block', marginBottom: '5px', textAlign: 'left', fontWeight: 'bold', fontSize: '13px' }}>පද්ධති සටහන් (Comments - ඓච්ඡිකයි)</label>
            <input 
              id="comments"
              type="text" 
              placeholder="e.g. රිසිට්පත අනුමත කරන ලදී / රිසිට්පත අපැහැදිලියි..." 
              value={verificationComments}
              onChange={(e) => setVerificationComments(e.target.value)}
              style={inputStyle}
            />

            <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
              <button
                disabled={verifying}
                onClick={() => handleVerifySlip('Completed')}
                style={{ flex: 1, padding: '12px', backgroundColor: '#2e7d32', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                {verifying ? 'මතක තබමින්...' : '✅ රිසිට්පත අනුමත කරන්න (Approve)'}
              </button>
              <button
                disabled={verifying}
                onClick={() => handleVerifySlip('Rejected')}
                style={{ flex: 1, padding: '12px', backgroundColor: '#c62828', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                {verifying ? 'මතක තබමින්...' : '❌ ප්‍රතික්ෂේප කරන්න (Reject)'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSS Animation keyframe for loading indicator */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      
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