import axios from 'axios';
import { BACKEND_URL } from '../constants/contractor';
import { 
  PaymentFormData, 
  PaymentProjectOption, 
  PaymentContractorOption, 
  PaymentContractOption 
} from '../types/payment';

const api = axios.create({
  baseURL: BACKEND_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const createPayment = async (data: PaymentFormData): Promise<void> => {
  try {
    // Convert string values to appropriate types
            const userString = localStorage.getItem('user');
    if (!userString) {
      throw new Error('User not authenticated');
    }
    
    const user = JSON.parse(userString);
    const paymentData = {
      ...data,
      amount: parseFloat(data.amount),
      contract: data.contract || undefined, // Don't send empty string
      transactionId: data.transactionId || undefined,
      workDescription: data.workDescription || undefined,
      receiptPhoto: data.receiptPhoto || undefined,
      notes: data.notes || undefined,
      // Note: createdBy should be set from auth context in real implementation
      createdBy: user.id // This should come from auth context
    };

    await api.post('/api/payment/create-payment', paymentData);
    console.log(paymentData)
  } catch (error) {
    console.error('Failed to create payment:', error);
    throw new Error('Failed to create payment. Please try again.');
  }
};

export const fetchProjectsForPayment = async (): Promise<PaymentProjectOption[]> => {
  try {
    const response = await api.get('/api/project/get-all-projects');
    return response.data.data || [];
  } catch (error) {
    console.error('Failed to fetch projects:', error);
    throw new Error('Failed to load projects');
  }
};

export const fetchContractorsForPayment = async (): Promise<PaymentContractorOption[]> => {
  try {
    const response = await api.get('/api/contractor/get-all-contractors');
    return response.data.data || [];
  } catch (error) {
    console.error('Failed to fetch contractors:', error);
    throw new Error('Failed to load contractors');
  }
};

export const fetchContractsForPayment = async (): Promise<PaymentContractOption[]> => {
  try {
    const response = await api.get('/api/project-contract/get-all-project-contracts');
    return response.data.data || [];
  } catch (error) {
    console.error('Failed to fetch contracts:', error);
    throw new Error('Failed to load contracts');
  }
};

// Filter contracts based on selected project and contractor
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