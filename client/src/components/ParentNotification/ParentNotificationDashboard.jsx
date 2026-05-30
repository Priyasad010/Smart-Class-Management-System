import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { IoNotificationsOutline, IoSendOutline, IoNewspaperOutline, IoCheckmarkDoneOutline, IoWarningOutline, IoRefreshOutline } from 'react-icons/io5';

import ManualSMSForm from './ManualSMSForm';
import SMSLogsTable from './SMSLogsTable';

function ParentNotificationDashboard() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState('send'); // 'send' | 'history'

  // Metric stats
  const [metrics, setMetrics] = useState({
    total: 0,
    delivered: 0,
    failed: 0,
    successRate: 100
  });

  const fetchSMSLogs = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/notifications/logs');
      if (res.data?.success) {
        const data = res.data.data;
        setLogs(data);
        calculateMetrics(data);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load SMS notification logs.');
    } finally {
      setLoading(false);
    }
  };

  const calculateMetrics = (logList) => {
    const total = logList.length;
    const delivered = logList.filter(l => l.status === 'Delivered').length;
    const failed = total - delivered;
    const successRate = total > 0 ? Math.round((delivered / total) * 100) : 100;

    setMetrics({
      total,
      delivered,
      failed,
      successRate
    });
  };

  useEffect(() => {
    fetchSMSLogs();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-8 min-h-screen">
      
      {/* ========================================== */}
      {/* 1. HEADER SECTION (Glassmorphic Accent)    */}
      {/* ========================================== */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 border-slate-800 bg-slate-900/60 relative overflow-hidden select-none">
        
        {/* Glow Accent inside Header */}
        <div className="absolute top-[-50%] right-[-10%] w-[30%] h-[150%] bg-violet-500/10 blur-[80px] rounded-full rotate-12 -z-10"></div>
        
        <div className="flex items-center gap-4 text-center md:text-left flex-col md:flex-row">
          <div className="w-14 h-14 rounded-2xl bg-violet-500/20 flex items-center justify-center border border-violet-500/30 text-violet-400">
            <IoNotificationsOutline size={32} className="animate-bounce" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
              Parent Notification Center
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-xl">
              Send SMS announcements, broadcast class updates, dispatch custom individual notices, and audit delivery history log logs.
            </p>
          </div>
        </div>

        {/* Action Button: Refresh Database */}
        <button
          onClick={fetchSMSLogs}
          className="glass-btn bg-slate-850 hover:bg-slate-800 border border-slate-800 text-slate-300 font-bold px-5 py-3 flex items-center gap-2 shrink-0 group"
        >
          <IoRefreshOutline size={20} className="group-hover:rotate-180 transition-transform duration-500" />
          <span>Refresh Logs</span>
        </button>

      </div>

      {/* ========================================== */}
      {/* 2. STATS OVERVIEW METRICS                  */}
      {/* ========================================== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 select-none animate-fadeIn">
        
        {/* Total SMS Sent Card */}
        <div className="glass-panel bg-slate-900/40 border border-slate-800/40 rounded-2xl p-5 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Dispatched</span>
            <h3 className="text-3xl font-extrabold text-white mt-1">{metrics.total}</h3>
          </div>
          <div className="w-11 h-11 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
            <IoSendOutline size={20} />
          </div>
        </div>

        {/* Successfully Delivered Card */}
        <div className="glass-panel bg-slate-900/40 border border-slate-800/40 rounded-2xl p-5 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Delivered SMS</span>
            <h3 className="text-3xl font-extrabold text-emerald-400 mt-1">{metrics.delivered}</h3>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <IoCheckmarkDoneOutline size={20} />
          </div>
        </div>

        {/* Failed Deliveries Card */}
        <div className="glass-panel bg-slate-900/40 border border-slate-800/40 rounded-2xl p-5 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Failed Delivery</span>
            <h3 className="text-3xl font-extrabold text-rose-400 mt-1">{metrics.failed}</h3>
          </div>
          <div className="w-11 h-11 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
            <IoWarningOutline size={20} />
          </div>
        </div>

        {/* Success Delivery Rate Card */}
        <div className="glass-panel bg-slate-900/40 border border-slate-800/40 rounded-2xl p-5 flex items-center justify-between shadow-sm">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Success Rate</span>
            <h3 className="text-3xl font-extrabold text-sky-400 mt-1">{metrics.successRate}%</h3>
          </div>
          <div className="w-11 h-11 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
            <div className="font-extrabold text-sm">{metrics.successRate}%</div>
          </div>
        </div>

      </div>

      {/* ========================================== */}
      {/* 3. NAVIGATION VIEW TOGGLES                 */}
      {/* ========================================== */}
      <div className="flex border-b border-slate-800 justify-start items-center gap-4">
        <button
          onClick={() => setActiveSubTab('send')}
          className={`pb-4 px-6 text-sm font-bold tracking-wide uppercase transition-all border-b-2 ${
            activeSubTab === 'send'
              ? 'border-violet-500 text-violet-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Dispatch Console
        </button>
        <button
          onClick={() => setActiveSubTab('history')}
          className={`pb-4 px-6 text-sm font-bold tracking-wide uppercase transition-all border-b-2 ${
            activeSubTab === 'history'
              ? 'border-violet-500 text-violet-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Delivery Audit logs ({logs.length})
        </button>
      </div>

      {/* ========================================== */}
      {/* 4. ACTIVE VIEW COMPONENT MOUNTING         */}
      {/* ========================================== */}
      <div className="transition-all duration-300">
        {activeSubTab === 'send' ? (
          <ManualSMSForm onSendSuccess={fetchSMSLogs} />
        ) : (
          <SMSLogsTable logs={logs} loading={loading} onPurgeSuccess={fetchSMSLogs} />
        )}
      </div>


    </div>
  );
}

export default ParentNotificationDashboard;
