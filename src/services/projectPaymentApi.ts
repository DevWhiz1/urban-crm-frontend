import apiClient from './apiClient';
import { ProjectPaymentFormData, ProjectPaymentProjectOption } from '../types/projectPayment';

export const createProjectPayment = async (data: ProjectPaymentFormData): Promise<void> => {
  try {
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
      createdBy: user.id || user._id,
    };

    await apiClient.post('/api/payment/add-payment-for-project', projectPaymentData);
  } catch (error) {
    console.error('Failed to create project payment:', error);
    throw new Error('Failed to create project payment. Please try again.');
  }
};

export const fetchProjectsForProjectPayment = async (): Promise<ProjectPaymentProjectOption[]> => {
  try {
    const response = await apiClient.get('/api/project/get-all-projects');
    return response.data.data || [];
  } catch (error) {
    console.error('Failed to fetch projects:', error);
    throw new Error('Failed to load projects');
  }
};