import apiClient from './apiClient';
import { ProjectPaymentFormData, ProjectPaymentProjectOption } from '../types/projectPayment';

export const createProjectPayment = async (data: ProjectPaymentFormData): Promise<void> => {
  try {
    const projectPaymentData = {
      ...data,
      amount: parseFloat(data.paymentAmount),
      transactionId: data.transactionId || undefined,
      receiptPhoto: data.receiptPhoto || undefined,
      paymentMethod: data.paymentMethod || 'online',
      notes: data.notes || undefined,
      // createdBy is set server-side from the authenticated user (req.user.userId)
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

export interface BulkProjectPaymentItem {
  amount: number;
  date: string;
  workDescription?: string;
  type?: 'credit' | 'debit';
  paymentMethod?: string;
  notes?: string;
}

export const bulkImportProjectPayments = async (data: {
  project: string;
  payments: BulkProjectPaymentItem[];
}): Promise<{ message: string; count: number }> => {
  try {
    const response = await apiClient.post('/api/payment/bulk-import-project', data);
    return response.data;
  } catch (error: any) {
    console.error('Failed to bulk import project payments:', error);
    throw new Error(error.response?.data?.message || 'Failed to bulk import project payments.');
  }
};