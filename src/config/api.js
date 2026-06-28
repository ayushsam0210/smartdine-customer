import axios from 'axios';

// In dev, use relative URLs so Vite's /api proxy handles requests (avoids CORS).
const baseURL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '' : 'http://localhost:4000');

const api = axios.create({
  baseURL,
  timeout: 10000,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const serverMessage = error?.response?.data?.message || error?.response?.data?.error;
    if (typeof serverMessage === 'string' && serverMessage.trim()) {
      return Promise.reject(serverMessage);
    }

    if (error.code === 'ECONNABORTED') {
      return Promise.reject('Request timed out. Please check your connection and try again.');
    }

    if (!error.response || error.response.status >= 500) {
      return Promise.reject('Unable to reach the server. Please check your connection.');
    }

    const message = error.message || 'Something went wrong. Please try again.';
    return Promise.reject(typeof message === 'string' ? message : 'Something went wrong. Please try again.');
  },
);

export default api;
