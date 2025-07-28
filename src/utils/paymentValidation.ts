import { PaymentFormData, PaymentFormErrors } from '../types/payment';

export const validatePaymentForm = (data: PaymentFormData): PaymentFormErrors => {
  const errors: PaymentFormErrors = {};

  // Required fields
  if (!data.project.trim()) {
    errors.project = 'Project selection is required';
  }

  if (!data.contractor.trim()) {
    errors.contractor = 'Contractor selection is required';
  }

  if (!data.amount.trim()) {
    errors.amount = 'Payment amount is required';
  } else if (isNaN(parseFloat(data.amount)) || parseFloat(data.amount) <= 0) {
    errors.amount = 'Please enter a valid amount greater than 0';
  }

  if (!data.paymentMethod.trim()) {
    errors.paymentMethod = 'Payment method is required';
  }

  if (!data.date.trim()) {
    errors.date = 'Payment date is required';
  }

  // Date validation - payment date should not be in the future
  if (data.date) {
    const paymentDate = new Date(data.date);
    const today = new Date();
    today.setHours(23, 59, 59, 999); // End of today
    
    if (paymentDate > today) {
      errors.date = 'Payment date cannot be in the future';
    }
  }

  // Transaction ID validation for non-cash payments
  if (data.paymentMethod && data.paymentMethod !== 'cash' && !data.transactionId.trim()) {
    errors.transactionId = 'Transaction ID is required for non-cash payments';
  }

  // Receipt photo URL validation
  if (data.receiptPhoto.trim() && !isValidUrl(data.receiptPhoto.trim())) {
    errors.receiptPhoto = 'Please enter a valid URL for receipt photo';
  }

  return errors;
};

const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const hasPaymentErrors = (errors: PaymentFormErrors): boolean => {
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

export const getPaymentStatusColor = (status: string): string => {
  switch (status) {
    case 'paid': return 'text-green-600 bg-green-100';
    case 'verified': return 'text-blue-600 bg-blue-100';
    case 'pending': return 'text-yellow-600 bg-yellow-100';
    case 'disputed': return 'text-red-600 bg-red-100';
    case 'rejected': return 'text-gray-600 bg-gray-100';
    default: return 'text-gray-600 bg-gray-100';
  }
};