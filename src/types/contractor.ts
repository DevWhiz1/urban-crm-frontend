export interface User {
  _id: string;
  userName: string;
  email: string;
  phoneNumber?: string;
  address?: string;
  status: string;
  role?: string;
}

export interface Contractor {
  _id: string;
  user: string | {
    _id: string;
    userName: string;
    email: string;
    phoneNumber?: string;
    address?: string;
    status: string;
    role?: string;
  };
  companyName: string;
  contractorType: string;
  paymentTerms: string;
  accountNumber?: string;
  address: string;
  phoneNumber: string;
  isActive: boolean;
  rating?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ContractorFormData {
  user: string;
  companyName: string;
  contractorType: string;
  paymentTerms: string;
  bankDetails: string;
  address: string;
  phoneNumber: string;
}

export interface FormErrors {
  user?: string;
  companyName?: string;
  contractorType?: string;
  paymentTerms?: string;
  bankDetails?: string;
  address?: string;
  phoneNumber?: string;
}

export interface NotificationState {
  show: boolean;
  type: 'success' | 'error';
  message: string;
}