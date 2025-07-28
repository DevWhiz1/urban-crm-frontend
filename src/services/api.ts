import axios from 'axios';
import { BACKEND_URL } from '../constants/contractor';
import { User, ContractorFormData } from '../types/contractor';

const api = axios.create({
  baseURL: BACKEND_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const fetchUsers = async (): Promise<User[]> => {
  try {
    const response = await api.get('/api/user/get-all-users');
    return response.data.data || [];
  } catch (error) {
    console.error('Failed to fetch users:', error);
    throw new Error('Failed to load users');
  }
};

export const createContractor = async (data: ContractorFormData): Promise<void> => {
  try {
    await api.post('/api/contractor/create-contractor', data);
  } catch (error) {
    console.error('Failed to create contractor:', error);
    throw new Error('Failed to create contractor. Please try again.');
  }
};