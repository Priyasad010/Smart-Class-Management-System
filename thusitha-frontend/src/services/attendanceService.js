import { request } from './api';

export const attendanceService = {
  saveAttendance: (attendanceData) => request('/attendance', {
    method: 'POST',
    body: JSON.stringify(attendanceData)
  })
};