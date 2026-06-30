import React, { useState } from 'react';
import PropTypes from 'prop-types';

const TeacherTab = ({ teachers, onAdd, onEdit, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [formData, setFormData] = useState({
    username: '', password: '', teacher_name: '', phone: '', email: '', specialization: '', qualifications: ''
  });

  const filteredTeachers = teachers.filter(t =>
    (t.teacher_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.specialization || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const resetForm = () => {
    setFormData({ username: '', password: '', teacher_name: '', phone: '', email: '', specialization: '', qualifications: '' });
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await onAdd(formData);
      setShowAddModal(false);
      resetForm();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      await onEdit(editingTeacher.teacher_id, formData);
      setEditingTeacher(null);
      resetForm();
    } catch (err) {
      console.error(err);
    }
  };

  const processDelete = async () => {
    if (!confirmDeleteId) return;
    try {
      await onDelete(confirmDeleteId);
      setConfirmDeleteId(null);
    } catch (err) {
      console.error(err);
    }
  };

  const openEditModal = (teacher) => {
    setEditingTeacher(teacher);
    setFormData({
      username: '', password: '',
      teacher_name: teacher.teacher_name || '',
      phone: teacher.phone || '',
      email: teacher.email || '',
      specialization: teacher.specialization || '',
      qualifications: teacher.qualifications || ''
    });
  };

  const inputStyle = { width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ddd', boxSizing: 'border-box', marginBottom: '12px' };
  const labelStyle = { display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' };

  const renderForm = (isEdit) => (
    <form onSubmit={isEdit ? handleEdit : handleAdd}>
      {!isEdit && (
        <>
          <div>
            <label htmlFor="teacher-username" style={labelStyle}>පරිශීලක නාමය (Login Username)</label>
            <input id="teacher-username" type="text" value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} required style={inputStyle} placeholder="teacher01" />
          </div>
          <div>
            <label htmlFor="teacher-password" style={labelStyle}>මුරපදය</label>
            <input id="teacher-password" type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} required style={inputStyle} placeholder="••••••" />
          </div>
        </>
      )}
      <div>
        <label htmlFor="teacher-name" style={labelStyle}>ගුරුවරයාගේ නම</label>
        <input id="teacher-name" type="text" value={formData.teacher_name} onChange={(e) => setFormData({...formData, teacher_name: e.target.value})} required style={inputStyle} placeholder="Mr. Perera" />
      </div>
      <div>
        <label htmlFor="teacher-phone" style={labelStyle}>දුරකථන අංකය</label>
        <input id="teacher-phone" type="text" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} style={inputStyle} placeholder="0771234567" />
      </div>
      <div>
        <label htmlFor="teacher-email" style={labelStyle}>ඊමේල්</label>
        <input id="teacher-email" type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} style={inputStyle} placeholder="teacher@example.com" />
      </div>
      <div>
        <label htmlFor="teacher-spec" style={labelStyle}>විෂය / විශේෂත්වය</label>
        <input id="teacher-spec" type="text" value={formData.specialization} onChange={(e) => setFormData({...formData, specialization: e.target.value})} style={inputStyle} placeholder="Combined Mathematics" />
      </div>
      <div>
        <label htmlFor="teacher-qual" style={labelStyle}>සුදුසුකම්</label>
        <input id="teacher-qual" type="text" value={formData.qualifications} onChange={(e) => setFormData({...formData, qualifications: e.target.value})} style={inputStyle} placeholder="B.Sc, M.Sc" />
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
        <button type="button" onClick={() => { isEdit ? setEditingTeacher(null) : setShowAddModal(false); resetForm(); }} style={{ padding: '10px 20px', border: '1px solid #ccc', background: 'none', borderRadius: '6px', cursor: 'pointer' }}>අවලංගු කරන්න</button>
        <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#1a237e', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>💾 සුරකින්න</button>
      </div>
    </form>
  );

  return (
    <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ color: '#1a237e', margin: 0 }}>👨‍🏫 ගුරු ලේඛනය</h3>
        <button type="button" onClick={() => setShowAddModal(true)} style={{ padding: '10px 15px', backgroundColor: '#1a237e', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
          ➕ අලුත් ගුරුවරයෙක් එකතු කරන්න
        </button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <input type="text" placeholder="නමින්, ඊමේල්, හෝ විෂයෙන් සොයන්න..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ddd', boxSizing: 'border-box' }} />
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px' }}>
        <thead>
          <tr style={{ backgroundColor: '#f5f5f5', textAlign: 'left' }}>
            <th style={{ padding: '12px' }}>ID</th>
            <th style={{ padding: '12px' }}>නම</th>
            <th style={{ padding: '12px' }}>දුරකථන</th>
            <th style={{ padding: '12px' }}>ඊමේල්</th>
            <th style={{ padding: '12px' }}>විෂය</th>
            <th style={{ padding: '12px' }}>සුදුසුකම්</th>
            <th style={{ padding: '12px' }}>ක්‍රියාමාර්ග</th>
          </tr>
        </thead>
        <tbody>
          {filteredTeachers.length === 0 && (
            <tr><td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>ගුරුවරුන් හමුවුණේ නැත.</td></tr>
          )}
          {filteredTeachers.map((teacher, index) => (
            <tr key={teacher.teacher_id || index} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '12px', fontWeight: 'bold' }}>{teacher.teacher_id}</td>
              <td style={{ padding: '12px' }}>{teacher.teacher_name}</td>
              <td style={{ padding: '12px' }}>{teacher.phone || 'N/A'}</td>
              <td style={{ padding: '12px' }}>{teacher.email || 'N/A'}</td>
              <td style={{ padding: '12px' }}>{teacher.specialization || 'N/A'}</td>
              <td style={{ padding: '12px' }}>{teacher.qualifications || 'N/A'}</td>
              <td style={{ padding: '12px', display: 'flex', gap: '5px' }}>
                <button onClick={() => openEditModal(teacher)} style={{ padding: '5px 10px', backgroundColor: '#ffd600', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>සංස්කරණය</button>
                <button onClick={() => setConfirmDeleteId(teacher.teacher_id)} style={{ padding: '5px 10px', backgroundColor: '#ff1744', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>ඉවත් කරන්න</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Add Teacher Modal */}
      {showAddModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1200 }}>
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', width: '450px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 20px 0', color: '#1a237e', textAlign: 'center' }}>➕ අලුත් ගුරුවරයෙක් එකතු කිරීම</h3>
            {renderForm(false)}
          </div>
        </div>
      )}

      {/* Edit Teacher Modal */}
      {editingTeacher && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1200 }}>
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', width: '450px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 20px 0', color: '#1a237e', textAlign: 'center' }}>✏️ ගුරු දත්ත සංස්කරණය</h3>
            {renderForm(true)}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDeleteId && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1200 }}>
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', width: '400px', textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: '40px', color: '#d32f2f', marginBottom: '15px' }}>⚠️</div>
            <h3 style={{ margin: '0 0 10px 0', color: '#1a237e' }}>ගුරුවරයා ඉවත් කිරීම ස්ථිරද?</h3>
            <p style={{ color: '#666', fontSize: '14px', lineHeight: '1.5' }}>මෙම ක්‍රියාව ආපසු හැරවිය නොහැක.</p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '25px' }}>
              <button onClick={() => setConfirmDeleteId(null)} style={{ flex: 1, padding: '10px', border: '1px solid #ccc', background: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' }}>අවලංගු කරන්න</button>
              <button onClick={processDelete} style={{ flex: 1, padding: '10px', backgroundColor: '#d32f2f', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>ඔව්, ඉවත් කරන්න</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

TeacherTab.propTypes = {
  teachers: PropTypes.array.isRequired,
  onAdd: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default TeacherTab;
