import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { IoPersonAddOutline, IoMailOutline, IoCallOutline, IoSchoolOutline, IoBriefcaseOutline } from 'react-icons/io5';

function TeacherRegistrationForm({ onRegisterSuccess }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    qualification: '',
    specialization: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
      toast.error('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post('/api/teachers', formData);
      if (res.data?.success) {
        toast.success(`Successfully registered ${formData.firstName} ${formData.lastName}!`);
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          qualification: '',
          specialization: ''
        });
        if (onRegisterSuccess) onRegisterSuccess();
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to register teacher.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel bg-slate-900/40 border border-slate-800/60 rounded-3xl p-6 sm:p-8 max-w-2xl mx-auto shadow-xl relative overflow-hidden">
      
      {/* Decorative Glow */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
          <IoPersonAddOutline size={20} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Register New Teacher</h3>
          <p className="text-xs text-slate-400">Add profile credentials for institution tutors.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* First Name */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">First Name *</label>
            <input
              type="text"
              name="firstName"
              placeholder="e.g. Ruwan"
              value={formData.firstName}
              onChange={handleChange}
              className="glass-input w-full px-4 py-2.5 text-sm bg-slate-950/40 text-white"
              required
            />
          </div>

          {/* Last Name */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Last Name *</label>
            <input
              type="text"
              name="lastName"
              placeholder="e.g. Perera"
              value={formData.lastName}
              onChange={handleChange}
              className="glass-input w-full px-4 py-2.5 text-sm bg-slate-950/40 text-white"
              required
            />
          </div>

        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Email Address */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Email Address *</label>
            <div className="relative">
              <IoMailOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input
                type="email"
                name="email"
                placeholder="e.g. ruwan@academy.com"
                value={formData.email}
                onChange={handleChange}
                className="glass-input w-full pl-10 pr-4 py-2.5 text-sm bg-slate-950/40 text-white"
                required
              />
            </div>
          </div>

          {/* Phone Number */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Phone Number *</label>
            <div className="relative">
              <IoCallOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input
                type="text"
                name="phone"
                placeholder="e.g. 0771234567"
                value={formData.phone}
                onChange={handleChange}
                className="glass-input w-full pl-10 pr-4 py-2.5 text-sm bg-slate-950/40 text-white"
                required
              />
            </div>
          </div>

        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Specialization Area */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Subject Specialization</label>
            <div className="relative">
              <IoBriefcaseOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input
                type="text"
                name="specialization"
                placeholder="e.g. Advanced Level Physics"
                value={formData.specialization}
                onChange={handleChange}
                className="glass-input w-full pl-10 pr-4 py-2.5 text-sm bg-slate-950/40 text-white"
              />
            </div>
          </div>

          {/* Qualifications */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Qualifications Description</label>
            <div className="relative">
              <IoSchoolOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input
                type="text"
                name="qualification"
                placeholder="e.g. BSc (Hons) in Physics"
                value={formData.qualification}
                onChange={handleChange}
                className="glass-input w-full pl-10 pr-4 py-2.5 text-sm bg-slate-950/40 text-white"
              />
            </div>
          </div>

        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full glass-btn bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold py-3.5 flex items-center justify-center gap-2 shadow-glow hover:shadow-indigo-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="w-5 h-5 rounded-full border-2 border-white/20 border-t-white animate-spin"></div>
          ) : (
            <>
              <IoPersonAddOutline size={18} />
              <span>Register Teacher</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}

export default TeacherRegistrationForm;
