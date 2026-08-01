import apiClient from './apiClient';
import { User, ContractorFormData } from '../types/contractor';

export const fetchUsers = async (): Promise<User[]> => {
  try {
    const response = await apiClient.get('/api/user/get-all-users');
    return response.data.data || [];
  } catch (error) {
    console.error('Failed to fetch users:', error);
    throw new Error('Failed to load users');
  }
};

export const createContractor = async (data: ContractorFormData): Promise<void> => {
  try {
    await apiClient.post('/api/contractor/create-contractor', data);
  } catch (error) {
    console.error('Failed to create contractor:', error);
    throw new Error('Failed to create contractor. Please try again.');
  }
};