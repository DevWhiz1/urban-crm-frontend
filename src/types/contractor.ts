export interface User {
  _id: string;
  userName: string;
  email: string;
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