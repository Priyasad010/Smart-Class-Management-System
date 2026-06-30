import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { request } from '../../services/api';

const SmartAttendanceLivePanel = ({ halls, activeSessions }) => {
  const [sessionId, setSessionId] = useState('');
  const [hallId, setHallId] = useState('');
  const [liveData, setLiveData] = useState(null);
  const [isPolling, setIsPolling] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let intervalId;

    const fetchLiveStats = async () => {
      try {
        setError(null);
        // We poll the lightweight live-status endpoint
        const response = await request(`/attendance/session/${sessionId}/live-status`, {
          method: 'GET'
        });
        setLiveData(response);
      } catch (err) {
        setError(err.message);
        setIsPolling(false); // Stop polling on error
      }
    };

    if (isPolling && sessionId && hallId) {
      fetchLiveStats(); // Initial fetch
      intervalId = setInterval(fetchLiveStats, 5000); // Poll every 5 seconds
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isPolling, sessionId, hallId]);

  const handleToggleLive = () => {
    if (!sessionId || !hallId) {
      alert('කරුණාකර Session සහ Hall තෝරන්න.');
      return;
    }
    setIsPolling(!isPolling);
  };

  const cardStyle = { backgroundColor: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', marginBottom: '20px' };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={cardStyle}>
        <h3 style={{ color: '#1a237e', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ display: 'inline-block', width: '12px', height: '12px', borderRadius: '50%', backgroundColor: isPolling ? '#f44336' : '#9e9e9e', animation: isPolling ? 'pulse 1.5s infinite' : 'none' }}></span>
          📸 Smart Attendance Live Panel
        </h3>
        <p style={{ fontSize: '14px', color: '#666' }}>
          මෙම පැනලය හරහා ශාලාවේ සිසුන් පැමිණීම (QR) සහ AI කැමරා ගණනය සජීවීව (Live) නිරීක්ෂණය කළ හැක.
        </p>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
          <div>
            <label htmlFor="live-session-select" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Session තෝරන්න</label>
            <select id="live-session-select" value={sessionId} onChange={(e) => {setSessionId(e.target.value); setIsPolling(false);}} disabled={isPolling} style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }}>
              <option value="">-- පන්තිය තෝරන්න --</option>
              {activeSessions.map(s => <option key={s.schedule_id} value={s.schedule_id}>{s.course_name} ({s.day_of_week} {s.start_time}-{s.end_time})</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="live-hall-select" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>ශාලාව (Hall) තෝරන්න</label>
            <select id="live-hall-select" value={hallId} onChange={(e) => {setHallId(e.target.value); setIsPolling(false);}} disabled={isPolling} style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }}>
              <option value="">-- ශාලාවක් තෝරන්න --</option>
              {halls.map(h => <option key={h.hall_id} value={h.hall_id}>{h.hall_name}</option>)}
            </select>
          </div>
        </div>

        <button 
          onClick={handleToggleLive} 
          style={{ width: '100%', padding: '15px', backgroundColor: isPolling ? '#d32f2f' : '#1a237e', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          {isPolling ? '⏹️ සජීවී නිරීක්ෂණය නවත්වන්න (Stop Live)' : '▶️ සජීවී නිරීක්ෂණය අරඹන්න (Start Live)'}
        </button>
      </div>

      {error && (
        <div style={{ padding: '15px', backgroundColor: '#ffebee', color: '#c62828', borderRadius: '5px', marginBottom: '20px' }}>
          ⚠️ දෝෂයකි: {error}
        </div>
      )}

      {liveData && isPolling && (
        <div style={{ ...cardStyle, borderLeft: `10px solid ${liveData.mismatch_detected ? '#ff9800' : '#4caf50'}`, transition: 'all 0.3s ease' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h4 style={{ color: liveData.mismatch_detected ? '#f57c00' : '#2e7d32', margin: 0, fontSize: '24px' }}>
              {liveData.mismatch_detected ? '⚠️ Mismatch Detected! Verifying...' : '✅ Synchronized (MATCH)'}
            </h4>
            <div style={{ fontSize: '12px', color: '#666', textAlign: 'right' }}>
              <div>Threshold: ±{liveData.threshold || 5} students</div>
              <div>Last updated: {new Date().toLocaleTimeString()}</div>
            </div>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '30px', textAlign: 'center' }}>
            <div style={{ padding: '20px', backgroundColor: '#e8eaf6', borderRadius: '10px', minWidth: '150px' }}>
              <div style={{ fontSize: '14px', color: '#3f51b5', fontWeight: 'bold' }}>DOOR SCANS (QR)</div>
              <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#1a237e' }}>{liveData.qr_count}</div>
            </div>
            <div style={{ padding: '20px', backgroundColor: '#e8eaf6', borderRadius: '10px', minWidth: '150px' }}>
              <div style={{ fontSize: '14px', color: '#3f51b5', fontWeight: 'bold' }}>AI HEADCOUNT</div>
              <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#1a237e' }}>{liveData.ai_headcount}</div>
            </div>
          </div>

          <div style={{ backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '8px' }}>
            <h5 style={{ marginTop: 0, marginBottom: '15px' }}>📷 Live Zone Data (CCTV):</h5>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              {Object.entries(liveData.zone_breakdown || {}).map(([name, count]) => (
                <div key={name} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', backgroundColor: 'white', borderRadius: '5px', border: '1px solid #eee' }}>
                  <span style={{ fontWeight: '500' }}>{name}</span>
                  <span style={{ fontWeight: 'bold', color: '#1a237e', fontSize: '18px' }}>{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      <style>{`
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(244, 67, 54, 0.7); }
          70% { box-shadow: 0 0 0 10px rgba(244, 67, 54, 0); }
          100% { box-shadow: 0 0 0 0 rgba(244, 67, 54, 0); }
        }
      `}</style>
    </div>
  );
};

SmartAttendanceLivePanel.propTypes = {
  halls: PropTypes.array.isRequired,
  activeSessions: PropTypes.array.isRequired
};

export default SmartAttendanceLivePanel;
