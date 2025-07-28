export interface Payment {
  _id: string;
  project: string;
  contractor: string;
  contract?: string;
  date: string;
  amount: number;
  paymentMethod: 'cash' | 'check' | 'bank_transfer' | 'upi' | 'digital_wallet';
  transactionId?: string;
  workDescription?: string;
  status: 'pending' | 'paid' | 'verified' | 'disputed' | 'rejected';
  receiptPhoto?: string;
  notes?: string;
  createdBy: string;
}

export interface PaymentFormData {
  project: string;
  contractor: string;
  contract: string;
  date: string;
  amount: string;
  paymentMethod: string;
  transactionId: string;
  workDescription: string;
  status: string;
  receiptPhoto: string;
  notes: string;
}

export interface PaymentFormErrors {
  project?: string;
  contractor?: string;
  contract?: string;
  date?: string;
  amount?: string;
  paymentMethod?: string;
  transactionId?: string;
  workDescription?: string;
  receiptPhoto?: string;
  notes?: string;
}

export interface PaymentNotificationState {
  show: boolean;
  type: 'success' | 'error';
  message: string;
}

export interface PaymentProjectOption {
  _id: string;
  name: string;
  projectCode: string;
  status: string;
  customer: {
    user: {
      userName: string;
      email: string;
    };
  };
}

export interface PaymentContractorOption {
  _id: string;
  user: {
    _id: string;
    userName: string;
    email: string;
  };
  companyName: string;
  contractorType: string;
}

export interface PaymentContractOption {
  _id: string;
  project: {
    _id: string;
    name: string;
    projectCode: string;
  };
  contractor: {
    _id: string;
    companyName: string;
  };
  contractType: string;
  totalAmount: number;
  startDate: string;
  endDate?: string;
}