export interface MaterialPayment {
  _id: string;
  project: string;
  materialDetail: string;
  materialProvider: string;
  supplier?: string | { _id: string; companyName: string; };
  MaterialQuantity: number;
  MaterialRate: number;
  totalAmount: number;
  transactionType: 'purchase' | 'return';
  date: string;
  description?: string;
}

export interface MaterialPaymentFormData {
  project: string;
  materialDetail: string;
  materialProvider: string;
  MaterialQuantity: string;
  MaterialRate: string;
  totalAmount: string;
  transactionType: 'purchase' | 'return';
  date: string;
  status: string;
  paymentMethod: string;
  receiptPhoto: string;
  description?: string;
}

export interface MaterialPaymentFormErrors {
  project?: string;
  materialDetail?: string;
  materialProvider?: string;
  supplier?: string;
  MaterialQuantity?: string;
  MaterialRate?: string;
  totalAmount?: string;
  date?: string;
}

export interface MaterialPaymentNotificationState {
  show: boolean;
  type: 'success' | 'error';
  message: string;
}

export interface MaterialProjectOption {
  _id: string;
  name: string;
  projectCode: string;
  status: string;
  projectType: string;
}