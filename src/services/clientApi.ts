import axios from 'axios';
import { BACKEND_URL } from '../constants/contractor';
import { User } from '../types/contractor';
import { ClientFormData } from '../types/client';

const api = axios.create({
  baseURL: BACKEND_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const createClient = async (data: ClientFormData): Promise<void> => {
  try {
    await api.post('/api/client/create-client', data);
  } catch (error) {
    console.error('Failed to create client:', error);
    throw new Error('Failed to create client. Please try again.');
  }
};

export const fetchUsersForClient = async (): Promise<User[]> => {
  try {
    const response = await api.get('/api/user/get-all-users');
    return response.data.data || [];
  } catch (error) {
    console.error('Failed to fetch users:', error);
    throw new Error('Failed to load users');
  }
};