import React from 'react';
import { IoEyeOutline, IoCreateOutline, IoQrCodeOutline, IoToggleOutline, IoSchoolOutline, IoMailOutline, IoCallOutline } from 'react-icons/io5';

function StudentList({ students, onViewDetails, onEdit, onToggleStatus }) {
  if (students.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center rounded-3xl border border-dashed border-slate-800 bg-slate-900/20 glass-panel">
        <IoSchoolOutline size={50} className="text-slate-600 mb-3 animate-pulse" />
        <h3 className="text-lg font-bold text-slate-300">No students found</h3>
        <p className="text-slate-500 text-sm max-w-sm mt-1">
          Try adjusting your search criteria or filters, or add a brand new student profile to start.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {students.map((student) => (
        <div
          key={student.id}
          className="glass-card group rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300 shadow-md"
        >
          {/* Glass Card Glow Accent */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-500/10 to-sky-400/5 blur-xl group-hover:scale-125 transition-transform duration-500 -z-10 rounded-full"></div>

          <div>
            {/* Top Row: ID Badge & Active Status */}
            <div className="flex items-center justify-between gap-2 mb-4">
              <span className="text-xs font-bold text-indigo-400 select-all">
                {student.student_id_code}
              </span>
              <button
                onClick={() => onToggleStatus(student)}
                className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wider uppercase border transition-all active:scale-95 ${
                  student.is_active
                    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/25'
                    : 'bg-rose-500/15 text-rose-400 border-rose-500/20 hover:bg-rose-500/25'
                }`}
                title="Toggle Active Status"
              >
                <IoToggleOutline size={12} className={student.is_active ? 'rotate-180 transition-transform duration-200 text-emerald-400' : 'transition-transform duration-200 text-rose-400'} />
                <span>{student.is_active ? 'Active' : 'Inactive'}</span>
              </button>
            </div>

            {/* Profile Avatar & Primary Details */}
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-full border border-slate-700/60 overflow-hidden relative shadow-inner bg-slate-800 flex-shrink-0">
                {student.profile_photo_url ? (
                  <img
                    src={student.profile_photo_url}
                    alt={`${student.first_name} ${student.last_name}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-bold text-lg text-indigo-400 uppercase select-none">
                    {student.first_name[0]}
                    {student.last_name[0]}
                  </div>
                )}
              </div>
              
              <div className="overflow-hidden">
                <h4 className="font-extrabold text-white text-base truncate group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-indigo-200 transition-all duration-300">
                  {student.first_name} {student.last_name}
                </h4>
                <div className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
                  <IoSchoolOutline size={13} className="text-indigo-400" />
                  <span className="truncate">{student.grade_class || 'Class N/A'}</span>
                </div>
              </div>
            </div>

            {/* Minor Metadata */}
            <div className="space-y-1.5 py-3 border-t border-b border-slate-800/40 text-[11px] text-slate-400 select-none">
              <div className="flex items-center gap-2 truncate">
                <IoMailOutline size={12} className="text-slate-500" />
                <span className="truncate">{student.email || 'No email provided'}</span>
              </div>
              <div className="flex items-center gap-2 truncate">
                <IoCallOutline size={12} className="text-slate-500" />
                <span>{student.parent_phone_number || 'No contact linked'}</span>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="grid grid-cols-3 gap-2 mt-4 select-none">
            
            {/* View Details */}
            <button
              onClick={() => onViewDetails(student)}
              className="flex items-center justify-center gap-1 py-2 text-xs font-semibold rounded-lg bg-slate-800/40 hover:bg-indigo-500/10 hover:text-indigo-400 border border-slate-800/80 hover:border-indigo-500/30 text-slate-300 transition-all active:scale-95"
              title="View Complete Profile & QR Code"
            >
              <IoEyeOutline size={15} />
              <span>Profile</span>
            </button>

            {/* Generate / Show QR */}
            <button
              onClick={() => onViewDetails(student)}
              className="flex items-center justify-center gap-1 py-2 text-xs font-semibold rounded-lg bg-slate-800/40 hover:bg-sky-500/10 hover:text-sky-400 border border-slate-800/80 hover:border-sky-500/30 text-slate-300 transition-all active:scale-95"
              title="Interactive QR Code Badge"
            >
              <IoQrCodeOutline size={14} />
              <span>QR Code</span>
            </button>

            {/* Edit details */}
            <button
              onClick={() => onEdit(student)}
              className="flex items-center justify-center gap-1 py-2 text-xs font-semibold rounded-lg bg-slate-800/40 hover:bg-amber-500/10 hover:text-amber-400 border border-slate-800/80 hover:border-amber-500/30 text-slate-300 transition-all active:scale-95"
              title="Modify Details"
            >
              <IoCreateOutline size={15} />
              <span>Edit</span>
            </button>

          </div>

        </div>
      ))}
    </div>
  );
}

export default StudentList;
