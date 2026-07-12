import { request } from './api';

export const attendanceService = {
  saveAttendance: (attendanceData) => request('/attendance/bulk-save', {
    method: 'POST',
    body: attendanceData
  })
};