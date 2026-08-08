import apiClient from '../../../services/apiClient';

export interface ContractProjectDTO {
  id: string;
  name: string;
  projectCode: string;
  location: string;
  status: string;
  progress?: number;
}

export interface ContractorContractDTO {
  id: string;
  contractType: string;
  totalAmount: number;
  startDate: string;
  endDate?: string;
  isTerminated: boolean;
  description?: string;
  project: ContractProjectDTO | null;
}

export interface ContractorPaymentDTO {
  id: string;
  paymentId: string;
  amount: number;
  date: string;
  paymentMethod: string;
  status: string;
  transactionId?: string;
  workDescription?: string;
  notes?: string;
}

export interface ContractorPaymentSummary {
  contractId: string;
  contractType: string;
  totalAmount: number;
  totalReceived: number;
  pendingBalance: number;
  project: ContractProjectDTO | null;
}

export interface ContractorSummaryDTO {
  totalContracts: number;
  activeContracts: number;
  totalContractValue: number;
  totalReceived: number;
  pendingBalance: number;
}

export interface ContractorAllPaymentDTO {
  id: string;
  paymentId: string;
  amount: number;
  date: string;
  paymentMethod: string;
  status: string;
  transactionId?: string;
  workDescription?: string;
  notes?: string;
  contract: {
    id: string;
    contractType: string;
    totalAmount: number;
    project: { id: string; name: string; projectCode: string } | null;
  } | null;
}

export const contractorPortalApi = {
  /**
   * Fetches dashboard summary stats for the contractor.
   */
  getSummary: async (): Promise<ContractorSummaryDTO> => {
    const response = await apiClient.get('/api/portal/contractor/summary');
    return response.data.summary;
  },

  /**
   * Fetches all contracts belonging to this contractor.
   * Backend enforces ownership: contract.contractor === req.contractorId
   */
  getMyContracts: async (): Promise<ContractorContractDTO[]> => {
    const response = await apiClient.get('/api/portal/contractor/contracts');
    return response.data.contracts;
  },

  /**
   * Fetches all payments across all of the contractor's contracts.
   * Backend enforces ownership: contract.contractor === req.contractorId
   */
  getAllMyPayments: async (): Promise<ContractorAllPaymentDTO[]> => {
    const response = await apiClient.get('/api/portal/contractor/all-payments');
    return response.data.payments;
  },

  /**
   * Fetches payment summary + list for a specific contract.
   * Backend enforces ownership: contract.contractor === req.contractorId
   */
  getMyContractPayments: async (
    contractId: string
  ): Promise<{ summary: ContractorPaymentSummary; payments: ContractorPaymentDTO[] }> => {
    const response = await apiClient.get(`/api/portal/contractor/payments/${contractId}`);
    return { summary: response.data.summary, payments: response.data.payments };
  },
};
