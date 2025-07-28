import axios from 'axios';
import { BACKEND_URL } from '../constants/contractor';
import { ProjectPaymentFormData, ProjectPaymentProjectOption } from '../types/projectPayment';

const api = axios.create({
  baseURL: BACKEND_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const createProjectPayment = async (data: ProjectPaymentFormData): Promise<void> => {
  try {
    // Convert string values to appropriate types
            const userString = localStorage.getItem('user');
    if (!userString) {
      throw new Error('User not authenticated');
    }
    
    const user = JSON.parse(userString);
    const projectPaymentData = {
      ...data,
      amount: parseFloat(data.paymentAmount),
      transactionId: data.transactionId || undefined,
      receiptPhoto: data.receiptPhoto || undefined,
      notes: data.notes || undefined,
      createdBy: user.id,
      
    };

    await api.post('/api/payment/add-payment-for-project', projectPaymentData);
    console.log(projectPaymentData)
  } catch (error) {
    console.error('Failed to create project payment:', error);
    throw new Error('Failed to create project payment. Please try again.');
  }
};

export const fetchProjectsForProjectPayment = async (): Promise<ProjectPaymentProjectOption[]> => {
  try {
    const response = await api.get('/api/project/get-all-projects');
    return response.data.data || [];
  } catch (error) {
    console.error('Failed to fetch projects:', error);
    throw new Error('Failed to load projects');
  }
};