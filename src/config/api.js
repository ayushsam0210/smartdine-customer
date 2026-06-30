import axios from 'axios';

// In dev, use relative URLs so Vite's /api proxy handles requests (avoids CORS).
const baseURL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '' : 'http://localhost:4000');

const api = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // 1. If the request was deliberately cancelled by the application, pass it through silently
    if (axios.isCancel(error)) {
      return Promise.reject(error);
    }

    let friendlyMessage = 'Something went wrong. Please try again.';

    // 2. Extract explicit backend validation errors
    const serverMessage = error?.response?.data?.message || error?.response?.data?.error;
    if (typeof serverMessage === 'string' && serverMessage.trim()) {
      friendlyMessage = serverMessage;
    } 
    // 3. Handle request timeouts explicitly
    else if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      friendlyMessage = 'Request timed out. Please check your connection and try again.';
    } 
    // 4. Handle offline dropouts or internal server meltdowns
    else if (!error.response || error.response.status >= 500) {
      friendlyMessage = 'Unable to reach the server. Please check your network connection.';
    } 
    // 5. Fallback to native Axios generic error message
    else if (error.message) {
      friendlyMessage = error.message;
    }

    // CRITICAL FIX: Reject with an Error instance instead of a raw string
    return Promise.reject(new Error(friendlyMessage));
  },
);

export default api;
