import React, { useState } from 'react';
import PropTypes from 'prop-types';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const SuspiciousActivityTab = ({ logs, startDate, endDate, onStartDateChange, onEndDateChange, onResolve, apiUrl }) => {
  const [selectedLog, setSelectedLog] = useState(null);
  const [comment, setComment] = useState('');
  const [activeZoneImg, setActiveZoneImg] = useState('');

  const inputStyle = { padding: '8px', borderRadius: '5px', border: '1px solid #ddd' };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(18);
    doc.setTextColor(26, 35, 126); // Thusitha Navy Blue
    doc.text('Thusitha Smart Class - Suspicious Activity Report', 14, 20);
    
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Period: ${startDate || 'Start'} to ${endDate || 'Today'}`, 14, 30);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 37);
    doc.text(`Total Incidents: ${logs.length}`, 14, 44);

    // Table
    const tableColumn = ["Date/Time", "Class", "QR/AI", "Status", "Resolution Notes"];
    const tableRows = logs.map(log => [
      new Date(log.detected_at).toLocaleString(),
      log.class_name,
      `${log.qr_count} / ${log.ai_headcount}`,
      log.status || 'Pending',
      log.resolution_comment || 'No notes provided'
    ]);

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 50,
      theme: 'grid',
      headStyles: { fillColor: [26, 35, 126] }
    });

    doc.save(`Security_Discrepancy_Report_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '15px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ color: '#1a237e', margin: 0 }}>🛡️ සැක සහිත පැමිණීම් වාර්තාව (Suspicious Activity)</h3>
        <button 
          onClick={handleExportPDF}
          disabled={logs.length === 0}
          style={{ padding: '10px 20px', backgroundColor: '#455a64', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          📊 වාර්තාව ලබාගන්න (Export PDF)
        </button>
      </div>

      <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', alignItems: 'flex-end' }}>
        <div>
          <label htmlFor="startDate" style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '5px' }}>සිට</label>
          <input id="startDate" type="date" value={startDate} onChange={(e) => onStartDateChange(e.target.value)} style={inputStyle} />
        </div>
        <div>
          <label htmlFor="endDate" style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', marginBottom: '5px' }}>දක්වා</label>
          <input id="endDate" type="date" value={endDate} onChange={(e) => onEndDateChange(e.target.value)} style={inputStyle} />
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f5f5f5', textAlign: 'left' }}>
              <th style={{ padding: '12px' }}>දිනය සහ වේලාව</th>
              <th style={{ padding: '12px' }}>පන්තිය</th>
              <th style={{ padding: '12px', textAlign: 'center' }}>QR / AI</th>
              <th style={{ padding: '12px' }}>කලාපීය විස්තර (Zones)</th>
              <th style={{ padding: '12px' }}>තත්ත්වය</th>
              <th style={{ padding: '12px', textAlign: 'center' }}>ක්‍රියාමාර්ග</th>
            </tr>
          </thead>
          <tbody>
            {logs.map(log => (
              <tr key={log.log_id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '12px', fontSize: '13px' }}>{new Date(log.detected_at).toLocaleString()}</td>
                <td style={{ padding: '12px', fontWeight: 'bold' }}>{log.class_name}</td>
                <td style={{ padding: '12px', textAlign: 'center' }}>
                   <span style={{ color: '#1a237e' }}>{log.qr_count}</span> / <span style={{ color: '#d32f2f' }}>{log.ai_headcount}</span>
                </td>
                <td style={{ padding: '12px', fontSize: '12px' }}>
                  {Object.entries(log.zone_details).map(([zone, count]) => `${zone}: ${count}`).join(', ')}
                </td>
                <td style={{ padding: '12px', fontSize: '12px', color: '#c53030' }}>
                  {log.unverified_student_ids && log.unverified_student_ids.length > 0 
                    ? log.unverified_student_ids.join(', ') 
                    : 'N/A'}
                </td>
                <td style={{ padding: '12px' }}>
                  <span style={{ 
                    padding: '4px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold',
                    backgroundColor: log.status === 'Resolved' ? '#e8f5e9' : '#fff3e0',
                    color: log.status === 'Resolved' ? '#2e7d32' : '#e65100'
                  }}>
                    {log.status || 'Pending'}
                  </span>
                </td>
                <td style={{ padding: '12px', textAlign: 'center' }}>
                  <button 
                    onClick={() => { setSelectedLog(log); setComment(log.resolution_comment || ''); setActiveZoneImg(Object.values(log.image_paths || {})[0] || ''); }}
                    style={{ padding: '6px 12px', backgroundColor: '#1a237e', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                  >
                    {log.status === 'Resolved' ? '👁️ View' : '🛠️ Resolve'}
                  </button>
                </td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr><td colSpan="6" style={{ padding: '30px', textAlign: 'center', color: '#666' }}>වාර්තා හමුවුනේ නැත.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* RESOLVE MODAL WITH PHOTO */}
      {selectedLog && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1300 }}>
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '15px', width: '800px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
            <h3 style={{ color: '#1a237e', marginTop: 0 }}>🔍 විසංවාදය නිරාකරණය (Discrepancy Resolution)</h3>
            
            <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
              <div style={{ flex: 1 }}>
                <h5 style={{ marginBottom: '10px' }}>📸 හඳුනාගත් දර්ශන (Captured Evidence)</h5>
                <div style={{ display: 'flex', gap: '5px', marginBottom: '10px', overflowX: 'auto' }}>
                  {Object.entries(selectedLog.image_paths || {}).map(([zone, path]) => (
                    <button key={zone} onClick={() => setActiveZoneImg(path)} style={{ padding: '5px 10px', backgroundColor: activeZoneImg === path ? '#1a237e' : '#eee', color: activeZoneImg === path ? 'white' : '#333', border: 'none', borderRadius: '4px', cursor: 'pointer', whiteSpace: 'nowrap', fontSize: '11px' }}>
                      {zone}
                    </button>
                  ))}
                </div>
                {activeZoneImg ? (
                  <img 
                    src={`${apiUrl}/${activeZoneImg}`} 
                    alt="Evidence" 
                    style={{ width: '100%', borderRadius: '8px', border: '1px solid #ddd', objectFit: 'contain', maxHeight: '300px' }} 
                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/300x200?text=Image+Not+Found'; }} // Fallback for broken images
                  />
                ) : <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f5f5f5', borderRadius: '8px', color: '#999' }}>දර්ශන ලබාගත නොහැක</div>}
              </div>

              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h5 style={{ marginBottom: '10px' }}>✍️ විමර්ශන සටහන් (Investigation Comments)</h5>
                <textarea 
                  value={comment} 
                  onChange={(e) => setComment(e.target.value)} 
                  disabled={selectedLog.status === 'Resolved'}
                  placeholder="පරීක්ෂා කිරීමෙන් පසු ඔබගේ නිරීක්ෂණ මෙහි සටහන් කරන්න..." 
                  style={{ flex: 1, padding: '15px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', minHeight: '200px' }}
                />
              </div>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '15px', marginTop: '20px' }}>
              {selectedLog.status !== 'Resolved' && (
                <button onClick={() => { onResolve(selectedLog.log_id, 'තාක්ෂණික දෝෂයක් (Technical Error)'); setSelectedLog(null); setComment(''); }} style={{ padding: '10px 20px', backgroundColor: '#ff9800', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
                  ⚙️ තාක්ෂණික දෝෂයක් (Technical Error)
                </button>
              )}
              <div style={{ display: 'flex', gap: '15px', marginLeft: 'auto' }}>
              <button onClick={() => setSelectedLog(null)} style={{ padding: '10px 20px', borderRadius: '6px', border: '1px solid #ccc', background: 'none', cursor: 'pointer' }}>Close</button>
              {selectedLog.status !== 'Resolved' && (
                <button onClick={() => { onResolve(selectedLog.log_id, comment); setSelectedLog(null); }} style={{ padding: '10px 25px', backgroundColor: '#2e7d32', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Resolve Now</button>
              )}
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
  );
};

SuspiciousActivityTab.propTypes = {
  logs: PropTypes.array.isRequired,
  startDate: PropTypes.string,
  endDate: PropTypes.string,
  onStartDateChange: PropTypes.func.isRequired,
  onEndDateChange: PropTypes.func.isRequired,
  onResolve: PropTypes.func.isRequired,
  apiUrl: PropTypes.string
};

export default SuspiciousActivityTab;