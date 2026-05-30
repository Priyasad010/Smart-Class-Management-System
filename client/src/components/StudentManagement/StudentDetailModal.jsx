import React from 'react';
import { IoClose, IoPrintOutline, IoDownloadOutline, IoMailOutline, IoCallOutline, IoCalendarOutline, IoLocationOutline, IoSchoolOutline } from 'react-icons/io5';
import toast from 'react-hot-toast';

function StudentDetailModal({ isOpen, onClose, student }) {
  if (!isOpen || !student) return null;

  const birthDateFormatted = student.date_of_birth
    ? new Date(student.date_of_birth).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'N/A';

  const registerDateFormatted = student.created_at
    ? new Date(student.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'N/A';

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadQR = async () => {
    if (!student.qr_code_url) {
      toast.error('No QR code available to download.');
      return;
    }
    try {
      const response = await fetch(student.qr_code_url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `QR-${student.student_id_code}-${student.first_name}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      toast.success('QR Code downloaded successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to download QR code image.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl overflow-y-auto rounded-3xl border border-slate-800/80 bg-slate-900/90 shadow-modal glass-panel p-6 sm:p-8 animate-slide-up">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors z-10"
        >
          <IoClose size={22} />
        </button>

        {/* Action Panel: Print and Download */}
        <div className="flex gap-2 mb-6 select-none">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 transition-all active:scale-95"
          >
            <IoPrintOutline size={16} />
            <span>Print Student Badge</span>
          </button>
          <button
            onClick={handleDownloadQR}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/20 transition-all active:scale-95"
          >
            <IoDownloadOutline size={16} />
            <span>Download QR</span>
          </button>
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          
          {/* Left Panel: Profile Badge Design (Printers target this) */}
          <div className="md:col-span-2 flex flex-col items-center justify-center">
            
            {/* Print Area - Contains the beautiful Student Badge structure */}
            <div 
              id="print-badge-area"
              className="w-full max-w-[260px] p-6 rounded-3xl border border-slate-700/80 bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950/60 shadow-xl flex flex-col items-center text-center space-y-4 relative overflow-hidden"
            >
              {/* Premium Glow Accents */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 blur-xl rounded-full"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-sky-500/10 blur-xl rounded-full"></div>

              {/* Status Ribbon */}
              <span className={`absolute top-4 right-4 text-[10px] font-extrabold tracking-wider uppercase px-2 py-0.5 rounded-full ${
                student.is_active 
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25' 
                  : 'bg-rose-500/15 text-rose-400 border border-rose-500/25'
              }`}>
                {student.is_active ? 'Active' : 'Inactive'}
              </span>

              {/* Student Photo */}
              <div className="w-28 h-28 rounded-full border-4 border-slate-800 shadow-md overflow-hidden relative">
                {student.profile_photo_url ? (
                  <img 
                    src={student.profile_photo_url} 
                    alt={`${student.first_name} ${student.last_name}`} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-slate-800 flex items-center justify-center text-indigo-400 font-extrabold text-3xl uppercase">
                    {student.first_name[0]}{student.last_name[0]}
                  </div>
                )}
              </div>

              {/* Name and ID */}
              <div>
                <h4 className="text-lg font-bold text-white leading-tight">
                  {student.first_name} {student.last_name}
                </h4>
                <p className="text-xs font-bold text-indigo-400 tracking-wide mt-1">
                  {student.student_id_code}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {student.grade_class || 'Class details pending'}
                </p>
              </div>

              {/* Interactive QR Code Display */}
              <div className="p-2 bg-white rounded-2xl shadow-inner inline-block">
                {student.qr_code_url ? (
                  <img 
                    src={student.qr_code_url} 
                    alt="Student QR Code" 
                    className="w-32 h-32 object-contain"
                  />
                ) : (
                  <div className="w-32 h-32 flex items-center justify-center text-xs text-slate-500">
                    No QR code
                  </div>
                )}
              </div>

              {/* Smart Class Label */}
              <div className="w-full pt-3 border-t border-slate-800/80">
                <span className="text-[9px] font-extrabold tracking-widest uppercase text-slate-500">
                  Smart Class Badge
                </span>
              </div>

            </div>

          </div>

          {/* Right Panel: Student and Guardian Meta Info */}
          <div className="md:col-span-3 space-y-6 flex flex-col justify-between">
            
            <div>
              <h3 className="text-xl font-bold text-slate-200">
                Detailed Profile Information
              </h3>
              <p className="text-slate-400 text-xs mt-0.5">
                Registered on {registerDateFormatted}
              </p>
            </div>

            {/* Basic Info Metadata Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              <div className="flex items-start gap-3 bg-slate-800/20 p-3.5 rounded-2xl border border-slate-800/40">
                <IoCalendarOutline className="text-indigo-400 mt-0.5 flex-shrink-0" size={18} />
                <div>
                  <span className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Date of Birth</span>
                  <span className="text-sm font-medium text-slate-300">{birthDateFormatted}</span>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-slate-800/20 p-3.5 rounded-2xl border border-slate-800/40">
                <IoSchoolOutline className="text-indigo-400 mt-0.5 flex-shrink-0" size={18} />
                <div>
                  <span className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Grade & Enrollment</span>
                  <span className="text-sm font-medium text-slate-300">
                    {student.grade_class || 'Class N/A'} ({student.enrollment_year})
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-slate-800/20 p-3.5 rounded-2xl border border-slate-800/40">
                <IoMailOutline className="text-indigo-400 mt-0.5 flex-shrink-0" size={18} />
                <div className="overflow-hidden">
                  <span className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Email Address</span>
                  <span className="text-sm font-medium text-slate-300 truncate block select-all">{student.email || 'None'}</span>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-slate-800/20 p-3.5 rounded-2xl border border-slate-800/40">
                <IoCallOutline className="text-indigo-400 mt-0.5 flex-shrink-0" size={18} />
                <div>
                  <span className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Contact Number</span>
                  <span className="text-sm font-medium text-slate-300 select-all">{student.phone || 'None'}</span>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-slate-800/20 p-3.5 rounded-2xl border border-slate-800/40 sm:col-span-2">
                <IoLocationOutline className="text-indigo-400 mt-0.5 flex-shrink-0" size={18} />
                <div>
                  <span className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Home Address</span>
                  <span className="text-sm font-medium text-slate-300">{student.address || 'No address details provided.'}</span>
                </div>
              </div>

            </div>

            {/* Parent Details Card */}
            <div className="p-4 rounded-2xl border border-sky-500/20 bg-gradient-to-r from-sky-950/20 to-indigo-950/20 space-y-3">
              <h4 className="text-xs font-extrabold text-sky-400 tracking-wider uppercase flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping"></span>
                Parent SMS Link
              </h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="block text-slate-500">Guardian Name</span>
                  <span className="font-semibold text-slate-300">{student.parent_name}</span>
                </div>
                <div>
                  <span className="block text-slate-500">SMS Mobile Contact</span>
                  <span className="font-semibold text-slate-300 select-all">{student.parent_phone_number}</span>
                </div>
                {student.parent_email && (
                  <div className="sm:col-span-2">
                    <span className="block text-slate-500">Guardian Email</span>
                    <span className="font-semibold text-slate-300 select-all">{student.parent_email}</span>
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

export default StudentDetailModal;
