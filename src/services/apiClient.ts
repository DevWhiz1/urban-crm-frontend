import axios from 'axios';
import { BACKEND_URL } from '../constants/contractor';

const baseURL = BACKEND_URL || 'http://localhost:5000';

const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  // IMPORTANT: send cookies (httpOnly token) with every cross-origin request
  withCredentials: true,
});

// Response Interceptor: Handle global 401 Unauthorized errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token missing or expired — redirect to login
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
