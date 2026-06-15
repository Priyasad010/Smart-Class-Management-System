import React from 'react';
import PropTypes from 'prop-types';
import { Bar, Line } from 'react-chartjs-2';

const HallUtilizationTab = ({ data }) => {
  const chartData = {
    labels: data.map(h => h.hall_name),
    datasets: [
      {
        label: 'මුළු පැය ගණන (Total Hours)',
        data: data.map(h => h.total_hours),
        backgroundColor: '#3f51b5',
        borderRadius: 5,
      }
    ]
  };

  // Data for Discrepancy Analysis (Historical Mismatches)
  const discrepancyChartData = {
    labels: data.map(h => h.hall_name),
    datasets: [
      {
        label: 'විසංවාද සංඛ්‍යාව (Discrepancy Count)',
        data: data.map(h => h.mismatch_count || 0),
        backgroundColor: 'rgba(211, 47, 47, 0.5)',
        borderColor: '#d32f2f',
        borderWidth: 2,
        fill: true,
        tension: 0.4
      }
    ]
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
      <div style={{ display: 'flex', gap: '25px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '400px', backgroundColor: 'white', padding: '25px', borderRadius: '15px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
          <h3 style={{ color: '#1a237e', marginBottom: '20px' }}>🏛️ ශාලා භාවිතය (Hall Utilization)</h3>
          <div style={{ height: '300px' }}>
            <Bar data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>

        <div style={{ flex: 1, minWidth: '400px', backgroundColor: 'white', padding: '25px', borderRadius: '15px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
          <h3 style={{ color: '#d32f2f', marginBottom: '20px' }}>⚠️ විසංවාද විශ්ලේෂණය (Hall Discrepancies)</h3>
          <div style={{ height: '300px' }}>
            <Line data={discrepancyChartData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>
      </div>

      <div style={{ flex: 1, minWidth: '400px', backgroundColor: 'white', padding: '25px', borderRadius: '15px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
        <h4 style={{ color: '#1a237e', marginBottom: '15px' }}>විස්තරාත්මක දත්ත</h4>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f5f5f5', textAlign: 'left' }}>
              <th style={{ padding: '12px' }}>ශාලාව</th>
              <th style={{ padding: '12px' }}>ධාරිතාව</th>
              <th style={{ padding: '12px' }}>පන්ති ගණන</th>
              <th style={{ padding: '12px' }}>මුළු පැය</th>
              <th style={{ padding: '12px', textAlign: 'center' }}>විසංවාද</th>
            </tr>
          </thead>
          <tbody>
            {data.map((hall, idx) => (
              <tr key={`${hall.hall_name}-${idx}`} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '12px', fontWeight: 'bold' }}>{hall.hall_name}</td>
                <td style={{ padding: '12px' }}>{hall.capacity}</td>
                <td style={{ padding: '12px' }}>{hall.total_classes}</td>
                <td style={{ padding: '12px' }}>{hall.total_hours || 0}h</td>
                <td style={{ padding: '12px', textAlign: 'center', color: '#d32f2f', fontWeight: 'bold' }}>{hall.mismatch_count || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

HallUtilizationTab.propTypes = {
  data: PropTypes.array.isRequired
};

export default HallUtilizationTab;