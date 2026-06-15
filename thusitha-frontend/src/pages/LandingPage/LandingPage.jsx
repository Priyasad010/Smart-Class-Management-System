import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../../context/NotificationContext';

const LandingPage = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = React.useState([]);
  const { showNotification } = useNotification();
  const [formData, setFormData] = useState({
    student_name: '',
    school: '',
    grade: '',
    parent_phone: '',
    email: '',
    course_id: ''
  });

  // Fetch courses for the dropdown
  React.useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/courses/public`)
      .then(res => res.json())
      .then(data => setCourses(data || []))
      .catch(err => console.error("Error fetching courses:", err));
  }, []);

  const handlePreRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/students/register-public`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (response.ok) {
        showNotification('ලියාපදිංචිය සාර්ථකයි! කරුණාකර අනුමැතිය සඳහා කාර්යාලයට පැමිණෙන්න.');
        setFormData({ student_name: '', school: '', grade: '', parent_phone: '', email: '', course_id: '' });
      } else {
        showNotification(data.error, 'error');
      }
    } catch {
      showNotification('පද්ධති දෝෂයකි. පසුව උත්සාහ කරන්න.', 'error');
    }
  };

  return (
    <div style={{ fontFamily: "'Noto Sans Sinhala', 'Segoe UI', Tahoma, sans-serif", color: '#333', backgroundColor: '#ffffff', minHeight: '100vh' }}>
      {/* Navigation Bar */}
      <nav style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        padding: '15px 5%',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
        position: 'sticky', 
        top: 0, 
        zIndex: 1000,
        flexWrap: 'wrap',
        gap: '15px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src="/Project%20LOGO.png" alt="Thusitha Logo" style={{ width: 'clamp(35px, 5vw, 45px)', height: 'auto', objectFit: 'contain' }} />
          <h2 style={{ margin: 0, color: '#1a237e', letterSpacing: '-0.02em', fontSize: 'clamp(18px, 4vw, 24px)' }}>Thusitha Smart Class</h2>
        </div>
        <div style={{ display: 'flex', gap: 'clamp(15px, 3vw, 30px)', alignItems: 'center', flexWrap: 'wrap' }}>
          <a href="#classes" style={{ textDecoration: 'none', color: '#555', fontWeight: '600', fontSize: '14px' }}>පාඨමාලා</a>
          <a href="#teachers" style={{ textDecoration: 'none', color: '#555', fontWeight: '600', fontSize: '14px' }}>දේශකයන්</a>
          <button 
            onClick={() => navigate('/login')}
            style={{ padding: '8px 20px', backgroundColor: '#1a237e', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}
          >
            පද්ධතියට ඇතුළු වන්න (Login)
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <header style={{ padding: '120px 50px', background: 'linear-gradient(180deg, #f8f9fa 0%, #ffffff 100%)', textAlign: 'center' }}>
        <h1 style={{ fontSize: '54px', color: '#1a237e', marginBottom: '24px', lineHeight: '1.2', fontWeight: '800' }}>හෙට දවස දිනන දරුවෙකු වෙනුවෙන්...</h1>
        <p style={{ fontSize: '20px', color: '#666', maxWidth: '800px', margin: '0 auto 40px' }}>Thusitha Smart Class සමඟින් ඔබේ අධ්‍යාපන සිහින සැබෑ කරගන්න. දැන් ඔබට නිවසේ සිටම ලියාපදිංචි විය හැක.</p>
        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
          <a href="#classes" style={{ padding: '18px 45px', backgroundColor: '#ffd600', color: '#1a237e', textDecoration: 'none', borderRadius: '50px', fontWeight: 'bold', fontSize: '18px', boxShadow: '0 10px 15px -3px rgba(255, 214, 0, 0.3)' }}>පාඨමාලා ගවේෂණය කරන්න</a>
          <a href="#register" style={{ padding: '18px 45px', backgroundColor: '#2e7d32', color: 'white', textDecoration: 'none', borderRadius: '50px', fontWeight: 'bold', fontSize: '18px', boxShadow: '0 10px 15px -3px rgba(46, 125, 50, 0.3)' }}>දැන්ම ලියාපදිංචි වන්න</a>
        </div>
      </header>

      {/* Smart Features Showcase */}
      <section style={{ padding: '100px 60px', textAlign: 'center' }}>
        <h2 style={{ color: '#1a237e', fontSize: '36px', marginBottom: '60px', fontWeight: '700' }}>Thusitha Smart Technology</h2>
        <div style={{ display: 'flex', gap: '30px', justifyContent: 'center' }}>
          {[
            { icon: '📱', title: 'QR පැමිණීමේ පද්ධතිය', desc: 'පන්තියට ඇතුළු වූ වහාම දෙමාපියන්ට SMS මගින් තොරතුරු ලැබෙන සුරක්ෂිත පද්ධතිය.' },
            { icon: '🧠', title: 'AI Headcount', desc: 'පන්තියේ සිටින ශිෂ්‍ය සංඛ්‍යාව කැමරා පද්ධතිය හරහා ස්වයංක්‍රීයව පරීක්ෂා කිරීමේ හැකියාව.' },
            { icon: '💻', title: 'LMS (Moodle)', desc: 'ඉගෙනුම් ද්‍රව්‍ය සහ වීඩියෝ පාඩම් ඕනෑම වේලාවක ලබාගත හැකි ඒකාබද්ධ LMS පද්ධතිය.' }
          ].map((f) => (
            <div key={f.title} style={{ flex: 1, padding: '40px 30px', backgroundColor: 'white', borderRadius: '20px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.05)', transition: 'transform 0.3s' }}>
              <div style={{ fontSize: '50px', marginBottom: '20px' }}>{f.icon}</div>
              <h4 style={{ color: '#1a237e', marginBottom: '12px', fontSize: '20px' }}>{f.title}</h4>
              <p style={{ color: '#718096', fontSize: '15px', lineHeight: '1.6' }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Course Categories */}
      <section id="classes" style={{ padding: '80px 60px', backgroundColor: '#f5f7fa' }}>
        <h2 style={{ color: '#1a237e', fontSize: '32px', marginBottom: '50px', textAlign: 'center' }}>අපගේ පාඨමාලා වර්ගීකරණය</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '25px' }}>
          <div style={{ padding: '40px', backgroundColor: 'white', borderRadius: '12px', textAlign: 'center', borderTop: '6px solid #1a237e' }}>
            <h3>🏫 School Curriculum</h3>
            <p>6 - 11 ශ්‍රේණි සඳහා රජයේ විෂය නිර්දේශයට අනුව පවත්වන පන්ති.</p>
          </div>
          <div style={{ padding: '40px', backgroundColor: 'white', borderRadius: '12px', textAlign: 'center', borderTop: '6px solid #ffd600' }}>
            <h3>🎓 Advanced Level</h3>
            <p>විද්‍යා, කලා සහ වාණිජ අංශයේ දිවයිනේ ප්‍රමුඛ දේශකයන්ගේ පන්ති.</p>
          </div>
          <div style={{ padding: '40px', backgroundColor: 'white', borderRadius: '12px', textAlign: 'center', borderTop: '6px solid #2e7d32' }}>
            <h3>⚡ Special Courses</h3>
            <p>O/L සහ A/L අවසන් කළ සිසුන් සඳහා IT සහ ඉංග්‍රීසි ඩිප්ලෝමා පාඨමාලා.</p>
          </div>
        </div>
      </section>

      {/* Lecturers Section Placeholder */}
      <section id="teachers" style={{ padding: '80px 60px', textAlign: 'center' }}>
        <h2 style={{ color: '#1a237e', fontSize: '32px', marginBottom: '50px' }}>දිවයිනේ ප්‍රමුඛතම දේශක මඩුල්ල</h2>
        <p style={{ color: '#666' }}>දේශකයන්ගේ පින්තූර සහ විස්තර පුවරු (Flyers) මෙහි දිස්වනු ඇත.</p>
      </section>

      {/* Pre-Registration Form */}
      <section id="register" style={{ padding: '100px 50px', backgroundColor: '#ffffff' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ color: '#1a237e', fontSize: '36px' }}>දැන්ම ඔබේ අසුන වෙන්කරවා ගන්න</h2>
          <p style={{ color: '#666' }}>පහත තොරතුරු ඇතුළත් කර පූර්ව ලියාපදිංචිය සිදු කරන්න.</p>
        </div>
        <div style={{ maxWidth: '600px', margin: '0 auto', padding: '40px', borderRadius: '15px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', border: '1px solid #eee' }}>
          <form onSubmit={handlePreRegister}>
            <div style={{ marginBottom: '20px' }}>
              <label htmlFor="student_name" style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>ශිෂ්‍යයාගේ නම</label>
              <input 
                id="student_name"
                type="text" 
                style={{ width: '100%', padding: '12px', borderRadius: '5px', border: '1px solid #ddd' }} 
                value={formData.student_name}
                onChange={(e) => setFormData({...formData, student_name: e.target.value})}
                required 
              />
            </div>
            <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
              <div style={{ flex: 1 }}>
                <label htmlFor="school" style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>පාසල</label>
                <input 
                  id="school"
                  type="text" 
                  style={{ width: '100%', padding: '12px', borderRadius: '5px', border: '1px solid #ddd' }} 
                  value={formData.school}
                  onChange={(e) => setFormData({...formData, school: e.target.value})}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label htmlFor="grade" style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>ශ්‍රේණිය</label>
                <input 
                  id="grade"
                  type="text" 
                  style={{ width: '100%', padding: '12px', borderRadius: '5px', border: '1px solid #ddd' }} 
                  value={formData.grade}
                  onChange={(e) => setFormData({...formData, grade: e.target.value})}
                />
              </div>
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label htmlFor="parent_phone" style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>මව්පිය දුරකථන අංකය</label>
              <input 
                id="parent_phone"
                type="tel" 
                style={{ width: '100%', padding: '12px', borderRadius: '5px', border: '1px solid #ddd' }} 
                value={formData.parent_phone}
                onChange={(e) => setFormData({...formData, parent_phone: e.target.value})}
                required 
              />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label htmlFor="course_id" style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>උනන්දුවක් දක්වන පන්තිය (Interested Course)</label>
              <select 
                id="course_id"
                style={{ width: '100%', padding: '12px', borderRadius: '5px', border: '1px solid #ddd' }} 
                value={formData.course_id}
                onChange={(e) => setFormData({...formData, course_id: e.target.value})}
              >
                <option value="">-- පන්තියක් තෝරන්න (Select a Course) --</option>
                {courses.map(c => <option key={c.course_id} value={c.course_id}>{c.course_name}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: '30px' }}>
              <label htmlFor="email" style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>විද්‍යුත් තැපෑල (Email)</label>
              <input 
                id="email"
                type="email" 
                style={{ width: '100%', padding: '12px', borderRadius: '5px', border: '1px solid #ddd' }} 
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
            <button type="submit" style={{ width: '100%', padding: '15px', backgroundColor: '#1a237e', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }}>
              තොරතුරු ඉදිරිපත් කරන්න
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;