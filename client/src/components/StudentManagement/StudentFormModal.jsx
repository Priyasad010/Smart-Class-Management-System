import React, { useState, useEffect, useRef } from 'react';
import { IoClose, IoCloudUploadOutline, IoCalendarOutline, IoChevronDownOutline, IoPersonOutline, IoCallOutline, IoMailOutline, IoLocationOutline, IoSchoolOutline } from 'react-icons/io5';
import axios from 'axios';
import toast from 'react-hot-toast';

function StudentFormModal({ isOpen, onClose, studentToEdit, onSuccess }) {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    date_of_birth: '',
    gender: 'Male',
    email: '',
    phone: '',
    address: '',
    grade_class: '',
    enrollment_year: new Date().getFullYear(),
    parent_name: '',
    parent_phone_number: '',
    parent_email: '',
  });

  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (studentToEdit) {
      // Format birthdate from ISO string (YYYY-MM-DD)
      const dobFormatted = studentToEdit.date_of_birth 
        ? new Date(studentToEdit.date_of_birth).toISOString().split('T')[0]
        : '';

      setFormData({
        first_name: studentToEdit.first_name || '',
        last_name: studentToEdit.last_name || '',
        date_of_birth: dobFormatted,
        gender: studentToEdit.gender || 'Male',
        email: studentToEdit.email || '',
        phone: studentToEdit.phone || '',
        address: studentToEdit.address || '',
        grade_class: studentToEdit.grade_class || '',
        enrollment_year: studentToEdit.enrollment_year || new Date().getFullYear(),
        parent_name: studentToEdit.parent_name || '',
        parent_phone_number: studentToEdit.parent_phone_number || '',
        parent_email: studentToEdit.parent_email || '',
      });
      setPhotoPreview(studentToEdit.profile_photo_url || null);
      setPhotoFile(null);
    } else {
      setFormData({
        first_name: '',
        last_name: '',
        date_of_birth: '',
        gender: 'Male',
        email: '',
        phone: '',
        address: '',
        grade_class: '',
        enrollment_year: new Date().getFullYear(),
        parent_name: '',
        parent_phone_number: '',
        parent_email: '',
      });
      setPhotoPreview(null);
      setPhotoFile(null);
    }
  }, [studentToEdit, isOpen]);

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'enrollment_year' ? parseInt(value) || '' : value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.match('image.*')) {
        toast.error('Only JPEG and PNG image files are allowed.');
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Profile photo must be less than 2MB.');
        return;
      }
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleUploadPhoto = async (studentId) => {
    if (!photoFile) return;

    const data = new FormData();
    data.append('photo', photoFile);

    try {
      await axios.post(`/api/students/${studentId}/photo`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    } catch (err) {
      console.error('Photo upload failed:', err);
      toast.error('Student registered, but photo upload failed.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Frontend validations
    const requiredFields = ['first_name', 'last_name', 'date_of_birth', 'parent_name', 'parent_phone_number'];
    const missing = requiredFields.filter((field) => !formData[field]);

    if (missing.length > 0) {
      toast.error('Please fill in all required fields.');
      setLoading(false);
      return;
    }

    try {
      if (studentToEdit) {
        // Update Student
        const res = await axios.put(`/api/students/${studentToEdit.id}`, formData);
        
        // If there's a new photo, upload it
        if (photoFile) {
          await handleUploadPhoto(studentToEdit.id);
        }

        toast.success('Student details updated successfully!');
        onSuccess();
        onClose();
      } else {
        // Register Student
        const res = await axios.post('/api/students', formData);
        const newStudent = res.data.data;

        // If there's a photo, upload it
        if (photoFile && newStudent?.id) {
          await handleUploadPhoto(newStudent.id);
        }

        toast.success(`Successfully registered ${formData.first_name}!`);
        onSuccess();
        onClose();
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to save student profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-800/80 bg-slate-900/90 shadow-modal glass-panel p-6 sm:p-8 animate-slide-up">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-6 mb-6 border-b border-slate-800">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-sky-400">
              {studentToEdit ? 'Edit Student Details' : 'Register New Student'}
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              {studentToEdit ? `Updating STU ID: ${studentToEdit.student_id_code}` : 'Enter academic, personal and parent contact info.'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <IoClose size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Main Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Left Column: Photo Upload */}
            <div className="flex flex-col items-center justify-start space-y-4">
              <span className="text-sm font-semibold text-slate-300 self-start">Profile Photo</span>
              
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="group relative flex flex-col items-center justify-center w-full aspect-square max-w-[240px] rounded-2xl border-2 border-dashed border-slate-700 hover:border-indigo-500/60 bg-slate-900/50 cursor-pointer overflow-hidden transition-all duration-300"
              >
                {photoPreview ? (
                  <>
                    <img 
                      src={photoPreview} 
                      alt="Profile preview" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                    <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-slate-200 transition-opacity duration-200">
                      <IoCloudUploadOutline size={30} className="animate-bounce" />
                      <span className="text-xs font-medium mt-1">Replace Image</span>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center p-6 text-center text-slate-500 group-hover:text-indigo-400 transition-colors">
                    <IoCloudUploadOutline size={44} className="mb-2 text-slate-600 group-hover:text-indigo-400" />
                    <span className="text-sm font-medium">Upload JPEG / PNG</span>
                    <span className="text-xs text-slate-600 mt-1">Max Size: 2 MB</span>
                  </div>
                )}
              </div>

              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept="image/jpeg,image/png" 
              />
              
              {photoPreview && (
                <button
                  type="button"
                  onClick={() => {
                    setPhotoFile(null);
                    setPhotoPreview(null);
                  }}
                  className="text-xs text-red-400 hover:text-red-300 underline underline-offset-4 transition-colors"
                >
                  Remove photo
                </button>
              )}
            </div>

            {/* Middle & Right: Personal and Academic Info */}
            <div className="md:col-span-2 space-y-6">
              <h3 className="text-lg font-bold text-slate-200 border-l-4 border-indigo-500 pl-3">
                Personal & Academic Details
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* First Name */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                    First Name <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <IoPersonOutline className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleInputChange}
                      placeholder="e.g. John"
                      className="glass-input w-full pl-11"
                      required
                    />
                  </div>
                </div>

                {/* Last Name */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-400">
                    Last Name <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <IoPersonOutline className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleInputChange}
                      placeholder="e.g. Doe"
                      className="glass-input w-full pl-11"
                      required
                    />
                  </div>
                </div>

                {/* Date of Birth */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                    Date of Birth <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <IoCalendarOutline className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="date"
                      name="date_of_birth"
                      value={formData.date_of_birth}
                      onChange={handleInputChange}
                      className="glass-input w-full pl-11 text-slate-200"
                      required
                    />
                  </div>
                </div>

                {/* Gender */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-400">Gender</label>
                  <div className="relative">
                    <IoChevronDownOutline className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      className="glass-input w-full appearance-none pr-10"
                    >
                      <option value="Male" className="bg-slate-900">Male</option>
                      <option value="Female" className="bg-slate-900">Female</option>
                      <option value="Other" className="bg-slate-900">Other</option>
                    </select>
                  </div>
                </div>

                {/* Email */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-400">Email Address</label>
                  <div className="relative">
                    <IoMailOutline className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="e.g. john@example.com"
                      className="glass-input w-full pl-11"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-400">Phone Number</label>
                  <div className="relative">
                    <IoCallOutline className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="e.g. +94771234567"
                      className="glass-input w-full pl-11"
                    />
                  </div>
                </div>

                {/* Grade / Class */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-400">Grade / Class</label>
                  <div className="relative">
                    <IoSchoolOutline className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      name="grade_class"
                      value={formData.grade_class}
                      onChange={handleInputChange}
                      placeholder="e.g. Grade 12-A"
                      className="glass-input w-full pl-11"
                    />
                  </div>
                </div>

                {/* Enrollment Year */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-400">Enrollment Year</label>
                  <div className="relative">
                    <IoCalendarOutline className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="number"
                      name="enrollment_year"
                      value={formData.enrollment_year}
                      onChange={handleInputChange}
                      placeholder="e.g. 2026"
                      className="glass-input w-full pl-11"
                    />
                  </div>
                </div>

                {/* Address */}
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-400">Residential Address</label>
                  <div className="relative">
                    <IoLocationOutline className="absolute left-4 top-4 text-slate-500" />
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      placeholder="Enter street name, city, zip code..."
                      rows="3"
                      className="glass-input w-full pl-11 py-3 resize-none"
                    ></textarea>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Parent/Guardian Details Layer */}
          <div className="pt-6 border-t border-slate-800 space-y-6">
            <h3 className="text-lg font-bold text-slate-200 border-l-4 border-sky-500 pl-3">
              Parent / Guardian Details <span className="text-xs font-normal text-sky-400">(Required by SMS Notification System)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              {/* Parent Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                  Parent / Guardian Name <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <IoPersonOutline className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    name="parent_name"
                    value={formData.parent_name}
                    onChange={handleInputChange}
                    placeholder="e.g. Robert Doe"
                    className="glass-input w-full pl-11"
                    required
                  />
                </div>
              </div>

              {/* Parent Phone Number */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                  Parent SMS Mobile <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <IoCallOutline className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="tel"
                    name="parent_phone_number"
                    value={formData.parent_phone_number}
                    onChange={handleInputChange}
                    placeholder="e.g. +94779876543"
                    className="glass-input w-full pl-11"
                    required
                  />
                </div>
              </div>

              {/* Parent Email */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400">Parent Email Address</label>
                <div className="relative">
                  <IoMailOutline className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="email"
                    name="parent_email"
                    value={formData.parent_email}
                    onChange={handleInputChange}
                    placeholder="e.g. robert@example.com"
                    className="glass-input w-full pl-11"
                  />
                </div>
              </div>

            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="glass-btn bg-slate-800/80 hover:bg-slate-800 text-slate-300 px-6"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="glass-btn bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white min-w-[140px] px-6 shadow-glow"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
                  <span>Saving...</span>
                </div>
              ) : (
                <span>{studentToEdit ? 'Save Changes' : 'Register Student'}</span>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

export default StudentFormModal;
