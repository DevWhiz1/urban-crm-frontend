import React, { useState } from 'react';
import { Breadcrumbs } from '../ui/Breadcrumbs';
import { Mail, Lock, User, Briefcase, Phone, MapPin, Building, CreditCard, Package } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Notification } from '../ui/Notification';
import { Select } from '../ui/Select';
import { createUser } from '../../services/userApi';
import { createClient } from '../../services/clientApi';
import { createContractor } from '../../services/contractorApi';
import { createSupplier } from '../../services/supplierApi';

const ROLE_OPTIONS = [
    { value: 'Admin', label: 'Admin' },
    { value: 'Contractor', label: 'Contractor' },
    { value: 'Client', label: 'Client' },
    { value: 'Supplier', label: 'Supplier' },
];

import { CONTRACTOR_TYPES } from '../../constants/contractor';
import { SUPPLIER_TYPES, SUPPLIER_PAYMENT_TERMS } from '../../constants/supplier';

const PAYMENT_TERMS_OPTIONS = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'bi-weekly', label: 'Bi-Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'milestone', label: 'Milestone' },
];

export const AddUser: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState({
        show: false,
        type: 'success' as 'success' | 'error',
        message: ''
    });

    const [formData, setFormData] = useState({
        userName: '',
        email: '',
        password: '',
        role: 'Client'
    });

    const [clientData, setClientData] = useState({
        paymentTerms: '',
        bankDetails: '',
        address: '',
        phoneNumber: '',
    });

    const [contractorData, setContractorData] = useState({
        companyName: '',
        phoneNumber: '',
        contractorType: 'general',
        paymentTerms: 'weekly',
        accountNumber: '',
        address: '',
    });

    const [supplierData, setSupplierData] = useState({
        companyName: '',
        phoneNumber: '',
        supplierType: '',
        paymentTerms: 'monthly',
        accountNumber: '',
        address: '',
    });

    const [customSupplierType, setCustomSupplierType] = useState('');

    const [errors, setErrors] = useState<{ userName?: string; email?: string; password?: string; role?: string; supplierCompanyName?: string; supplierType?: string }>({});

    const handleInputChange = (field: keyof typeof formData) => (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        setFormData(prev => ({ ...prev, [field]: e.target.value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };

    const handleClientChange = (field: keyof typeof clientData) => (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        setClientData(prev => ({ ...prev, [field]: e.target.value }));
    };

    const handleContractorChange = (field: keyof typeof contractorData) => (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        setContractorData(prev => ({ ...prev, [field]: e.target.value }));
    };

    const handleSupplierChange = (field: keyof typeof supplierData) => (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        setSupplierData(prev => ({ ...prev, [field]: e.target.value }));
        if (field === 'companyName' && errors.supplierCompanyName) {
            setErrors(prev => ({ ...prev, supplierCompanyName: undefined }));
        }
        if (field === 'supplierType' && errors.supplierType) {
            setErrors(prev => ({ ...prev, supplierType: undefined }));
        }
    };

    const validateForm = () => {
        const newErrors: { userName?: string; email?: string; password?: string; role?: string; supplierCompanyName?: string; supplierType?: string } = {};
        if (!formData.userName.trim()) {
            newErrors.userName = 'Username is required';
        }
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email';
        }
        if (!formData.password.trim()) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }
        if (!formData.role) {
            newErrors.role = 'Role is required';
        }

        // Supplier-specific validations
        if (formData.role === 'Supplier') {
            if (!supplierData.companyName.trim()) {
                newErrors.supplierCompanyName = 'Company name is required for suppliers';
            }
            if (!supplierData.supplierType) {
                newErrors.supplierType = 'Supplier type is required';
            }
            if (supplierData.supplierType === 'other' && !customSupplierType.trim()) {
                newErrors.supplierType = 'Please specify the supplier type';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;
        try {
            setLoading(true);
            
            // 1. Create User (admin-only endpoint — does not touch session cookies)
            const response = await createUser(formData);
            const newUserId = response?.user?.id;

            if (!newUserId) {
                throw new Error("User creation failed, could not retrieve user ID.");
            }

            // 2. Create Client, Contractor or Supplier Profile based on role
            if (formData.role === 'Client') {
                await createClient({
                    user: newUserId,
                    ...clientData
                });
            } else if (formData.role === 'Contractor') {
                await createContractor({
                    user: newUserId,
                    ...contractorData
                });
            } else if (formData.role === 'Supplier') {
                const finalSupplierType = supplierData.supplierType === 'other' 
                    ? customSupplierType.trim() 
                    : supplierData.supplierType;
                await createSupplier({
                    user: newUserId,
                    ...supplierData,
                    supplierType: finalSupplierType,
                });
            }

            setNotification({
                show: true,
                type: 'success',
                message: 'User added successfully!'
            });
            
            // Reset forms
            setFormData({ userName: '', email: '', password: '', role: 'Client' });
            setClientData({ paymentTerms: '', bankDetails: '', address: '', phoneNumber: '' });
            setContractorData({ companyName: '', phoneNumber: '', contractorType: 'general', paymentTerms: 'weekly', accountNumber: '', address: '' });
            setSupplierData({ companyName: '', phoneNumber: '', supplierType: '', paymentTerms: 'monthly', accountNumber: '', address: '' });
            setCustomSupplierType('');
        } catch (error: any) {
            setNotification({
                show: true,
                type: 'error',
                message: error.message || 'Failed to add user. Please try again.'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <Breadcrumbs
                items={[
                    { label: 'Dashboard', path: '/dashboard' },
                    { label: 'Users', path: '/dashboard/users' },
                    { label: 'Add New User' }
                ]}
            />

            <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Add New User</h1>
                <p className="text-sm text-gray-500 mt-1">Create a user profile. Selecting Client, Contractor, or Supplier will show additional fields.</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 sm:p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="border-b border-gray-100 pb-4 mb-4">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">Account Information</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input
                                label="Username"
                                type="text"
                                value={formData.userName}
                                onChange={handleInputChange('userName')}
                                error={errors.userName}
                                placeholder="Enter username"
                                required
                            />
                            <Input
                                label="Email Address"
                                type="email"
                                value={formData.email}
                                onChange={handleInputChange('email')}
                                error={errors.email}
                                placeholder="Enter email address"
                                required
                            />
                            <Input
                                label="Password"
                                type="password"
                                value={formData.password}
                                onChange={handleInputChange('password')}
                                error={errors.password}
                                placeholder="Create password (min. 6 chars)"
                                required
                            />
                            <Select
                                label="Role"
                                value={formData.role}
                                onChange={handleInputChange('role')}
                                error={errors.role}
                                required
                                options={ROLE_OPTIONS}
                            />
                        </div>
                    </div>

                    {/* Dynamic Client Fields */}
                    {formData.role === 'Client' && (
                        <div className="bg-blue-50/50 p-6 rounded-xl border border-blue-100">
                            <h2 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
                                <Briefcase className="w-5 h-5" /> Client Details
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Input
                                    label="Phone Number"
                                    type="text"
                                    value={clientData.phoneNumber}
                                    onChange={handleClientChange('phoneNumber')}
                                    placeholder="Enter phone number"
                                    icon={<Phone className="w-4 h-4 text-gray-400" />}
                                />
                                <Input
                                    label="Address"
                                    type="text"
                                    value={clientData.address}
                                    onChange={handleClientChange('address')}
                                    placeholder="Enter address"
                                    icon={<MapPin className="w-4 h-4 text-gray-400" />}
                                />
                                <Select
                                    label="Payment Terms"
                                    value={clientData.paymentTerms}
                                    onChange={handleClientChange('paymentTerms')}
                                    options={PAYMENT_TERMS_OPTIONS}
                                />
                                <Input
                                    label="Bank Details"
                                    type="text"
                                    value={clientData.bankDetails}
                                    onChange={handleClientChange('bankDetails')}
                                    placeholder="Account #, Bank Name"
                                    icon={<CreditCard className="w-4 h-4 text-gray-400" />}
                                />
                            </div>
                        </div>
                    )}

                    {/* Dynamic Contractor Fields */}
                    {formData.role === 'Contractor' && (
                        <div className="bg-orange-50/50 p-6 rounded-xl border border-orange-100">
                            <h2 className="text-lg font-semibold text-orange-900 mb-4 flex items-center gap-2">
                                <Building className="w-5 h-5" /> Contractor Details
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Input
                                    label="Company Name"
                                    type="text"
                                    value={contractorData.companyName}
                                    onChange={handleContractorChange('companyName')}
                                    placeholder="Enter company name"
                                    icon={<Building className="w-4 h-4 text-gray-400" />}
                                />
                                <Input
                                    label="Phone Number"
                                    type="text"
                                    value={contractorData.phoneNumber}
                                    onChange={handleContractorChange('phoneNumber')}
                                    placeholder="Enter phone number"
                                    icon={<Phone className="w-4 h-4 text-gray-400" />}
                                />
                                <Select
                                    label="Contractor Type"
                                    value={contractorData.contractorType}
                                    onChange={handleContractorChange('contractorType')}
                                    options={CONTRACTOR_TYPES}
                                />
                                <Select
                                    label="Payment Terms"
                                    value={contractorData.paymentTerms}
                                    onChange={handleContractorChange('paymentTerms')}
                                    options={PAYMENT_TERMS_OPTIONS}
                                />
                                <Input
                                    label="Account Number"
                                    type="text"
                                    value={contractorData.accountNumber}
                                    onChange={handleContractorChange('accountNumber')}
                                    placeholder="Enter account details"
                                    icon={<CreditCard className="w-4 h-4 text-gray-400" />}
                                />
                                <Input
                                    label="Address"
                                    type="text"
                                    value={contractorData.address}
                                    onChange={handleContractorChange('address')}
                                    placeholder="Enter address"
                                    icon={<MapPin className="w-4 h-4 text-gray-400" />}
                                />
                            </div>
                        </div>
                    )}

                    {/* Dynamic Supplier Fields */}
                    {formData.role === 'Supplier' && (
                        <div className="bg-teal-50/50 p-6 rounded-xl border border-teal-100">
                            <h2 className="text-lg font-semibold text-teal-900 mb-4 flex items-center gap-2">
                                <Package className="w-5 h-5" /> Supplier Details
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Input
                                    label="Company Name"
                                    type="text"
                                    value={supplierData.companyName}
                                    onChange={handleSupplierChange('companyName')}
                                    placeholder="Enter company name"
                                    error={errors.supplierCompanyName}
                                    required
                                    icon={<Building className="w-4 h-4 text-gray-400" />}
                                />
                                <Input
                                    label="Phone Number"
                                    type="text"
                                    value={supplierData.phoneNumber}
                                    onChange={handleSupplierChange('phoneNumber')}
                                    placeholder="Enter phone number"
                                    icon={<Phone className="w-4 h-4 text-gray-400" />}
                                />
                                <div>
                                    <Select
                                        label="Supplier Type"
                                        value={supplierData.supplierType}
                                        onChange={handleSupplierChange('supplierType')}
                                        options={SUPPLIER_TYPES}
                                        placeholder="Select supplier type..."
                                        error={errors.supplierType}
                                        required
                                    />
                                </div>
                                {supplierData.supplierType === 'other' && (
                                    <Input
                                        label="Specify Type"
                                        type="text"
                                        value={customSupplierType}
                                        onChange={(e) => {
                                            setCustomSupplierType(e.target.value);
                                            if (errors.supplierType) {
                                                setErrors(prev => ({ ...prev, supplierType: undefined }));
                                            }
                                        }}
                                        placeholder="Enter custom supplier type"
                                        error={errors.supplierType && supplierData.supplierType === 'other' ? errors.supplierType : undefined}
                                        required
                                    />
                                )}
                                <Select
                                    label="Payment Terms"
                                    value={supplierData.paymentTerms}
                                    onChange={handleSupplierChange('paymentTerms')}
                                    options={SUPPLIER_PAYMENT_TERMS}
                                />
                                <Input
                                    label="Account Number"
                                    type="text"
                                    value={supplierData.accountNumber}
                                    onChange={handleSupplierChange('accountNumber')}
                                    placeholder="Enter account details"
                                    icon={<CreditCard className="w-4 h-4 text-gray-400" />}
                                />
                                <Input
                                    label="Address"
                                    type="text"
                                    value={supplierData.address}
                                    onChange={handleSupplierChange('address')}
                                    placeholder="Enter address"
                                    icon={<MapPin className="w-4 h-4 text-gray-400" />}
                                />
                            </div>
                        </div>
                    )}

                    <div className="pt-4 border-t border-gray-100 flex justify-end">
                        <Button
                            type="submit"
                            loading={loading}
                            size="lg"
                            className="px-8"
                        >
                            Create User {formData.role !== 'Admin' && `& ${formData.role}`}
                        </Button>
                    </div>
                </form>
            </div>

            <Notification
                show={notification.show}
                type={notification.type}
                message={notification.message}
                onClose={() => setNotification(prev => ({ ...prev, show: false }))}
            />
        </div>
    );
};