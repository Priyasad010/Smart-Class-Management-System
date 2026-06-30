import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import './Login.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false); // 💡 සාර්ථක පණිවිඩය පාලනය කරන State එක
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotUsername, setForgotUsername] = useState('');
  const [forgotMessage, setForgotMessage] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [isSubmittingForgot, setIsSubmittingForgot] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await authService.login(username, password);
      
      // 💡 බ්‍රවුසර් Alert එක වෙනුවට අපේම සිස්ටම් එකේ Modal එක ඔන් කරනවා
      setShowSuccessModal(true);
      
      // 💡 තත්පර 2.5 කින් පසු ඉබේම Dashboard එකට රැගෙන යාම
      setTimeout(() => {
        setShowSuccessModal(false);
        navigate('/dashboard');
      }, 2500);
      
    } catch (err) {
      if (err.message.includes('Invalid')) {
        setError('❌ ඇතුළත් කළ Username හෝ Password වැරදියි!');
      } else if (err.message.includes('Network Error')) {
        setError('⚠️ පද්ධතිය සම්බන්ධ කිරීමේ දෝෂයකි. කරුණාකර පසුව නැවත උත්සාහ කරන්න.');
      } else {
        setError(err.message);
      }
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotError('');
    setForgotMessage('');
    setIsSubmittingForgot(true);
    
    try {
      const res = await authService.forgotPassword(forgotUsername);
      setForgotMessage(res.message || 'තාවකාලික මුරපදය WhatsApp ඔස්සේ යවන ලදී.');
    } catch (err) {
      setForgotError(err.message || 'පරිශීලකයා හමුවුනේ නැත.');
    } finally {
      setIsSubmittingForgot(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h2>Thusitha Institute</h2>
        </div>
        
        {error && (
          <div style={{ 
            color: '#d32f2f', 
            backgroundColor: '#ffebee', 
            padding: '10px', 
            borderRadius: '6px', 
            marginBottom: '15px', 
            fontWeight: '600',
            fontSize: '14px',
            border: '1px solid #ffcdd2'
          }}>
            {error}
          </div>
        )}
        
        {!showForgotModal ? (
          <form onSubmit={handleSubmit} className="login-form">
            <div className="input-group">
              <label htmlFor="username-input">Username</label>
              <input 
                id="username-input"
                type="text" 
                placeholder="Enter your username" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required 
              />
            </div>

            <div className="input-group">
              <label htmlFor="password-input">Password</label>
              <input 
                id="password-input"
                type="password" 
                placeholder="Enter your password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
            </div>

            <div style={{ textAlign: 'right', marginBottom: '15px' }}>
              <span 
                onClick={() => setShowForgotModal(true)}
                style={{ color: '#1976d2', cursor: 'pointer', fontSize: '14px', textDecoration: 'underline' }}
              >
                Forgot Password?
              </span>
            </div>

            <button type="submit" className="login-btn">Sign In</button>
          </form>
        ) : (
          <div className="forgot-password-form" style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#333', textAlign: 'center' }}>මුරපදය අමතකද?</h3>
            <p style={{ fontSize: '13px', color: '#666', marginBottom: '15px', textAlign: 'center' }}>
              ඔබගේ පරිශීලක නාමය (Username) ඇතුලත් කරන්න. ලියාපදිංචි අංකයට තාවකාලික මුරපදයක් WhatsApp හරහා යවනු ලැබේ.
            </p>

            {forgotError && <div style={{ color: '#d32f2f', backgroundColor: '#ffebee', padding: '8px', borderRadius: '4px', fontSize: '13px', marginBottom: '10px' }}>{forgotError}</div>}
            {forgotMessage && <div style={{ color: '#2e7d32', backgroundColor: '#e8f5e9', padding: '8px', borderRadius: '4px', fontSize: '13px', marginBottom: '10px' }}>{forgotMessage}</div>}

            <form onSubmit={handleForgotPassword} className="login-form">
              <div className="input-group">
                <input 
                  type="text" 
                  placeholder="Enter your username" 
                  value={forgotUsername}
                  onChange={(e) => setForgotUsername(e.target.value)}
                  required 
                />
              </div>
              
              <button 
                type="submit" 
                className="login-btn"
                disabled={isSubmittingForgot}
                style={{ marginBottom: '10px', opacity: isSubmittingForgot ? 0.7 : 1 }}
              >
                {isSubmittingForgot ? 'යවමින්...' : 'මුරපදය යවන්න'}
              </button>
              
              <div style={{ textAlign: 'center' }}>
                <span 
                  onClick={() => { setShowForgotModal(false); setForgotMessage(''); setForgotError(''); setForgotUsername(''); }}
                  style={{ color: '#666', cursor: 'pointer', fontSize: '14px', textDecoration: 'underline' }}
                >
                  Back to Login
                </span>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* 💡 මෙන්න ලෙක්චරර් කියපු විදිහට සිස්ටම් එක ඇතුළෙන්ම පෙනෙන ලස්සන පිළිගැනීමේ පණිවිඩය (Custom Modal) */}
      {showSuccessModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          zIndex: 1000,
          fontFamily: 'Segoe UI'
        }}>
          <div style={{
            backgroundColor: '#white',
            background: 'white',
            padding: '30px 40px',
            borderRadius: '12px',
            textAlign: 'center',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
            animation: 'fadeIn 0.3s ease-in-out'
          }}>
            <div style={{ fontSize: '50px', marginBottom: '10px' }}>🌟</div>
            <h2 style={{ color: '#2e7d32', margin: '0 0 10px 0' }}>ආයුබෝවන්!</h2>
            <p style={{ fontSize: '16px', color: '#333', margin: 0, fontWeight: '500' }}>
              තුසිත ආයතන වෙබ් අඩවියට සාදරයෙන් පිළිගනිමු.
            </p>
            <div style={{ marginTop: '15px', color: '#666', fontSize: '13px' }}>
              පද්ධතියට ඇතුල් වෙමින් පවතී, කරුණාකර රැඳී සිටින්න...
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Login;