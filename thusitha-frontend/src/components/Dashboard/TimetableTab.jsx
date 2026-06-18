import React from 'react';
import PropTypes from 'prop-types';

const TimetableTab = ({ schedules, role }) => {
  // No local state for schedule, it comes from props
  // No loading/error states here, handled by parent Dashboard component

  return (
    <div style={{ padding: '20px', animation: 'fadeIn 0.5s ease-in' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0, color: '#1a237e' }}>📅 මගේ කාලසටහන (My Timetable)</h2>
      </div>

      <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#1a237e', color: 'white', textAlign: 'left' }}>
                <th style={{ padding: '15px', borderBottom: '2px solid #3f51b5' }}>දිනය (Day)</th>
                <th style={{ padding: '15px', borderBottom: '2px solid #3f51b5' }}>වේලාව (Time)</th>
                <th style={{ padding: '15px', borderBottom: '2px solid #3f51b5' }}>විෂය සහ පන්තිය (Subject/Class)</th>
                <th style={{ padding: '15px', borderBottom: '2px solid #3f51b5' }}>ශාලාව (Hall)</th>
                <th style={{ padding: '15px', borderBottom: '2px solid #3f51b5' }}>දේශකයා (Lecturer)</th>
              </tr>
            </thead>
            <tbody>
              {schedules.length > 0 ? (
                schedules.map((item, index) => (
                  <tr key={item.schedule_id} style={{ backgroundColor: index % 2 === 0 ? '#f8f9fa' : 'white', borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '12px 15px', fontWeight: 'bold' }}>{item.day_of_week}</td>
                    <td style={{ padding: '12px 15px' }}>
                      <span style={{ backgroundColor: '#e8eaf6', padding: '4px 8px', borderRadius: '4px', fontSize: '14px' }}>
                        {item.start_time.slice(0, 5)} - {item.end_time.slice(0, 5)}
                      </span>
                    </td>
                    <td style={{ padding: '12px 15px' }}>
                      <div style={{ fontWeight: '600' }}>{item.course_name}</div>
                      <div style={{ fontSize: '12px', color: '#666' }}>{item.subject_name}</div>
                    </td>
                    <td style={{ padding: '12px 15px' }}>{item.hall_name}</td>
                    <td style={{ padding: '12px 15px' }}>{item.lecturer_name || 'අදාළ නොවේ'}</td>
                  </tr>
                ))
              ) : (
              <tr>
                <td colSpan="5" style={{ padding: '30px', textAlign: 'center', color: '#757575' }}>ඔබ සඳහා වෙන්වූ කාලසටහනක් හමුවුනේ නැත.</td>
              </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

TimetableTab.propTypes = {
  schedules: PropTypes.array.isRequired,
  role: PropTypes.string.isRequired,
};

export default TimetableTab;