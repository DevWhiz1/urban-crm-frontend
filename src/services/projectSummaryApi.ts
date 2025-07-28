import axios from 'axios';
import { BACKEND_URL } from '../constants/contractor';

const api = axios.create({
  baseURL: BACKEND_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const fetchAllProjects = async () => {
  try {
    const response = await api.get('/api/project/get-all-projects');
    return response.data.data || [];
  } catch (error) {
    console.error('Failed to fetch projects:', error);
    throw new Error('Failed to load projects');
  }
};

export const fetchProjectPaymentSummary = async (projectId: string) => {
  try {
    const response = await api.get(`/api/payment/full-summary/${projectId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch project payment summary:', error);
    throw new Error('Failed to load project payment summary');
  }
};