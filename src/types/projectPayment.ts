export interface ProjectPayment {
  _id: string;
  project: string;
  type: 'credit' | 'debit';
  paymentAmount: number;
  paymentDate: string;
  paymentStatus: 'pending' | 'paid' | 'verified' | 'disputed' | 'rejected';
  paymentMethod: 'cash' | 'check' | 'bank_transfer' | 'upi' | 'digital_wallet';
  transactionId?: string;
  receiptPhoto?: string;
  notes?: string;
}

export interface ProjectPaymentFormData {
  project: string;
  type: string;
  paymentAmount: string;
  paymentDate: string;
  paymentStatus: string;
  paymentMethod: string;
  transactionId: string;
  receiptPhoto: string;
  notes: string;
}

export interface ProjectPaymentFormErrors {
  project?: string;
  type?: string;
  paymentAmount?: string;
  paymentDate?: string;
  paymentStatus?: string;
  paymentMethod?: string;
  transactionId?: string;
  receiptPhoto?: string;
  notes?: string;
}

export interface ProjectPaymentNotificationState {
  show: boolean;
  type: 'success' | 'error';
  message: string;
}

export interface ProjectPaymentProjectOption {
  _id: string;
  name: string;
  projectCode: string;
  status: string;
}