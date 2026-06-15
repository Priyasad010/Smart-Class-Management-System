import { request } from './api';

export const studentService = {
  getAllStudents: () => request('/students', { method: 'GET' }),
  createStudent: (studentData) => request('/students', {
    method: 'POST',
    body: JSON.stringify(studentData)
  })
};