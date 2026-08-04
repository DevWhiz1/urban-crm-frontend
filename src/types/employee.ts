export interface EmployeeDocument {
  _id?: string;
  url: string;
  name: string;
  type?: 'CNIC' | 'Contract' | 'Certificate' | 'Other';
}

export interface Employee {
  _id: string;
  employeeId: string;
  fullName: string;
  cnic: string;
  phone: string;
  email?: string;
  address?: string;
  designation?: string;
  department?: string;
  employmentType: 'Permanent' | 'Contract' | 'Daily Wage' | 'Intern';
  joiningDate: string;
  salary?: number;
  status: 'Active' | 'On Leave' | 'Resigned' | 'Terminated';
  emergencyContact?: string;
  documents?: EmployeeDocument[];
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface EmployeeFormData {
  fullName: string;
  cnic: string;
  phone: string;
  email?: string;
  address?: string;
  designation?: string;
  department?: string;
  employmentType: 'Permanent' | 'Contract' | 'Daily Wage' | 'Intern';
  joiningDate: string;
  salary?: number;
  status?: 'Active' | 'On Leave' | 'Resigned' | 'Terminated';
  emergencyContact?: string;
  documents?: EmployeeDocument[];
  role: string;
  password?: string;
}
