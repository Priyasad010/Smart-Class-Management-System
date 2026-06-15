import React from 'react';
import PropTypes from 'prop-types';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const TeacherPerformanceTab = ({ performanceData }) => {
  const barChartData = {
    labels: performanceData.map(t => t.lecturer_name),
    datasets: [
      {
        label: 'පැමිණීමේ වේලානුරූපීතාවය (Punctuality %)',
        data: performanceData.map(t => Number.parseFloat(t.avg_punctuality)),
        backgroundColor: 'rgba(63, 81, 181, 0.7)',
        borderColor: '#3f51b5',
        borderWidth: 1,
      },
      {
        label: 'විභාග සමත් ප්‍රතිශතය (Exam Pass %)',
        data: performanceData.map(t => Number.parseFloat(t.avg_exam_pass)),
        backgroundColor: 'rgba(46, 125, 50, 0.7)',
        borderColor: '#2e7d32',
        borderWidth: 1,
      }
    ]
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
      <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '15px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
        <h3 style={{ color: '#1a237e', marginBottom: '20px' }}>👨‍🏫 ගුරුවරුන්ගේ කාර්ය සාධන විශ්ලේෂණය (Teacher Performance Overview)</h3>
        <div style={{ height: '400px' }}>
          <Bar 
            data={barChartData} 
            options={{ 
              responsive: true, 
              maintainAspectRatio: false,
              scales: { y: { beginAtZero: true, max: 100 } }
            }} 
          />
        </div>
      </div>

      <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '15px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
        <h4 style={{ color: '#1a237e', marginBottom: '15px' }}>විස්තරාත්මක කාර්ය සාධන දත්ත</h4>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f5f5f5', textAlign: 'left' }}>
              <th style={{ padding: '12px' }}>ගුරුවරයාගේ නම</th>
              <th style={{ padding: '12px', textAlign: 'center' }}>මුළු පන්ති</th>
              <th style={{ padding: '12px', textAlign: 'center' }}>වේලානුරූපීතාවය</th>
              <th style={{ padding: '12px', textAlign: 'center' }}>විභාග සාමර්ථ්‍යය</th>
            </tr>
          </thead>
          <tbody>
            {performanceData.map((teacher, idx) => (
              <tr key={teacher.lecturer_name || idx} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '12px', fontWeight: 'bold' }}>{teacher.lecturer_name}</td>
                <td style={{ padding: '12px', textAlign: 'center' }}>{teacher.classes_taught}</td>
                <td style={{ padding: '12px', textAlign: 'center', color: '#1a237e', fontWeight: 'bold' }}>{teacher.avg_punctuality}</td>
                <td style={{ padding: '12px', textAlign: 'center', color: '#2e7d32', fontWeight: 'bold' }}>{teacher.avg_exam_pass}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

TeacherPerformanceTab.propTypes = {
  performanceData: PropTypes.arrayOf(PropTypes.shape({
    lecturer_name: PropTypes.string.isRequired,
    classes_taught: PropTypes.number.isRequired,
    avg_punctuality: PropTypes.string.isRequired,
    avg_exam_pass: PropTypes.string.isRequired,
  })).isRequired
};

export default TeacherPerformanceTab;