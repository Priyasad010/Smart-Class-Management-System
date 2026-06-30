import React from 'react';
import PropTypes from 'prop-types';

const TeacherClassesTab = ({ courses, lecturers, currentUser, classSchedules }) => {
  const teacherProfile = lecturers.find(l => l.user_id === currentUser.id);
  const myCourses = teacherProfile 
    ? courses.filter(c => c.teacher_id === teacherProfile.teacher_id)
    : [];

  return (
    <div style={{ padding: '20px', animation: 'fadeIn 0.5s ease-in' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0, color: '#1a237e' }}>🎓 මගේ පන්ති (My Classes)</h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {myCourses.length > 0 ? (
          myCourses.map((course) => {
            const courseSchedules = classSchedules.filter(s => s.course_id === course.course_id);
            return (
              <div 
                key={course.course_id} 
                style={{ 
                  backgroundColor: 'white', 
                  borderRadius: '10px', 
                  padding: '20px', 
                  boxShadow: '0 4px 6px rgba(0,0,0,0.05)', 
                  borderTop: '5px solid #1a237e' 
                }}
              >
                <h3 style={{ color: '#1a237e', marginTop: 0, marginBottom: '10px' }}>{course.course_name}</h3>
                <p style={{ margin: '5px 0', fontSize: '14px', color: '#666' }}>
                  <strong>මාසික ගාස්තුව:</strong> LKR {course.monthly_fee}
                </p>
                <div style={{ marginTop: '15px' }}>
                  <strong style={{ fontSize: '13px', color: '#333' }}>🗓️ පන්ති වේලාවන්:</strong>
                  {courseSchedules.length > 0 ? (
                    <ul style={{ paddingLeft: '20px', margin: '5px 0', fontSize: '13px', color: '#555' }}>
                      {courseSchedules.map(s => (
                        <li key={s.schedule_id}>
                          {s.day_of_week}: {s.start_time.slice(0, 5)} - {s.end_time.slice(0, 5)} ({s.hall_name})
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p style={{ margin: '5px 0', fontSize: '13px', color: '#999', fontStyle: 'italic' }}>කාලසටහනක් ඇතුළත් කර නැත.</p>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div style={{ gridColumn: '1 / -1', backgroundColor: 'white', padding: '30px', borderRadius: '8px', textAlign: 'center', color: '#757575' }}>
            ඔබ උගන්වන කිසිදු පන්තියක් පද්ධතිය තුළ ලියාපදිංචි වී නොමැත.
          </div>
        )}
      </div>
    </div>
  );
};

TeacherClassesTab.propTypes = {
  courses: PropTypes.array.isRequired,
  lecturers: PropTypes.array.isRequired,
  currentUser: PropTypes.object.isRequired,
  classSchedules: PropTypes.array.isRequired,
};

export default TeacherClassesTab;
