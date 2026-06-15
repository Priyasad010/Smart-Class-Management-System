import React from 'react';
import PropTypes from 'prop-types';

const Sidebar = ({ activeTab, setActiveTab, onLogout, role }) => {
  const getButtonStyle = (tabName) => ({
    width: '100%',
    padding: '12px 15px',
    cursor: 'pointer',
    borderRadius: '6px',
    backgroundColor: activeTab === tabName ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
    color: 'white',
    border: 'none',
    textAlign: 'left',
    marginBottom: '8px',
    fontWeight: activeTab === tabName ? '700' : '500',
    fontSize: '15px',
    transition: 'all 0.2s ease-in-out',
    borderLeft: activeTab === tabName ? '4px solid #ffd600' : '4px solid transparent',
    paddingLeft: activeTab === tabName ? '20px' : '15px',
  });

  const isAdmin = role === 'Admin';
  const isCounterPerson = role === 'Counter Person';
  const isTeacher = role === 'Teacher';
  const isStudent = role === 'Student';

  return (
    <div style={{ width: '260px', backgroundColor: '#1a237e', color: 'white', display: 'flex', flexDirection: 'column', padding: '20px', justifyContent: 'space-between', boxSizing: 'border-box' }}>
      <div>
        <div style={{ textAlign: 'center', marginBottom: '30px', borderBottom: '1px solid #3f51b5', paddingBottom: '20px' }}>
          <img src="/Project%20LOGO.png" alt="Thusitha Logo" style={{ width: '80px', height: '80px', borderRadius: '50%', marginBottom: '10px', backgroundColor: 'white', padding: '5px' }} />
          <h2 style={{ margin: 0, fontSize: '18px' }}>Thusitha Smart Class</h2>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column' }}>
          <button type="button" onClick={() => setActiveTab('home')} style={getButtonStyle('home')}>🏠 මුල් පිටුව (Home)</button>
          
          {(isAdmin || isCounterPerson || isTeacher) && (
            <button type="button" onClick={() => setActiveTab('students')} style={getButtonStyle('students')}>🧑‍🎓 ශිෂ්‍ය ලේඛනය (Registry)</button>
          )}
          
          {isCounterPerson && (
            <button type="button" onClick={() => setActiveTab('approvals')} style={getButtonStyle('approvals')}>⏳ ශිෂ්‍ය අනුමැතිය (Approvals)</button>
          )}

          {isAdmin && (
            <>
              <button type="button" onClick={() => setActiveTab('lecturers')} style={getButtonStyle('lecturers')}>👨‍🏫 දේශකයන් කළමනාකරණය</button>
              <button type="button" onClick={() => setActiveTab('classes')} style={getButtonStyle('classes')}>📚 පන්ති සහ පරිශීලකයින්</button>
              <button type="button" onClick={() => setActiveTab('hall_reports')} style={getButtonStyle('hall_reports')}>🏢 ශාලා වාර්තා</button>
              <button type="button" onClick={() => setActiveTab('camera_config')} style={getButtonStyle('camera_config')}>📷 කැමරා සැකසුම්</button>
              <button type="button" onClick={() => setActiveTab('promos')} style={getButtonStyle('promos')}>📢 වෙබ් අඩවි ප්‍රවර්ධන</button>
              <button type="button" onClick={() => setActiveTab('teacher_performance')} style={getButtonStyle('teacher_performance')}>📊 ගුරු කාර්ය සාධනය</button>
              <button type="button" onClick={() => setActiveTab('suspicious_logs')} style={getButtonStyle('suspicious_logs')}>🛡️ සැක සහිත පැමිණීම්</button>
              <button type="button" onClick={() => setActiveTab('system_health')} style={getButtonStyle('system_health')}>🏥 පද්ධති තත්ත්වය (Health)</button>
              <button type="button" onClick={() => setActiveTab('settings')} style={getButtonStyle('settings')}>⚙️ පද්ධති සැකසුම්</button>
            </>
          )}

          {(isTeacher || isStudent) && (
            <button type="button" onClick={() => setActiveTab('my_timetable')} style={getButtonStyle('my_timetable')}>📅 මගේ කාලසටහන</button>
          )}
          
          {(isAdmin || isCounterPerson) && (
            <button type="button" onClick={() => setActiveTab('enrollment')} style={getButtonStyle('enrollment')}>🔗 ලියාපදිංචිය (Enrollment)</button>
          )}
          <button type="button" onClick={() => setActiveTab('study_area')} style={getButtonStyle('study_area')}>📖 අධ්‍යයන අංශය (Study Area)</button>
          
          {isAdmin && (
            <button type="button" onClick={() => setActiveTab('payments')} style={getButtonStyle('payments')}>💰 ගෙවීම් (Payments)</button>
          )}
          
          {(isAdmin || isTeacher || isStudent) && (
            <button type="button" onClick={() => setActiveTab('exams')} style={getButtonStyle('exams')}>📝 විභාග සහ ලකුණු (Exams)</button>
          )}
          
          {isAdmin && (
            <>
              <button type="button" onClick={() => setActiveTab('inquiries')} style={getButtonStyle('inquiries')}>✉️ වෙබ් අඩවි විමසීම්</button>
              <button type="button" onClick={() => setActiveTab('sms_logs')} style={getButtonStyle('sms_logs')}>📱 SMS වාර්තා</button>
            </>
          )}
          {isAdmin && (
            <button type="button" onClick={() => setActiveTab('audit_logs')} style={getButtonStyle('audit_logs')}>📋 විගණන වාර්තා</button>
          )}
          
          <button type="button" onClick={() => setActiveTab('materials')} style={getButtonStyle('materials')}>📁 ඉගෙනුම් ද්‍රව්‍ය</button>
          
          {(isAdmin || isTeacher) && (
            <>
              <button type="button" onClick={() => setActiveTab('attendance')} style={getButtonStyle('attendance')}>📝 පැමිණීම සටහන් කිරීම</button>
              <button type="button" onClick={() => setActiveTab('ai_validation')} style={getButtonStyle('ai_validation')}>🛡️ AI පැමිණීම පරීක්ෂාව</button>
            </>
          )}
        </nav>
      </div>
      <button 
        type="button" 
        onClick={onLogout} 
        style={{ width: '100%', padding: '12px', backgroundColor: '#d32f2f', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
      >
        🚪 පද්ධතියෙන් ඉවත් වන්න
      </button>
    </div>
  );
};

Sidebar.propTypes = {
  activeTab: PropTypes.string.isRequired,
  setActiveTab: PropTypes.func.isRequired,
  onLogout: PropTypes.func.isRequired,
  role: PropTypes.string,
};

export default Sidebar;