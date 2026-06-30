import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Doughnut } from 'react-chartjs-2';

const WhatsAppLogTab = ({ logs, onResend, onDelete, onBulkResend, onResendFilteredFailed }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [bulkDate, setBulkDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const filteredLogs = logs.filter(log => {
    const matchesSearch = (log.parent_name && log.parent_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          (log.parent_phone && String(log.parent_phone).includes(searchTerm));
    const matchesStatus = statusFilter === 'All' || log.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const failedFilteredLogs = filteredLogs.filter(log => log.status === 'Failed');

  // 📊 Delivery Performance Stats Calculation
  const sentCount = logs.filter(l => l.status === 'Sent').length;
  const failedCount = logs.filter(l => l.status === 'Failed').length;
  const totalCount = logs.length;
  const successRate = totalCount > 0 ? ((sentCount / totalCount) * 100).toFixed(1) : 100;

  const chartData = {
    labels: ['යවන ලදී (Sent)', 'අසාර්ථකයි (Failed)'],
    datasets: [
      {
        data: [sentCount, failedCount],
        backgroundColor: ['#2e7d32', '#d32f2f'],
        hoverOffset: 4,
      },
    ],
  };

  const inputStyle = { width: '100%', padding: '10px', marginBottom: '20px', borderRadius: '5px', border: '1px solid #ddd', boxSizing: 'border-box' };

  return (
    <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '15px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
      <h3 style={{ color: '#1a237e', marginBottom: '25px' }}>📱 WhatsApp වාර්තා සහ බෙදාහැරීමේ කාර්ය සාධනය (WhatsApp History & Performance)</h3>

      {/* 📈 Success Rate Overview Section */}
      <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap', marginBottom: '35px', padding: '25px', backgroundColor: '#f8fafc', borderRadius: '15px', alignItems: 'center' }}>
        <div style={{ width: '180px', height: '180px' }}>
          <Doughnut data={chartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
        </div>
        <div style={{ flex: 1, minWidth: '250px' }}>
          <div style={{ color: '#64748b', fontSize: '12px', fontWeight: 'bold', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '1px' }}>බෙදාහැරීමේ සාර්ථකත්වය (Delivery Success Rate)</div>
          <div style={{ fontSize: '56px', fontWeight: '900', color: Number.parseFloat(successRate) > 90 ? '#2e7d32' : '#f57c00', lineHeight: '1' }}>
            {successRate}%
          </div>
          <div style={{ display: 'flex', gap: '30px', marginTop: '20px' }}>
            <div style={{ borderLeft: '5px solid #2e7d32', paddingLeft: '15px' }}>
              <small style={{ color: '#666', fontSize: '11px', fontWeight: 'bold' }}>සාර්ථක (Sent):</small>
              <div style={{ fontWeight: '800', fontSize: '22px', color: '#1e293b' }}>{sentCount}</div>
            </div>
            <div style={{ borderLeft: '5px solid #d32f2f', paddingLeft: '15px' }}>
              <small style={{ color: '#666', fontSize: '11px', fontWeight: 'bold' }}>අසාර්ථක (Failed):</small>
              <div style={{ fontWeight: '800', fontSize: '22px', color: '#1e293b' }}>{failedCount}</div>
            </div>
          </div>
        </div>
      </div>
      
      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '20px' }}>
        <div style={{ flex: 1, minWidth: '300px' }}>
          <label htmlFor="searchInput" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>සෙවීම</label>
          <input 
            id="searchInput"
            type="text" 
            placeholder="මව්පිය නම හෝ දුරකථන අංකයෙන් සොයන්න..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={inputStyle}
          />
        </div>

        <div style={{ flex: 0.5, minWidth: '150px' }}>
          <label htmlFor="statusFilter" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>තත්ත්වය අනුව පෙරීම</label>
          <select 
            id="statusFilter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={inputStyle}
          >
            <option value="All">සියල්ල (All)</option>
            <option value="Sent">යවන ලදී (Sent)</option>
            <option value="Failed">අසාර්ථකයි (Failed)</option>
          </select>
        </div>
        
        {failedFilteredLogs.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'flex-end', marginBottom: '20px' }}>
            <button 
              onClick={() => onResendFilteredFailed(failedFilteredLogs.map(l => l.log_id))}
              style={{ padding: '10px 15px', backgroundColor: '#e65100', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
            > Retry {failedFilteredLogs.length} Failed</button>
          </div>
        )}
        
        <div style={{ padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '8px', border: '1px solid #eee', display: 'flex', alignItems: 'flex-end', gap: '10px' }}>
          <div>
            <label htmlFor="bulkDateInput" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>තොග වශයෙන් යැවීම (Bulk Resend)</label>
            <input 
              id="bulkDateInput"
              type="date" 
              value={bulkDate} 
              onChange={(e) => setBulkDate(e.target.value)}
              style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
            />
          </div>
          <button 
            onClick={() => onBulkResend(bulkDate)}
            style={{ padding: '10px 15px', backgroundColor: '#2e7d32', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
          >🚀 Bulk Resend</button>
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f5f5f5', textAlign: 'left' }}>
              <th style={{ padding: '12px' }}>මව්පිය නම</th>
              <th style={{ padding: '12px' }}>දුරකථන අංකය</th>
              <th style={{ padding: '12px' }}>වර්ගය</th>
              <th style={{ padding: '12px' }}>තත්ත්වය</th>
              <th style={{ padding: '12px' }}>දිනය</th>
              <th style={{ padding: '12px', textAlign: 'center' }}>ක්‍රියාමාර්ග</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.map(log => (
              <tr key={log.log_id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '12px' }}>{log.parent_name}</td>
                <td style={{ padding: '12px' }}>{log.parent_phone}</td>
                <td style={{ padding: '12px' }}>
                  <span style={{ padding: '4px 8px', backgroundColor: '#e8eaf6', borderRadius: '4px', fontSize: '12px', color: '#1a237e' }}>
                    {log.sms_type}
                  </span>
                </td>
                <td style={{ padding: '12px' }}>
                  <span style={{ 
                    padding: '4px 10px', 
                    borderRadius: '12px', 
                    fontSize: '11px', 
                    fontWeight: 'bold',
                    backgroundColor: log.status === 'Sent' ? '#e8f5e9' : '#ffebee',
                    color: log.status === 'Sent' ? '#2e7d32' : '#d32f2f',
                    border: `1px solid ${log.status === 'Sent' ? '#c8e6c9' : '#ffcdd2'}`,
                    display: 'inline-block'
                  }}>
                    {log.status === 'Sent' ? '✅ Sent' : '❌ Failed'}
                  </span>
                </td>
                <td style={{ padding: '12px' }}>{new Date(log.sent_at).toLocaleString()}</td>
                <td style={{ padding: '12px', textAlign: 'center', display: 'flex', gap: '8px', justifyContent: 'center' }}>
                  <button 
                    onClick={() => setSelectedMessage(log)}
                    style={{ padding: '6px 12px', backgroundColor: '#455a64', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                  >
                    👁️ View
                  </button>
                  {log.status === 'Failed' ? (
                    <button 
                      onClick={() => onResend(log.log_id)}
                      style={{ padding: '6px 12px', backgroundColor: '#f57c00', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
                      title="Retry sending this failed message"
                    >
                      🔁 Retry
                    </button>
                  ) : (
                    <button 
                      onClick={() => onResend(log.log_id)}
                      style={{ padding: '6px 12px', backgroundColor: '#1a237e', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                    >
                      🔄 Resend
                    </button>
                  )}
                  <button 
                    onClick={() => onDelete(log.log_id)}
                    style={{ padding: '6px 12px', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                  >
                    🗑️ Delete
                  </button>
                </td>
              </tr>
            ))}
            {filteredLogs.length === 0 && (
              <tr><td colSpan="5" style={{ padding: '20px', textAlign: 'center', color: '#666' }}>වාර්තා හමුවුනේ නැත.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* View Message Modal */}
      {selectedMessage && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 }}>
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', width: '90%', maxWidth: '500px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
              <h3 style={{ margin: 0, color: '#1a237e' }}>✉️ පණිවිඩය පරීක්ෂා කිරීම</h3>
              <button onClick={() => setSelectedMessage(null)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#666' }}>&times;</button>
            </div>
            
            <div style={{ marginBottom: '15px' }}>
              <small style={{ color: '#666', fontWeight: 'bold' }}>මව්පිය නම:</small>
              <div style={{ fontSize: '16px' }}>{selectedMessage.parent_name}</div>
            </div>
            
            <div style={{ marginBottom: '15px' }}>
              <small style={{ color: '#666', fontWeight: 'bold' }}>දුරකථන අංකය:</small>
              <div style={{ fontSize: '16px' }}>{selectedMessage.parent_phone}</div>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <small style={{ color: '#666', fontWeight: 'bold' }}>පණිවිඩය:</small>
              <div style={{ padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '8px', marginTop: '5px', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>
                {selectedMessage.message_body}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button 
                onClick={() => setSelectedMessage(null)} 
                style={{ flex: 1, padding: '12px', border: '1px solid #ccc', background: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                Close
              </button>
              <button 
                onClick={() => {
                  onResend(selectedMessage.log_id);
                  setSelectedMessage(null);
                }} 
                style={{ flex: 1, padding: '12px', backgroundColor: selectedMessage.status === 'Failed' ? '#f57c00' : '#1a237e', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                {selectedMessage.status === 'Failed' ? '🔁 Retry Now' : '🔄 Resend Now'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

WhatsAppLogTab.propTypes = {
  logs: PropTypes.array.isRequired,
  onResend: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onBulkResend: PropTypes.func.isRequired,
  onResendFilteredFailed: PropTypes.func.isRequired
};

export default WhatsAppLogTab;