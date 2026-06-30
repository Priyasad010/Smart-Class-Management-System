import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useNotification } from '../../context/NotificationContext';

const PromotionTab = ({ promos, onCreate, onUpdate, onDelete }) => {
  const { showNotification } = useNotification();
  const [formData, setFormData] = useState({ title: '', content_type: 'Flyer', description: '' });
  const [file, setFile] = useState(null);
  const [editingPromoId, setEditingPromoId] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) {
      setFile(null);
      return;
    }
    const allowedExtensions = ['.png', '.jpg', '.jpeg'];
    const fileName = selectedFile.name.toLowerCase();
    const isAllowed = allowedExtensions.some(ext => fileName.endsWith(ext));

    if (!isAllowed) {
      showNotification('මෙම ගොනු වර්ගය ඇතුළත් කළ නොහැක. කරුණාකර රූප ගොනුවක් (PNG, JPG, JPEG) තෝරන්න.', 'error');
      e.target.value = null; // Clear the input selection
      setFile(null);
    } else {
      setFile(selectedFile);
    }
  };

  const handleEditClick = (promo) => {
    setEditingPromoId(promo.promo_id);
    setFormData({
      title: promo.title,
      content_type: promo.content_type,
      description: promo.description || ''
    });
    setFile(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    if (file) data.append('file', file);
    
    if (editingPromoId) {
      onUpdate(editingPromoId, data);
      setEditingPromoId(null);
    } else {
      onCreate(data);
    }
    
    setFormData({ title: '', content_type: 'Flyer', description: '' });
    setFile(null);
  };

  const inputStyle = { width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', marginBottom: '15px' };

  return (
    <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
      <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', maxWidth: '400px', flex: 1 }}>
        <h3 style={{ color: '#1a237e', marginBottom: '20px' }}>
          {editingPromoId ? 'ප්‍රවර්ධනය සංස්කරණය කරන්න' : '➕ නව ප්‍රවර්ධනයක් ඇතුළත් කරන්න'}
        </h3>
        <form onSubmit={handleSubmit}>
          <select style={inputStyle} value={formData.content_type} onChange={e => setFormData({...formData, content_type: e.target.value})}>
            <option value="Flyer">Flyer (ප්‍රවර්ධන පත්‍රිකාව)</option>
            <option value="Teacher_Profile">Teacher Profile (ගුරු පැතිකඩ)</option>
            <option value="Achievement">Achievement (ජයග්‍රහණ)</option>
          </select>
          <input type="text" placeholder="මාතෘකාව (Title)" style={inputStyle} value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
          <textarea placeholder="විස්තරය (Description)" style={{...inputStyle, height: '80px'}} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
          
          <div style={{ marginBottom: '20px', padding: '15px', border: '1px dashed #1a237e', borderRadius: '5px', backgroundColor: '#f8f9fa' }}>
            <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold', fontSize: '14px', color: '#333' }}>අන්තර්ගතය (Upload Content)</label>
            <input 
              key={editingPromoId || (file ? 'file-present' : 'file-empty')}
              type="file" 
              accept="image/png, image/jpeg, image/jpg" 
              onChange={handleFileChange} 
              style={{ width: '100%' }} 
              required={!editingPromoId} 
            />
          </div>

          <button type="submit" style={{ width: '100%', padding: '12px', backgroundColor: '#1a237e', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', fontSize: '15px' }}>
            {editingPromoId ? 'යාවත්කාලීන කරන්න' : 'ප්‍රවර්ධනය සුරකින්න (Save Promotion)'}
          </button>

          {editingPromoId && (
            <button type="button" onClick={() => { setEditingPromoId(null); setFormData({ title: '', content_type: 'Flyer', description: '' }); setFile(null); }} style={{ width: '100%', padding: '10px', backgroundColor: '#f5f5f5', color: '#333', border: '1px solid #ccc', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', marginTop: '10px' }}>
              අවලංගු කරන්න (Cancel)
            </button>
          )}
        </form>
      </div>

      <div style={{ flex: 2, minWidth: '400px', backgroundColor: 'white', padding: '25px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
        <h3 style={{ color: '#1a237e', marginBottom: '20px' }}>ප්‍රකාශිත ප්‍රවර්ධන (Published Promotions)</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
          {promos.map(p => (
            <div key={p.promo_id} style={{ border: '1px solid #eee', borderRadius: '8px', overflow: 'hidden' }}>
              {p.image_url && <img src={p.image_url.startsWith('http') ? p.image_url : `${import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/api$/, '') : 'http://localhost:5000'}/${p.image_url.replace(/^api\//, '')}`} alt={p.title} style={{ width: '100%', height: '120px', objectFit: 'cover' }} />}
              <div style={{ padding: '10px' }}>
                <div style={{ fontSize: '10px', color: '#666', fontWeight: 'bold' }}>{p.content_type}</div>
                <div style={{ fontWeight: 'bold', fontSize: '14px', margin: '5px 0' }}>{p.title}</div>
                <div style={{ display: 'flex', gap: '5px', marginTop: '10px' }}>
                  <button onClick={() => handleEditClick(p)} style={{ flex: 1, padding: '6px', backgroundColor: '#e3f2fd', color: '#1565c0', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>සංස්කරණය</button>
                  <button onClick={() => onDelete(p.promo_id)} style={{ flex: 1, padding: '6px', backgroundColor: '#ffebee', color: '#d32f2f', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>මකාදමන්න</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

PromotionTab.propTypes = {
  promos: PropTypes.array.isRequired,
  onCreate: PropTypes.func.isRequired,
  onUpdate: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default PromotionTab;