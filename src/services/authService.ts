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

  /**
   * Fetches the current authenticated user's profile using the httpOnly cookie.
   * Called on every app start to rehydrate React Context.
   */
  getMe: async () => {
    const response = await apiClient.get('/api/auth/me');
    return response.data;
  },

  /**
   * Clears the httpOnly cookie on the server, invalidating the session.
   */
  logout: async () => {
    const response = await apiClient.post('/api/auth/logout');
    return response.data;
  },
};