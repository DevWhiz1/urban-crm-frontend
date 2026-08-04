import apiClient from './apiClient';
import { Employee, EmployeeFormData } from '../types/employee';

export const employeeApi = {
  getEmployees: async (params?: { page?: number; limit?: number | 'all'; search?: string; status?: string }): Promise<any> => {
    const response = await apiClient.get('/api/employee', { params });
    return response.data;
  },

  getEmployeeById: async (id: string): Promise<Employee> => {
    const response = await apiClient.get(`/api/employee/${id}`);
    return response.data;
  },

  createEmployee: async (data: EmployeeFormData): Promise<Employee> => {
    const response = await apiClient.post('/api/employee', data);
    return response.data;
  },

  updateEmployee: async (id: string, data: Partial<EmployeeFormData>): Promise<Employee> => {
    const response = await apiClient.put(`/api/employee/${id}`, data);
    return response.data;
  },

  deleteEmployee: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/employee/${id}`);
  },
};
