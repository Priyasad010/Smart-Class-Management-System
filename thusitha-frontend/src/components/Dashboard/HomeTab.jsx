import React from 'react';
import PropTypes from 'prop-types';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Title, Tooltip, Legend);

const HomeTab = ({ username, studentCount, userCount, revenueData, attendanceData }) => {
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

  return (
    <div className="printable-content" style={{ fontFamily: 'Noto Sans Sinhala, Segoe UI, Tahoma, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <img src="/Project%20LOGO.png" alt="Logo" style={{ width: '45px', height: '45px' }} />
          <h2 style={{ margin: 0, color: '#1a237e' }}>ආයුබෝවන්, {username}!</h2>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => globalThis.print()} style={{ padding: '10px 20px', backgroundColor: '#455a64', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
            🖨️ Print Dashboard
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '20px', marginTop: '30px' }}>
        <div style={{ flex: 1, backgroundColor: 'white', padding: '30px', borderRadius: '16px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)', borderLeft: '6px solid #1a237e' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#718096', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600' }}>ඩේටාබේස් එකේ මුළු සිසුන්</h4>
          <h2 style={{ margin: 0, fontSize: '36px', color: '#1a202c', fontWeight: '800' }}>{studentCount.toLocaleString()}</h2>
        </div>
        <div style={{ flex: 1, backgroundColor: 'white', padding: '30px', borderRadius: '16px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)', borderLeft: '6px solid #2e7d32' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#718096', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600' }}>මුළු පන්ති/පරිශීලකයින්</h4>
          <h2 style={{ margin: 0, fontSize: '36px', color: '#1a202c', fontWeight: '800' }}>{userCount.toLocaleString()}</h2>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '20px', marginTop: '30px' }}>
        <div style={{ flex: 2, backgroundColor: 'white', padding: '25px', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
          <h3 style={{ color: '#1a237e', marginBottom: '20px' }}>📊 මාසික ආදායම් විශ්ලේෂණය (Monthly Revenue)</h3>
          <div style={{ height: '300px' }}>
            <Bar
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'top' } }
              }}
            />
          </div>
        </div>

        <div style={{ flex: 1, backgroundColor: 'white', padding: '25px', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
          <h3 style={{ color: '#1a237e', marginBottom: '20px' }}>📝 අද පැමිණීම (Today's Attendance)</h3>
          <div style={{ height: '300px', display: 'flex', justifyContent: 'center' }}>
            <Doughnut
              data={attendanceChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom' } }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

HomeTab.propTypes = {
  username: PropTypes.string.isRequired,
  studentCount: PropTypes.number.isRequired,
  userCount: PropTypes.number.isRequired,
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