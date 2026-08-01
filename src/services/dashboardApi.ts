import axios from 'axios';
import { BACKEND_URL } from '../constants/contractor';

const api = axios.create({
  baseURL: BACKEND_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface DashboardStats {
  projects: {
    total: number;
    active: number;
    completed: number;
    planning: number;
    totalRevenue: number;
    averageProjectValue: number;
  };
  contractors: {
    total: number;
    active: number;
    averageRating: number;
    topContractor: string;
  };
  clients: {
    total: number;
    active: number;
    newThisMonth: number;
  };
  payments: {
    totalAmount: number;
    pendingAmount: number;
    paidThisMonth: number;
    overdueAmount: number;
  };
  recentActivity: Array<{
    id: string;
    type: 'project' | 'contractor' | 'client' | 'payment';
    action: string;
    description: string;
    timestamp: string;
  }>;
  monthlyRevenue: Array<{
    month: string;
    revenue: number;
    projects: number;
  }>;
  projectStatusDistribution: Array<{
    status: string;
    count: number;
    percentage: number;
  }>;
}

export const fetchDashboardStats = async (): Promise<DashboardStats> => {
  try {
    const response = await api.get('/api/dashboard/stats');
    return response.data.data;
  } catch (error) {
    console.error('Failed to fetch dashboard stats:', error);
    throw new Error('Failed to load dashboard statistics');
  }
};
