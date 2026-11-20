import axios from 'axios';
import { useAuthStore } from '../../store/authStore';

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const detail = error.response?.data?.detail;

    // Si la sesión expiró (401) o el usuario fue desactivado (400)
    if (status === 401 || (status === 400 && detail === 'Cuenta de usuario desactivada')) {
      const originalRequestUrl = error.config?.url || '';
      if (!originalRequestUrl.includes('/auth/token') && !originalRequestUrl.includes('/auth/me')) {
        useAuthStore.getState().logout();
      }
    }
    return Promise.reject(error);
  }
);