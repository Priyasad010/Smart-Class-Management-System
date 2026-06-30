import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { request } from '../../services/api';

const CoursesPage = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Colors from our professional palette
  const PRIMARY_NAVY = '#070D59';
  const SECONDARY_BLUE = '#1F3C88';
  const LIGHT_ACCENT_BLUE = '#5893D4';
  const [isBackHovered, setIsBackHovered] = useState(false); // Hover state for back button

  useEffect(() => {
    // Ensure full screen width
    const root = document.getElementById('root');
    if (root) {
      root.style.maxWidth = 'none';
      root.style.padding = '0';
      root.style.margin = '0';
      root.style.width = '100%';
    }

    request('/courses/public') // Use request helper for public route
      .then(data => { // request helper handles response.ok and JSON parsing
        setCourses(data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching courses:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div style={{ fontFamily: "'Noto Sans Sinhala', sans-serif", minHeight: '100vh', backgroundColor: '#f5f7fa' }}>
      {/* Simple Header */}
      <header style={{ backgroundColor: 'white', padding: '20px 5%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', position: 'sticky', top: 0, zIndex: 100 }}>
        <button
          type="button"
          style={{
            display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer',
            background: 'none', border: 'none', padding: 0, fontFamily: 'inherit',
            color: 'inherit' // Ensure text color is inherited
          }}
          onClick={() => navigate('/')}
        >
          <img src="/Project%20LOGO.png" alt="Logo" style={{ width: '40px' }} />
          <h2 style={{ margin: 0, color: PRIMARY_NAVY, fontSize: '20px' }}>Thusitha Smart Academy</h2>
        </button>
        <button 
          onClick={() => navigate('/')} 
          onMouseEnter={() => setIsBackHovered(true)}
          onMouseLeave={() => setIsBackHovered(false)}
          style={{ 
            background: isBackHovered ? PRIMARY_NAVY : 'none', 
            border: `1px solid ${PRIMARY_NAVY}`, 
            padding: '8px 20px', 
            borderRadius: '5px', 
            cursor: 'pointer', 
            fontWeight: 'bold', 
            color: isBackHovered ? 'white' : PRIMARY_NAVY, transition: 'all 0.3s ease' }}
        >
          ආපසු (Back)
        </button>
      </header>

      <main style={{ padding: '60px 5%' }}>
        {/* Navigation Path (Breadcrumbs) */}
        <div style={{ marginBottom: '20px', fontSize: '14px', color: '#666', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            onClick={() => navigate('/')}
            style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: SECONDARY_BLUE, fontWeight: '500', fontFamily: 'inherit', fontSize: 'inherit' }}
            aria-label="Go to Home Page"
          >
            මුල් පිටුව
          </button>
          <span>&gt;</span>
          <span style={{ color: PRIMARY_NAVY, fontWeight: 'bold' }}>අපගේ පාඨමාලා</span>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '50px' }}>
          <h1 style={{ color: PRIMARY_NAVY, fontSize: '36px', marginBottom: '15px' }}>අපගේ පාඨමාලා සහ කාලසටහන්</h1>
          <p style={{ color: '#666' }}>ඔබට ගැලපෙන විෂය සහ වේලාව තෝරාගන්න. ලියාපදිංචි වීමට පන්තිය මත ක්ලික් කරන්න.</p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px' }}>පූරණය වෙමින්...</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '30px' }}>
            {courses.length > 0 ? courses.map(course => (
              <div 
                key={course.course_id}
                style={{ 
                  backgroundColor: 'white', 
                  borderRadius: '15px', 
                  overflow: 'hidden', 
                  boxShadow: '0 10px 20px rgba(0,0,0,0.05)',
                  transition: 'transform 0.3s ease',
                  border: '1px solid #eee',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <div style={{ backgroundColor: PRIMARY_NAVY, padding: '20px', color: 'white' }}>
                  <h3 style={{ margin: 0, fontSize: '20px' }}>{course.course_name}</h3>
                  <div style={{ fontSize: '13px', opacity: 0.8, marginTop: '5px' }}>{course.subject_name}</div>
                </div>
                
                <div style={{ padding: '25px', flexGrow: 1 }}>
                  <div style={{ marginBottom: '15px' }}>
                    <small style={{ color: '#888', fontWeight: 'bold', display: 'block' }}>දේශකයා (Teacher)</small>
                    <div style={{ color: SECONDARY_BLUE, fontSize: '18px', fontWeight: 'bold' }}>{course.lecturer_name || 'විස්තර ලබා ගත නොහැක'}</div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', paddingTop: '15px', borderTop: '1px solid #eee' }}>
                    <div>
                      <small style={{ color: '#888', fontWeight: 'bold', display: 'block' }}>මාසික ගාස්තුව</small>
                      <div style={{ color: '#2e7d32', fontSize: '20px', fontWeight: '800' }}>Rs. {course.monthly_fee}</div>
                    </div>
                    <button 
                      onClick={() => navigate('/', { state: { openRegister: true, courseId: course.course_id } })}
                      style={{ backgroundColor: LIGHT_ACCENT_BLUE, color: 'white', border: 'none', padding: '10px 20px', borderRadius: '50px', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                      ලියාපදිංචි වන්න
                    </button>
                  </div>
                </div>
              </div>
            )) : (
              <div style={{ textAlign: 'center', gridColumn: '1 / -1' }}>පන්ති දත්ත සොයාගත නොහැක.</div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default CoursesPage;