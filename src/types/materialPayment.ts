export interface MaterialPayment {
  _id: string;
  project: string;
  materialDetail: string;
  materialProvider: string;
  MaterialQuantity: number;
  MaterialRate: number;
  totalAmount: number;
  date: string;
}

export interface MaterialPaymentFormData {
  project: string;
  materialDetail: string;
  materialProvider: string;
  MaterialQuantity: string;
  MaterialRate: string;
  totalAmount: string;
  date: string;
}

export interface MaterialPaymentFormErrors {
  project?: string;
  materialDetail?: string;
  materialProvider?: string;
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
}