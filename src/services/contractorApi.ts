import apiClient from './apiClient';
import { Contractor, ContractorFormData, User } from '../types/contractor';

export const createContractor = async (data: ContractorFormData): Promise<void> => {
  try {
    await apiClient.post('/api/contractor/create-contractor', data);
  } catch (error) {
    console.error('Failed to create contractor:', error);
    throw new Error('Failed to create contractor. Please try again.');
  }
};

export const fetchAllContractors = async (): Promise<Contractor[]> => {
  try {
    const response = await apiClient.get('/api/contractor/get-all-contractors');
    return response.data.data || [];
  } catch (error) {
    console.error('Failed to fetch contractors:', error);
    throw new Error('Failed to load contractors');
  }
};

export const fetchContractorById = async (id: string): Promise<Contractor> => {
  try {
    const response = await apiClient.get(`/api/contractor/get-single-contractor/${id}`);
    return response.data.data;
  } catch (error) {
    console.error('Failed to fetch contractor:', error);
    throw new Error('Failed to load contractor');
  }
};

export const updateContractor = async (id: string, data: Partial<ContractorFormData>): Promise<Contractor> => {
  try {
    const response = await apiClient.put(`/api/contractor/update-contractor/${id}`, data);
    return response.data.data;
  } catch (error) {
    console.error('Failed to update contractor:', error);
    throw new Error('Failed to update contractor. Please try again.');
  }
};

export const deleteContractor = async (id: string): Promise<void> => {
  try {
    await apiClient.delete(`/api/contractor/delete-contractor/${id}`);
  } catch (error) {
    console.error('Failed to delete contractor:', error);
    throw new Error('Failed to delete contractor. Please try again.');
  }
};

export const fetchUsersForContractor = async (): Promise<User[]> => {
  try {
    const response = await apiClient.get('/api/user/get-all-users');
    const users = response.data.data || [];
    return users.filter((u: User) => u.role === 'Contractor');
  } catch (error) {
    console.error('Failed to fetch users:', error);
    throw new Error('Failed to load users');
  }
};
