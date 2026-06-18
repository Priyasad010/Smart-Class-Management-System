import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [courses, setCourses] = useState([]);
  const [formData, setFormData] = useState({
    student_name: '',
    school: '',
    grade: '',
    parent_phone: '',
    email: '',
    course_id: ''
  });

  // පිටුවේ දෙපස පවතින කළු පැහැති ඉඩ (Pillarboxing) ඉවත් කිරීම සඳහා
  useEffect(() => {
    const root = document.getElementById('root');
    if (root) {
      root.style.maxWidth = 'none';
      root.style.padding = '0';
      root.style.margin = '0';
      root.style.width = '100%';
      root.style.textAlign = 'left';
    }
  }, []);

  // පන්ති ලැයිස්තුව ලබා ගැනීම
  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/courses/public`)
      .then(res => res.json())
      .then(data => setCourses(data || []))
      .catch(err => console.error("Error fetching courses:", err));
  }, []);

  const handlePreRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await request('/students/register-public', { // Use request helper for public route
        method: 'POST',
        body: formData // request helper will stringify if not FormData
      });
      // request helper throws error if !response.ok, so no need to check response.ok here
      if (response) { // Check if response is not null/undefined
        alert('ලියාපදිංචිය සාර්ථකයි! කරුණාකර අනුමැතිය සඳහා කාර්යාලයට පැමිණෙන්න.');
        setIsModalOpen(false);
        setFormData({ student_name: '', school: '', grade: '', parent_phone: '', email: '', course_id: '' });
      } else {
        const data = await response.json();
        alert(data.error || 'ලියාපදිංචිය අසාර්ථකයි.');
      }
    } catch (err) {
      console.error('Pre-registration error:', err);
      alert('පද්ධති දෝෂයකි. පසුව උත්සාහ කරන්න.');
    }
  };

  // Hover states for buttons/links
  const [isLoginHovered, setIsLoginHovered] = useState(false);
  const [isExploreHovered, setIsExploreHovered] = useState(false);
  const [isRegisterHovered, setIsRegisterHovered] = useState(false);
  const [promotions, setPromotions] = useState([]);
  const [promoLoading, setPromoLoading] = useState(true);

  // ගුරු මඩුල්ලේ විස්තර (Mock data - පසුව Backend එකෙන් ලබාගත හැක)
  const [currentLecturer, setCurrentLecturer] = useState(0);
  const lecturers = [
    {
      name: "තුසිත ගුරුතුමා",
      subject: "භෞතික විද්‍යාව (Physics)",
      description: "වසර 15කට අධික අත්දැකීම් සහිත ප්‍රමුඛතම දේශක.",
      image: "/Project%20LOGO.png"
    },
    {
      name: "අමිල ගුරුතුමා",
      subject: "රසායන විද්‍යාව (Chemistry)",
      description: "සරලව හා නිරවුල්ව විෂය කරුණු කියාදෙන දක්ෂ ගුරුවරයෙක්.",
      image: "/Project%20LOGO.png"
    },
    {
      name: "නිමල් ගුරුතුමා",
      subject: "සංයුක්ත ගණිතය (Applied Math)",
      description: "විෂය නිර්දේශය ඉක්මවා යන තාර්කික දැනුමක් ලබා දෙන දේශක.",
      image: "/Project%20LOGO.png"
    }
  ];

  const nextLecturer = () => setCurrentLecturer((prev) => (prev + 1) % lecturers.length);
  const prevLecturer = () => setCurrentLecturer((prev) => (prev - 1 + lecturers.length) % lecturers.length);

  // Promotions (Flyers, Teacher Profiles) Backend එකෙන් ලබා ගැනීම
  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        const data = await request('/promos'); // Use request helper for public route
        setPromotions(data || []);
      } catch (err) { console.error("Error fetching promotions:", err); } finally { setPromoLoading(false); }
    };
    fetchPromotions();
  }, []);

  // Define Color Palette
  const PRIMARY_NAVY = '#070D59';
  const SECONDARY_BLUE = '#1F3C88';
  const LIGHT_ACCENT_BLUE = '#5893D4';
  const BACKGROUND_BLUE = '#CEDDEF';
  const GREEN_SUCCESS = '#2e7d32'; // Keeping green for registration as per previous discussion
  const GREEN_SUCCESS_HOVER = '#1b5e20';

  // SonarQube S3358: Extract nested ternary into independent statement
  let promoContent;
  if (promoLoading) {
    promoContent = <p style={{ color: SECONDARY_BLUE }}>ප්‍රවර්ධන දත්ත පූරණය වෙමින් පවතී...</p>;
  } else if (promotions.length > 0) {
    promoContent = (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 350px), 1fr))', gap: '30px', justifyContent: 'center' }}> {/* SonarQube: S3358 handled by extracting promoContent */}
        {promotions.map((promo) => (
          <button key={promo.promo_id} type="button" style={{ // Changed to button for accessibility and interactivity
            border: 'none', // Remove default button border
            cursor: 'pointer', // Indicate interactivity
            width: '100%', // Ensure it takes full width of grid cell
            textAlign: 'left', // Align content to left
            backgroundColor: 'white', 
            borderRadius: '15px', 
            boxShadow: '0 10px 30px rgba(0,0,0,0.05)', 
            overflow: 'hidden', 
            transition: 'transform 0.3s ease, box-shadow 0.3s ease'
          }}>
            {promo.image_url && <img src={`${import.meta.env.VITE_API_URL}/${promo.image_url}`} alt={promo.title} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />}
            <div style={{ padding: '20px' }}>
              <span style={{ fontSize: '12px', color: LIGHT_ACCENT_BLUE, fontWeight: 'bold', textTransform: 'uppercase' }}>{promo.content_type}</span>
              <h4 style={{ color: PRIMARY_NAVY, margin: '10px 0', fontSize: '18px' }}>{promo.title}</h4>
              <p style={{ color: '#666', fontSize: '14px', lineHeight: '1.5' }}>{promo.description}</p>
            </div>
          </button>
        ))}
      </div>
    );
  } else {
    promoContent = <p style={{ color: SECONDARY_BLUE }}>දැනට ප්‍රවර්ධන දත්ත නොමැත.</p>;
  }

  return (
    <div style={{ fontFamily: "'Noto Sans Sinhala', 'Segoe UI', Tahoma, sans-serif", color: '#333', backgroundColor: '#ffffff', minHeight: '100vh', width: '100%', overflowX: 'hidden' }}>
      {/* Navigation Bar */}
      <nav style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        padding: '15px 5%',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderBottom: `1px solid ${BACKGROUND_BLUE}`,
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        zIndex: 1000, 
        flexWrap: 'wrap', 
        gap: '15px',
        boxSizing: 'border-box'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src="/Project%20LOGO.png" alt="Thusitha Logo" style={{ width: '45px', height: 'auto' }} />
          <h2 style={{ margin: 0, color: PRIMARY_NAVY, fontWeight: '800', fontSize: 'clamp(18px, 4vw, 26px)' }}>Thusitha Smart Academy</h2>
        </div>
        <div style={{ display: 'flex', gap: 'clamp(15px, 3vw, 30px)', alignItems: 'center', flexWrap: 'wrap' }}>
          <a href="/courses" style={{ textDecoration: 'none', color: SECONDARY_BLUE, fontWeight: '600', fontSize: '14px', transition: 'color 0.3s ease' }} onMouseEnter={e => e.target.style.color=LIGHT_ACCENT_BLUE} onMouseLeave={e => e.target.style.color=SECONDARY_BLUE}>පාඨමාලා</a>
          <a href="/teachers" style={{ textDecoration: 'none', color: SECONDARY_BLUE, fontWeight: '600', fontSize: '14px', transition: 'color 0.3s ease' }} onMouseEnter={e => e.target.style.color=LIGHT_ACCENT_BLUE} onMouseLeave={e => e.target.style.color=SECONDARY_BLUE}>ගුරු මඩුල්ල</a>
          <button
            onClick={() => navigate('/login')}
            onMouseEnter={() => setIsLoginHovered(true)}
            onMouseLeave={() => setIsLoginHovered(false)}
            style={{
              padding: '10px 25px',
              backgroundColor: isLoginHovered ? SECONDARY_BLUE : PRIMARY_NAVY,
              color: 'white',
              border: 'none',
              borderRadius: '50px',
              cursor: 'pointer',
              fontWeight: 'bold',
              transition: 'all 0.3s ease'
            }}
          >
            Login
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <header style={{ 
        padding: '80px 5%', 
        background: `linear-gradient(135deg, ${BACKGROUND_BLUE} 0%, #ffffff 100%)`, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        minHeight: '80vh',
        flexWrap: 'wrap'
      }}>
        <div style={{ flex: '1', minWidth: '320px', paddingRight: '40px' }}>
          <h1 style={{ fontSize: 'clamp(36px, 5vw, 60px)', color: PRIMARY_NAVY, marginBottom: '24px', lineHeight: '1.1', fontWeight: '800', letterSpacing: '-1px' }}>
            හෙට දවස දිනන <br/><span style={{color: LIGHT_ACCENT_BLUE}}>දක්ෂයෙකු</span> වන්න.
          </h1>
          <p style={{ fontSize: '20px', color: '#555', marginBottom: '40px', lineHeight: '1.6' }}>නවීන තාක්ෂණය සමඟ අධ්‍යාපනයේ නව අත්දැකීමක්. Thusitha Smart Academy සමඟින් ඔබේ අධ්‍යාපන සිහින සැබෑ කරගන්න. දැන්ම අප සමඟ එක්වී ඔබේ අනාගතය ජයගන්න.</p>
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setIsModalOpen(true)}
              onMouseEnter={() => setIsRegisterHovered(true)}
              onMouseLeave={() => setIsRegisterHovered(false)}
              style={{
                padding: '18px 40px',
                backgroundColor: isRegisterHovered ? GREEN_SUCCESS_HOVER : GREEN_SUCCESS,
                color: 'white', border: 'none', borderRadius: '50px', fontWeight: 'bold', fontSize: '18px', cursor: 'pointer',
                boxShadow: isRegisterHovered ? '0 15px 30px rgba(46, 125, 50, 0.3)' : '0 10px 20px rgba(46, 125, 50, 0.2)', // Increased shadow on hover
                transform: isRegisterHovered ? 'translateY(-2px)' : 'translateY(0)', // Slight lift on hover
                transition: 'all 0.3s ease'
              }}
            >දැන්ම ලියාපදිංචි වන්න</button>
            <a
              href="#classes"
              onMouseEnter={() => setIsExploreHovered(true)}
              onMouseLeave={() => setIsExploreHovered(false)}
              style={{
                padding: '16px 38px',
                backgroundColor: isExploreHovered ? BACKGROUND_BLUE : 'white',
                color: SECONDARY_BLUE, textDecoration: 'none', borderRadius: '50px', fontWeight: 'bold', fontSize: '18px',
                border: `2px solid ${SECONDARY_BLUE}`, transition: 'all 0.3s ease'
              }}
            >පාඨමාලා ගවේෂණය</a>
          </div>
        </div>
        <div style={{ flex: '1', minWidth: '320px', display: 'flex', justifyContent: 'center', marginTop: '40px' }}>
          <div style={{ 
            width: '100%', maxWidth: '450px', minHeight: '380px', backgroundColor: 'white', borderRadius: '30px', 
            boxShadow: '0 30px 60px rgba(7, 13, 89, 0.15)', overflow: 'hidden', border: `8px solid ${PRIMARY_NAVY}`,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative',
            padding: '20px', textAlign: 'center', transition: 'all 0.5s ease'
          }}>
            <h4 style={{ color: PRIMARY_NAVY, margin: '0 0 15px 0', fontSize: '18px' }}>අපගේ ගුරු මඩුල්ල</h4>
            
            <div style={{ 
              width: '120px', height: '120px', borderRadius: '50%', backgroundColor: BACKGROUND_BLUE, 
              marginBottom: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: `4px solid ${LIGHT_ACCENT_BLUE}`, overflow: 'hidden'
            }}>
              <img src={lecturers[currentLecturer].image} alt="Guru" style={{ width: '80%', opacity: 0.8 }} />
            </div>

            <h3 style={{ margin: '0', color: SECONDARY_BLUE, fontSize: '22px' }}>{lecturers[currentLecturer].name}</h3>
            <p style={{ margin: '5px 0', color: LIGHT_ACCENT_BLUE, fontWeight: 'bold', fontSize: '14px' }}>{lecturers[currentLecturer].subject}</p>
            <p style={{ margin: '10px 0', color: '#666', fontSize: '13px', lineHeight: '1.4' }}>{lecturers[currentLecturer].description}</p>

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button 
                onClick={prevLecturer}
                style={{ 
                  padding: '8px 20px', backgroundColor: PRIMARY_NAVY, color: 'white', 
                  border: 'none', borderRadius: '20px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold'
                }}
              >
                ⬅ පෙර
              </button>
              <button 
                onClick={nextLecturer}
                style={{ 
                  padding: '8px 20px', backgroundColor: PRIMARY_NAVY, color: 'white', 
                  border: 'none', borderRadius: '20px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold'
                }}
              >
                මීළඟ ➔
              </button>
            </div>

            <div style={{ display: 'flex', gap: '5px', marginTop: '15px' }}>
              {lecturers.map((lecturer, i) => (
                <button 
                  key={lecturer.name}
                  type="button"
                  aria-label={`Go to lecturer ${lecturer.name}`}
                  style={{ width: '8px', height: '8px', borderRadius: '50%', padding: 0, border: 'none', backgroundColor: currentLecturer === i ? PRIMARY_NAVY : BACKGROUND_BLUE, cursor: 'pointer' }}
                  onClick={() => setCurrentLecturer(i)}
                ></button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Promotions Section (Flyers, Teacher Profiles, Achievements) */}
      <section id="promotions" style={{ padding: '80px 5%', backgroundColor: BACKGROUND_BLUE, textAlign: 'center' }}>
        <h2 style={{ color: PRIMARY_NAVY, fontSize: '36px', marginBottom: '20px', fontWeight: '700' }}>අපගේ නවතම ප්‍රවර්ධන සහ විශේෂාංග</h2>
        <p style={{ color: '#666', marginBottom: '60px' }}>අපගේ සිසුන්ගේ සාර්ථකත්වයන්, දේශකයන්ගේ විස්තර සහ නවතම පන්ති පිළිබඳ තොරතුරු.</p>
        
        {promoContent}
      </section>

      {/* Smart Features Showcase */}
      <section id="features" style={{ padding: '100px 5%', textAlign: 'center', backgroundColor: '#ffffff' }}>
        <h2 style={{ color: PRIMARY_NAVY, fontSize: '36px', marginBottom: '20px', fontWeight: '700' }}>පද්ධති විශේෂාංග</h2>
        <p style={{ color: '#666', marginBottom: '60px' }}>අධ්‍යාපනය සහ තාක්ෂණය එකට එක්වූ අපගේ විශේෂත්වයන්</p>
        <div style={{ display: 'flex', gap: '30px', justifyContent: 'center', flexWrap: 'wrap' }}>
          {[
            { icon: '📱', title: 'Smart QR Attendance', desc: 'ආරක්ෂිත සහ වේගවත් QR පැමිණීමේ පද්ධතිය සමඟ සිසුන්ගේ පැමිණීම නිරීක්ෂණය කරන්න.' },
            { icon: '🧠', title: 'AI-Powered Monitoring', desc: 'AI තාක්ෂණය භාවිතයෙන් පන්ති කාමර ක්‍රියාකාරකම් වඩාත් නිවැරදිව අධීක්ෂණය කරන්න.' },
            { icon: '💻', title: 'Digital Learning Experience', desc: 'ඕනෑම තැනක සිට ඉගෙනුම් ද්‍රව්‍ය සහ පාඩම් වෙත ප්‍රවේශ වන්න.' },
            { icon: '💳', title: 'Easy Fee Management', desc: 'ගෙවීම් සහ මූල්‍ය තොරතුරු එකම ස්ථානයකින් කළමනාකරණය කරන්න.' }
          ].map((f, index) => (
            <button key={f.title} 
              type="button"
              style={{ flex: '1', minWidth: '250px', padding: '40px 30px', backgroundColor: 'white', borderRadius: '20px', boxShadow: '0 10px 40px rgba(0,0,0,0.04)', transition: 'transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease', border: `1px solid ${BACKGROUND_BLUE}`, cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit' }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.boxShadow = '0 15px 50px rgba(0,0,0,0.1)';
                e.currentTarget.style.borderColor = PRIMARY_NAVY;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 10px 40px rgba(0,0,0,0.04)';
                e.currentTarget.style.borderColor = BACKGROUND_BLUE;
              }}>
              <div style={{ fontSize: '50px', marginBottom: '20px', color: LIGHT_ACCENT_BLUE }}>{f.icon}</div>
              <h4 style={{ color: PRIMARY_NAVY, marginBottom: '15px', fontSize: '20px', fontWeight: '700' }}>{f.title}</h4>
              <p style={{ color: '#666', fontSize: '15px', lineHeight: '1.6' }}>{f.desc}</p>
            </button>
          ))}
        </div>
      </section>

      {/* Course Categories */}
      <section id="classes" style={{ padding: '100px 5%', backgroundColor: '#f5f7fa' }}>
        <h2 style={{ color: PRIMARY_NAVY, fontSize: '36px', marginBottom: '20px', textAlign: 'center', fontWeight: '700' }}>අපගේ පාඨමාලා</h2>
        <p style={{ color: '#666', marginBottom: '60px', textAlign: 'center' }}>සියලුම වයස් කාණ්ඩ සඳහා නිර්මාණය කළ අධ්‍යාපන වැඩසටහන්</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', justifyContent: 'center' }}>
          {[
            { 
              icon: '🏫', 
              title: 'School Curriculum', 
              desc: '1-11 ශ්‍රේණි සඳහා රජයේ විෂය නිර්දේශයට අනුව පවත්වන පන්ති.',
              color: PRIMARY_NAVY 
            },
            { 
              icon: '🎓', 
              title: 'Advanced Level', 
              desc: 'විද්‍යා, ගණිත, වාණිජ, කලා සහ තාක්ෂණ අංශ සඳහා උසස් පෙළ පන්ති.',
              color: SECONDARY_BLUE 
            },
            { 
              icon: '🚀', 
              title: 'Special Courses', 
              desc: 'වෘත්තීය සංවර්ධන පාඨමාලා.',
              color: LIGHT_ACCENT_BLUE 
            }
          ].map((course) => (
            <button key={course.title}
              type="button"
              style={{ 
                padding: '50px 30px', 
                backgroundColor: 'white', 
                borderRadius: '20px', 
                boxShadow: '0 10px 40px rgba(0,0,0,0.04)', 
                transition: 'transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease', 
                border: `1px solid ${BACKGROUND_BLUE}`,
                borderTop: `8px solid ${course.color}`,
                cursor: 'pointer', 
                textAlign: 'center', 
                fontFamily: 'inherit' 
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-10px)';
                e.currentTarget.style.boxShadow = '0 20px 60px rgba(0,0,0,0.1)';
                e.currentTarget.style.borderColor = course.color;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 10px 40px rgba(0,0,0,0.04)';
                e.currentTarget.style.borderColor = BACKGROUND_BLUE;
              }}>
              <div style={{ fontSize: '70px', marginBottom: '20px' }}>{course.icon}</div>
              <h4 style={{ color: PRIMARY_NAVY, marginBottom: '15px', fontSize: '24px', fontWeight: '700' }}>{course.title}</h4>
              <p style={{ color: '#666', fontSize: '15px', lineHeight: '1.6' }}>{course.desc}</p>
            </button>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{ backgroundColor: PRIMARY_NAVY, color: 'white', padding: '60px 5% 20px', borderTop: `5px solid ${LIGHT_ACCENT_BLUE}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '40px', marginBottom: '40px' }}>
          <div style={{ flex: '1', minWidth: '250px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
              <img src="/Project%20LOGO.png" alt="Logo" style={{ width: '50px', backgroundColor: 'white', borderRadius: '50%', padding: '5px' }} />
              <h3 style={{ margin: 0, fontSize: '24px', color: LIGHT_ACCENT_BLUE }}>Thusitha Smart Academy</h3>
            </div>
            <p style={{ fontSize: '14px', lineHeight: '1.8', opacity: 0.8 }}>දිවයිනේ ප්‍රමුඛතම අධ්‍යාපන ආයතනයක් ලෙස නවීන තාක්ෂණය සමඟින් දරුවන්ගේ අනාගතය සුබදායී කිරීමට අපි කැපවී සිටින්නෙමු.</p>
          </div>
          <div style={{ flex: '1', minWidth: '200px' }}>
            <h4 style={{ color: LIGHT_ACCENT_BLUE, marginBottom: '20px' }}>Quick Links</h4>
            <ul style={{ listStyle: 'none', padding: 0, lineHeight: '2.2' }}>
              <li style={{ marginBottom: '10px' }}><a href="#home" style={{ color: '#aab', textDecoration: 'none' }}>මුල් පිටුව</a></li>
              <li style={{ marginBottom: '10px' }}><a href="#classes" style={{ color: '#aab', textDecoration: 'none' }}>පාඨමාලා</a></li>
              <li style={{ marginBottom: '10px' }}><a href="/teachers" style={{ color: '#aab', textDecoration: 'none' }}>ගුරු මඩුල්ල</a></li>
            </ul>
          </div>
          <div style={{ flex: '1', minWidth: '200px' }}>
            <h4 style={{ color: LIGHT_ACCENT_BLUE, marginBottom: '20px' }}>සම්බන්ධ වන්න</h4>
            <p style={{ fontSize: '14px', marginBottom: '10px' }}>📍 Thusitha Education Center, Gampaha</p>
            <p style={{ fontSize: '14px', marginBottom: '10px' }}>📞 033-22XXXXX</p>
            <p style={{ fontSize: '14px' }}>✉️ info@thusitha.edu</p>
          </div>
        </div>
        <div style={{ textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px', fontSize: '12px', opacity: 0.6 }}>
          &copy; {new Date().getFullYear()} Thusitha Smart Academy. All Rights Reserved.
        </div>
      </footer>

      {/* Registration Modal Popup */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000, padding: '20px' }}>
          <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '15px', maxWidth: '500px', width: '100%', position: 'relative', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <button onClick={() => setIsModalOpen(false)} style={{ position: 'absolute', top: '15px', right: '15px', border: 'none', background: 'none', fontSize: '28px', cursor: 'pointer', color: '#666' }}>&times;</button>
            <h2 style={{ color: '#1a237e', marginBottom: '10px', textAlign: 'center' }}>ලියාපදිංචි වන්න</h2>
            <p style={{ textAlign: 'center', color: '#666', marginBottom: '30px', fontSize: '14px' }}>ඔබේ තොරතුරු ඇතුළත් කර පන්තියට අදාළ අසුනක් වෙන් කරවා ගන්න.</p>
            
            <form onSubmit={handlePreRegister}>
              <div style={{ marginBottom: '15px' }}>
                <label htmlFor="student_name" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>ශිෂ්‍යයාගේ නම</label>
                <input id="student_name" type="text" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }} value={formData.student_name} onChange={e => setFormData({...formData, student_name: e.target.value})} required />
              </div>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                <div style={{ flex: 1 }}>
                  <label htmlFor="school" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>පාසල</label>
                  <input id="school" type="text" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }} value={formData.school} onChange={e => setFormData({...formData, school: e.target.value})} />
                </div>
                <div style={{ flex: 1 }}>
                  <label htmlFor="grade" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>ශ්‍රේණිය</label>
                  <input id="grade" type="text" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }} value={formData.grade} onChange={e => setFormData({...formData, grade: e.target.value})} />
                </div>
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label htmlFor="parent_phone" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>මව්පිය දුරකථන අංකය</label>
                <input id="parent_phone" type="tel" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }} value={formData.parent_phone} onChange={e => setFormData({...formData, parent_phone: e.target.value})} required />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label htmlFor="course_id" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>උනන්දුවක් දක්වන පන්තිය (Interested Course)</label>
                <select id="course_id" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }} value={formData.course_id} onChange={e => setFormData({...formData, course_id: e.target.value})} required>
                  <option value="">-- පන්තියක් තෝරන්න --</option>
                  {courses.map(c => (
                    <option key={c.course_id} value={c.course_id}>{c.course_name}</option>
                  ))}
                </select>
              </div>
              <div style={{ marginBottom: '25px' }}>
                <label htmlFor="email" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>ඊමේල් ලිපිනය (ඇත්නම්)</label>
                <input id="email" type="email" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }} value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
              
              <button type="submit" style={{ width: '100%', padding: '15px', backgroundColor: PRIMARY_NAVY, color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }}>
                ලියාපදිංචි කිරීම තහවුරු කරන්න
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;