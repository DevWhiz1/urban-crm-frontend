import { PriceAddition } from './project';

export interface ProjectContract {
  _id: string;
  project: string | {
    _id: string;
    name: string;
    projectCode: string;
    status: string;
    location?: string;
    projectCategory?: string;
    projectType?: string;
  };
  contractor: string | {
    _id: string;
    companyName: string;
    contractorType: string;
    user: {
      _id: string;
      userName: string;
      email: string;
    };
    paymentTerms?: string;
    bankDetails?: string;
    address?: string;
    phoneNumber?: string;
  };
  contractType: string;
  totalAmount: number;
  additions?: PriceAddition[];
  startDate: string;
  endDate?: string;
  payments: string[];
  isTerminated: boolean;
  Description: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProjectContractFormData {
  project: string;
  contractor: string;
  contractType: string;
  totalAmount: string;
  startDate: string;
  endDate: string;
  Description: string;
}

export interface ProjectContractFormErrors {
  project?: string;
  contractor?: string;
  contractType?: string;
  totalAmount?: string;
  startDate?: string;
  endDate?: string;
  Description?: string;
}

export interface ProjectContractNotificationState {
  show: boolean;
  type: 'success' | 'error';
  message: string;
}

export interface ProjectOption {
  _id: string;
  name: string;
  projectCode: string;
  status: string;
}

export interface ContractorOption {
  _id: string;
  user: {
    _id: string;
    userName: string;
    email: string;
  };
  companyName: string;
  contractorType: string;
}