import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { request, BASE_URL } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import { generateReceiptPDF } from '../../utils/generateReceiptPDF';
import { Download } from 'lucide-react';

const ParentPortalTab = ({ myChildren, onRefresh }) => {
  const { showNotification } = useNotification();
  const [selectedChildId, setSelectedChildId] = useState(
    myChildren && myChildren.length > 0 ? myChildren[0].student_id : ''
  );
  const [activeSubTab, setActiveSubTab] = useState('attendance'); // 'attendance', 'exams', 'payments'
  const [uploadingPaymentId, setUploadingPaymentId] = useState(null);

  if (!myChildren || myChildren.length === 0) {
    return (
      <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '15px', textAlign: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.03)' }}>
        <h3 style={{ color: '#1a237e', margin: '0 0 10px 0' }}>දරුවන්ගේ දත්ත නොමැත</h3>
        <p style={{ color: '#666' }}>මෙම මව්පිය ගිණුමට සම්බන්ධ ශිෂ්‍ය ගිණුම් කිසිවක් පද්ධතියේ හමු නොවීය.</p>
      </div>
    );
  }

  // Find active child object
  const activeChild = myChildren.find(c => c.student_id === Number(selectedChildId)) || myChildren[0];

  const handleReceiptUpload = async (e, paymentId) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingPaymentId(paymentId);
    const formData = new FormData();
    formData.append('receipt', file);

    try {
      await request(`/payments/${paymentId}/upload-confirmation`, {
        method: 'POST',
        body: formData,
        isFormData: true
      });
      showNotification('ගෙවීම් පත්‍රිකාව සාර්ථකව උඩුගත කරන ලදී! පද්ධති සත්‍යාපනයෙන් පසු තහවුරු වනු ඇත.', 'success');
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error(err);
      showNotification(err.message || 'ගෙවීම් පත්‍රිකාව උඩුගත කිරීම අසාර්ථක විය.', 'error');
    } finally {
      setUploadingPaymentId(null);
    }
  };

  const badgeStyle = (status) => {
    let bg = '#e8f5e9';
    let text = '#2e7d32';
    if (status === 'Pending' || status === 'Absent') {
      bg = '#ffebee';
      text = '#c62828';
    } else if (status === 'Pending Verification' || status === 'Late') {
      bg = '#fff8e1';
      text = '#f57f17';
    }
    return {
      backgroundColor: bg,
      color: text,
      padding: '4px 10px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: 'bold',
      display: 'inline-block'
    };
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* 👤 Children Selector Row */}
      <div style={{ display: 'flex', gap: '15px', overflowX: 'auto', paddingBottom: '5px' }}>
        {myChildren.map((child) => (
          <button
            key={child.student_id}
            onClick={() => setSelectedChildId(child.student_id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 20px',
              backgroundColor: selectedChildId === child.student_id ? '#1a237e' : 'white',
              color: selectedChildId === child.student_id ? 'white' : '#333',
              border: selectedChildId === child.student_id ? 'none' : '1px solid #ddd',
              borderRadius: '12px',
              cursor: 'pointer',
              fontWeight: 'bold',
              transition: 'all 0.2s',
              boxShadow: '0 4px 6px rgba(0,0,0,0.02)',
              minWidth: '200px'
            }}
          >
            <div style={{
              width: '35px',
              height: '35px',
              borderRadius: '50%',
              backgroundColor: '#eee',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px'
            }}>
              👶
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '14px' }}>{child.student_name}</div>
              <div style={{ fontSize: '11px', opacity: 0.8 }}>{child.grade}</div>
            </div>
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        
        {/* 💳 Child Info & QR Code Card */}
        <div style={{ flex: '1 1 300px', backgroundColor: 'white', padding: '25px', borderRadius: '15px', boxShadow: '0 4px 10px rgba(0,0,0,0.02)', height: 'fit-content' }}>
          <h3 style={{ color: '#1a237e', margin: '0 0 20px 0', borderBottom: '2px solid #f5f5f5', paddingBottom: '10px' }}>👤 ශිෂ්‍ය විස්තර</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
            <div style={{
              width: '90px',
              height: '90px',
              borderRadius: '50%',
              backgroundColor: '#e8eaf6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '40px',
              border: '3px solid #1a237e'
            }}>
              👨‍🎓
            </div>
            <div style={{ textAlign: 'center' }}>
              <h4 style={{ margin: '0 0 5px 0', fontSize: '18px', color: '#1a237e' }}>{activeChild.student_name}</h4>
              <p style={{ margin: 0, color: '#666', fontSize: '13px' }}>{activeChild.school} | {activeChild.grade}</p>
            </div>
          </div>

          <div style={{ backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '10px', textAlign: 'center' }}>
            <span style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>පැමිණීමේ QR කේතය (QR Key)</span>
            <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#1a237e', padding: '8px', border: '1px dashed #1a237e', borderRadius: '5px', backgroundColor: '#e8eaf6', letterSpacing: '1px' }}>
              {activeChild.qr_code_key}
            </div>
            <small style={{ color: '#888', display: 'block', marginTop: '5px' }}>ආයතනයට ඇතුළු වීමේදී මෙම කේතය ස්කෑන් කරන්න.</small>
          </div>
        </div>

        {/* 📊 Details Panels (Attendance, Exams, Payments) */}
        <div style={{ flex: '2 1 600px', backgroundColor: 'white', padding: '25px', borderRadius: '15px', boxShadow: '0 4px 10px rgba(0,0,0,0.02)' }}>
          
          {/* Sub Navigation */}
          <div style={{ display: 'flex', borderBottom: '2px solid #eee', gap: '15px', marginBottom: '20px' }}>
            <button
              onClick={() => setActiveSubTab('attendance')}
              style={{
                padding: '10px 15px',
                border: 'none',
                background: 'none',
                borderBottom: activeSubTab === 'attendance' ? '3px solid #1a237e' : '3px solid transparent',
                color: activeSubTab === 'attendance' ? '#1a237e' : '#666',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              📅 පැමිණීමේ වාර්තා (Attendance)
            </button>
            <button
              onClick={() => setActiveSubTab('exams')}
              style={{
                padding: '10px 15px',
                border: 'none',
                background: 'none',
                borderBottom: activeSubTab === 'exams' ? '3px solid #1a237e' : '3px solid transparent',
                color: activeSubTab === 'exams' ? '#1a237e' : '#666',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              📝 විභාග සහ ලකුණු (Exams)
            </button>
            <button
              onClick={() => setActiveSubTab('payments')}
              style={{
                padding: '10px 15px',
                border: 'none',
                background: 'none',
                borderBottom: activeSubTab === 'payments' ? '3px solid #1a237e' : '3px solid transparent',
                color: activeSubTab === 'payments' ? '#1a237e' : '#666',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              💰 ගෙවීම් විස්තර (Payments)
            </button>
          </div>

          {/* 📅 SUB TAB: Attendance */}
          {activeSubTab === 'attendance' && (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #eee', textAlign: 'left', backgroundColor: '#f9f9f9' }}>
                    <th style={{ padding: '12px' }}>දිනය සහ වේලාව</th>
                    <th style={{ padding: '12px' }}>පන්තිය</th>
                    <th style={{ padding: '12px' }}>කලාපය (Zone)</th>
                    <th style={{ padding: '12px', textAlign: 'center' }}>තත්ත්වය</th>
                  </tr>
                </thead>
                <tbody>
                  {!activeChild.attendance || activeChild.attendance.length === 0 ? (
                    <tr><td colSpan="4" style={{ textAlign: 'center', padding: '20px', color: '#888' }}>පැමිණීමේ සටහන් කිසිවක් හමු නොවීය.</td></tr>
                  ) : (
                    activeChild.attendance.map((log) => (
                      <tr key={log.log_id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                        <td style={{ padding: '12px' }}>{new Date(log.timestamp).toLocaleString()}</td>
                        <td style={{ padding: '12px' }}>{log.course_name || 'සාමාන්‍ය පැමිණීම'}</td>
                        <td style={{ padding: '12px' }}>{log.zone || 'Lobby / Gate'}</td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          <span style={badgeStyle(log.verification_status)}>
                            {log.verification_status === 'Verified' ? 'පැමිණ ඇත' : log.verification_status === 'Late' ? 'ප්‍රමාදයි' : log.verification_status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* 📝 SUB TAB: Exam Results */}
          {activeSubTab === 'exams' && (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #eee', textAlign: 'left', backgroundColor: '#f9f9f9' }}>
                    <th style={{ padding: '12px' }}>විභාගය</th>
                    <th style={{ padding: '12px' }}>දිනය</th>
                    <th style={{ padding: '12px', textAlign: 'center' }}>ලකුණු</th>
                    <th style={{ padding: '12px', textAlign: 'center' }}>සමත්/අසමත්</th>
                  </tr>
                </thead>
                <tbody>
                  {!activeChild.results || activeChild.results.length === 0 ? (
                    <tr><td colSpan="4" style={{ textAlign: 'center', padding: '20px', color: '#888' }}>ප්‍රතිඵල සටහන් කිසිවක් හමු නොවීය.</td></tr>
                  ) : (
                    activeChild.results.map((res, idx) => {
                      const percentage = (res.marks / res.total_marks) * 100;
                      const isPass = percentage >= res.pass_percentage;
                      return (
                        <tr key={idx} style={{ borderBottom: '1px solid #f5f5f5' }}>
                          <td style={{ padding: '12px' }}>{res.exam_name}</td>
                          <td style={{ padding: '12px' }}>{new Date(res.exam_date).toLocaleDateString()}</td>
                          <td style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold' }}>{res.marks} / {res.total_marks}</td>
                          <td style={{ padding: '12px', textAlign: 'center' }}>
                            <span style={badgeStyle(isPass ? 'Verified' : 'Pending')}>
                              {isPass ? 'சමත්' : 'අසමත්'}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* 💰 SUB TAB: Payments */}
          {activeSubTab === 'payments' && (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #eee', textAlign: 'left', backgroundColor: '#f9f9f9' }}>
                    <th style={{ padding: '12px' }}>මාසය</th>
                    <th style={{ padding: '12px' }}>පන්තිය</th>
                    <th style={{ padding: '12px' }}>මුදල</th>
                    <th style={{ padding: '12px', textAlign: 'center' }}>තත්ත්වය</th>
                    <th style={{ padding: '12px', textAlign: 'center' }}>ස්ලිප් එක (Receipt)</th>
                  </tr>
                </thead>
                <tbody>
                  {!activeChild.payments || activeChild.payments.length === 0 ? (
                    <tr><td colSpan="5" style={{ textAlign: 'center', padding: '20px', color: '#888' }}>ගෙවීම් සටහන් කිසිවක් හමු නොවීය.</td></tr>
                  ) : (
                    activeChild.payments.map((pay) => (
                      <tr key={pay.payment_id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                        <td style={{ padding: '12px', fontWeight: '500' }}>{pay.for_month}</td>
                        <td style={{ padding: '12px' }}>{pay.course_name}</td>
                        <td style={{ padding: '12px' }}>රු. {Number(pay.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          <span style={badgeStyle(pay.payment_status)}>
                            {pay.payment_status === 'Completed' || pay.payment_status === 'Paid' ? 'ගෙවා ඇත' : pay.payment_status === 'Pending Verification' ? 'සත්‍යාපනය වෙමින්' : 'ගෙවා නැත'}
                          </span>
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap', alignItems: 'center' }}>
                            {(pay.payment_status === 'Completed' || pay.payment_status === 'Paid') && (
                              <button
                                onClick={() => generateReceiptPDF({
                                  ...pay,
                                  amount_paid: pay.amount // Parent query maps amount_paid to amount
                                })}
                                style={{
                                  padding: '5px 12px',
                                  backgroundColor: '#4caf50',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '5px',
                                  cursor: 'pointer',
                                  fontSize: '11px',
                                  fontWeight: 'bold',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}
                              >
                                <Download size={12} /> PDF
                              </button>
                            )}
                            {pay.payment_slip_path || pay.confirmation_url ? (
                              <a
                                href={`${BASE_URL}${pay.payment_slip_path || pay.confirmation_url}`}
                                target="_blank"
                                rel="noreferrer"
                                style={{ color: '#1a237e', textDecoration: 'underline', fontSize: '12px', fontWeight: 'bold' }}
                              >
                                📄 බලන්න (View)
                              </a>
                            ) : pay.payment_status !== 'Completed' && pay.payment_status !== 'Paid' ? (
                              <div>
                                <input
                                  type="file"
                                  id={`slip-${pay.payment_id}`}
                                  accept="image/*, .pdf"
                                  style={{ display: 'none' }}
                                  onChange={(e) => handleReceiptUpload(e, pay.payment_id)}
                                />
                                <label
                                  htmlFor={`slip-${pay.payment_id}`}
                                  style={{
                                    padding: '5px 12px',
                                    backgroundColor: '#2e7d32',
                                    color: 'white',
                                    borderRadius: '5px',
                                    cursor: 'pointer',
                                    fontSize: '11px',
                                    fontWeight: 'bold',
                                    display: 'inline-block'
                                  }}
                                >
                                  {uploadingPaymentId === pay.payment_id ? 'පූරණය වෙමින්...' : '📤 Slip එක දාන්න'}
                                </label>
                              </div>
                            ) : (
                              <span style={{ color: '#999', fontSize: '12px' }}>නොමැත</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};

ParentPortalTab.propTypes = {
  myChildren: PropTypes.arrayOf(
    PropTypes.shape({
      student_id: PropTypes.number.isRequired,
      student_name: PropTypes.string.isRequired,
      school: PropTypes.string,
      grade: PropTypes.string,
      qr_code_key: PropTypes.string,
      courses: PropTypes.array,
      attendance: PropTypes.array,
      results: PropTypes.array,
      payments: PropTypes.array
    })
  ).isRequired,
  onRefresh: PropTypes.func
};

export default ParentPortalTab;
