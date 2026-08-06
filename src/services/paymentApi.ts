import apiClient from './apiClient';
import {
  PaymentFormData,
  PaymentProjectOption,
  PaymentContractorOption,
  PaymentContractOption
} from '../types/payment';

export const createPayment = async (data: PaymentFormData): Promise<void> => {
  try {
    const userString = localStorage.getItem('user');
    if (!userString) {
      throw new Error('User not authenticated');
    }

    const user = JSON.parse(userString);
    const paymentData = {
      ...data,
      amount: parseFloat(data.amount),
      contract: data.contract || undefined,
      transactionId: data.transactionId || undefined,
      workDescription: data.workDescription || undefined,
      receiptPhoto: data.receiptPhoto || undefined,
      paymentMethod: data.paymentMethod || 'online',
      notes: data.notes || undefined,
      createdBy: user.id || user._id
    };

    await apiClient.post('/api/payment/create-payment', paymentData);
  } catch (error) {
    console.error('Failed to create payment:', error);
    throw new Error('Failed to create payment. Please try again.');
  }
};

export const fetchProjectsForPayment = async (): Promise<PaymentProjectOption[]> => {
  try {
    const response = await apiClient.get('/api/project/get-all-projects?basic=true');
    return response.data.data || [];
  } catch (error) {
    console.error('Failed to fetch projects:', error);
    throw new Error('Failed to load projects');
  }
};

export const fetchContractorsForPayment = async (projectId?: string): Promise<PaymentContractorOption[]> => {
  try {
    const url = projectId 
      ? `/api/project/get-project-contractors/${projectId}` 
      : '/api/contractor/get-all-contractors?basic=true';
    const response = await apiClient.get(url);
    return response.data.data || [];
  } catch (error) {
    console.error('Failed to fetch contractors:', error);
    throw new Error('Failed to load contractors');
  }
};

export const fetchContractsForPayment = async (projectId?: string): Promise<PaymentContractOption[]> => {
  try {
    const url = projectId 
      ? `/api/project-contract/get-all-project-contracts?project=${projectId}`
      : '/api/project-contract/get-all-project-contracts';
    const response = await apiClient.get(url);
    return response.data.data || [];
  } catch (error) {
    console.error('Failed to fetch contracts:', error);
    throw new Error('Failed to load contracts');
  }
};

export const getFilteredContracts = (
  contracts: PaymentContractOption[],
  projectId: string,
  contractorId: string
): PaymentContractOption[] => {
  return contracts.filter(contract =>
    contract.project._id === projectId &&
    contract.contractor._id === contractorId
  );
};

export interface BulkImportPaymentItem {
  date: string;
  amount: number;
  workDescription?: string;
  type?: 'credit' | 'debit';
  paymentMethod?: string;
  notes?: string;
}

export const bulkImportPayments = async (data: {
  project: string;
  contractor: string;
  contract?: string;
  payments: BulkImportPaymentItem[];
}): Promise<{ message: string; count: number }> => {
  try {
    const response = await apiClient.post('/api/payment/bulk-import', data);
    return response.data;
  } catch (error: any) {
    console.error('Failed to bulk import payments:', error);
    throw new Error(error.response?.data?.message || 'Failed to bulk import payments. Please try again.');
  }
};

export const updatePayment = async (id: string, data: Partial<PaymentFormData>): Promise<any> => {
  try {
    const paymentData = {
      ...data,
      amount: data.amount ? parseFloat(data.amount.toString()) : undefined,
    };
    const response = await apiClient.put(`/api/payment/update-payment/${id}`, paymentData);
    return response.data.payment;
  } catch (error) {
    console.error('Failed to update payment:', error);
    throw new Error('Failed to update payment. Please try again.');
  }
};

export const deletePayment = async (id: string): Promise<void> => {
  try {
    await apiClient.delete(`/api/payment/delete-payment/${id}`);
  } catch (error) {
    console.error('Failed to delete payment:', error);
    throw new Error('Failed to delete payment. Please try again.');
  }
};