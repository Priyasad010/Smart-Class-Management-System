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

  useEffect(() => {
    if (selectedCourse) {
      request(`/materials/${selectedCourse}`)
        .then(data => setMaterials(data || []))
        .catch(err => console.error(err));
      
      const course = courses.find(c => c.course_id === Number.parseInt(selectedCourse, 10));
      setSelectedCourseData(course);
    }
  }, [selectedCourse]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !selectedCourse) return showNotification('කරුණාකර පන්තිය සහ ගොනුව තෝරන්න.', 'error');

    setUploading(true);
    const formData = new FormData();
    formData.append('course_id', selectedCourse);
    formData.append('material_title', title);
    formData.append('file', file);

    try {
      await request('/materials/upload', {
        method: 'POST',
        body: formData
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
          
          {selectedCourseData?.moodle_course_id && (
            <div style={{ marginBottom: '15px' }}>
              <button 
                type="button"
                onClick={() => window.open(`https://moodle.thusitha.edu/course/view.php?id=${selectedCourseData.moodle_course_id}`, '_blank')}
                style={{ width: '100%', padding: '10px', backgroundColor: '#f57c00', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                🌐 Open Moodle Classroom
              </button>
            </div>
          )}

          <input type="text" placeholder="ගොනුවේ නම (Title)" style={{ width: '100%', padding: '10px', marginBottom: '15px' }} value={title} onChange={(e) => setTitle(e.target.value)} required />
          <input type="file" style={{ width: '100%', padding: '10px', marginBottom: '15px' }} onChange={(e) => setFile(e.target.files[0])} required />
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