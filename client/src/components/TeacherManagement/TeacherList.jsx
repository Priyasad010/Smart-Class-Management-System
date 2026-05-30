import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { IoSearchOutline, IoFilterOutline, IoBriefcaseOutline, IoCheckmarkCircleOutline, IoCloseCircleOutline, IoLinkOutline, IoShieldCheckmarkOutline } from 'react-icons/io5';

function TeacherList({ teachers, fetchTeachers, subjects, fetchSubjects }) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState(null); // For assigning subjects modal
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [mappingLoading, setMappingLoading] = useState(false);

  // Filter teachers locally
  const getFilteredTeachers = () => {
    return teachers.filter((teacher) => {
      const q = search.toLowerCase();
      const matchesSearch =
        teacher.first_name.toLowerCase().includes(q) ||
        teacher.last_name.toLowerCase().includes(q) ||
        teacher.email.toLowerCase().includes(q) ||
        (teacher.specialization && teacher.specialization.toLowerCase().includes(q)) ||
        teacher.teacher_id_code.toLowerCase().includes(q);

      const matchesStatus =
        !statusFilter ||
        (statusFilter === 'active' && teacher.is_active) ||
        (statusFilter === 'inactive' && !teacher.is_active);

      return matchesSearch && matchesStatus;
    });
  };

  const filteredTeachers = getFilteredTeachers();

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const res = await axios.patch(`/api/teachers/${id}/status`, { isActive: !currentStatus });
      if (res.data?.success) {
        toast.success(`Teacher set to ${!currentStatus ? 'Active' : 'Inactive'}`);
        fetchTeachers();
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to toggle teacher status.');
    }
  };

  const handleAssignSubject = async (e) => {
    e.preventDefault();
    if (!selectedSubjectId) {
      toast.error('Please select a subject to assign.');
      return;
    }

    setMappingLoading(true);
    try {
      const res = await axios.post('/api/teachers/assign-subject', {
        teacherId: selectedTeacher.id,
        subjectId: parseInt(selectedSubjectId, 10)
      });
      if (res.data?.success) {
        toast.success(`Assigned subject to ${selectedTeacher.first_name} successfully!`);
        setSelectedTeacher(null);
        setSelectedSubjectId('');
        fetchTeachers(); // Refetch database data to update mapped subject tags
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to map teacher to subject.');
    } finally {
      setMappingLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* ─── FILTRATION BAR ────────────────────────────────────────────────── */}
      <div className="glass-panel bg-slate-900/50 border border-slate-800/60 rounded-3xl p-5 flex flex-col sm:flex-row items-center gap-4 justify-between select-none">
        
        {/* Search */}
        <div className="relative w-full sm:max-w-md">
          <IoSearchOutline className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input
            type="text"
            placeholder="Search teachers by name, credentials or specialization..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="glass-input w-full pl-11 py-2.5 text-sm bg-slate-950/40"
          />
        </div>

        {/* Filters */}
        <div className="flex w-full sm:w-auto items-center gap-3">
          <div className="relative flex-1 sm:flex-none">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="glass-input w-full py-2.5 text-sm bg-slate-950/40 text-slate-300 pr-8"
            >
              <option value="">All Statuses</option>
              <option value="active">Active Tutors</option>
              <option value="inactive">Inactive Tutors</option>
            </select>
          </div>
        </div>

      </div>

      {/* ─── DIRECTORY TABLE ────────────────────────────────────────────────── */}
      <div className="glass-panel bg-slate-900/40 border border-slate-800/50 rounded-3xl overflow-hidden shadow-lg">
        {filteredTeachers.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-20 text-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-850 flex items-center justify-center text-slate-600 border border-slate-800/80 mb-4">
              <IoBriefcaseOutline size={26} />
            </div>
            <h4 className="text-white font-bold text-base">No Teachers Found</h4>
            <p className="text-slate-500 text-xs mt-1">Try resetting filters or registering a new teacher.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900/80 border-b border-slate-850/80 text-xs font-bold text-slate-500 uppercase tracking-wider select-none">
                  <th className="py-4 px-6">Teacher ID</th>
                  <th className="py-4 px-6">Name / Contact</th>
                  <th className="py-4 px-6">Specialization / Qualifications</th>
                  <th className="py-4 px-6 text-center">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850/40 text-xs sm:text-sm">
                {filteredTeachers.map((teacher) => (
                  <tr key={teacher.id} className="hover:bg-slate-850/20 transition-colors">
                    
                    {/* ID CODE */}
                    <td className="py-4 px-6 font-mono font-bold text-indigo-400">
                      {teacher.teacher_id_code}
                    </td>

                    {/* Name / Contact */}
                    <td className="py-4 px-6">
                      <div className="flex flex-col">
                        <span className="font-bold text-white">{teacher.first_name} {teacher.last_name}</span>
                        <span className="text-xs text-slate-400 mt-0.5">{teacher.email}</span>
                        <span className="text-[10px] text-slate-500 font-mono mt-0.5">{teacher.phone}</span>
                      </div>
                    </td>

                    {/* Qualifications & Assigned Subjects list */}
                    <td className="py-4 px-6 text-slate-300">
                      <div className="flex flex-col gap-1.5">
                        <div>
                          <span className="font-semibold text-slate-200 block">{teacher.specialization || 'General Tutor'}</span>
                          <span className="text-xs text-slate-400 italic mt-0.5 block">{teacher.qualification || 'No listed qualification'}</span>
                        </div>
                        {/* Display assigned subjects tags with safe parsing */}
                        {(() => {
                          let subs = [];
                          if (Array.isArray(teacher.assigned_subjects)) {
                            subs = teacher.assigned_subjects;
                          } else if (typeof teacher.assigned_subjects === 'string') {
                            try {
                              subs = JSON.parse(teacher.assigned_subjects);
                            } catch (e) {
                              subs = [];
                            }
                          }
                          // Filter out empty or null items
                          subs = subs.filter(s => s && s.subject_code);
                          
                          if (subs.length === 0) return null;
                          
                          return (
                            <div className="flex flex-wrap gap-1.5 mt-1">
                              {subs.map((sub, i) => (
                                <span key={i} className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 select-none">
                                  {sub.subject_code} - {sub.subject_name}
                                </span>
                              ))}
                            </div>
                          );
                        })()}
                      </div>
                    </td>



                    {/* Status Badge */}
                    <td className="py-4 px-6 text-center">
                      <button
                        onClick={() => handleToggleStatus(teacher.id, teacher.is_active)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide border cursor-pointer hover:scale-105 transition-all ${
                          teacher.is_active
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        }`}
                      >
                        {teacher.is_active ? (
                          <>
                            <IoCheckmarkCircleOutline size={12} />
                            <span>Active</span>
                          </>
                        ) : (
                          <>
                            <IoCloseCircleOutline size={12} />
                            <span>Inactive</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* Actions: Map to Subject */}
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => setSelectedTeacher(teacher)}
                        className="glass-btn bg-slate-800 hover:bg-slate-700 text-indigo-400 hover:text-white px-3 py-2 text-xs flex items-center gap-1.5 shrink-0 inline-flex"
                      >
                        <IoLinkOutline size={14} />
                        <span>Assign Subject</span>
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ─── ASSIGN SUBJECT MODAL TOOL ───────────────────────────────────────── */}
      {selectedTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="glass-panel bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6 relative">
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <IoShieldCheckmarkOutline size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Assign Subject Mapping</h3>
                <p className="text-xs text-slate-400">Associate subject to {selectedTeacher.first_name}</p>
              </div>
            </div>

            <form onSubmit={handleAssignSubject} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Available Subjects Matrix</label>
                <select
                  value={selectedSubjectId}
                  onChange={(e) => setSelectedSubjectId(e.target.value)}
                  className="glass-input w-full py-3 text-sm bg-slate-950/40 text-slate-300"
                  required
                >
                  <option value="">-- Choose Subject --</option>
                  {subjects.map((sub) => (
                    <option key={sub.id} value={sub.id} className="bg-slate-900">
                      [{sub.subject_code}] {sub.subject_name} — {sub.grade} ({sub.course_type})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setSelectedTeacher(null)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={mappingLoading || !selectedSubjectId}
                  className="glass-btn bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider flex items-center gap-2"
                >
                  {mappingLoading ? (
                    <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin"></div>
                  ) : (
                    <span>Assign Subject</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default TeacherList;
