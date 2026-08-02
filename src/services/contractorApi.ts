import axios from 'axios';
import { BACKEND_URL } from '../constants/contractor';
import { Contractor, ContractorFormData, User } from '../types/contractor';

const api = axios.create({
  baseURL: BACKEND_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const createContractor = async (data: ContractorFormData): Promise<void> => {
  try {
    await api.post('/api/contractor/create-contractor', data);
  } catch (error) {
    console.error('Failed to create contractor:', error);
    throw new Error('Failed to create contractor. Please try again.');
  }
};

export const fetchAllContractors = async (): Promise<Contractor[]> => {
  try {
    const response = await api.get('/api/contractor/get-all-contractors');
    return response.data.data || [];
  } catch (error) {
    console.error('Failed to fetch contractors:', error);
    throw new Error('Failed to load contractors');
  }
};

export const fetchContractorById = async (id: string): Promise<Contractor> => {
  try {
    const response = await api.get(`/api/contractor/get-single-contractor/${id}`);
    return response.data.data;
  } catch (error) {
    console.error('Failed to fetch contractor:', error);
    throw new Error('Failed to load contractor');
  }
};

export const updateContractor = async (id: string, data: Partial<ContractorFormData>): Promise<Contractor> => {
  try {
    const response = await api.put(`/api/contractor/update-contractor/${id}`, data);
    return response.data.data;
  } catch (error) {
    console.error('Failed to update contractor:', error);
    throw new Error('Failed to update contractor. Please try again.');
  }
};

export const deleteContractor = async (id: string): Promise<void> => {
  try {
    await api.delete(`/api/contractor/delete-contractor/${id}`);
  } catch (error) {
    console.error('Failed to delete contractor:', error);
    throw new Error('Failed to delete contractor. Please try again.');
  }
};

export const fetchUsersForContractor = async (): Promise<User[]> => {
  try {
    const response = await api.get('/api/user/get-all-users');
    return response.data.data || [];
  } catch (error) {
    console.error('Failed to fetch users:', error);
    throw new Error('Failed to load users');
  }
};
