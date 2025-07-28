export interface Client {
  _id: string;
  user: string;
  paymentTerms: string;
  bankDetails: string;
  address: string;
  phoneNumber: string;
  isActive: boolean;
}

export interface ClientFormData {
  user: string;
  paymentTerms: string;
  bankDetails: string;
  address: string;
  phoneNumber: string;
}

export interface ClientFormErrors {
  user?: string;
  paymentTerms?: string;
  bankDetails?: string;
  address?: string;
  phoneNumber?: string;
}

export interface ClientNotificationState {
  show: boolean;
  type: 'success' | 'error';
  message: string;
}