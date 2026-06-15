import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../../context/NotificationContext';

const LoginPage = () => {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { showNotification } = useNotification();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      const data = await response.json();
      
      if (response.ok) {
        // The authController now sets an HttpOnly cookie, so we just save user info
        localStorage.setItem('user', JSON.stringify(data.user));
        showNotification('සාර්ථකව ඇතුළු විය!');
        navigate('/dashboard');
      } else {
        showNotification(data.message, 'error');
      }
    } catch (err) {
      console.error(err);
      showNotification('සම්බන්ධතාවයේ දෝෂයකි.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f2f5' }}>
      <div style={{ width: '100%', maxWidth: '400px', padding: '40px', backgroundColor: 'white', borderRadius: '15px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <img src="/Project%20LOGO.png" alt="Logo" style={{ width: '80px', marginBottom: '15px' }} />
          <h2 style={{ margin: 0, color: '#1a237e' }}>පද්ධතියට ඇතුළු වන්න</h2>
          <p style={{ color: '#666', fontSize: '14px' }}>Thusitha Smart Class Management</p>
        </div>
        
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '20px' }}>
            <label htmlFor="username" style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>පරිශීලක නාමය (Username)</label>
            <input 
              id="username"
              type="text" 
              required
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', boxSizing: 'border-box' }}
              value={credentials.username}
              onChange={(e) => setCredentials({...credentials, username: e.target.value})}
            />
          </div>
          <div style={{ marginBottom: '30px' }}>
            <label htmlFor="password" style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>මුරපදය (Password)</label>
            <input 
              id="password"
              type="password" 
              required
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', boxSizing: 'border-box' }}
              value={credentials.password}
              onChange={(e) => setCredentials({...credentials, password: e.target.value})}
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            style={{ width: '100%', padding: '14px', backgroundColor: '#1a237e', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }}
          >
            {loading ? 'පරීක්ෂා කරමින්...' : 'ඇතුළු වන්න'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;