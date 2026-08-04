export interface ExpenseCategory {
  _id: string;
  name: string;
  createdAt: string;
}

export interface Expense {
  _id: string;
  expenseId: string;
  date: string;
  category: string | ExpenseCategory;
  amount: number;
  paymentMethod?: string;
  vendor?: string;
  description?: string;
  expenseType: 'Company' | 'Project' | 'Employee';
  project?: any; // Can be typed fully later if needed
  employee?: any;
  attachReceipt?: string;
  approvalStatus: 'Pending' | 'Approved' | 'Rejected';
  createdBy: any;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseFormData {
  date: string;
  category: string;
  amount: number;
  paymentMethod?: string;
  vendor?: string;
  description?: string;
  expenseType: 'Company' | 'Project' | 'Employee';
  project?: string;
  employee?: string;
  attachReceipt?: string;
  approvalStatus?: 'Pending' | 'Paid' | 'Approved' | 'Rejected';
}
