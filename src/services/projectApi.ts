import apiClient from './apiClient';
import { ProjectFormData, Client, Contractor, Project } from '../types/project';

const normalizeId = (id: any): string => {
  if (!id) return '';
  if (typeof id === 'string') return id.trim();
  if (typeof id === 'object') return (id._id || id.id || '').toString().trim();
  return String(id).trim();
};

export const createProject = async (data: ProjectFormData): Promise<void> => {
  try {
    const projectData = {
      ...data,
      customer: normalizeId(data.customer),
      ratePerSquareFoot: data.ratePerSquareFoot ? parseFloat(data.ratePerSquareFoot) : undefined,
      totalArea: data.totalArea ? parseFloat(data.totalArea) : undefined,
      totalCoverageArea: data.totalCoverageArea ? parseFloat(data.totalCoverageArea) : undefined,
      totalCost: data.totalCost ? parseFloat(data.totalCost) : undefined,
      labouRate: data.labouRate ? parseFloat(data.labouRate) : undefined,
      totalLabourCost: data.totalLabourCost ? parseFloat(data.totalLabourCost) : undefined,
      contractors: data.contractors ? data.contractors.map(normalizeId).filter(id => id !== '') : undefined,
    };

    await apiClient.post('/api/project/create-project', projectData);
  } catch (error) {
    console.error('Failed to create project:', error);
    throw new Error('Failed to create project. Please try again.');
  }
};

export const fetchClients = async (): Promise<Client[]> => {
  try {
    const response = await apiClient.get('/api/client/get-all-clients');
    return response.data.data || [];
  } catch (error) {
    console.error('Failed to fetch clients:', error);
    throw new Error('Failed to load clients');
  }
};

export const fetchContractors = async (): Promise<Contractor[]> => {
  try {
    const response = await apiClient.get('/api/contractor/get-all-contractors');
    return response.data.data || [];
  } catch (error) {
    console.error('Failed to fetch contractors:', error);
    throw new Error('Failed to load contractors');
  }
};

export const fetchAllProjects = async (): Promise<Project[]> => {
  try {
    const response = await apiClient.get('/api/project/get-all-projects');
    return response.data.data || [];
  } catch (error) {
    console.error('Failed to fetch projects:', error);
    throw new Error('Failed to load projects');
  }
};

export const fetchProjectById = async (id: string): Promise<Project> => {
  try {
    const response = await apiClient.get(`/api/project/get-single-project/${id}`);
    return response.data.data;
  } catch (error) {
    console.error('Failed to fetch project:', error);
    throw new Error('Failed to load project');
  }
};

export const updateProject = async (id: string, data: Partial<ProjectFormData>): Promise<Project> => {
  try {
    const projectData = {
      ...data,
      customer: data.customer ? normalizeId(data.customer) : undefined,
      ratePerSquareFoot: data.ratePerSquareFoot ? parseFloat(data.ratePerSquareFoot) : undefined,
      totalArea: data.totalArea ? parseFloat(data.totalArea) : undefined,
      totalCoverageArea: data.totalCoverageArea ? parseFloat(data.totalCoverageArea) : undefined,
      totalCost: data.totalCost ? parseFloat(data.totalCost) : undefined,
      labouRate: data.labouRate ? parseFloat(data.labouRate) : undefined,
      totalLabourCost: data.totalLabourCost ? parseFloat(data.totalLabourCost) : undefined,
      contractors: data.contractors ? data.contractors.map(normalizeId).filter(id => id !== '') : undefined,
    };

    const response = await apiClient.put(`/api/project/update-project/${id}`, projectData);
    return response.data.data;
  } catch (error) {
    console.error('Failed to update project:', error);
    throw new Error('Failed to update project. Please try again.');
  }
};

export const deleteProject = async (id: string): Promise<void> => {
  try {
    await apiClient.delete(`/api/project/delete-project/${id}`);
  } catch (error) {
    console.error('Failed to delete project:', error);
    throw new Error('Failed to delete project. Please try again.');
  }
};

export const addProjectAddition = async (id: string, amount: number, reason: string): Promise<Project> => {
  try {
    const response = await apiClient.post(`/api/project/add-addition/${id}`, { amount, reason });
    return response.data.data;
  } catch (error: any) {
    console.error('Failed to add price addition to project:', error);
    const msg = error.response?.data?.message || 'Failed to add price addition. Please try again.';
    throw new Error(msg);
  }
};