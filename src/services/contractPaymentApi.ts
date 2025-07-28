import axios from 'axios';
import { BACKEND_URL } from '../constants/contractor';

const api = axios.create({
  baseURL: BACKEND_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const fetchAllProjectsForContracts = async () => {
  try {
    const response = await api.get('/api/project/get-all-projects');
    return response.data.data || [];
  } catch (error) {
    console.error('Failed to fetch projects:', error);
    throw new Error('Failed to load projects');
  }
};

export const fetchProjectContracts = async (projectId: string) => {
  try {
    const response = await api.get(`/api/payment/contracts/by-project/${projectId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch project contracts:', error);
    throw new Error('Failed to load project contracts');
  }
};

export const fetchContractPaymentSummary = async (contractId: string) => {
  try {
    const response = await api.get(`/api/payment/contract-summary/${contractId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch contract payment summary:', error);
    throw new Error('Failed to load contract payment summary');
  }
};