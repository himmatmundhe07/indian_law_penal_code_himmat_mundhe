import axios from 'axios';
import { store } from '../store';
import { logout } from '../store/authSlice';

// Create an Axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach Token
api.interceptors.request.use(
  (config) => {
    const token = store.getState().auth.token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle Global Errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Check if unauthorized
    if (error.response && error.response.status === 401) {
      // Dispatch logout if token is expired or invalid
      store.dispatch(logout());
      // Optionally redirect to login page if we aren't already there
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
