import apiClient from './apiClient';
import { ProjectContractFormData, ProjectOption, ContractorOption, ProjectContract } from '../types/projectContract';

export const createProjectContract = async (data: ProjectContractFormData): Promise<void> => {
  try {
    const contractData = {
      ...data,
      totalAmount: parseFloat(data.totalAmount),
      startDate: data.startDate || new Date().toISOString().split('T')[0],
      endDate: data.endDate || undefined,
    };

    await apiClient.post('/api/project-contract/create-project-contract', contractData);
  } catch (error) {
    console.error('Failed to create project contract:', error);
    throw new Error('Failed to create project contract. Please try again.');
  }
};

export const fetchProjects = async (): Promise<ProjectOption[]> => {
  try {
    const response = await apiClient.get('/api/project/get-all-projects?basic=true');
    return response.data.data || [];
  } catch (error) {
    console.error('Failed to fetch projects:', error);
    throw new Error('Failed to load projects');
  }
};

export const fetchContractorsForContract = async (projectId?: string): Promise<ContractorOption[]> => {
  try {
    const url = '/api/contractor/get-all-contractors?basic=true';
    const response = await apiClient.get(url);
    return response.data.data || [];
  } catch (error) {
    console.error('Failed to fetch contractors:', error);
    throw new Error('Failed to load contractors');
  }
};

export const fetchAllProjectContracts = async (): Promise<ProjectContract[]> => {
  try {
    const response = await apiClient.get('/api/project-contract/get-all-project-contracts?limit=all');
    return response.data.data || [];
  } catch (error) {
    console.error('Failed to fetch project contracts:', error);
    throw new Error('Failed to load project contracts');
  }
};

export const getProjectContractsPaginated = async (params: { page?: number; limit?: number; search?: string } = {}): Promise<{ data: ProjectContract[], pagination: any }> => {
  try {
    const response = await apiClient.get('/api/project-contract/get-all-project-contracts', { params });
    return { data: response.data.data || [], pagination: response.data.pagination };
  } catch (error) {
    console.error('Failed to fetch paginated project contracts:', error);
    throw new Error('Failed to load project contracts');
  }
};

export const fetchProjectContractsByProjectId = async (projectId: string): Promise<ProjectContract[]> => {
  try {
    const response = await apiClient.get('/api/project-contract/get-all-project-contracts', {
      params: { project: projectId }
    });
    return response.data.data || [];
  } catch (error) {
    console.error('Failed to fetch project contracts by project:', error);
    throw new Error('Failed to load project contracts');
  }
};

export const fetchProjectContractById = async (id: string): Promise<ProjectContract> => {
  try {
    const response = await apiClient.get(`/api/project-contract/get-single-project-contract/${id}`);
    return response.data.data;
  } catch (error) {
    console.error('Failed to fetch project contract:', error);
    throw new Error('Failed to load project contract');
  }
};

export const updateProjectContract = async (id: string, data: Partial<ProjectContractFormData>): Promise<ProjectContract> => {
  try {
    const contractData = {
      ...data,
      totalAmount: data.totalAmount ? parseFloat(data.totalAmount) : undefined,
      endDate: data.endDate || undefined,
    };

    const response = await apiClient.put(`/api/project-contract/update-project-contract/${id}`, contractData);
    return response.data.data;
  } catch (error) {
    console.error('Failed to update project contract:', error);
    throw new Error('Failed to update project contract. Please try again.');
  }
};

export const deleteProjectContract = async (id: string): Promise<void> => {
  try {
    await apiClient.delete(`/api/project-contract/delete-project-contract/${id}`);
  } catch (error) {
    console.error('Failed to delete project contract:', error);
    throw new Error('Failed to delete project contract. Please try again.');
  }
};

export const addContractAddition = async (id: string, amount: number, reason: string): Promise<ProjectContract> => {
  try {
    const response = await apiClient.post(`/api/project-contract/add-addition/${id}`, { amount, reason });
    return response.data.data;
  } catch (error: any) {
    console.error('Failed to add price addition to project contract:', error);
    const msg = error.response?.data?.message || 'Failed to add price addition. Please try again.';
    throw new Error(msg);
  }
};

export const updateContractAddition = async (id: string, additionId: string, amount: number, reason: string): Promise<ProjectContract> => {
  try {
    const response = await apiClient.put(`/api/project-contract/update-addition/${id}/${additionId}`, { amount, reason });
    return response.data.data;
  } catch (error: any) {
    console.error('Failed to update contract price addition:', error);
    const msg = error.response?.data?.message || 'Failed to update price addition. Please try again.';
    throw new Error(msg);
  }
};

export const deleteContractAddition = async (id: string, additionId: string): Promise<ProjectContract> => {
  try {
    const response = await apiClient.delete(`/api/project-contract/delete-addition/${id}/${additionId}`);
    return response.data.data;
  } catch (error: any) {
    console.error('Failed to delete contract price addition:', error);
    const msg = error.response?.data?.message || 'Failed to delete price addition. Please try again.';
    throw new Error(msg);
  }
};