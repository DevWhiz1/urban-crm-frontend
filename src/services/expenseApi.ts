import apiClient from './apiClient';
import { Expense, ExpenseCategory, ExpenseFormData } from '../types/expense';

export const expenseApi = {
  // Categories
  getCategories: async (): Promise<ExpenseCategory[]> => {
    const response = await apiClient.get('/api/expense/categories');
    return response.data;
  },
  createCategory: async (name: string): Promise<ExpenseCategory> => {
    const response = await apiClient.post('/api/expense/categories', { name });
    return response.data;
  },
  deleteCategory: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/expense/categories/${id}`);
  },

  // Expenses
  getExpenses: async (params?: { page?: number; limit?: number; search?: string; expenseType?: string }): Promise<any> => {
    const response = await apiClient.get('/api/expense', { params });
    return response.data;
  },
  getExpenseById: async (id: string): Promise<Expense> => {
    const response = await apiClient.get(`/api/expense/${id}`);
    return response.data;
  },
  createExpense: async (data: ExpenseFormData): Promise<Expense> => {
    const response = await apiClient.post('/api/expense', data);
    return response.data;
  },
  updateExpense: async (id: string, data: Partial<ExpenseFormData>): Promise<Expense> => {
    const response = await apiClient.put(`/api/expense/${id}`, data);
    return response.data;
  },
  deleteExpense: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/expense/${id}`);
  },
};
