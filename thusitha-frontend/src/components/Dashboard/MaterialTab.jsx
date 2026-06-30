import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { request } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';

const MaterialTab = ({ courses }) => {
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedCourseData, setSelectedCourseData] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [title, setTitle] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const { showNotification } = useNotification();

  const userData = localStorage.getItem('user');
  const user = userData ? JSON.parse(userData) : null;
  const isStudent = user?.role === 'Student';

  useEffect(() => {
    if (selectedCourse) {
      request(`/materials/${selectedCourse}`) // /api prefix handled by api.js
        .then(data => setMaterials(data || []))
        .catch(err => console.error(err));
      
      const course = courses.find(c => c.course_id === Number.parseInt(selectedCourse, 10));
      setSelectedCourseData(course);
    }
  }, [selectedCourse]);


  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !selectedCourse) return showNotification('කරුණාකර පන්තිය සහ ගොනුව තෝරන්න.', 'error');

    // Enforce PDF only check on file
    if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
      return showNotification('PDF ගොනු පමණක් උඩුගත කළ හැක. (Only PDF files are allowed)', 'error');
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('course_id', selectedCourse);
    formData.append('material_title', title);
    formData.append('file', file);

    try {
      await request('/materials/upload', {
        method: 'POST',
        body: formData,
        isFormData: true
      });
      
      showNotification('ගොනුව සාර්ථකව උඩුගත කළා!');
      setTitle('');
      setFile(null);
      
      // Refresh list
      const data = await request(`/materials/${selectedCourse}`);
      setMaterials(data || []);
      
    } catch (err) {
      showNotification(err.message, 'error');
    } finally {
      setUploading(false);
    }
  };

  if (isStudent) {
    return (
      <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
        <h3 style={{ color: '#1a237e', marginBottom: '20px' }}>📁 මගේ ඉගෙනුම් ද්‍රව්‍ය (My Learning Materials)</h3>
        
        <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '300px' }}>
            <label htmlFor="course-select" style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>පන්තිය තෝරන්න (Select Class)</label>
            <select id="course-select" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '15px', marginBottom: '20px', outline: 'none' }} value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)} required>
              <option value="">-- පන්තිය තෝරන්න --</option>
              {courses.map(c => <option key={c.course_id} value={c.course_id}>{c.course_name}</option>)}
            </select>
            
          </div>

          <div style={{ flex: 2, minWidth: '300px', borderLeft: '1px solid #eee', paddingLeft: '30px' }}>
            <h4 style={{ marginTop: 0, color: '#1a237e', borderBottom: '2px solid #1a237e', paddingBottom: '8px' }}>පවතින ඉගෙනුම් ගොනු (Available Learning Files)</h4>
            {selectedCourse ? (
              materials.length > 0 ? (
                materials.map(m => (
                  <div key={m.material_id} style={{ padding: '15px 10px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: '500', color: '#333' }}>📄 {m.material_title}</span>
                    <a 
                      href={`${import.meta.env.VITE_API_URL}/${m.uploaded_file}`} 
                      target="_blank" 
                      rel="noreferrer" 
                      style={{ 
                        textDecoration: 'none', 
                        color: 'white', 
                        backgroundColor: '#1a237e', 
                        padding: '8px 16px', 
                        borderRadius: '6px', 
                        fontSize: '13px', 
                        fontWeight: 'bold',
                        boxShadow: '0 2px 4px rgba(26, 35, 126, 0.2)' 
                      }}
                    >
                      බාගත කරන්න (Download PDF)
                    </a>
                  </div>
                ))
              ) : (
                <div style={{ color: '#666', fontStyle: 'italic', padding: '20px 0' }}>මෙම පන්තිය සඳහා දැනට ඉගෙනුම් ද්‍රව්‍ය කිසිවක් උඩුගත කර නොමැත.</div>
              )
            ) : (
              <div style={{ color: '#888', padding: '20px 0', textAlign: 'center' }}>කරුණාකර ඉගෙනුම් ද්‍රව්‍ය බැලීම සඳහා පන්තියක් තෝරන්න.</div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
      <h3 style={{ color: '#1a237e', marginBottom: '20px' }}>📁 ඉගෙනුම් ද්‍රව්‍ය කළමනාකරණය (Learning Materials)</h3>
      
      <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
        <form onSubmit={handleUpload} style={{ flex: 1, minWidth: '300px' }}>
          <label htmlFor="course-select" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>පන්තිය තෝරන්න</label>
          <select id="course-select" style={{ width: '100%', padding: '10px', marginBottom: '15px' }} value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)} required>
            <option value="">-- පන්තිය තෝරන්න --</option>
            {courses.map(c => <option key={c.course_id} value={c.course_id}>{c.course_name}</option>)}
          </select>
          

          <input type="text" placeholder="ගොනුවේ නම (Title)" style={{ width: '100%', padding: '10px', marginBottom: '15px' }} value={title} onChange={(e) => setTitle(e.target.value)} required />
          <div style={{ marginBottom: '15px' }}>
            <label htmlFor="file-input" style={{ display: 'block', marginBottom: '5px', fontSize: '12px', color: '#666' }}>* PDF ගොනු පමණක් අනුමත කෙරේ. (Only PDF files are allowed.)</label>
            <input id="file-input" type="file" accept=".pdf" style={{ width: '100%', padding: '10px' }} onChange={(e) => setFile(e.target.files[0])} required />
          </div>
          <button type="submit" disabled={uploading} style={{ width: '100%', padding: '12px', backgroundColor: '#1a237e', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
            {uploading ? 'පූරණය වෙමින්...' : '📤 ගොනුව උඩුගත කරන්න'}
          </button>
        </form>

        <div style={{ flex: 1, minWidth: '300px', borderLeft: '1px solid #eee', paddingLeft: '30px' }}>
          <h4 style={{ marginTop: 0 }}>පවතින ගොනු</h4>
          {materials.map(m => (
            <div key={m.material_id} style={{ padding: '10px', borderBottom: '1px solid #f0f0f0' }}>
              <a href={`${import.meta.env.VITE_API_URL}/${m.uploaded_file}`} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', color: '#3f51b5', fontWeight: '500' }}>📄 {m.material_title}</a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

MaterialTab.propTypes = {
  courses: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default MaterialTab;