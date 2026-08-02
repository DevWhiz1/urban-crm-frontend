import apiClient from './apiClient';
import { MaterialPaymentFormData, MaterialProjectOption } from '../types/materialPayment';

export const createMaterialPayment = async (data: MaterialPaymentFormData): Promise<void> => {
  try {
    const materialPaymentData = {
      ...data,
      MaterialQuantity: parseFloat(data.MaterialQuantity),
      MaterialRate: parseFloat(data.MaterialRate),
      totalAmount: parseFloat(data.totalAmount),
    };

    await apiClient.post('/api/material/add-material-payment', materialPaymentData);
  } catch (error) {
    console.error('Failed to create material payment:', error);
    throw new Error('Failed to create material payment. Please try again.');
  }
};

export const fetchProjectsForMaterial = async (): Promise<MaterialProjectOption[]> => {
  try {
    const response = await apiClient.get('/api/project/get-all-projects');
    return response.data.data || [];
  } catch (error) {
    console.error('Failed to fetch projects:', error);
    throw new Error('Failed to load projects');
  }
};

export interface BulkMaterialItem {
  materialDetail?: string;
  materialProvider?: string;
  MaterialQuantity?: number;
  MaterialRate?: number;
  totalAmount?: number;
  date: string;
}

export const bulkImportMaterialPayments = async (data: {
  project: string;
  materials: BulkMaterialItem[];
}): Promise<{ message: string; count: number }> => {
  try {
    const response = await apiClient.post('/api/material/bulk-import', data);
    return response.data;
  } catch (error: any) {
    console.error('Failed to bulk import material payments:', error);
    throw new Error(error.response?.data?.message || 'Failed to bulk import material payments.');
  }
};