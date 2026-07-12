import { request } from './api';

export const studentService = {
  getAllStudents: () => request('/students', { method: 'GET' }),
  createStudent: (studentData) => request('/students', {
    method: 'POST',
    body: studentData
  }),
  updateStudent: (id, studentData) => request(`/students/${id}`, {
    method: 'PUT',
    body: studentData
  }),
  deleteStudent: (id) => request(`/students/${id}`, {
    method: 'DELETE'
  }),
  uploadStudentPhoto: (id, formData) => request(`/students/${id}/upload-photo`, {
    method: 'POST',
    body: formData,
    isFormData: true
  }),
  getMyStudents: () => request('/teachers/my-students', { method: 'GET' })
};