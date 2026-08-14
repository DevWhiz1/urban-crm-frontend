import apiClient from './apiClient';

export const fetchAllProjectsForContracts = async () => {
  try {
    const response = await apiClient.get('/api/project/get-all-projects');
    return response.data.data || [];
  } catch (error) {
    console.error('Failed to fetch projects:', error);
    throw new Error('Failed to load projects');
  }
};

export const fetchPaginatedProjectsForContracts = async (params: any = {}) => {
  try {
    const response = await apiClient.get('/api/project/get-all-projects', { params });
    return { data: response.data.data || [], pagination: response.data.pagination };
  } catch (error) {
    console.error('Failed to fetch paginated projects:', error);
    throw new Error('Failed to load paginated projects');
  }
};

export const fetchProjectContracts = async (projectId: string) => {
  try {
    const response = await apiClient.get(`/api/payment/contracts/by-project/${projectId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch project contracts:', error);
    throw new Error('Failed to load project contracts');
  }
};

export const fetchContractPaymentSummary = async (contractId: string) => {
  try {
    const response = await apiClient.get(`/api/payment/contract-summary/${contractId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch contract payment summary:', error);
    throw new Error('Failed to load contract payment summary');
  }
};