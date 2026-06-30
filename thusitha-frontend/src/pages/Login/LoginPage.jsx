import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../../context/NotificationContext';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { authService } from '../../services/authService';
import { request } from '../../services/api';

const LoginPage = () => {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { showNotification } = useNotification();
  const [showPassword, setShowPassword] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [role, setRole] = useState('Student');

  // First-time password change state
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  const PRIMARY_NAVY = '#070D59';
  const SECONDARY_BLUE = '#1F3C88';

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!credentials.username || !credentials.password) {
      showNotification('කරුණාකර හිස්ව ඇති තොරතුරු පුරවන්න.', 'error');
      return;
    }

    setLoading(true);
    try {
      const data = await authService.login(credentials.username, credentials.password);
      
      if (data.must_change_password) {
        setShowPasswordChange(true);
        showNotification('ඔබ ප්‍රථම වරට Login වෙයි. කරුණාකර නව මුරපදයක් සකසන්න.');
      } else {
        showNotification('සාර්ථකව ඇතුළු විය!');
        navigate('/dashboard');
      }
    } catch (err) {
      console.error(err);
      showNotification(err.message || 'සම්බන්ධතාවයේ දෝෂයකි.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      showNotification('මුරපදය අවම වශයෙන් අකුරු 6ක් විය යුතුයි.', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showNotification('මුරපද දෙක සමාන නොවේ.', 'error');
      return;
    }

    setChangingPassword(true);
    try {
      await request('/auth/change-password', {
        method: 'POST',
        body: { newPassword }
      });
      showNotification('මුරපදය සාර්ථකව වෙනස් කළා! Dashboard එකට යොමු වෙයි...');
      setShowPasswordChange(false);
      navigate('/dashboard');
    } catch (err) {
      showNotification(err.message || 'මුරපදය වෙනස් කිරීමේ දෝෂයකි.', 'error');
    } finally {
      setChangingPassword(false);
    }
  };

  let buttonBgColor;
  if (loading) {
    buttonBgColor = '#ccc';
  } else if (isHovered) {
    buttonBgColor = '#1F3C88';
  } else {
    buttonBgColor = PRIMARY_NAVY;
  }

  return (
    <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f2f5' }}>
      {/* Navigation Path (Breadcrumbs) */}
      <div style={{ position: 'absolute', top: '20px', left: '5%', fontSize: '14px', color: '#666', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button
          type="button"
          onClick={() => navigate('/')}
          style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: SECONDARY_BLUE, fontWeight: '500', fontFamily: 'inherit', fontSize: 'inherit' }}
          aria-label="Go to Home Page"
        >
          මුල් පිටුව
        </button>
        <span>&gt;</span>
        <span style={{ color: PRIMARY_NAVY, fontWeight: 'bold' }}>Login</span>
      </div>

      <div style={{ width: '100%', maxWidth: '400px', padding: '40px', backgroundColor: 'white', borderRadius: '15px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <img src="/Project%20LOGO.png" alt="Logo" style={{ width: '80px', marginBottom: '15px' }} />
          <h2 style={{ margin: 0, color: PRIMARY_NAVY }}>
            {showPasswordChange ? 'නව මුරපදයක් සකසන්න' : 'පද්ධතියට ඇතුළු වන්න'}
          </h2>
          <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px' }}>
            {showPasswordChange ? 'ඔබගේ ආරක්ෂාව සඳහා පළමු වරට Login වන විට නව මුරපදයක් සකසන්න.' : 'Thusitha Smart Class Management'}
          </p>
        </div>

        {!showPasswordChange && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1px solid #eee', gap: '4px' }}>
            {['Student', 'Teacher', 'Counter Person', 'Admin'].map((roleType) => (
              <button
                key={roleType}
                type="button"
                onClick={() => setRole(roleType)}
                style={{
                  flex: 1,
                  padding: '10px 2px',
                  background: 'none',
                  border: 'none',
                  borderBottom: role === roleType ? `3px solid ${PRIMARY_NAVY}` : '3px solid transparent',
                  color: role === roleType ? PRIMARY_NAVY : '#666',
                  fontWeight: role === roleType ? 'bold' : 'normal',
                  cursor: 'pointer',
                  fontSize: '13px'
                }}
              >
                {roleType === 'Student' ? 'ශිෂ්‍ය' : roleType === 'Teacher' ? 'ගුරු' : roleType === 'Counter Person' ? 'කවුන්ටර' : 'පරිපාලක'}
              </button>
            ))}
          </div>
        )}

        {!showPasswordChange ? (
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '20px' }}>
              <label htmlFor="username" style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                {role === 'Student' ? 'ශිෂ්‍ය පරිශීලක නාමය (Student Username)' : 
                 role === 'Teacher' ? 'ගුරු පරිශීලක නාමය (Teacher Username)' : 
                 role === 'Counter Person' ? 'කවුන්ටර පරිශීලක නාමය (Counter Username)' : 
                 'පරිපාලක පරිශීලක නාමය (Admin Username)'}
              </label>
              <input 
                id="username"
                type="text" 
                required
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', boxSizing: 'border-box' }}
                value={credentials.username}
                onChange={(e) => setCredentials({...credentials, username: e.target.value})}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    document.getElementById('password').focus();
                  }
                }}
              />
            </div>
            <div style={{ marginBottom: '30px' }}>
              <label htmlFor="password" style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>මුරපදය (Password)</label>
              <div style={{ position: 'relative' }}>
                <input 
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', boxSizing: 'border-box', paddingRight: '40px' }}
                  value={credentials.password}
                  onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(prev => !prev)}
                  style={{
                    position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', color: '#666', fontSize: '18px'
                  }}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <FaEye /> : <FaEyeSlash />}
                </button>
              </div>
            </div>
            <button 
              type="submit" 
              disabled={loading}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              style={{ 
                width: '100%', 
                padding: '14px', 
                backgroundColor: buttonBgColor, 
                color: 'white', 
                border: 'none', 
                borderRadius: '8px', 
                cursor: loading ? 'not-allowed' : 'pointer', 
                fontWeight: 'bold', 
                fontSize: '16px',
                transition: 'all 0.3s ease',
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? 'පරීක්ෂා කරමින්...' : 'ඇතුළු වන්න'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleChangePassword}>
            <div style={{ marginBottom: '20px' }}>
              <label htmlFor="newPassword" style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>නව මුරපදය</label>
              <input 
                id="newPassword"
                type="password" 
                required
                minLength={6}
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', boxSizing: 'border-box' }}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="අවම අකුරු 6ක්"
              />
            </div>
            <div style={{ marginBottom: '30px' }}>
              <label htmlFor="confirmPassword" style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>මුරපදය තහවුරු කරන්න</label>
              <input 
                id="confirmPassword"
                type="password" 
                required
                minLength={6}
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', boxSizing: 'border-box' }}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="නැවත ඇතුළත් කරන්න"
              />
            </div>
            <button 
              type="submit" 
              disabled={changingPassword}
              style={{ 
                width: '100%', 
                padding: '14px', 
                backgroundColor: changingPassword ? '#ccc' : '#2e7d32',
                color: 'white', 
                border: 'none', 
                borderRadius: '8px', 
                cursor: changingPassword ? 'not-allowed' : 'pointer', 
                fontWeight: 'bold', 
                fontSize: '16px',
                transition: 'all 0.3s ease'
              }}
            >
              {changingPassword ? 'සුරකිමින්...' : '🔐 මුරපදය සුරකින්න'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
