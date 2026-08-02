export interface Client {
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
  paymentTerms: string;
  bankDetails: string;
  address: string;
  phoneNumber: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
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