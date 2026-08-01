import apiClient from './apiClient';

export const authService = {
  login: async (credentials: { email: string; password: string }) => {
    const response = await apiClient.post('/api/auth/login', credentials);
    return response.data;
  },

  register: async (userData: { userName: string; email: string; password: string }) => {
    const response = await apiClient.post('/api/auth/register', userData);
    return response.data;
  },
};