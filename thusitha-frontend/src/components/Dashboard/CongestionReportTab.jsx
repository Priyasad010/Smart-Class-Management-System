import React from 'react';
import PropTypes from 'prop-types';
import { Bar } from 'react-chartjs-2';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useNotification } from '../../context/NotificationContext';

const CongestionReportTab = ({ data }) => {
  const { showNotification } = useNotification();

  const chartData = {
    labels: data.map(d => d.hall_name),
    datasets: [
      {
        label: 'භාවිතාව ඉක්මවූ වාර ගණන (Over-capacity Incidents)',
        data: data.map(d => d.incident_count),
        backgroundColor: 'rgba(211, 47, 47, 0.7)',
        borderRadius: 5,
      }
    ]
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(18);
    doc.setTextColor(26, 35, 126);
    doc.text('Thusitha Smart Class - Hall Congestion History', 14, 20);
    
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);

    // Table
    const tableColumn = ["Hall Name", "Incident Count", "Highest Peak", "Avg. Duration"];
    const tableRows = data.map(row => [
      row.hall_name,
      row.incident_count,
      row.highest_peak,
      `${row.avg_duration || 0} mins`
    ]);

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 40,
      theme: 'grid',
      headStyles: { fillColor: [211, 47, 47] } // Red theme for safety reports
    });

    doc.save(`Congestion_History_Report_${new Date().toISOString().split('T')[0]}.pdf`);
    showNotification('වාර්තාව සාර්ථකව බාගත කළා!');
  };

  return (
    <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '15px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ color: '#1a237e', margin: 0 }}>⚠️ ශාලා තදබදය පිළිබඳ වාර්තාව (Congestion History)</h3>
        <button 
          onClick={handleDownloadPDF}
          disabled={data.length === 0}
          style={{ padding: '10px 20px', backgroundColor: '#d32f2f', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          🖨️ PDF වාර්තාව ලබාගන්න
        </button>
      </div>
      
      <div style={{ height: '300px', marginBottom: '30px' }}>
        <Bar data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
      </div>

      <h4 style={{ marginBottom: '15px' }}>විස්තරාත්මක දත්ත</h4>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: '#f5f5f5', textAlign: 'left' }}>
            <th style={{ padding: '12px' }}>ශාලාව</th>
            <th style={{ padding: '12px', textAlign: 'center' }}>වාර ගණන</th>
            <th style={{ padding: '12px', textAlign: 'center' }}>උපරිම ශිෂ්‍ය සංඛ්‍යාව</th>
            <th style={{ padding: '12px', textAlign: 'center' }}>සාමාන්‍ය කාලය</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.hall_name} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '12px', fontWeight: 'bold' }}>{row.hall_name}</td>
              <td style={{ padding: '12px', textAlign: 'center', color: '#d32f2f', fontWeight: 'bold' }}>{row.incident_count}</td>
              <td style={{ padding: '12px', textAlign: 'center' }}>{row.highest_peak}</td>
              <td style={{ padding: '12px', textAlign: 'center' }}>{row.avg_duration || 0} min</td>
            </tr>
          ))}
          {data.length === 0 && (
            <tr><td colSpan="3" style={{ padding: '20px', textAlign: 'center', color: '#888' }}>දැනට වාර්තා නොමැත.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

CongestionReportTab.propTypes = {
  data: PropTypes.array.isRequired
};

export default CongestionReportTab;