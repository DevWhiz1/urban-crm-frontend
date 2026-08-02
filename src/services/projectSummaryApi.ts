import apiClient from './apiClient';

export const fetchAllProjects = async () => {
  try {
    const response = await apiClient.get('/api/project/get-all-projects');
    return response.data.data || [];
  } catch (error) {
    console.error('Failed to fetch projects:', error);
    throw new Error('Failed to load projects');
  }
};

export const fetchProjectPaymentSummary = async (projectId: string) => {
  try {
    const response = await apiClient.get(`/api/payment/full-summary/${projectId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch project payment summary:', error);
    throw new Error('Failed to load project payment summary');
  }
};