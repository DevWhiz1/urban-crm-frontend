export interface Project {
  _id: string;
  name: string;
  projectCode: string;
  location: string;
  projectCategory: 'residential' | 'commercial' | 'industrial' | 'infrastructure' | 'other';
  projectType: 'labourRate' | 'withMaterial';
  ratePerSquareFoot?: number;
  totalArea?: number;
  totalCoverageArea?: number;
  totalCost?: number;
  labouRate?: number;
  totalLabourCost?: number;
  startDate?: string;
  estimatedDuration?: string;
  actualCompletionDate?: string;
  customer: string;
  contractors: string[];
  description?: string;
  status: 'planning' | 'pending' | 'ongoing' | 'completed' | 'on_hold' | 'cancelled';
  progress: number;
  drawings?: string[];
  contracts?: string[];
  invoices?: string[];
}

export interface ProjectFormData {
  name: string;
  customer: string;
  location: string;
  projectCategory: string;
  projectType: string;
  ratePerSquareFoot: string;
  totalArea: string;
  totalCoverageArea: string;
  totalCost: string;
  labouRate: string;
  totalLabourCost: string;
  startDate: string;
  estimatedDuration: string;
  contractors: string[];
  drawings: string[];
  contracts: string[];
  description: string;
  status: string;
}

export interface ProjectFormErrors {
  name?: string;
  customer?: string;
  location?: string;
  projectCategory?: string;
  projectType?: string;
  ratePerSquareFoot?: string;
  totalArea?: string;
  totalCoverageArea?: string;
  labouRate?: string;
  startDate?: string;
  estimatedDuration?: string;
  drawings?: string;
  contracts?: string;
  description?: string;
}

export interface ProjectNotificationState {
  show: boolean;
  type: 'success' | 'error';
  message: string;
}

export interface Client {
  _id: string;
  user: {
    _id: string;
    userName: string;
    email: string;
  };
  paymentTerms: string;
  bankDetails: string;
  address: string;
  phoneNumber: string;
  isActive: boolean;
}

export interface Contractor {
  _id: string;
  user: {
    _id: string;
    userName: string;
    email: string;
  };
  companyName: string;
  contractorType: string;
  paymentTerms: string;
  bankDetails: string;
  address: string;
  phoneNumber: string;
}