import React from 'react';
import PropTypes from 'prop-types';
import { Bar, Doughnut, Line, Scatter, Bubble } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Title, Tooltip, Legend, ScatterController, BubbleController } from 'chart.js';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import confetti from 'canvas-confetti';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Title, Tooltip, Legend, ScatterController, BubbleController);

const HomeTab = ({ username, studentCount, userCount, revenueData, attendanceData, occupancyData, resolutionSummary, analyticsData, teacherPerformanceData, correlationData, hallUtilization, hallOccupancyData, predictiveOccupancyData, activeCongestions, discrepancyChartData }) => {
  
  // 🏆 Calculate Top 10 Students Logic
  const topStudents = [...(correlationData || [])]
    .map(s => ({
      ...s,
      rank_score: (Number.parseFloat(s.avg_marks) * 0.7) + (Number.parseFloat(s.punctuality_score) * 0.3)
    }))
    .sort((a, b) => b.rank_score - a.rank_score)
    .slice(0, 10);

  const getRankEmoji = (index) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `#${index + 1}`;
  };

  // 🩺 System Health Score Logic
  const totalDiscrepancies = resolutionSummary.pending + resolutionSummary.resolved;
  const healthScore = Math.max(0, 100 - (totalDiscrepancies / (studentCount || 1) * 100)).toFixed(0);

  const triggerCelebration = () => {
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#1a237e', '#ffd600', '#ffffff']
    });
  };

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

  const occupancyChartData = {
    labels: occupancyData?.map(d => d.hour) || [],
    datasets: [
      {
        label: 'අධ්‍යයන අංශයේ සිසුන් ගණන (Library Usage)',
        data: occupancyData?.map(d => d.count) || [],
        borderColor: '#1a237e',
        backgroundColor: 'rgba(26, 35, 126, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: '#ffd600'
      }
    ]
  };

  const scatterData = {
    datasets: [
      {
        label: 'ශිෂ්‍ය සාර්ථකත්ව සම්බන්ධතාවය (Punctuality vs Marks)',
        data: correlationData?.map(d => ({ x: Number.parseFloat(d.punctuality_score), y: Number.parseFloat(d.avg_marks) })) || [],
        backgroundColor: 'rgba(255, 99, 132, 1)',
        pointRadius: 6,
        pointHoverRadius: 8,
      },
    ],
  };

  // 🌡️ Heat Map Data Construction
  const uniqueHalls = [...new Set(hallOccupancyData?.map(d => d.hall_name))];
  const heatMapData = {
    datasets: uniqueHalls.map((hall, idx) => ({
      label: hall,
      data: hallOccupancyData
        .filter(d => d.hall_name === hall)
        .map(d => ({
          x: Number.parseInt(d.hour.split(':')[0]),
          y: idx + 1,
          r: Math.min(Number.parseInt(d.count) * 2, 20) // Radius based on crowd size
        })),
      backgroundColor: `hsla(${idx * 45}, 70%, 50%, 0.6)`,
    }))
  };

  const heatMapOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: { 
        title: { display: true, text: 'පැය (Hour of Day)' },
        min: 6, max: 20, ticks: { stepSize: 1 } 
      },
      y: { 
        title: { display: true, text: 'ශාලාව (Hall)' },
        min: 0, max: uniqueHalls.length + 1,
        ticks: {
          callback: (value) => uniqueHalls[value - 1] || ''
        }
      }
    },
    plugins: { 
      tooltip: { 
        callbacks: { 
          label: (ctx) => `${ctx.dataset.label}: ${ctx.raw.count} / ${ctx.raw.capacity} (${ctx.raw.percent}%)` 
        } 
      } 
    }
  };

  const scatterOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: { title: { display: true, text: 'Punctuality Score (%)' }, min: 0, max: 100 },
      y: { title: { display: true, text: 'Average Marks (%)' }, min: 0, max: 100 }
    },
    plugins: { tooltip: { callbacks: { label: (ctx) => `Score: ${ctx.raw.y}%, Punctuality: ${ctx.raw.x}%` } } }
  };

  const handleDownloadHealthReport = () => {
    const doc = new jsPDF();
    const totalIncidents = resolutionSummary.pending + resolutionSummary.resolved;
    const impactPercent = studentCount > 0 ? (totalIncidents / studentCount) * 100 : 0;
    const efficiency = totalIncidents > 0 ? (resolutionSummary.resolved / totalIncidents) * 100 : 0;

    // Header
    doc.setFontSize(18);
    doc.setTextColor(26, 35, 126);
    doc.text('Thusitha Smart Class - System Health Report', 14, 20);

    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);

    // KPI Summary Table
    doc.autoTable({
      head: [["Metric Category", "Current Value"]],
      body: [
        ["Total Registered Students", studentCount],
        ["Total AI Security Discrepancies", totalIncidents],
        ["Financial Impact Risk Level", `${impactPercent.toFixed(2)}%`],
        ["Incident Resolution Efficiency", `${efficiency.toFixed(2)}%`],
      ],
      startY: 40,
      theme: 'grid',
      headStyles: { fillColor: [26, 35, 126] }
    });

    // Resolution Status Details
    doc.setFontSize(14);
    doc.setTextColor(26, 35, 126);
    doc.text('Resolution Status Details', 14, doc.lastAutoTable.finalY + 15);
    doc.autoTable({
      head: [["Status", "Count"]],
      body: [
        ["Pending Investigation", resolutionSummary.pending],
        ["Successfully Resolved", resolutionSummary.resolved]
      ],
      startY: doc.lastAutoTable.finalY + 20,
      theme: 'striped'
    });

    // Teacher Performance Summary
    if (teacherPerformanceData && teacherPerformanceData.length > 0) {
      doc.setFontSize(14);
      doc.setTextColor(26, 35, 126);
      doc.text('Teacher Performance Summary', 14, doc.lastAutoTable.finalY + 15);
      doc.autoTable({
        head: [["Teacher Name", "Classes Taught", "Avg. Punctuality", "Avg. Exam Pass %"]],
        body: teacherPerformanceData.map(t => [
          t.teacher_name,
          t.classes_taught,
          t.avg_punctuality,
          t.avg_exam_pass
        ]),
        startY: doc.lastAutoTable.finalY + 20,
        theme: 'grid',
        headStyles: { fillColor: [26, 35, 126] }
      });
    }

    doc.save(`System_Health_Report_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div className="printable-content" style={{ fontFamily: 'Noto Sans Sinhala, Segoe UI, Tahoma, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <img src="/Project%20LOGO.png" alt="Logo" style={{ width: '45px', height: '45px' }} />
          <h2 style={{ margin: 0, color: '#1a237e' }}>ආයුබෝවන්, {username}!</h2>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={handleDownloadHealthReport} style={{ padding: '10px 20px', backgroundColor: '#1a237e', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
            🩺 Health Report
          </button>
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
        <div style={{ flex: 1, backgroundColor: activeCongestions?.length > 0 ? '#fff5f5' : 'white', padding: '30px', borderRadius: '16px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)', borderLeft: `6px solid ${activeCongestions?.length > 0 ? '#f44336' : '#4caf50'}`, transition: 'all 0.3s ease' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#718096', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600' }}>සක්‍රිය තදබදයන් (Safety)</h4>
          <h2 style={{ margin: 0, fontSize: '36px', color: activeCongestions?.length > 0 ? '#d32f2f' : '#1a202c', fontWeight: '800' }}>{activeCongestions?.length || 0}</h2>
        </div>
        <div style={{ flex: 1, backgroundColor: 'white', padding: '30px', borderRadius: '16px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)', borderLeft: '6px solid #f44336' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#718096', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600' }}>විසංවාද සාරාංශය (Resolutions)</h4>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '24px', fontWeight: '800', color: '#d32f2f' }}>{resolutionSummary.pending}</div>
              <div style={{ fontSize: '12px', color: '#666' }}>විමර්ශනය වෙමින්</div>
            </div>
            <div style={{ width: '1px', height: '30px', backgroundColor: '#eee' }}></div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: '800', color: '#2e7d32' }}>{resolutionSummary.resolved}</div>
              <div style={{ fontSize: '12px', color: '#666' }}>නිරාකරණය කළ</div>
            </div>
            <div style={{ width: '1px', height: '30px', backgroundColor: '#eee' }}></div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: '800', color: healthScore > 90 ? '#2e7d32' : '#f57f17' }}>{healthScore}%</div>
              <div style={{ fontSize: '12px', color: '#666' }}>Health Score</div>
            </div>
          </div>
        </div>
      </div>

      {/* ⚠️ Financial Impact Alert */}
      {(() => {
        const totalIncidents = resolutionSummary.pending + resolutionSummary.resolved;
        const impactPercent = studentCount > 0 ? (totalIncidents / studentCount) * 100 : 0;
        if (impactPercent > 10) {
          return (
            <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#fff5f5', borderLeft: '10px solid #c53030', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <span style={{ fontSize: '30px' }}>🚨</span>
                <div>
                  <h4 style={{ margin: 0, color: '#c53030' }}>මූල්‍ය බලපෑම් අනතුරු ඇඟවීම (Financial Impact Alert)</h4>
                  <p style={{ margin: '5px 0 0 0', color: '#666', fontSize: '14px' }}>සැක සහිත පැමිණීම් සංඛ්‍යාව මුළු ශිෂ්‍ය සංඛ්‍යාවෙන් <strong>{impactPercent.toFixed(1)}%</strong> ක් දක්වා ඉහළ ගොස් ඇත. මෙය ආදායමට බලපෑම් කළ හැකි බැවින් වහාම පරීක්ෂා කරන්න.</p>
                </div>
              </div>
            </div>
          );
        }
        return null;
      })()}

      <div style={{ marginTop: '30px', backgroundColor: 'white', padding: '25px', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
        <h3 style={{ color: '#1a237e', marginBottom: '20px' }}>📈 අධ්‍යයන අංශයේ පැය අනුව භාවිතය (Study Area Occupancy)</h3>
        <div style={{ height: '250px' }}>
          <Line 
            data={occupancyChartData}
            options={{ responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', gap: '20px', marginTop: '30px' }}>
        <div style={{ flex: 2, backgroundColor: 'white', padding: '25px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
          <h3 style={{ color: '#1a237e', marginBottom: '20px' }}>📊 මාසික ආදායම් විශ්ලේෂණය</h3>
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

      {/* 🏆 TOP 10 STUDENTS LEADERBOARD */}
      <div style={{ marginTop: '30px', backgroundColor: 'white', padding: '25px', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
        <h3 style={{ color: '#1a237e', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          🏆 දක්ෂතම සිසුන් 10 දෙනා (Top 10 Students){' '}
          <small style={{ fontSize: '12px', color: '#666', fontWeight: 'normal' }}>(Marks 70% + Punctuality 30%)</small>
        </h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', textAlign: 'left' }}>
                <th style={{ padding: '12px', width: '60px' }}>ස්ථානය</th>
                <th style={{ padding: '12px' }}>ශිෂ්‍යයා</th>
                <th style={{ padding: '12px', textAlign: 'center' }}>ලකුණු සාමාන්‍යය</th>
                <th style={{ padding: '12px', textAlign: 'center' }}>වේලානුරූපීතාවය</th>
                <th style={{ padding: '12px', textAlign: 'center' }}>Rank Score</th>
              </tr>
            </thead>
            <tbody>
              {topStudents.length === 0 ? (
                <tr><td colSpan="5" style={{ padding: '30px', textAlign: 'center', color: '#94a3b8' }}>ප්‍රමාණවත් දත්ත නොමැත.</td></tr>
              ) : (
                topStudents.map((student, index) => (
                  <tr 
                    key={student.student_id}
                    style={{ 
                      borderBottom: '1px solid #f1f5f9', 
                      cursor: index === 0 ? 'pointer' : 'default',
                      backgroundColor: index === 0 ? '#fffde7' : 'transparent' // Highlight top student row
                    }}
                    onClick={index === 0 ? triggerCelebration : undefined} // Confetti on click for #1
                    title={index === 0 ? "Click to Celebrate the Student of the Month!" : ""}
                  >
                    <td style={{ padding: '12px', fontWeight: 'bold', fontSize: '18px' }}>{getRankEmoji(index)}</td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ fontWeight: '600', color: '#1e293b' }}>{student.student_name}</div>
                        {index === 0 && (
                          <span style={{ padding: '2px 8px', backgroundColor: '#ffd600', color: '#1a237e', borderRadius: '4px', fontSize: '10px', fontWeight: '900', letterSpacing: '0.5px' }}>
                            🏅 STUDENT OF THE MONTH
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>{student.student_id}</div>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>{student.avg_marks}%</td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>{student.punctuality_score}%</td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <div style={{ padding: '4px 8px', backgroundColor: '#f0f9ff', color: '#0369a1', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold', display: 'inline-block' }}>
                        {student.rank_score.toFixed(1)}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ marginTop: '30px', backgroundColor: 'white', padding: '25px', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
        <h3 style={{ color: '#1a237e', marginBottom: '20px' }}>🌡️ ශාලා භාවිතය පිළිබඳ තාප සිතියම (Hall Occupancy Heat Map)</h3>
        <div style={{ height: '350px' }}>
          <Bubble 
            data={heatMapData}
            options={heatMapOptions}
          />
        </div>
      </div>

      <div style={{ marginTop: '30px', backgroundColor: 'white', padding: '25px', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
        <h3 style={{ color: '#d32f2f', marginBottom: '20px' }}>🏛️ ශාලා අනුව පැමිණීමේ විසංවාද (Hall Discrepancies)</h3>
        <div style={{ height: '300px' }}>
          <Line
            data={discrepancyChartData}
            options={{ responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } }}
          />
        </div>
      </div>

      <div style={{ marginTop: '30px', backgroundColor: 'white', padding: '25px', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
        <h3 style={{ color: '#1a237e', marginBottom: '20px' }}>🎯 ශිෂ්‍ය සාර්ථකත්ව සම්බන්ධතාවය (Success Correlation)</h3>
        <div style={{ height: '350px' }}>
          <Scatter 
            data={scatterData}
            options={scatterOptions}
          />
        </div>
      </div>

        <div style={{ flex: 1, backgroundColor: 'white', padding: '25px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
          <h3 style={{ color: '#1a237e', marginBottom: '20px' }}>📝 අද පැමිණීම</h3>
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
  occupancyData: PropTypes.arrayOf(PropTypes.shape({
    hour: PropTypes.string.isRequired,
    count: PropTypes.number.isRequired
  })).isRequired,
  resolutionSummary: PropTypes.shape({
    pending: PropTypes.number.isRequired,
    resolved: PropTypes.number.isRequired
  }).isRequired,
  analyticsData: PropTypes.arrayOf(
    PropTypes.shape({
      month: PropTypes.string.isRequired,
      revenue: PropTypes.number.isRequired,
      mismatches: PropTypes.number.isRequired,
    })
  ),
  teacherPerformanceData: PropTypes.arrayOf(
    PropTypes.shape({
      teacher_name: PropTypes.string.isRequired,
      classes_taught: PropTypes.number.isRequired,
      avg_punctuality: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
      avg_exam_pass: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    })
  ),
  correlationData: PropTypes.arrayOf(
    PropTypes.shape({
      student_id: PropTypes.string,
      punctuality_score: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      avg_marks: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    })
  ),
  hallUtilization: PropTypes.array,
  hallOccupancyData: PropTypes.array,
  predictiveOccupancyData: PropTypes.array,
  activeCongestions: PropTypes.array,
  discrepancyChartData: PropTypes.object.isRequired, // Add this propType
};

export default HomeTab;