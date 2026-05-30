import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { IoAddOutline, IoBookOutline, IoLibraryOutline } from 'react-icons/io5';

function SubjectManagementForm({ subjects, fetchSubjects }) {
  const [formData, setFormData] = useState({
    subjectCode: '',
    subjectName: '',
    grade: '',
    courseType: 'O/L'
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.subjectCode || !formData.subjectName || !formData.grade) {
      toast.error('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post('/api/teachers/subjects', formData);
      if (res.data?.success) {
        toast.success(`Subject ${formData.subjectName} created successfully!`);
        setFormData({
          subjectCode: '',
          subjectName: '',
          grade: '',
          courseType: 'O/L'
        });
        if (fetchSubjects) fetchSubjects();
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to create subject.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* ─── CREATE SUBJECT CARD ───────────────────────────────────────────── */}
      <div className="glass-panel bg-slate-900/40 border border-slate-800/60 rounded-3xl p-6 sm:p-8 h-fit space-y-6">
        
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <IoAddOutline size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Create New Subject</h3>
            <p className="text-xs text-slate-400">Define subjects and curricula codes.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Subject Code */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Subject Code *</label>
            <input
              type="text"
              name="subjectCode"
              placeholder="e.g. SUB-ENG-OL"
              value={formData.subjectCode}
              onChange={handleChange}
              className="glass-input w-full px-4 py-2.5 text-sm bg-slate-950/40 text-white"
              required
            />
          </div>

          {/* Subject Name */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Subject Name *</label>
            <input
              type="text"
              name="subjectName"
              placeholder="e.g. English Language"
              value={formData.subjectName}
              onChange={handleChange}
              className="glass-input w-full px-4 py-2.5 text-sm bg-slate-950/40 text-white"
              required
            />
          </div>

          {/* Grade */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Target Grade/Class *</label>
            <input
              type="text"
              name="grade"
              placeholder="e.g. Grade 10, Grade 11"
              value={formData.grade}
              onChange={handleChange}
              className="glass-input w-full px-4 py-2.5 text-sm bg-slate-950/40 text-white"
              required
            />
          </div>

          {/* Course Type */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Course Stream Classification</label>
            <select
              name="courseType"
              value={formData.courseType}
              onChange={handleChange}
              className="glass-input w-full py-2.5 text-sm bg-slate-950/40 text-slate-300"
            >
              <option value="O/L">Ordinary Level (O/L)</option>
              <option value="A/L">Advanced Level (A/L)</option>
              <option value="Professional">Professional Course</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full glass-btn bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold py-3.5 flex items-center justify-center gap-2 shadow-glow hover:shadow-indigo-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="w-5 h-5 rounded-full border-2 border-white/20 border-t-white animate-spin"></div>
            ) : (
              <>
                <IoAddOutline size={18} />
                <span>Add Subject</span>
              </>
            )}
          </button>

        </form>

      </div>

      {/* ─── SUBJECT MATRIX CATALOGUE ────────────────────────────────────────── */}
      <div className="glass-panel bg-slate-900/40 border border-slate-800/60 rounded-3xl p-6 sm:p-8 lg:col-span-2 space-y-6">
        
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <IoLibraryOutline size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Subject Matrix Catalogue</h3>
            <p className="text-xs text-slate-400">Inventory of academic courses currently active.</p>
          </div>
        </div>

        {subjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-20 text-center">
            <div className="w-14 h-14 rounded-2xl bg-slate-850 flex items-center justify-center text-slate-600 border border-slate-800/80 mb-4">
              <IoBookOutline size={26} />
            </div>
            <h4 className="text-white font-bold text-base">No Subjects Registered</h4>
            <p className="text-slate-500 text-xs mt-1">Create subjects to link to faculty members.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[460px] overflow-y-auto pr-2">
            {subjects.map((sub) => (
              <div
                key={sub.id}
                className="glass-panel bg-slate-950/20 border border-slate-800/60 rounded-2xl p-4 flex items-center justify-between hover:border-slate-700 transition-all select-none"
              >
                <div className="space-y-1">
                  <span className="text-[10px] font-mono font-bold text-indigo-400 bg-indigo-500/5 border border-indigo-500/10 px-2 py-0.5 rounded">
                    {sub.subject_code}
                  </span>
                  <h4 className="text-sm font-bold text-white pt-1">{sub.subject_name}</h4>
                  <p className="text-xs text-slate-400">Grade Target: {sub.grade}</p>
                </div>
                
                <div className="text-right">
                  <span className="text-[10px] font-extrabold uppercase tracking-wide px-2.5 py-1 rounded-full bg-slate-850 text-slate-300 border border-slate-800">
                    {sub.course_type}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

    </div>
  );
}

export default SubjectManagementForm;
