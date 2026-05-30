import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { IoSearchOutline, IoFilterOutline, IoCalendarOutline, IoCheckmarkCircleOutline, IoCloseCircleOutline, IoTrashOutline } from 'react-icons/io5';

function SMSLogsTable({ logs, loading, onPurgeSuccess }) {
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedType, setSelectedType] = useState('');

  const handlePurge = async () => {
    if (!window.confirm('🚨 WARNING: Are you absolutely sure you want to permanently delete all SMS logs from the database? This action is irreversible.')) {
      return;
    }
    try {
      const res = await axios.delete('/api/notifications/purge');
      if (res.data?.success) {
        toast.success('All SMS logs have been successfully cleared.');
        if (onPurgeSuccess) onPurgeSuccess();
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to purge database SMS logs.');
    }
  };


  // Filter logs locally based on search term, status, type
  const getFilteredLogs = () => {
    return logs.filter((log) => {
      const query = search.toLowerCase();
      const matchesSearch = 
        log.parent_phone.toLowerCase().includes(query) ||
        (log.student_name && log.student_name.toLowerCase().includes(query)) ||
        log.message.toLowerCase().includes(query);

      const matchesStatus = !selectedStatus || log.status === selectedStatus;
      const matchesType = !selectedType || log.type === selectedType;

      return matchesSearch && matchesStatus && matchesType;
    });
  };

  const filteredLogs = getFilteredLogs();

  return (
    <div className="space-y-6">
      
      {/* ─── FILTRATION BAR ────────────────────────────────────────────────── */}
      <div className="glass-panel bg-slate-900/50 border border-slate-800/60 rounded-3xl p-5 flex flex-col sm:flex-row items-center gap-4 justify-between">
        
        {/* Search field */}
        <div className="relative w-full sm:max-w-md">
          <IoSearchOutline className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input
            type="text"
            placeholder="Search logs by phone, student name or message text..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="glass-input w-full pl-11 py-2.5 text-sm bg-slate-950/40"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex w-full sm:w-auto items-center gap-3">
          
          {/* Status Dropdown */}
          <div className="relative flex-1 sm:flex-none">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="glass-input w-full py-2.5 text-sm bg-slate-950/40 text-slate-300 pr-8"
            >
              <option value="">All Statuses</option>
              <option value="Delivered">Delivered</option>
              <option value="Failed">Failed</option>
            </select>
          </div>

          {/* Type Dropdown */}
          <div className="relative flex-1 sm:flex-none">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="glass-input w-full py-2.5 text-sm bg-slate-950/40 text-slate-300 pr-8"
            >
              <option value="">All Types</option>
              <option value="Manual">Manual</option>
              <option value="Bulk">Bulk Announcement</option>
            </select>
          </div>

          {/* Purge Logs Button */}
          <button
            type="button"
            onClick={handlePurge}
            disabled={logs.length === 0}
            className="glass-btn bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-455 font-bold px-4 py-2.5 rounded-xl text-sm flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <IoTrashOutline size={16} />
            <span>Purge Logs</span>
          </button>

        </div>

      </div>


      {/* ─── LOGS HISTORY TABLE ────────────────────────────────────────────── */}
      <div className="glass-panel bg-slate-900/40 border border-slate-800/50 rounded-3xl overflow-hidden shadow-lg">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-24 text-center">
            <div className="w-12 h-12 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin mb-4"></div>
            <span className="text-slate-400 font-medium text-sm">Querying database...</span>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-20 text-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-850 flex items-center justify-center text-slate-600 border border-slate-800/80 mb-4">
              <IoCalendarOutline size={26} />
            </div>
            <h4 className="text-white font-bold text-base">No Matching Logs Found</h4>
            <p className="text-slate-500 text-xs mt-1">There are no matching notifications logged in this range.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900/80 border-b border-slate-850/80 text-xs font-bold text-slate-500 uppercase tracking-wider select-none">
                  <th className="py-4 px-6">Recipient Phone</th>
                  <th className="py-4 px-6">Linked Student</th>
                  <th className="py-4 px-6">Message Content</th>
                  <th className="py-4 px-6 w-32 text-center">Class / Type</th>
                  <th className="py-4 px-6 w-32 text-center">Delivery Status</th>
                  <th className="py-4 px-6 w-44">Sent Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850/40 text-xs sm:text-sm">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-850/20 transition-colors">
                    
                    {/* Recipient Phone */}
                    <td className="py-4 px-6 font-mono font-semibold text-white">
                      {log.parent_phone}
                    </td>
                    
                    {/* Student Name */}
                    <td className="py-4 px-6 text-slate-300">
                      {log.student_name ? (
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-200">{log.student_name}</span>
                          <span className="text-[10px] text-indigo-400">ID Ref: {log.student_id}</span>
                        </div>
                      ) : (
                        <span className="text-slate-500 italic">Unlinked Recipient</span>
                      )}
                    </td>

                    {/* Message Body */}
                    <td className="py-4 px-6 text-slate-400 max-w-sm break-words leading-relaxed">
                      {log.message}
                    </td>

                    {/* Notification Classification Type */}
                    <td className="py-4 px-6 text-center">
                      <span className={`inline-flex items-center px-2.5 py-1.5 rounded-xl text-[10px] font-extrabold uppercase tracking-wide border ${
                        log.type === 'Bulk'
                          ? 'bg-violet-500/10 text-violet-400 border-violet-500/25'
                          : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/25'
                      }`}>
                        {log.type}
                      </span>
                    </td>

                    {/* Delivery Status Badge */}
                    <td className="py-4 px-6 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[10px] font-extrabold uppercase tracking-wide border ${
                        log.status === 'Delivered'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      }`}>
                        {log.status === 'Delivered' ? (
                          <>
                            <IoCheckmarkCircleOutline size={12} />
                            <span>Delivered</span>
                          </>
                        ) : (
                          <>
                            <IoCloseCircleOutline size={12} />
                            <span>Failed</span>
                          </>
                        )}
                      </span>
                    </td>

                    {/* Sent Timestamp */}
                    <td className="py-4 px-6 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                      {new Date(log.sent_at).toLocaleString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                      })}
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}

export default SMSLogsTable;
