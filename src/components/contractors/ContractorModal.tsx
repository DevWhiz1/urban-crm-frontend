import React, { useState, useEffect } from 'react';
import {
    X,
    Wrench,
    Building,
    User,
    Users,
    Phone,
    MapPin,
    Star,
    CheckCircle,
    XCircle,
    Banknote,
    CreditCard
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Textarea } from '../ui/Textarea';
import { Notification } from '../ui/Notification';
import {
    createContractor,
    updateContractor,
    fetchUsersForContractor
} from '../../services/contractorApi';
import { CONTRACTOR_TYPES, PAYMENT_TERMS } from '../../constants/contractor';
import { validateForm, hasErrors } from '../../utils/validation';
import { Contractor, ContractorFormData, User as ContractorUser } from '../../types/contractor';

interface ContractorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (contractor: Contractor) => void;
    contractor?: Contractor;
    mode: 'add' | 'edit' | 'view';
}

export const ContractorModal: React.FC<ContractorModalProps> = ({
    isOpen,
    onClose,
    onSave,
    contractor,
    mode
}) => {
    const [users, setUsers] = useState<ContractorUser[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(true);
    const [notification, setNotification] = useState({
        show: false,
        type: 'success' as 'success' | 'error',
        message: ''
    });

    const getInitialFormData = (c?: Contractor): ContractorFormData => ({
        user: c?.user && typeof c.user === 'object' ? c.user._id : (typeof c?.user === 'string' ? c.user : ''),
        companyName: c?.companyName || '',
        contractorType: c?.contractorType || '',
        paymentTerms: c?.paymentTerms || '',
        bankDetails: c?.bankDetails || c?.accountNumber || '',
        address: c?.address || (c?.user && typeof c.user === 'object' ? c.user.address : '') || '',
        phoneNumber: c?.phoneNumber || (c?.user && typeof c.user === 'object' ? c.user.phoneNumber : '') || ''
    });

    const [formData, setFormData] = useState<ContractorFormData>(getInitialFormData(contractor));
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (isOpen) {
            loadInitialData();
            setFormData(getInitialFormData(contractor));
            setErrors({});
        }
    }, [isOpen, contractor, mode]);

    const loadInitialData = async () => {
        try {
            setLoadingData(true);
            const usersData = await fetchUsersForContractor();
            setUsers(usersData);
        } catch (error) {
            showNotification('error', 'Failed to load users. Please refresh the page.');
        } finally {
            setLoadingData(false);
        }
    };

    const showNotification = (type: 'success' | 'error', message: string) => {
        setNotification({ show: true, type, message });
    };

    const handleInputChange = (field: keyof ContractorFormData) => (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const value = e.target.value;
        setFormData(prev => ({ ...prev, [field]: value }));

        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Perform validation
        const validationErrors = validateForm(formData) as Record<string, string>;

        // Additional field validations for consistency
        if (!formData.user) validationErrors.user = 'User selection is required';
        if (!formData.companyName) validationErrors.companyName = 'Company name is required';
        if (!formData.contractorType) validationErrors.contractorType = 'Contractor type is required';
        if (!formData.paymentTerms) validationErrors.paymentTerms = 'Payment terms are required';

        setErrors(validationErrors);

        if (hasErrors(validationErrors)) {
            showNotification('error', 'Please fix the errors below before submitting.');
            return;
        }

        try {
            setLoading(true);

            // Pass both bankDetails and accountNumber for compatibility
            const payload = {
                ...formData,
                accountNumber: formData.bankDetails
            };

            if (mode === 'edit' && contractor) {
                const updatedContractor = await updateContractor(contractor._id, payload);
                showNotification('success', 'Contractor updated successfully!');
                onSave(updatedContractor);
            } else {
                await createContractor(payload as any);
                showNotification('success', 'Contractor created successfully!');
                setFormData(getInitialFormData());
                onSave({} as Contractor);
            }
        } catch (error) {
            showNotification('error', `Failed to ${mode === 'edit' ? 'update' : 'create'} contractor. Please try again.`);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setFormData(getInitialFormData());
        setErrors({});
        onClose();
    };

    const userOptions = users.map(user => ({
        value: user._id,
        label: `${user.userName} (${user.email})`
    }));

    const getContractorTypeLabel = (val?: string) => {
        if (!val) return 'N/A';
        const found = CONTRACTOR_TYPES.find(t => t.value === val);
        return found ? found.label : val;
    };

    const contractorTypeOptions = [
        ...CONTRACTOR_TYPES,
        ...(formData.contractorType && !CONTRACTOR_TYPES.find(t => t.value === formData.contractorType)
            ? [{ value: formData.contractorType, label: formData.contractorType }]
            : [])
    ];

    const paymentTermOptions = [
        ...PAYMENT_TERMS.map(term => ({ value: term, label: term })),
        ...(formData.paymentTerms && !PAYMENT_TERMS.includes(formData.paymentTerms as any)
            ? [{ value: formData.paymentTerms, label: formData.paymentTerms }]
            : [])
    ];

    const selectedUser = users.find(u => u._id === formData.user);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                {/* Background overlay */}
                <div
                    className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                    onClick={mode !== 'view' ? handleClose : undefined}
                ></div>

                {/* Modal panel */}
                <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden border border-gray-200 transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
                    {/* Header */}
                    <div className="bg-blue-600 px-6 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                                    <Wrench className="w-4 h-4 text-white" />
                                </div>
                                <h3 className="text-lg font-semibold text-white">
                                    {mode === 'view' ? 'View Contractor' : mode === 'edit' ? 'Edit Contractor' : 'Add New Contractor'}
                                </h3>
                            </div>
                            <button
                                onClick={handleClose}
                                className="text-white hover:text-blue-200 transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 max-h-[75vh] overflow-y-auto">
                        {mode === 'view' ? (
                            // View Mode
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Left Column */}
                                <div className="space-y-6">
                                    {/* Basic Information */}
                                    <div>
                                        <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                                            <Building className="w-5 h-5 text-blue-600" />
                                            Company Information
                                        </h4>
                                        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium text-gray-500">Company Name:</span>
                                                <span className="text-sm text-gray-900 font-medium">{contractor?.companyName || 'N/A'}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium text-gray-500">Contractor Type:</span>
                                                <span className="text-sm text-gray-900 capitalize">{getContractorTypeLabel(contractor?.contractorType)}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium text-gray-500">Status:</span>
                                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${contractor?.isActive ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'
                                                    }`}>
                                                    {contractor?.isActive ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                                    {contractor?.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Contact Information */}
                                    <div>
                                        <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                                            <Phone className="w-5 h-5 text-green-600" />
                                            Contact Information
                                        </h4>
                                        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium text-gray-500">Phone:</span>
                                                <span className="text-sm text-gray-900">{contractor?.phoneNumber || (typeof contractor?.user === 'object' ? contractor.user.phoneNumber : '') || 'N/A'}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium text-gray-500">Address:</span>
                                                <span className="text-sm text-gray-900">{contractor?.address || (typeof contractor?.user === 'object' ? contractor.user.address : '') || 'N/A'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column */}
                                <div className="space-y-6">
                                    {/* User Information */}
                                    <div>
                                        <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                                            <User className="w-5 h-5 text-purple-600" />
                                            User Information
                                        </h4>
                                        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium text-gray-500">Name:</span>
                                                <span className="text-sm text-gray-900">
                                                    {typeof contractor?.user === 'object' ? contractor.user.userName : 'N/A'}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium text-gray-500">Email:</span>
                                                <span className="text-sm text-gray-900">
                                                    {typeof contractor?.user === 'object' ? contractor.user.email : 'N/A'}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium text-gray-500">User Status:</span>
                                                <span className="text-sm text-gray-900">
                                                    {typeof contractor?.user === 'object' ? contractor.user.status : 'N/A'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Payment Information */}
                                    <div>
                                        <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                                            <Banknote className="w-5 h-5 text-orange-600" />
                                            Payment Information
                                        </h4>
                                        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium text-gray-500">Payment Terms:</span>
                                                <span className="text-sm text-gray-900">{contractor?.paymentTerms || 'N/A'}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium text-gray-500">Bank / Account Details:</span>
                                                <span className="text-sm text-gray-900">{contractor?.bankDetails || contractor?.accountNumber || 'N/A'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            // Add/Edit Mode Form matching ContractorForm layout & fields
                            <form onSubmit={handleSubmit} className="space-y-8">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    {/* User Assignment */}
                                    <div className="lg:col-span-2">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                                <Users className="w-4 h-4 text-blue-600" />
                                            </div>
                                            <h3 className="text-lg font-medium text-gray-900">User Assignment</h3>
                                        </div>

                                        <Select
                                            label="Select User"
                                            options={userOptions}
                                            value={formData.user}
                                            onChange={handleInputChange('user')}
                                            error={errors.user}
                                            required
                                            placeholder={loadingData ? "Loading users..." : "Choose a user"}
                                            disabled={loadingData}
                                        />
                                        {selectedUser && (
                                            <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                                <p className="text-sm text-blue-800">
                                                    <strong>Email:</strong> {selectedUser.email} | 
                                                    <strong> Status:</strong> {selectedUser.status}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Company Details */}
                                    <div className="lg:col-span-2">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                                <Building className="w-4 h-4 text-green-600" />
                                            </div>
                                            <h3 className="text-lg font-medium text-gray-900">Company Details</h3>
                                        </div>

                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                            <Input
                                                label="Company Name"
                                                value={formData.companyName}
                                                onChange={handleInputChange('companyName')}
                                                error={errors.companyName}
                                                placeholder="Enter company name"
                                                required
                                            />

                                            <Select
                                                label="Contractor Type"
                                                options={contractorTypeOptions}
                                                value={formData.contractorType}
                                                onChange={handleInputChange('contractorType')}
                                                error={errors.contractorType}
                                                placeholder="Select contractor type"
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Payment & Contact */}
                                    <div className="lg:col-span-2">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                                <CreditCard className="w-4 h-4 text-purple-600" />
                                            </div>
                                            <h3 className="text-lg font-medium text-gray-900">Payment & Contact</h3>
                                        </div>

                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                            <Select
                                                label="Payment Terms"
                                                options={paymentTermOptions}
                                                value={formData.paymentTerms}
                                                onChange={handleInputChange('paymentTerms')}
                                                error={errors.paymentTerms}
                                                placeholder="Select payment terms"
                                                required
                                            />

                                            <Input
                                                label="Phone Number"
                                                type="tel"
                                                value={formData.phoneNumber}
                                                onChange={handleInputChange('phoneNumber')}
                                                error={errors.phoneNumber}
                                                placeholder="+1 (555) 123-4567"
                                            />
                                        </div>
                                    </div>

                                    {/* Additional Information */}
                                    <div className="lg:col-span-2">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                                                <MapPin className="w-4 h-4 text-orange-600" />
                                            </div>
                                            <h3 className="text-lg font-medium text-gray-900">Additional Information</h3>
                                        </div>

                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                            <Input
                                                label="Bank Details"
                                                value={formData.bankDetails}
                                                onChange={handleInputChange('bankDetails')}
                                                error={errors.bankDetails}
                                                placeholder="Account number, routing details, etc."
                                            />

                                            <div className="lg:row-span-1">
                                                <Textarea
                                                    label="Address"
                                                    value={formData.address}
                                                    onChange={handleInputChange('address')}
                                                    error={errors.address}
                                                    placeholder="Enter complete address"
                                                    rows={3}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
                        <Button
                            onClick={handleClose}
                            variant="outline"
                        >
                            {mode === 'view' ? 'Close' : 'Cancel'}
                        </Button>
                        {mode !== 'view' && (
                            <Button
                                onClick={handleSubmit}
                                loading={loading}
                                disabled={loadingData}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                {mode === 'edit' ? 'Update Contractor' : 'Create Contractor'}
                            </Button>
                        )}
                    </div>
                </div>
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

