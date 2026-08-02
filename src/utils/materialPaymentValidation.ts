import { MaterialPaymentFormData, MaterialPaymentFormErrors } from '../types/materialPayment';

export const validateMaterialPaymentForm = (data: MaterialPaymentFormData): MaterialPaymentFormErrors => {
  const errors: MaterialPaymentFormErrors = {};

  // Required fields
  if (!data.project.trim()) {
    errors.project = 'Project selection is required';
  }

  if (!data.totalAmount.trim()) {
    errors.totalAmount = 'Total amount is required';
  } else if (isNaN(parseFloat(data.totalAmount)) || parseFloat(data.totalAmount) <= 0) {
    errors.totalAmount = 'Please enter a valid amount greater than 0';
  }

  if (!data.date.trim()) {
    errors.date = 'Payment date is required';
  }



  // Quantity validation
  if (data.MaterialQuantity.trim() && (isNaN(parseFloat(data.MaterialQuantity)) || parseFloat(data.MaterialQuantity) <= 0)) {
    errors.MaterialQuantity = 'Please enter a valid quantity greater than 0';
  }

  // Rate validation
  if (data.MaterialRate.trim() && (isNaN(parseFloat(data.MaterialRate)) || parseFloat(data.MaterialRate) <= 0)) {
    errors.MaterialRate = 'Please enter a valid rate greater than 0';
  }

  return errors;
};

export const hasMaterialPaymentErrors = (errors: MaterialPaymentFormErrors): boolean => {
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