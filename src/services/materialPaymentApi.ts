import axios from 'axios';
import { BACKEND_URL } from '../constants/contractor';
import { MaterialPaymentFormData, MaterialProjectOption } from '../types/materialPayment';

const api = axios.create({
  baseURL: BACKEND_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const createMaterialPayment = async (data: MaterialPaymentFormData): Promise<void> => {
  try {
    // Convert string values to appropriate types
    const materialPaymentData = {
      ...data,
      MaterialQuantity: parseFloat(data.MaterialQuantity),
      MaterialRate: parseFloat(data.MaterialRate),
      totalAmount: parseFloat(data.totalAmount),
    };

    await api.post('/api/material/add-material-payment', materialPaymentData);
  } catch (error) {
    console.error('Failed to create material payment:', error);
    throw new Error('Failed to create material payment. Please try again.');
  }
};

export const fetchProjectsForMaterial = async (): Promise<MaterialProjectOption[]> => {
  try {
    const response = await api.get('/api/project/get-all-projects');
    return response.data.data || [];
  } catch (error) {
    console.error('Failed to fetch projects:', error);
    throw new Error('Failed to load projects');
  }
};