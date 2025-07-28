import { ProjectContractFormData, ProjectContractFormErrors } from '../types/projectContract';

export const validateProjectContractForm = (data: ProjectContractFormData): ProjectContractFormErrors => {
  const errors: ProjectContractFormErrors = {};

  // Required fields
  if (!data.project.trim()) {
    errors.project = 'Project selection is required';
  }

  if (!data.contractor.trim()) {
    errors.contractor = 'Contractor selection is required';
  }

  if (!data.totalAmount.trim()) {
    errors.totalAmount = 'Total amount is required';
  } else if (isNaN(parseFloat(data.totalAmount)) || parseFloat(data.totalAmount) <= 0) {
    errors.totalAmount = 'Please enter a valid amount greater than 0';
  }

  if (!data.startDate.trim()) {
    errors.startDate = 'Start date is required';
  }

  // Date validations
  if (data.startDate && data.endDate) {
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);
    
    if (endDate <= startDate) {
      errors.endDate = 'End date must be after start date';
    }
  }

  // Start date should not be in the past
  if (data.startDate) {
    const startDate = new Date(data.startDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (startDate < today) {
      errors.startDate = 'Start date cannot be in the past';
    }
  }

  return errors;
};

export const hasProjectContractErrors = (errors: ProjectContractFormErrors): boolean => {
  return Object.keys(errors).length > 0;
};

export const formatPKRCurrency = (amount: string): string => {
  const num = parseFloat(amount);
  if (isNaN(num)) return '';
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    minimumFractionDigits: 2
  }).format(num);
};