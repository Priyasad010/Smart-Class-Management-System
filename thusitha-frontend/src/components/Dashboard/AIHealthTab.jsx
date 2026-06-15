import React from 'react';
import PropTypes from 'prop-types';
import { Doughnut } from 'react-chartjs-2';

const AIHealthTab = ({ stats }) => {
  const chartData = {
    labels: ['සාර්ථකයි (Success)', 'විසංවාද (Mismatch)'],
    datasets: [
      {
        data: [stats.success_count, stats.mismatch_count],
        backgroundColor: ['#2e7d32', '#d32f2f'],
        hoverOffset: 4,
      },
    ],
  };

  return (
    <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '15px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
      <h3 style={{ color: '#1a237e', marginBottom: '25px' }}>🏥 AI පැමිණීම් පද්ධතියේ තත්ත්වය (System Health)</h3>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <div style={{ padding: '20px', backgroundColor: '#f8fafc', borderRadius: '12px', borderLeft: '5px solid #1a237e' }}>
          <small style={{ color: '#64748b', fontWeight: 'bold' }}>පරීක්ෂා කළ මුළු වාර ගණන</small>
          <div style={{ fontSize: '28px', fontWeight: '800', color: '#1e293b' }}>{stats.total_sessions}</div>
        </div>
        <div style={{ padding: '20px', backgroundColor: '#f0fdf4', borderRadius: '12px', borderLeft: '5px solid #22c55e' }}>
          <small style={{ color: '#166534', fontWeight: 'bold' }}>සාර්ථකත්ව ප්‍රතිශතය (Accuracy)</small>
          <div style={{ fontSize: '28px', fontWeight: '800', color: '#15803d' }}>{stats.success_rate}%</div>
        </div>
        <div style={{ padding: '20px', backgroundColor: '#fef2f2', borderRadius: '12px', borderLeft: '5px solid #ef4444' }}>
          <small style={{ color: '#991b1b', fontWeight: 'bold' }}>මුළු විසංවාද සංඛ්‍යාව</small>
          <div style={{ fontSize: '28px', fontWeight: '800', color: '#b91c1c' }}>{stats.mismatch_count}</div>
        </div>
        <div style={{ padding: '20px', backgroundColor: stats.engine_status?.face_rec_enabled ? '#f0fdf4' : '#fff7ed', borderRadius: '12px', borderLeft: `5px solid ${stats.engine_status?.face_rec_enabled ? '#22c55e' : '#f97316'}` }}>
          <small style={{ color: '#9a3412', fontWeight: 'bold' }}>Biometric Verification Engine</small>
          <div style={{ fontSize: '20px', fontWeight: '800', color: stats.engine_status?.face_rec_enabled ? '#15803d' : '#c2410c' }}>{stats.engine_status?.face_rec_enabled ? '✅ ONLINE' : '⚠️ OFFLINE'}</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
        <div style={{ flex: 1, minWidth: '300px', height: '300px' }}>
          <h4 style={{ textAlign: 'center', marginBottom: '15px' }}>Success vs Mismatch Breakdown</h4>
          <Doughnut data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
        </div>
        {!stats.engine_status?.face_rec_enabled && (
          <div style={{ flex: 1, padding: '20px', backgroundColor: '#fff7ed', borderRadius: '12px', border: '1px solid #ffedd5', color: '#9a3412' }}>
            <h4 style={{ marginTop: 0 }}>⚠️ Biometric Engine Warning</h4>
            <p style={{ fontSize: '13px' }}>මුහුණ හඳුනාගැනීමේ පද්ධතිය (Face Recognition) ක්‍රියාත්මක නොවේ. මෙය සක්‍රිය කිරීමට Visual Studio C++ Build Tools ස්ථාපනය කර 'face-recognition' library එක install කරන්න.</p>
            <p style={{ fontSize: '12px', fontWeight: 'bold' }}>Headcount (YOLO) පද්ධතිය සාමාන්‍ය පරිදි ක්‍රියාත්මක වේ.</p>
          </div>
        )}
        <div style={{ flex: 1.5, minWidth: '300px' }}>
          <div style={{ padding: '20px', backgroundColor: '#eff6ff', borderRadius: '12px', color: '#1e40af' }}>
            <h4 style={{ marginTop: 0 }}>💡 පද්ධති නිරීක්ෂණය</h4>
            <p style={{ fontSize: '14px', lineHeight: '1.6' }}>
              AI validation පද්ධතිය <strong>{stats.success_rate}%</strong> ක නිරවද්‍යතාවයකින් ක්‍රියාත්මක වේ. 
              හඳුනාගත් විසංවාද (Mismatches) {stats.mismatch_count} ක් ඇති අතර ඒවා 'Suspicious Activity' වාර්තා හරහා පරීක්ෂා කළ හැක.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

AIHealthTab.propTypes = {
  stats: PropTypes.object.isRequired,
};

export default AIHealthTab;