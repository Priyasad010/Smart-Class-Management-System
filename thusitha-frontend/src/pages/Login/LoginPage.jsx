import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../../context/NotificationContext';
import { FaEye, FaEyeSlash } from 'react-icons/fa'; // Import eye icons
import { authService } from '../../services/authService';

const LoginPage = () => {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { showNotification } = useNotification();
  const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility
  const [isHovered, setIsHovered] = useState(false);

  // Palette Colors
  const PRIMARY_NAVY = '#070D59'; // Corrected: Removed duplicate declaration
  const SECONDARY_BLUE = '#1F3C88';
  // LIGHT_ACCENT_BLUE and BACKGROUND_BLUE are not used in this component, so they are removed.

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!credentials.username || !credentials.password) {
      showNotification('කරුණාකර හිස්ව ඇති තොරතුරු පුරවන්න.', 'error');
      return;
    }

    setLoading(true);
    try {
      const data = await authService.login(credentials.username, credentials.password);
      console.log('Login successful, received data:', data);
      showNotification('සාර්ථකව ඇතුළු විය!');
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      // use error message from API if available
      showNotification(err.message || 'සම්බන්ධතාවයේ දෝෂයකි.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Extract nested ternary logic for background color (SonarQube S3358)
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
          <h2 style={{ margin: 0, color: PRIMARY_NAVY }}>පද්ධතියට ඇතුළු වන්න</h2>
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
              onKeyDown={(e) => { // Changed from onKeyPress to onKeyDown
                if (e.key === 'Enter') {
                  e.preventDefault(); // Prevent form submission
                  document.getElementById('password').focus(); // Move focus to password field
                }
              }}
            />
          </div>
          <div style={{ marginBottom: '30px' }}>
            <label htmlFor="password" style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>මුරපදය (Password)</label>
            <div style={{ position: 'relative' }}>
              <input 
                id="password"
                type={showPassword ? 'text' : 'password'} // Toggle type based on state
                required
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', boxSizing: 'border-box', paddingRight: '40px' }} // Add padding for the icon
                value={credentials.password}
                onChange={(e) => setCredentials({...credentials, password: e.target.value})}
              />
              <button
                type="button" // Important: Prevent form submission
                onClick={() => setShowPassword(prev => !prev)}
                style={{
                  position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: '#666', fontSize: '18px'
                }}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <FaEye /> : <FaEyeSlash />} {/* Swapped: Slashed eye shows when hidden */}
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
      </div>
    </div>
  );
};

export default LoginPage;