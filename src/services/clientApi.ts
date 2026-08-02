import axios from 'axios';
import { BACKEND_URL } from '../constants/contractor';
import { User } from '../types/contractor';
import { ClientFormData, Client } from '../types/client';

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

// Re-export User type for convenience
export type { User } from '../types/contractor';

export const fetchAllClients = async (): Promise<Client[]> => {
  try {
    const response = await api.get('/api/client/get-all-clients');
    return response.data.data || [];
  } catch (error) {
    console.error('Failed to fetch clients:', error);
    throw new Error('Failed to load clients');
  }
};

export const fetchClientById = async (id: string): Promise<Client> => {
  try {
    const response = await api.get(`/api/client/get-single-client/${id}`);
    return response.data.data;
  } catch (error) {
    console.error('Failed to fetch client:', error);
    throw new Error('Failed to load client');
  }
};

export const updateClient = async (id: string, data: Partial<ClientFormData>): Promise<Client> => {
  try {
    const response = await api.put(`/api/client/update-client/${id}`, data);
    return response.data.data;
  } catch (error) {
    console.error('Failed to update client:', error);
    throw new Error('Failed to update client. Please try again.');
  }
};

export const deleteClient = async (id: string): Promise<void> => {
  try {
    await api.delete(`/api/client/delete-client/${id}`);
  } catch (error) {
    console.error('Failed to delete client:', error);
    throw new Error('Failed to delete client. Please try again.');
  }
};