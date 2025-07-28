import axios from 'axios';
import { BACKEND_URL } from '../constants/contractor';

const api = axios.create({
  baseURL: BACKEND_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const authService = {
  login: async (credentials: { email: string; password: string }) => {
    const response = await api.post('/api/auth/login', credentials);
    return response.data;
  },

  register: async (userData: { userName: string; email: string; password: string }) => {
    const response = await api.post('/api/auth/register', userData);
    return response.data;
  },
};