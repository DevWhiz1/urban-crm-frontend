import apiClient from '../../../services/apiClient';

export interface ClientProjectDTO {
  id: string;
  projectCode: string;
  name: string;
  location: string;
  projectCategory: string;
  projectType: string;
  totalCoverageArea: number;
  totalCost: number;
  status: string;
  progress: number;
  startDate: string;
  estimatedDuration: string;
}

export interface ClientPaymentDTO {
  id: string;
  paymentId: string;
  receiptNo?: string;
  amount: number;
  date: string;
  paymentMethod: string;
  status: string;
  transactionId?: string;
  notes?: string;
  workDescription?: string;
}

export interface ClientPaymentSummary {
  projectName: string;
  projectCode: string;
  projectStatus: string;
  projectProgress: number;
  totalCost: number;
  totalReceived: number;
  pendingBalance: number;
  materialPurchaseCost: number;
  netMaterialCost: number;
}

export const clientPortalApi = {
  /**
   * Fetches the client's own project details.
   * Backend enforces ownership: project.customer === req.clientId
   */
  getMyProject: async (): Promise<ClientProjectDTO> => {
    const response = await apiClient.get('/api/portal/client/project');
    return response.data.project;
  },

  /**
   * Fetches the client's payment summary and payment list.
   * Backend enforces ownership: project.customer === req.clientId
   */
  getMyPayments: async (): Promise<{ summary: ClientPaymentSummary; payments: ClientPaymentDTO[] }> => {
    const response = await apiClient.get('/api/portal/client/payments');
    return { summary: response.data.summary, payments: response.data.payments };
  },
};
