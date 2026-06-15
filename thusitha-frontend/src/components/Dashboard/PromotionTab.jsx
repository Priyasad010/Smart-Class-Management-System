import React, { useState } from 'react';
import PropTypes from 'prop-types';

const PromotionTab = ({ promos, onCreate, onDelete }) => {
  const [formData, setFormData] = useState({ title: '', content_type: 'Flyer', description: '' });
  const [file, setFile] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    if (file) data.append('image', file);
    onCreate(data);
    setFormData({ title: '', content_type: 'Flyer', description: '' });
    setFile(null);
  };

  const inputStyle = { width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', marginBottom: '15px' };

  return (
    <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
      <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', maxWidth: '400px', flex: 1 }}>
        <h3 style={{ color: '#1a237e', marginBottom: '20px' }}>📢 නව ප්‍රවර්ධන දත්ත (Add Promo)</h3>
        <form onSubmit={handleSubmit}>
          <select style={inputStyle} value={formData.content_type} onChange={e => setFormData({...formData, content_type: e.target.value})}>
            <option value="Flyer">Flyer (පත්‍රිකා)</option>
            <option value="Teacher_Profile">Teacher Profile</option>
            <option value="Achievement">Achievement</option>
          </select>
          <input type="text" placeholder="Title" style={inputStyle} value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
          <textarea placeholder="Description" style={{...inputStyle, height: '80px'}} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
          <input type="file" onChange={e => setFile(e.target.files[0])} style={{ marginBottom: '15px' }} required />
          <button type="submit" style={{ width: '100%', padding: '12px', backgroundColor: '#1a237e', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>Upload Content</button>
        </form>
      </div>

      <div style={{ flex: 2, minWidth: '400px', backgroundColor: 'white', padding: '25px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
        <h3 style={{ color: '#1a237e', marginBottom: '20px' }}>🖼️ පවතින ප්‍රවර්ධන දත්ත</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
          {promos.map(p => (
            <div key={p.promo_id} style={{ border: '1px solid #eee', borderRadius: '8px', overflow: 'hidden' }}>
              {p.image_url && <img src={`${import.meta.env.VITE_API_URL}/${p.image_url}`} alt={p.title} style={{ width: '100%', height: '120px', objectFit: 'cover' }} />}
              <div style={{ padding: '10px' }}>
                <div style={{ fontSize: '10px', color: '#666', fontWeight: 'bold' }}>{p.content_type}</div>
                <div style={{ fontWeight: 'bold', fontSize: '14px', margin: '5px 0' }}>{p.title}</div>
                <button onClick={() => onDelete(p.promo_id)} style={{ padding: '4px 8px', backgroundColor: '#ffebee', color: '#d32f2f', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>Delete</button>
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
  onDelete: PropTypes.func.isRequired,
};

export default PromotionTab;