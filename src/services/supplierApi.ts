import apiClient from './apiClient';
import { Supplier, SupplierFormData } from '../types/supplier';

export const createSupplier = async (data: SupplierFormData): Promise<void> => {
  try {
    await apiClient.post('/api/supplier/create-supplier', data);
  } catch (error) {
    console.error('Failed to create supplier:', error);
    throw new Error('Failed to create supplier. Please try again.');
  }
};

export const fetchAllSuppliers = async (): Promise<Supplier[]> => {
  try {
    const response = await apiClient.get('/api/supplier/get-all-suppliers?basic=true');
    return response.data.data || [];
  } catch (error) {
    console.error('Failed to fetch suppliers:', error);
    throw new Error('Failed to load suppliers');
  }
};

export const getSuppliersPaginated = async (params: { page?: number; limit?: number; search?: string } = {}): Promise<{ data: Supplier[], pagination: any }> => {
  try {
    const response = await apiClient.get('/api/supplier/get-all-suppliers', { params });
    return { data: response.data.data || [], pagination: response.data.pagination };
  } catch (error) {
    console.error('Failed to fetch suppliers:', error);
    throw new Error('Failed to load suppliers');
  }
};

export const fetchSupplierById = async (id: string): Promise<Supplier> => {
  try {
    const response = await apiClient.get(`/api/supplier/get-single-supplier/${id}`);
    return response.data.data;
  } catch (error) {
    console.error('Failed to fetch supplier:', error);
    throw new Error('Failed to load supplier');
  }
};

export const updateSupplier = async (id: string, data: Partial<SupplierFormData>): Promise<Supplier> => {
  try {
    const response = await apiClient.put(`/api/supplier/update-supplier/${id}`, data);
    return response.data.data;
  } catch (error) {
    console.error('Failed to update supplier:', error);
    throw new Error('Failed to update supplier. Please try again.');
  }
};

export const deleteSupplier = async (id: string): Promise<void> => {
  try {
    await apiClient.delete(`/api/supplier/delete-supplier/${id}`);
  } catch (error) {
    console.error('Failed to delete supplier:', error);
    throw new Error('Failed to delete supplier. Please try again.');
  }
};
