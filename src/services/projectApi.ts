import axios from 'axios';
import { BACKEND_URL } from '../constants/contractor';
import { ProjectFormData, Client, Contractor } from '../types/project';

const api = axios.create({
  baseURL: BACKEND_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const createProject = async (data: ProjectFormData): Promise<void> => {
  try {
    // Convert string values to numbers where needed
    const projectData = {
      ...data,
      ratePerSquareFoot: data.ratePerSquareFoot ? parseFloat(data.ratePerSquareFoot) : undefined,
      totalArea: data.totalArea ? parseFloat(data.totalArea) : undefined,
      totalCoverageArea: data.totalCoverageArea ? parseFloat(data.totalCoverageArea) : undefined,
      totalCost: data.totalCost ? parseFloat(data.totalCost) : undefined,
      labouRate: data.labouRate ? parseFloat(data.labouRate) : undefined,
      totalLabourCost: data.totalLabourCost ? parseFloat(data.totalLabourCost) : undefined,
      contractors: data.contractors.filter(id => id.trim() !== ''), // Remove empty contractor IDs
    };

    await api.post('/api/project/create-project', projectData);
  } catch (error) {
    console.error('Failed to create project:', error);
    throw new Error('Failed to create project. Please try again.');
  }
};

export const fetchClients = async (): Promise<Client[]> => {
  try {
    const response = await api.get('/api/client/get-all-clients');
    return response.data.data || [];
  } catch (error) {
    console.error('Failed to fetch clients:', error);
    throw new Error('Failed to load clients');
  }
};

export const fetchContractors = async (): Promise<Contractor[]> => {
  try {
    const response = await api.get('/api/contractor/get-all-contractors');
    return response.data.data || [];
  } catch (error) {
    console.error('Failed to fetch contractors:', error);
    throw new Error('Failed to load contractors');
  }
};