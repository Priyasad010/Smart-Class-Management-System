import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { IoPaperPlaneOutline, IoSearchOutline, IoPeopleOutline, IoPersonOutline, IoChatbubbleEllipsesOutline, IoFilterOutline, IoBookOutline } from 'react-icons/io5';

function ManualSMSForm({ onSendSuccess }) {
  const [activeTab, setActiveTab] = useState('single'); // 'single' | 'bulk'
  
  // Predefined SMS templates
  const templates = [
    { label: '--- Select Predefined Template ---', value: '' },
    { label: 'Attendance: Absent Warning Alert', value: 'Dear Parent, your child [Student Name] was marked absent from class today. Please contact class admin.' },
    { label: 'Payments: Overdue Fee Notice', value: 'Dear Parent, this is a friendly notice that the course fee for [Student Name] is currently overdue. Please settle at the counter.' },
    { label: 'Examination: Results Published', value: 'Dear Parent, the exam marks for [Student Name] have been published. Please review their grades on the dashboard.' },
    { label: 'General: Holiday/Cancellation notice', value: 'Dear Parent, please note that class sessions for [Student Name] on next Monday are postponed due to holidays.' }
  ];

  // Single SMS state
  const [studentSearch, setStudentSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [singleMessage, setSingleMessage] = useState('');
  const [sendingSingle, setSendingSingle] = useState(false);

  // Bulk SMS state
  const [allStudents, setAllStudents] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [targetStudents, setTargetStudents] = useState([]); // List of students matching the class filter
  const [selectedStudentIds, setSelectedStudentIds] = useState(new Set()); // Selected students for bulk send
  const [bulkMessage, setBulkMessage] = useState('');
  const [sendingBulk, setSendingBulk] = useState(false);

  // Calculate characters and SMS Credits
  const getSMSStats = (text) => {
    const chars = text.length;
    if (chars === 0) return { chars: 0, parts: 0 };
    const parts = chars <= 160 ? 1 : Math.ceil(chars / 153);
    return { chars, parts };
  };


  // Load all students once for autocomplete / bulk targets
  const fetchAllStudents = async () => {
    try {
      const res = await axios.get('/api/students');
      if (res.data?.success) {
        setAllStudents(res.data.data);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load students directory.');
    }
  };

  useEffect(() => {
    fetchAllStudents();
  }, []);

  // Single: Autocomplete search filter
  useEffect(() => {
    if (studentSearch.trim() === '') {
      setSearchResults([]);
      return;
    }
    const query = studentSearch.toLowerCase();
    const filtered = allStudents.filter(
      s => 
        s.first_name.toLowerCase().includes(query) ||
        s.last_name.toLowerCase().includes(query) ||
        s.student_id_code.toLowerCase().includes(query)
    );
    setSearchResults(filtered.slice(0, 5)); // Limit to top 5 results
  }, [studentSearch, allStudents]);

  // Bulk: Filter students based on selected class
  useEffect(() => {
    if (!selectedClass) {
      setTargetStudents([]);
      setSelectedStudentIds(new Set());
      return;
    }
    const filtered = allStudents.filter(
      s => s.grade_class === selectedClass && s.is_active
    );
    setTargetStudents(filtered);
    // Auto-select all by default when class changes
    setSelectedStudentIds(new Set(filtered.map(s => s.id)));
  }, [selectedClass, allStudents]);

  // Extract unique classes list
  const getUniqueClasses = () => {
    const classes = new Set(allStudents.map(s => s.grade_class).filter(Boolean));
    return Array.from(classes).sort();
  };

  // Single SMS Submit handler
  const handleSendSingle = async (e) => {
    e.preventDefault();
    if (!selectedStudent) {
      toast.error('Please select a student first.');
      return;
    }
    if (!singleMessage.trim()) {
      toast.error('Please write a message to send.');
      return;
    }

    setSendingSingle(true);
    try {
      const res = await axios.post('/api/notifications/manual', {
        studentId: selectedStudent.id,
        parentPhone: selectedStudent.parent_phone_number,
        message: singleMessage
      });

      if (res.data?.success) {
        toast.success(`Message sent to parent: ${selectedStudent.parent_name}`);
        setSingleMessage('');
        setSelectedStudent(null);
        setStudentSearch('');
        if (onSendSuccess) onSendSuccess();
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to dispatch manual SMS.');
    } finally {
      setSendingSingle(false);
    }
  };

  // Bulk SMS Toggle student selection
  const handleToggleSelectStudent = (id) => {
    const updated = new Set(selectedStudentIds);
    if (updated.has(id)) {
      updated.delete(id);
    } else {
      updated.add(id);
    }
    setSelectedStudentIds(updated);
  };

  // Bulk SMS Toggle all selection
  const handleToggleSelectAll = () => {
    if (selectedStudentIds.size === targetStudents.length) {
      setSelectedStudentIds(new Set());
    } else {
      setSelectedStudentIds(new Set(targetStudents.map(s => s.id)));
    }
  };

  // Bulk SMS Submit handler
  const handleSendBulk = async (e) => {
    e.preventDefault();
    if (selectedStudentIds.size === 0) {
      toast.error('Please select at least one recipient.');
      return;
    }
    if (!bulkMessage.trim()) {
      toast.error('Please write the announcement message.');
      return;
    }

    setSendingBulk(true);
    try {
      // Build recipients list
      const recipients = targetStudents
        .filter(s => selectedStudentIds.has(s.id))
        .map(s => ({
          studentId: s.id,
          parentPhone: s.parent_phone_number
        }));

      const res = await axios.post('/api/notifications/bulk', {
        recipients,
        message: bulkMessage
      });

      if (res.data?.success) {
        const { delivered, failed } = res.data.data;
        toast.success(`Broadcast complete. Delivered: ${delivered}, Failed: ${failed}`);
        setBulkMessage('');
        setSelectedClass('');
        setSelectedStudentIds(new Set());
        if (onSendSuccess) onSendSuccess();
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to dispatch bulk announcements.');
    } finally {
      setSendingBulk(false);
    }
  };

  return (
    <div className="glass-panel bg-slate-900/50 border border-slate-800/60 rounded-3xl p-6 sm:p-8 shadow-xl max-w-4xl mx-auto">
      
      {/* Forms Tabs */}
      <div className="flex border-b border-slate-800/80 mb-6 gap-2">
        <button
          onClick={() => setActiveTab('single')}
          className={`pb-3 px-4 text-sm font-bold tracking-wide uppercase transition-all flex items-center gap-2 border-b-2 ${
            activeTab === 'single'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <IoPersonOutline size={16} />
          <span>Single Parent Message</span>
        </button>
        <button
          onClick={() => setActiveTab('bulk')}
          className={`pb-3 px-4 text-sm font-bold tracking-wide uppercase transition-all flex items-center gap-2 border-b-2 ${
            activeTab === 'bulk'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <IoPeopleOutline size={16} />
          <span>Class Bulk Announcement</span>
        </button>
      </div>

      {/* ─── TAB 1: SINGLE SMS FORM ────────────────────────────────────────── */}
      {activeTab === 'single' && (
        <form onSubmit={handleSendSingle} className="space-y-6">
          
          <div className="space-y-2 relative">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Search Student Directory
            </label>
            <div className="relative">
              <IoSearchOutline className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input
                type="text"
                placeholder="Type student name or ID (e.g. John Doe, STU-...)..."
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                className="glass-input w-full pl-11 py-3 text-sm bg-slate-950/40"
              />
            </div>

            {/* Autocomplete Results Panel */}
            {searchResults.length > 0 && (
              <div className="absolute left-0 right-0 mt-1 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-20 overflow-hidden divide-y divide-slate-800/50">
                {searchResults.map((student) => (
                  <button
                    key={student.id}
                    type="button"
                    onClick={() => {
                      setSelectedStudent(student);
                      setSearchResults([]);
                      setStudentSearch('');
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-slate-850 transition-colors flex items-center justify-between"
                  >
                    <div>
                      <h4 className="text-sm font-bold text-white">
                        {student.first_name} {student.last_name}
                      </h4>
                      <span className="text-xs text-slate-500">{student.student_id_code} — Class: {student.grade_class}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-indigo-400 font-semibold block">{student.parent_name}</span>
                      <span className="text-[10px] text-slate-500">{student.parent_phone_number}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Selected Student Details Display */}
          {selectedStudent && (
            <div className="glass-panel bg-indigo-500/5 border border-indigo-500/20 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-fadeIn">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                  <IoPersonOutline size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">
                    {selectedStudent.first_name} {selectedStudent.last_name}
                  </h4>
                  <p className="text-xs text-slate-400">Class: {selectedStudent.grade_class} | ID: {selectedStudent.student_id_code}</p>
                </div>
              </div>
              
              <div className="border-t sm:border-t-0 sm:border-l border-slate-800/80 pt-3 sm:pt-0 sm:pl-6 text-left">
                <p className="text-xs text-slate-400">Parent / Guardian Recipient:</p>
                <h5 className="text-sm font-bold text-indigo-400 mt-0.5">{selectedStudent.parent_name}</h5>
                <p className="text-xs text-slate-300 font-mono mt-0.5">{selectedStudent.parent_phone_number}</p>
              </div>
            </div>
          )}

          {/* Predefined Templates for Single SMS */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Predefined SMS Template
            </label>
            <div className="relative">
              <IoBookOutline className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <select
                onChange={(e) => {
                  const val = e.target.value;
                  if (!val) {
                    setSingleMessage('');
                    return;
                  }
                  const name = selectedStudent ? `${selectedStudent.first_name} ${selectedStudent.last_name}` : '[Student Name]';
                  setSingleMessage(val.replace('[Student Name]', name));
                }}
                className="glass-input w-full pl-11 py-3 text-sm bg-slate-950/40 text-slate-300"
              >
                {templates.map((tpl, i) => (
                  <option key={i} value={tpl.value} className="bg-slate-900">{tpl.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* SMS Text Message Box */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              SMS Message Text Content
            </label>
            <div className="relative">
              <IoChatbubbleEllipsesOutline className="absolute left-4 top-4 text-slate-500" size={18} />
              <textarea
                placeholder="Write custom SMS message text here... (e.g. parent updates, emergency notifications, academic feedback)"
                value={singleMessage}
                onChange={(e) => setSingleMessage(e.target.value)}
                maxLength={320}
                rows={4}
                className="glass-input w-full pl-11 pt-3 text-sm bg-slate-950/40 resize-none"
              />
              <div className="absolute bottom-3 right-3 flex items-center gap-2 select-none">
                <span className="text-[10px] font-mono text-slate-400 bg-slate-950/80 px-2 py-0.5 rounded border border-slate-800">
                  {getSMSStats(singleMessage).chars}/320 Chars
                </span>
                <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20 font-bold">
                  {getSMSStats(singleMessage).parts} SMS Credit{getSMSStats(singleMessage).parts !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </div>


          <button
            type="submit"
            disabled={sendingSingle || !selectedStudent || !singleMessage.trim()}
            className="w-full glass-btn bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold py-3.5 flex items-center justify-center gap-2 shadow-glow hover:shadow-indigo-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sendingSingle ? (
              <div className="w-5 h-5 rounded-full border-2 border-white/20 border-t-white animate-spin"></div>
            ) : (
              <>
                <IoPaperPlaneOutline size={18} />
                <span>Send SMS Message</span>
              </>
            )}
          </button>

        </form>
      )}

      {/* ─── TAB 2: BULK CLASS SMS FORM ────────────────────────────────────── */}
      {activeTab === 'bulk' && (
        <form onSubmit={handleSendBulk} className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Filter by Grade Class */}
            <div className="space-y-2 md:col-span-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Select Grade / Class
              </label>
              <div className="relative">
                <IoFilterOutline className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="glass-input w-full pl-11 py-3 text-sm bg-slate-950/40 text-slate-300"
                >
                  <option value="">-- Choose Class --</option>
                  {getUniqueClasses().map((cls) => (
                    <option key={cls} value={cls} className="bg-slate-900">{cls}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Selection Meta Info */}
            {selectedClass && (
              <div className="md:col-span-2 flex items-end justify-between p-3 border border-slate-800/80 bg-slate-950/20 rounded-2xl">
                <div>
                  <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wide block">Broadcasting Group</span>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Class: <span className="font-bold text-white">{selectedClass}</span> — Total Active: <span className="font-bold text-white">{targetStudents.length}</span>
                  </p>
                </div>
                
                <button
                  type="button"
                  onClick={handleToggleSelectAll}
                  className="text-xs font-bold text-indigo-400 hover:text-indigo-300 underline"
                >
                  {selectedStudentIds.size === targetStudents.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>
            )}

          </div>

          {/* Students Selection Table */}
          {selectedClass && targetStudents.length > 0 && (
            <div className="border border-slate-800/80 rounded-2xl bg-slate-950/20 overflow-hidden max-h-56 overflow-y-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900/50 border-b border-slate-800/80 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-2.5 px-4 w-12 text-center">Send</th>
                    <th className="py-2.5 px-4">Student</th>
                    <th className="py-2.5 px-4">Parent Recipient</th>
                    <th className="py-2.5 px-4">Contact Phone</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40">
                  {targetStudents.map((student) => (
                    <tr key={student.id} className="text-xs hover:bg-slate-900/40">
                      <td className="py-2.5 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={selectedStudentIds.has(student.id)}
                          onChange={() => handleToggleSelectStudent(student.id)}
                          className="w-3.5 h-3.5 rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-indigo-500"
                        />
                      </td>
                      <td className="py-2.5 px-4 font-bold text-white">
                        {student.first_name} {student.last_name}
                      </td>
                      <td className="py-2.5 px-4 text-slate-300">{student.parent_name}</td>
                      <td className="py-2.5 px-4 text-slate-400 font-mono">{student.parent_phone_number}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Predefined Templates for Bulk SMS */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Predefined SMS Template
            </label>
            <div className="relative">
              <IoBookOutline className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <select
                onChange={(e) => {
                  const val = e.target.value;
                  if (!val) {
                    setBulkMessage('');
                    return;
                  }
                  // Replace template placeholder with a generic "your child" for bulk broadcast
                  setBulkMessage(val.replace('[Student Name]', 'your child'));
                }}
                className="glass-input w-full pl-11 py-3 text-sm bg-slate-950/40 text-slate-300"
              >
                {templates.map((tpl, i) => (
                  <option key={i} value={tpl.value} className="bg-slate-900">{tpl.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* SMS Broadcast text message box */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Broadcast Announcement Message
            </label>
            <div className="relative">
              <IoChatbubbleEllipsesOutline className="absolute left-4 top-4 text-slate-500" size={18} />
              <textarea
                placeholder="Write bulk announcement message to blast... (e.g. school closure notification, parents-teachers meeting, general announcement)"
                value={bulkMessage}
                onChange={(e) => setBulkMessage(e.target.value)}
                maxLength={320}
                rows={4}
                className="glass-input w-full pl-11 pt-3 text-sm bg-slate-950/40 resize-none"
              />
              <div className="absolute bottom-3 right-3 flex items-center gap-2 select-none">
                <span className="text-[10px] font-mono text-slate-400 bg-slate-950/80 px-2 py-0.5 rounded border border-slate-800">
                  {getSMSStats(bulkMessage).chars}/320 Chars
                </span>
                <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20 font-bold">
                  {getSMSStats(bulkMessage).parts} SMS Credit{getSMSStats(bulkMessage).parts !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </div>


          <button
            type="submit"
            disabled={sendingBulk || selectedStudentIds.size === 0 || !bulkMessage.trim()}
            className="w-full glass-btn bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold py-3.5 flex items-center justify-center gap-2 shadow-glow hover:shadow-indigo-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sendingBulk ? (
              <div className="w-5 h-5 rounded-full border-2 border-white/20 border-t-white animate-spin"></div>
            ) : (
              <>
                <IoPaperPlaneOutline size={18} />
                <span>Broadcast Announcement ({selectedStudentIds.size} Parents)</span>
              </>
            )}
          </button>

        </form>
      )}

    </div>
  );
}

export default ManualSMSForm;
