import apiClient from './apiClient';

export interface ProjectReport {
  summary: {
    totalProjects: number;
    totalRevenue: number;
    averageProjectValue: number;
    statusBreakdown: Record<string, number>;
    categoryBreakdown: Record<string, number>;
  };
  projects: Array<{
    _id: string;
    name: string;
    projectCode: string;
    status: string;
    projectCategory: string;
    totalCost: number;
    createdAt: string;
    customer: any;
    contractors: any[];
  }>;
}

export interface ContractorReport {
  summary: {
    totalContractors: number;
    activeContractors: number;
    averageRating: number;
    typeBreakdown: Record<string, number>;
    ratingDistribution: Record<string, number>;
  };
  contractors: Array<{
    _id: string;
    companyName: string;
    contractorType: string;
    rating?: number;
    isActive: boolean;
    createdAt: string;
    user: any;
    phoneNumber?: string;
    paymentTerms?: string;
    address?: string;
  }>;
}

export interface ClientReport {
  summary: {
    totalClients: number;
    activeClients: number;
    newClientsThisMonth: number;
    paymentTermsBreakdown: Record<string, number>;
  };
  clients: Array<{
    _id: string;
    paymentTerms: string;
    isActive: boolean;
    createdAt: string;
    user: any;
  }>;
}

export interface PaymentReport {
  summary: {
    totalAmount: number;
    paidAmount: number;
    pendingAmount: number;
    overdueAmount: number;
    statusBreakdown: Record<string, number>;
    monthlyBreakdown: Record<string, { count: number; amount: number; credit: number; debit: number }>;
  };
  payments: Array<{
    _id: string;
    amount: number;
    status: string;
    paymentMethod: string;
    type: string;
    date: string;
    createdAt: string;
    project?: string;
    contractor?: string;
    contract?: string;
    workDescription?: string;
    transactionId?: string;
    createdBy?: string;
    updatedAt?: string;
  }>;
}

export interface FinancialSummary {
  revenue: {
    totalProjectRevenue: number;
    totalPayments: number;
    paidPayments: number;
    pendingPayments: number;
  };
  costs: {
    totalContractValue: number;
    grossProfit: number;
    profitMargin: number;
  };
  projects: number;
  contracts: number;
  payments: number;
}

export interface ReportFilters {
  startDate?: string;
  endDate?: string;
  status?: string;
  category?: string;
  contractorType?: string;
  minRating?: number;
  isActive?: boolean;
  paymentType?: string;
}

// Get project reports
export const getProjectReports = async (filters: ReportFilters = {}): Promise<ProjectReport> => {
  try {
    const response = await apiClient.get('/api/reports/projects', { params: filters });
    return response.data.data;
  } catch (error) {
    console.error('Failed to fetch project reports:', error);
    throw new Error('Failed to load project reports');
  }
};

// Get contractor reports
export const getContractorReports = async (filters: ReportFilters = {}): Promise<ContractorReport> => {
  try {
    const response = await apiClient.get('/api/reports/contractors', { params: filters });
    return response.data.data;
  } catch (error) {
    console.error('Failed to fetch contractor reports:', error);
    throw new Error('Failed to load contractor reports');
  }
};

// Get client reports
export const getClientReports = async (filters: ReportFilters = {}): Promise<ClientReport> => {
  try {
    const response = await apiClient.get('/api/reports/clients', { params: filters });
    return response.data.data;
  } catch (error) {
    console.error('Failed to fetch client reports:', error);
    throw new Error('Failed to load client reports');
  }
};

// Get payment reports
export const getPaymentReports = async (filters: ReportFilters = {}): Promise<PaymentReport> => {
  try {
    const response = await apiClient.get('/api/reports/payments', { params: filters });
    return response.data.data;
  } catch (error) {
    console.error('Failed to fetch payment reports:', error);
    throw new Error('Failed to load payment reports');
  }
};

// Get financial summary
export const getFinancialSummary = async (filters: ReportFilters = {}): Promise<FinancialSummary> => {
  try {
    const response = await apiClient.get('/api/reports/financial-summary', { params: filters });
    return response.data.data;
  } catch (error) {
    console.error('Failed to fetch financial summary:', error);
    throw new Error('Failed to load financial summary');
  }
};

// Payment Analytics Types
export interface PaymentAnalytics {
  period: string;
  analytics: Array<{
    date: string;
    credit: number;
    debit: number;
    net: number;
    count: number;
  }>;
  summary: {
    totalCredit: number;
    totalDebit: number;
    netAmount: number;
    totalTransactions: number;
  };
}

// Get payment analytics for dashboard graphs
export const getPaymentAnalytics = async (period: string = 'monthly'): Promise<PaymentAnalytics> => {
  try {
    const response = await apiClient.get('/api/reports/payment-analytics', { params: { period } });
    return response.data.data;
  } catch (error) {
    console.error('Failed to fetch payment analytics:', error);
    throw new Error('Failed to load payment analytics');
  }
};
