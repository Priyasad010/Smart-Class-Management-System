// src/services/authService.js
import { request } from './api';

export const authService = {
  login: async (username, password) => {
    const data = await request('/auth/login', {
      method: 'POST',
      body: { username, password }
    });

    if (data.token) {
      localStorage.setItem('token', data.token);
    }

    if (data.user) {
      localStorage.setItem('user', JSON.stringify(data.user));
    }

    return data;
  }
};