import { SupplierFormData, SupplierFormErrors } from '../types/supplier';

export const validateSupplierForm = (data: SupplierFormData): SupplierFormErrors => {
    const errors: SupplierFormErrors = {};

    if (!data.user) {
        errors.user = 'User is required';
    }

    if (!data.companyName || data.companyName.trim() === '') {
        errors.companyName = 'Company Name is required';
    }

    if (!data.supplierType || data.supplierType.trim() === '') {
        errors.supplierType = 'Supplier Type is required';
    }

    return errors;
};

export const hasSupplierErrors = (errors: SupplierFormErrors): boolean => {
    return Object.values(errors).some(error => error !== undefined && error !== '');
};
