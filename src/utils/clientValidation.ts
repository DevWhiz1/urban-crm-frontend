import { ClientFormData, ClientFormErrors } from '../types/client';

export const validateClientForm = (data: ClientFormData): ClientFormErrors => {
  const errors: ClientFormErrors = {};

  // Required fields
  if (!data.user.trim()) {
    errors.user = 'User selection is required';
  }

  // Phone number validation
  if (data.phoneNumber && !isValidPhoneNumber(data.phoneNumber)) {
    errors.phoneNumber = 'Please enter a valid phone number';
  }

  return errors;
};

export const isValidPhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^[0-9+\-()\s]{7,}$/;
  return phoneRegex.test(phone);
};

export const hasClientErrors = (errors: ClientFormErrors): boolean => {
  return Object.keys(errors).length > 0;
};