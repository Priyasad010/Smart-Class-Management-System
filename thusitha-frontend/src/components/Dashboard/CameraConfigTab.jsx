import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { request } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';

const CameraConfigTab = ({ halls }) => {
  const { showNotification } = useNotification();
  const [selectedHallId, setSelectedHallId] = useState('');
  const [zones, setZones] = useState([]);
  const [formData, setFormData] = useState({ zone_name: '', camera_url: '', position: '' });
  const [editingZoneId, setEditingZoneId] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchZones = async (hallId) => {
    if (!hallId) {
      setZones([]);
      return;
    }
    setLoading(true);
    try {
      const data = await request(`/camera-zones/hall/${hallId}`); // /api prefix handled by api.js
      setZones(data);
    } catch (err) {
      showNotification(`කැමරා කලාප ලබා ගැනීමට නොහැකි විය: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchZones(selectedHallId);
  }, [selectedHallId]);

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedHallId) {
      showNotification('කරුණාකර ශාලාවක් තෝරන්න.', 'error');
      return;
    }

    const payload = { ...formData, hall_id: selectedHallId, position: Number(formData.position) };

    try {
      if (editingZoneId) {
        await request(`/camera-zones/${editingZoneId}`, { method: 'PUT', body: JSON.stringify(payload) });
        showNotification('කැමරා කලාපය යාවත්කාලීන කරන ලදී!');
      } else {
        await request('/camera-zones', { method: 'POST', body: JSON.stringify(payload) });
        showNotification('කැමරා කලාපය සාර්ථකව එකතු කරන ලදී!');
      }
      setFormData({ zone_name: '', camera_url: '', position: '' });
      setEditingZoneId(null);
      fetchZones(selectedHallId);
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  const handleEdit = (zone) => {
    setEditingZoneId(zone.zone_id);
    setFormData({ zone_name: zone.zone_name, camera_url: zone.camera_url, position: zone.position });
  };

  const handleDelete = async (zoneId) => {
    if (!globalThis.confirm('ඔබට මෙම කැමරා කලාපය ඉවත් කිරීමට අවශ්‍යද?')) return;
    try {
      await request(`/camera-zones/${zoneId}`, { method: 'DELETE' }); // /api prefix handled by api.js
      showNotification('කැමරා කලාපය සාර්ථකව ඉවත් කරන ලදී!');
      fetchZones(selectedHallId);
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  const inputStyle = { width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', marginBottom: '15px', boxSizing: 'border-box' };

  return (
    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
      {/* LEFT: Hall Selection and Zone Form */}
      <div style={{ flex: 1, minWidth: '400px', backgroundColor: 'white', padding: '25px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
        <h3 style={{ color: '#1a237e', marginBottom: '20px' }}>📷 කැමරා කලාප කළමනාකරණය</h3>
        
        <label htmlFor="hallSelect" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>ශාලාව තෝරන්න</label>
        <select id="hallSelect" style={inputStyle} value={selectedHallId} onChange={(e) => setSelectedHallId(e.target.value)}>
          <option value="">-- ශාලාවක් තෝරන්න --</option>
          {halls.map(h => <option key={h.hall_id} value={h.hall_id}>{h.hall_name}</option>)}
        </select>

        {selectedHallId && (
          <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
            <h4 style={{ color: '#1a237e', marginBottom: '15px' }}>{editingZoneId ? 'කලාපය සංස්කරණය' : 'නව කලාපයක් එක් කරන්න'}</h4>
            
            <label htmlFor="zone_name" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>කලාපයේ නම (e.g., Front Rows)</label>
            <input type="text" id="zone_name" name="zone_name" value={formData.zone_name} onChange={handleFormChange} style={inputStyle} required />

            <label htmlFor="camera_url" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>කැමරා URL (RTSP/HTTP/File)</label>
            <input type="text" id="camera_url" name="camera_url" value={formData.camera_url} onChange={handleFormChange} style={inputStyle} placeholder="rtsp://user:pass@ip:port/stream or http://ip:port/shot.jpg" required />
            <p style={{ fontSize: '12px', color: '#666', marginTop: '-10px', marginBottom: '15px' }}>
              (e.g., `rtsp://user:pass@ip:port/stream`, `http://ip:port/shot.jpg` for phone apps, or `file:///path/to/image.jpg` for local testing)
            </p>

            <label htmlFor="position" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>පිහිටීම (Order)</label>
            <input type="number" id="position" name="position" value={formData.position} onChange={handleFormChange} style={inputStyle} min="1" required />

            <button type="submit" style={{ width: '100%', padding: '12px', backgroundColor: '#1a237e', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
              {editingZoneId ? '💾 යාවත්කාලීන කරන්න' : '➕ කලාපය එක් කරන්න'}
            </button>
            {editingZoneId && (
              <button type="button" onClick={() => { setEditingZoneId(null); setFormData({ zone_name: '', camera_url: '', position: '' }); }} style={{ width: '100%', padding: '10px', backgroundColor: '#666', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', marginTop: '10px' }}>
                අවලංගු කරන්න
              </button>
            )}
          </form>
        )}
      </div>

      {/* RIGHT: Existing Camera Zones */}
      <div style={{ flex: 2, minWidth: '500px', backgroundColor: 'white', padding: '25px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
        <h3 style={{ color: '#1a237e', marginBottom: '20px' }}>පවතින කැමරා කලාප</h3>
        {selectedHallId ? (
          (() => {
            if (loading) return <p>කැමරා කලාප පූරණය වෙමින් පවතී...</p>;
            if (zones.length === 0) return <p>මෙම ශාලාව සඳහා කැමරා කලාප නොමැත. අලුත් එකක් එක් කරන්න.</p>;
            return (
              <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f5f5f5', textAlign: 'left' }}>
                      <th style={{ padding: '12px' }}>කලාපය</th>
                      <th style={{ padding: '12px' }}>URL</th>
                      <th style={{ padding: '12px' }}>පිහිටීම</th>
                      <th style={{ padding: '12px' }}>ක්‍රියාමාර්ග</th>
                    </tr>
                  </thead>
                  <tbody>
                    {zones.map(zone => (
                      <tr key={zone.zone_id} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '12px' }}>{zone.zone_name}</td>
                        <td style={{ padding: '12px', fontSize: '12px', wordBreak: 'break-all' }}>{zone.camera_url}</td>
                        <td style={{ padding: '12px' }}>{zone.position}</td>
                        <td style={{ padding: '12px' }}>
                          <button 
                            onClick={() => handleEdit(zone)}
                            style={{ padding: '4px 8px', backgroundColor: '#fff8e1', color: '#f57f17', border: '1px solid #ffecb3', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDelete(zone.zone_id)}
                            style={{ padding: '4px 8px', backgroundColor: '#ffebee', color: '#d32f2f', border: '1px solid #ffcdd2', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', marginLeft: '5px' }}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })()
        ) : (
          <p>කැමරා කලාප බැලීමට ශාලාවක් තෝරන්න.</p>
        )}
      </div>
    </div>
  );
};

CameraConfigTab.propTypes = {
  halls: PropTypes.array.isRequired,
};

export default CameraConfigTab;