import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || (window.location.hostname === 'localhost' ? 'http://localhost:5000' : '');

export const authApi = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const authEndpoints = {
  login: '/api/auth/login',
  register: '/api/auth/register',
  me: '/api/auth/me',
  logout: '/api/auth/logout',
  forgotPassword: '/api/auth/forgot-password',
  resetPassword: (token) => `/api/auth/reset-password/${token}`,
};

export const normalizeApiError = (error) => {
  const response = error?.response?.data;

  if (Array.isArray(response?.errors) && response.errors.length > 0) {
    return response.errors.map((item) => item.message).join('\n');
  }

  return response?.message || error?.message || 'Something went wrong. Please try again.';
};
