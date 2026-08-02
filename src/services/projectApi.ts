import axios from 'axios';
import { BACKEND_URL } from '../constants/contractor';
import { ProjectFormData, Client, Contractor, Project } from '../types/project';

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

export const fetchAllProjects = async (): Promise<Project[]> => {
  try {
    const response = await api.get('/api/project/get-all-projects');
    return response.data.data || [];
  } catch (error) {
    console.error('Failed to fetch projects:', error);
    throw new Error('Failed to load projects');
  }
};

export const fetchProjectById = async (id: string): Promise<Project> => {
  try {
    const response = await api.get(`/api/project/get-single-project/${id}`);
    return response.data.data;
  } catch (error) {
    console.error('Failed to fetch project:', error);
    throw new Error('Failed to load project');
  }
};

export const updateProject = async (id: string, data: Partial<ProjectFormData>): Promise<Project> => {
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
      contractors: data.contractors?.filter(id => id.trim() !== '') || [],
    };

    const response = await api.put(`/api/project/update-project/${id}`, projectData);
    return response.data.data;
  } catch (error) {
    console.error('Failed to update project:', error);
    throw new Error('Failed to update project. Please try again.');
  }
};

export const deleteProject = async (id: string): Promise<void> => {
  try {
    await api.delete(`/api/project/delete-project/${id}`);
  } catch (error) {
    console.error('Failed to delete project:', error);
    throw new Error('Failed to delete project. Please try again.');
  }
};