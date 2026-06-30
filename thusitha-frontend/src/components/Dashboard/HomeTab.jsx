import React from 'react';
import PropTypes from 'prop-types';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { motion } from 'framer-motion';
import { Printer, Users, BookOpen, TrendingUp, CheckCircle, GraduationCap, Calendar } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Title, Tooltip, Legend);

const HomeTab = ({ username, role, studentCount, userCount, enrolledCourses, revenueData, attendanceData }) => {
  const isStudent = role === 'Student';

  const chartData = {
    labels: revenueData?.map(d => d.month) || [],
    datasets: [
      {
        label: 'මාසික ආදායම (Monthly Revenue)',
        data: revenueData?.map(d => d.total) || [],
        backgroundColor: '#3f51b5',
        borderRadius: 5,
      },
    ],
  };

  const attendanceChartData = {
    labels: attendanceData?.map(d => d.status) || [],
    datasets: [
      {
        data: attendanceData?.map(d => d.count) || [],
        backgroundColor: ['#4caf50', '#f44336', '#ffeb3b'],
        hoverOffset: 4,
      },
    ],
  };

  // =============================================
  // STUDENT VIEW: Shows enrolled courses only
  // =============================================
  if (isStudent) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-8"
      >
        {/* Welcome Header */}
        <div className="flex justify-between items-center bg-white/60 backdrop-blur-lg p-6 rounded-2xl shadow-sm border border-white/50">
          <div className="flex items-center gap-4">
            <div className="bg-white p-2 rounded-full shadow-md">
              <img src="/Project%20LOGO.png" alt="Logo" className="w-12 h-12 object-contain" />
            </div>
            <div>
              <h2 className="m-0 text-2xl font-bold text-primary-dark">ආයුබෝවන්, {username}! 👋</h2>
              <p className="text-gray-500 text-sm mt-1">ඔබගේ ඉගෙනුම් ස්ථානය සූදානම්!</p>
            </div>
          </div>
        </div>

        {/* Enrolled Courses */}
        <div className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-lg border border-white/60">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600"><GraduationCap size={24} /></div>
            <h3 className="text-xl font-bold text-primary-dark m-0">ඔබ ලියාපදිංචි වී ඇති පන්ති</h3>
          </div>
          {enrolledCourses && enrolledCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {enrolledCourses.map((course, idx) => (
                <motion.div
                  key={course.course_id || idx}
                  whileHover={{ y: -3 }}
                  className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 p-5 rounded-2xl"
                >
                  <div className="flex items-start gap-3">
                    <div className="bg-primary/10 p-3 rounded-xl text-primary shrink-0">
                      <BookOpen size={22} />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800 m-0">{course.course_name}</h4>
                      {course.teacher_name && (
                        <p className="text-sm text-gray-500 mt-1">👨‍🏫 {course.teacher_name}</p>
                      )}
                      {course.schedule_day && (
                        <p className="text-sm text-indigo-600 mt-1 flex items-center gap-1">
                          <Calendar size={13} /> {course.schedule_day} {course.start_time && `• ${course.start_time}`}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400">
              <GraduationCap size={48} className="mx-auto mb-3 opacity-30" />
              <p className="text-lg font-medium">ඔබ තවම කිසිදු පන්තියකට ලියාපදිංචි වී නැත.</p>
              <p className="text-sm mt-1">ලියාපදිංචිය සඳහා ප්‍රතිමාව කාර්යාලය හා සම්බන්ධ වන්න.</p>
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  // =============================================
  // ADMIN / TEACHER / COUNTER PERSON VIEW
  // =============================================
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="printable-content flex flex-col gap-8"
    >
      <div className="flex justify-between items-center bg-white/60 backdrop-blur-lg p-6 rounded-2xl shadow-sm border border-white/50">
        <div className="flex items-center gap-4">
          <div className="bg-white p-2 rounded-full shadow-md">
            <img src="/Project%20LOGO.png" alt="Logo" className="w-12 h-12 object-contain" />
          </div>
          <div>
            <h2 className="m-0 text-2xl font-bold text-primary-dark">ආයුබෝවන්, {username}! 👋</h2>
            <p className="text-gray-500 text-sm mt-1">ඔබගේ දෛනික වාර්තාව සහ දත්ත මෙහි දැක්වේ.</p>
          </div>
        </div>
        <div className="flex gap-3">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => globalThis.print()} 
            className="flex items-center gap-2 px-5 py-2.5 bg-gray-800 hover:bg-gray-900 text-white rounded-xl shadow-md font-semibold transition-colors"
          >
            <Printer size={18} /> Print Dashboard
          </motion.button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-lg border border-white/60 border-l-8 border-l-primary flex items-center gap-6"
        >
          <div className="bg-primary/10 p-4 rounded-2xl text-primary">
            <Users size={40} />
          </div>
          <div>
            <h4 className="text-gray-500 text-sm uppercase tracking-wider font-bold mb-1">ඩේටාබේස් එකේ මුළු සිසුන්</h4>
            <h2 className="text-5xl font-extrabold text-gray-800 m-0">{studentCount.toLocaleString()}</h2>
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-lg border border-white/60 border-l-8 border-l-secondary flex items-center gap-6"
        >
          <div className="bg-secondary/10 p-4 rounded-2xl text-secondary">
            <BookOpen size={40} />
          </div>
          <div>
            <h4 className="text-gray-500 text-sm uppercase tracking-wider font-bold mb-1">මුළු පන්ති/පරිශීලකයින්</h4>
            <h2 className="text-5xl font-extrabold text-gray-800 m-0">{userCount.toLocaleString()}</h2>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="col-span-2 bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-lg border border-white/60">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-blue-100 p-2 rounded-lg text-blue-600"><TrendingUp size={24} /></div>
            <h3 className="text-xl font-bold text-primary-dark m-0">මාසික ආදායම් විශ්ලේෂණය</h3>
          </div>
          <div className="h-[350px]">
            <Bar
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'top' } },
                scales: {
                  y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } },
                  x: { grid: { display: false } }
                }
              }}
            />
          </div>
        </div>

        <div className="col-span-1 bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-lg border border-white/60">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-green-100 p-2 rounded-lg text-green-600"><CheckCircle size={24} /></div>
            <h3 className="text-xl font-bold text-primary-dark m-0">අද පැමිණීම</h3>
          </div>
          <div className="h-[300px] flex justify-center mt-8">
            <Doughnut
              data={attendanceChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%',
                plugins: { legend: { position: 'bottom', labels: { padding: 20 } } }
              }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

HomeTab.propTypes = {
  username: PropTypes.string.isRequired,
  role: PropTypes.string,
  studentCount: PropTypes.number.isRequired,
  userCount: PropTypes.number.isRequired,
  enrolledCourses: PropTypes.array,
  revenueData: PropTypes.arrayOf(
    PropTypes.shape({
      month: PropTypes.string.isRequired,
      total: PropTypes.number.isRequired,
    })
  ).isRequired,
  attendanceData: PropTypes.arrayOf(
    PropTypes.shape({
      status: PropTypes.string.isRequired,
      count: PropTypes.number.isRequired,
    })
  ).isRequired,
};

export default HomeTab;