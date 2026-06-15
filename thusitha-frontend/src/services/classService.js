import { request } from './api';

export const classService = {
  // ඔයාගේ Backend එකේ Users රවුට් එකෙන් තමයි Class/User විස්තර එන්නේ
  getAllClasses: () => request('/users', { method: 'GET' })
};