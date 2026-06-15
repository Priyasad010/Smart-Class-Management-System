import React, { useState } from 'react';
import PropTypes from 'prop-types';
const StudentTab = ({ students, onAddClick, onEditClick, onDeleteClick, onEncode, onDownloadIDCard }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.studentId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const processDelete = async () => {
    if (!confirmDeleteId) return;
    try {
      await onDeleteClick(confirmDeleteId);
      setConfirmDeleteId(null);
    } catch (err) {
      console.error('Error deleting student:', err);
    }
  };

  return (
    <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ color: '#1a237e', margin: 0 }}>🧑‍🎓 සැබෑ ශිෂ්‍ය ලේඛනය</h3>
        <button 
          type="button" 
          onClick={onAddClick} 
          style={{ padding: '10px 15px', backgroundColor: '#1a237e', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          ➕ අලුත් ශිෂ්‍යයෙක් එකතු කරන්න
        </button>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <input 
          type="text" 
          placeholder="නමින් හෝ ශිෂ්‍ය අංකයෙන් සොයන්න..." 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ddd', boxSizing: 'border-box' }}
        />
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px' }}>
        <thead>
          <tr style={{ backgroundColor: '#f5f5f5', textAlign: 'left' }}>
            <th style={{ padding: '12px' }}>Student ID</th>
            <th style={{ padding: '12px' }}>නම</th>
            <th style={{ padding: '12px' }}>ඊමේල් / පාසල</th>
            <th style={{ padding: '12px', textAlign: 'center' }}>AI Biometrics</th>
            <th style={{ padding: '12px' }}>මව්පියන්ගේ නම</th>
            <th style={{ padding: '12px' }}>ක්‍රියාමාර්ග</th>
          </tr>
        </thead>
        <tbody>
          {filteredStudents.length === 0 && <tr><td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>ශිෂ්‍යයන් හමුවුණේ නැත.</td></tr>}
          {filteredStudents.map((student, index) => (
            <tr key={student._id || index} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '12px', fontWeight: 'bold' }}>{student.studentId}</td>
              <td style={{ padding: '12px' }}>{student.name}</td>
              <td style={{ padding: '12px' }}>{student.email}</td>
              <td style={{ padding: '12px', textAlign: 'center' }}>
                <span title={student.hasEncoding ? "Face Encoded" : "No Biometric Data"} style={{ fontSize: '18px' }}>
                  {student.hasEncoding ? '🛡️' : '🔘'}
                </span>
              </td>
              <td style={{ padding: '12px' }}>{student.parentName}</td>
              <td style={{ padding: '12px', display: 'flex', gap: '5px' }}>
                <button 
                  onClick={() => onEditClick(student)}
                  style={{ padding: '5px 10px', backgroundColor: '#ffd600', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
                >
                  සංස්කරණය
                </button>
                {!student.hasEncoding && (
                  <button 
                    onClick={() => onEncode(student._id)}
                    style={{ padding: '5px 10px', backgroundColor: '#455a64', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
                  >AI Encode</button>
                )}
                <button 
                  onClick={() => onDownloadIDCard(student)}
                  style={{ padding: '5px 10px', backgroundColor: '#1a237e', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
                >🆔 ID Card</button>
                <button 
                  onClick={() => setConfirmDeleteId(student._id)}
                  style={{ padding: '5px 10px', backgroundColor: '#ff1744', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
                >
                  ඉවත් කරන්න
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Custom Confirmation Modal */}
      {confirmDeleteId && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1200 }}>
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', width: '400px', textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: '40px', color: '#d32f2f', marginBottom: '15px' }}>⚠️</div>
            <h3 style={{ margin: '0 0 10px 0', color: '#1a237e' }}>ශිෂ්‍යයා ඉවත් කිරීම ස්ථිරද?</h3>
            <p style={{ color: '#666', fontSize: '14px', lineHeight: '1.5' }}>
              මෙම ක්‍රියාව ආපසු හැරවිය නොහැක. මෙම ශිෂ්‍යයාට අදාළ පැමිණීමේ වාර්තා සහ ගෙවීම් දත්ත ද මෙහිදී මැකී යනු ඇත.
            </p>
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

StudentTab.propTypes = {
  students: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      studentId: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      email: PropTypes.string,
      parentName: PropTypes.string,
    })
  ).isRequired,
  onAddClick: PropTypes.func.isRequired,
  onEditClick: PropTypes.func.isRequired,
  onDeleteClick: PropTypes.func.isRequired,
  onEncode: PropTypes.func.isRequired,
  onDownloadIDCard: PropTypes.func.isRequired,
};

export default StudentTab;