import React, { useState } from 'react';
import PropTypes from 'prop-types';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { request } from '../../services/api';

const AttendanceValidationTab = ({ halls, activeSessions, onSendAlert, onBulkNotify }) => {
  const [sessionId, setSessionId] = useState('');
  const [hallId, setHallId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleValidate = async () => {
    if (!sessionId || !hallId) return alert('කරුණාකර Session සහ Hall තෝරන්න.');
    setLoading(true);
    try {
      const response = await request('/attendance/validate-zones', {
        method: 'POST',
        body: JSON.stringify({ session_id: sessionId, hall_id: hallId })
      });
      setResult(response.data);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCSV = () => {
    if (!result?.verification_data?.unverified_students) return;
    
    const headers = ["Student ID", "Name"];
    const rows = result.verification_data.unverified_students.map(s => [s.id, s.name]);
    
    let csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Discrepancy_Report_Session_${sessionId}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handleDownloadPDF = () => {
    if (!result) return;
    const doc = new jsPDF();
    const session = activeSessions.find(s => s.schedule_id === Number(sessionId));
    const sessionName = session?.class_name || 'N/A';
    const hall = halls.find(h => h.hall_id === Number(hallId));
    const hallName = hall?.hall_name || 'N/A';

    // Header
    doc.setFontSize(18);
    doc.setTextColor(26, 35, 126);
    doc.text('Thusitha Smart Class - Session Attendance Report', 14, 20);

    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Session: ${sessionName}`, 14, 30);
    doc.text(`Hall: ${hallName}`, 14, 37);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 44);

    // Summary
    doc.setTextColor(0);
    doc.text(`Door (QR) Scans: ${result.qr_count}`, 14, 55);
    doc.text(`AI Headcount: ${result.ai_headcount}`, 14, 62);
    doc.text(`Validation Result: ${result.mismatch_detected ? 'Mismatch Detected ⚠️' : 'Verified ✅'}`, 14, 69);

    // Zone Breakdown
    const zoneTableData = Object.entries(result.zone_breakdown).map(([name, count]) => [name, count]);
    doc.autoTable({
      head: [["Zone Name", "Headcount"]],
      body: zoneTableData,
      startY: 75,
      theme: 'grid',
      headStyles: { fillColor: [26, 35, 126] }
    });

    // Unverified Students
    if (result.verification_data?.unverified_students?.length > 0) {
      doc.setFontSize(14);
      doc.setTextColor(197, 48, 48);
      doc.text('Unverified Students (Discrepancy List)', 14, doc.lastAutoTable.finalY + 15);
      const unverifiedTableData = result.verification_data.unverified_students.map(s => [s.id, s.name]);
      doc.autoTable({
        head: [["Student ID", "Student Name"]],
        body: unverifiedTableData,
        startY: doc.lastAutoTable.finalY + 20,
        theme: 'grid',
        headStyles: { fillColor: [197, 48, 48] }
      });
    }

    doc.save(`Session_Report_${sessionName.replace(/\s+/g, '_')}.pdf`);
  };

  const cardStyle = { backgroundColor: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', marginBottom: '20px' };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={cardStyle}>
        <h3 style={{ color: '#1a237e', marginBottom: '20px' }}>🛡️ AI Zoned Headcount Validation</h3>
        <p style={{ fontSize: '14px', color: '#666' }}>මෙමගින් ශාලාවේ එක් එක් කලාප (Zones) වල සිටින සිසුන් ගණන QR දත්ත සමඟ සැසඳීම සිදු කරයි.</p>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
          <div>
            <label htmlFor="session-select" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Session තෝරන්න</label>
            <select id="session-select" value={sessionId} onChange={(e) => setSessionId(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }}>
              <option value="">-- පන්තිය තෝරන්න --</option>
              {activeSessions.map(s => <option key={s.schedule_id} value={s.schedule_id}>{s.class_name}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="hall-select" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>ශාලාව (Hall) තෝරන්න</label>
            <select id="hall-select" value={hallId} onChange={(e) => setHallId(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }}>
              <option value="">-- ශාලාවක් තෝරන්න --</option>
              {halls.map(h => <option key={h.hall_id} value={h.hall_id}>{h.hall_name}</option>)}
            </select>
          </div>
        </div>

        <button 
          onClick={handleValidate} 
          disabled={loading}
          style={{ width: '100%', padding: '15px', backgroundColor: '#1a237e', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          {loading ? 'කලාපීය දත්ත පරීක්ෂා කරමින්...' : 'කලාපීය පැමිණීම පරීක්ෂා කරන්න (Validate Zones)'}
        </button>
      </div>

      {result && (
        <div style={{ ...cardStyle, borderLeft: `10px solid ${result.mismatch_detected ? '#f44336' : '#4caf50'}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h4 style={{ color: result.mismatch_detected ? '#d32f2f' : '#2e7d32', margin: 0 }}>
              {result.mismatch_detected ? '⚠️ Attendance Discrepancy Found' : '✅ Attendance Verified'}
            </h4>
            <button 
              onClick={handleDownloadPDF}
              style={{ padding: '8px 15px', backgroundColor: '#455a64', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}
            >
              🖨️ PDF Report
            </button>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', fontSize: '18px' }}>
            <div>QR Scans: <strong>{result.qr_count}</strong></div>
            <div>AI Count: <strong>{result.ai_headcount}</strong></div>
          </div>

          <div style={{ backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '8px' }}>
            <h5 style={{ marginTop: 0 }}>📷 Zone Breakdown (Headcount per Camera):</h5>
            {Object.entries(result.zone_breakdown).map(([name, count]) => (
              <div key={name} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #eee' }}>
                <span>{name}</span>
                <span style={{ fontWeight: 'bold', color: '#1a237e' }}>{count} Students</span>
              </div>
            ))}
          </div>

          {result.verification_data?.unverified_students?.length > 0 && (
            <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#fff5f5', borderRadius: '8px', border: '1px solid #feb2b2' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                 <h5 style={{ margin: 0, color: '#c53030' }}>🚫 හඳුනාගත නොහැකි වූ සිසුන් (Unverified Students):</h5>
                 <div style={{ display: 'flex', gap: '10px' }}>
                    <button 
                      onClick={() => onBulkNotify(result.verification_data.unverified_students.map(s => s.id), sessionId)}
                      style={{ padding: '6px 12px', backgroundColor: '#c53030', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}
                    >
                      🔔 Notify All Parents
                    </button>
                    <button 
                      onClick={handleDownloadCSV}
                      style={{ padding: '6px 12px', backgroundColor: '#4a5568', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}
                    >
                      📥 Download CSV
                    </button>
                 </div>
               </div>
               <p style={{ fontSize: '12px', color: '#666', marginBottom: '10px' }}>පැමිණීම සටහන් කළ නමුත් කැමරාව මගින් හඳුනාගත නොහැකි වූ සිසුන්:</p>
               <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px' }}>
                 {result.verification_data.unverified_students.map(s => (
                   <li key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', padding: '8px', backgroundColor: 'white', borderRadius: '4px' }}>
                     <span><strong>{s.id}</strong> - {s.name}</span>
                     <button 
                       onClick={() => onSendAlert(s.id, sessionId)}
                       style={{ padding: '6px 12px', backgroundColor: '#e53e3e', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
                     >
                       🔔 Notify Parent
                     </button>
                   </li>
                 ))}
               </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

AttendanceValidationTab.propTypes = {
  halls: PropTypes.array.isRequired,
  activeSessions: PropTypes.array.isRequired,
  onSendAlert: PropTypes.func.isRequired,
  onBulkNotify: PropTypes.func.isRequired
};

export default AttendanceValidationTab;