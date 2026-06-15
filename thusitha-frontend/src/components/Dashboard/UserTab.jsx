import React from 'react';
import PropTypes from 'prop-types';

const UserTab = ({ users, onResetPassword }) => {
  return (
    <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
      <h3 style={{ color: '#1a237e', margin: '0 0 15px 0' }}>📚 පද්ධති පරිශීලකයින් සහ පන්ති දත්ත</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px' }}>
        <thead>
          <tr style={{ backgroundColor: '#f5f5f5', textAlign: 'left' }}>
            <th style={{ padding: '12px' }}>පරිශීලක නාමය (Username)</th>
            <th style={{ padding: '12px' }}>තනතුර (Role)</th>
            <th style={{ padding: '12px' }}>ක්‍රියාමාර්ග (Actions)</th>
          </tr>
        </thead>
        <tbody>
          {users.map((cls, index) => (
            <tr key={cls._id || index} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '12px', fontWeight: '600', color: '#333' }}>{cls.username}</td>
              <td style={{ padding: '12px' }}>
                <span style={{ 
                  backgroundColor: cls.role === 'Admin' ? '#e8eaf6' : '#e8f5e9', 
                  color: cls.role === 'Admin' ? '#1a237e' : '#2e7d32', 
                  padding: '4px 10px', borderRadius: '4px', fontSize: '13px', fontWeight: 'bold' 
                }}>{cls.role}</span>
              </td>
              <td style={{ padding: '12px' }}>
                <button 
                  onClick={() => onResetPassword(cls._id)}
                  style={{ background: '#f44336', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                >
                  Reset Pass
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

UserTab.propTypes = {
  users: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string,
      username: PropTypes.string.isRequired,
      role: PropTypes.string.isRequired,
    })
  ).isRequired,
  onResetPassword: PropTypes.func.isRequired,
};

export default UserTab;