export interface Supplier {
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
  phoneNumber?: string;
  supplierType: string;
  paymentTerms?: string;
  accountNumber?: string;
  address?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface SupplierFormData {
  user: string;
  companyName: string;
  phoneNumber?: string;
  supplierType: string;
  paymentTerms?: string;
  accountNumber?: string;
  address?: string;
}

export interface SupplierFormErrors {
  user?: string;
  companyName?: string;
  supplierType?: string;
}

export interface SupplierNotificationState {
  show: boolean;
  type: 'success' | 'error';
  message: string;
}
