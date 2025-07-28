import axios from 'axios';
import { BACKEND_URL } from '../constants/contractor';
import { ProjectContractFormData, ProjectOption, ContractorOption } from '../types/projectContract';

const api = axios.create({
  baseURL: BACKEND_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const createProjectContract = async (data: ProjectContractFormData): Promise<void> => {
  try {
    // Convert string values to numbers where needed
    const contractData = {
      ...data,
      totalAmount: parseFloat(data.totalAmount),
      endDate: data.endDate || undefined, // Don't send empty string
    };

    await api.post('/api/project-contract/create-project-contract', contractData);
  } catch (error) {
    console.error('Failed to create project contract:', error);
    throw new Error('Failed to create project contract. Please try again.');
  }
};

export const fetchProjects = async (): Promise<ProjectOption[]> => {
  try {
    const response = await api.get('/api/project/get-all-projects');
    return response.data.data || [];
  } catch (error) {
    console.error('Failed to fetch projects:', error);
    throw new Error('Failed to load projects');
  }
};

export const fetchContractorsForContract = async (): Promise<ContractorOption[]> => {
  try {
    const response = await api.get('/api/contractor/get-all-contractors');
    return response.data.data || [];
  } catch (error) {
    console.error('Failed to fetch contractors:', error);
    throw new Error('Failed to load contractors');
  }
};