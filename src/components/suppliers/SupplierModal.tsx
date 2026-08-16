import React, { useState, useEffect } from 'react';
import {
    X,
    User as UserIcon,
    Users,
    CreditCard,
    MapPin,
    Phone,
    CheckCircle,
    XCircle,
    Banknote,
    Calendar,
    Truck,
    Building
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Textarea } from '../ui/Textarea';
import { Notification } from '../ui/Notification';
import {
    createSupplier,
    updateSupplier,
    Supplier
} from '../../services/supplierApi';
import { getSuppliersPaginated } from '../../services/supplierApi'; // wait, for fetching users we should use userApi or a specific endpoint
// actually we don't need to fetch ALL users here if we are only editing a supplier.
// If we are adding a supplier, we fetch users. But Add is done from Users page directly.
// In the modal, we only support 'view' or 'edit'.
import { getAllUsers } from '../../services/userApi';
import { PAYMENT_TERMS } from '../../constants/contractor';
import { validateSupplierForm, hasSupplierErrors } from '../../utils/supplierValidation';
import { SupplierFormData, SupplierFormErrors } from '../../types/supplier';

interface SupplierModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (supplier: Supplier) => void;
    supplier?: Supplier;
    mode: 'add' | 'edit' | 'view';
}

export const SupplierModal: React.FC<SupplierModalProps> = ({
    isOpen,
    onClose,
    onSave,
    supplier,
    mode
}) => {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(true);
    const [notification, setNotification] = useState({
        show: false,
        type: 'success' as 'success' | 'error',
        message: ''
    });

    const getInitialFormData = (s?: Supplier): SupplierFormData => ({
        user: s?.user && typeof s.user === 'object' ? s.user._id : (typeof s?.user === 'string' ? s.user : ''),
        companyName: s?.companyName || '',
        supplierType: s?.supplierType || '',
        paymentTerms: s?.paymentTerms || '',
        accountNumber: s?.accountNumber || '',
        address: s?.address || (s?.user && typeof s.user === 'object' ? s.user.address : '') || '',
        phoneNumber: s?.phoneNumber || (s?.user && typeof s.user === 'object' ? s.user.phoneNumber : '') || ''
    });

    const [formData, setFormData] = useState<SupplierFormData>(getInitialFormData(supplier));
    const [errors, setErrors] = useState<SupplierFormErrors>({});

    useEffect(() => {
        if (isOpen) {
            loadInitialData();
            setFormData(getInitialFormData(supplier));
            setErrors({});
        }
    }, [isOpen, supplier, mode]);

    const loadInitialData = async () => {
        try {
            setLoadingData(true);
            const { data } = await getAllUsers({ role: 'Supplier', limit: 1000 });
            setUsers(data);
        } catch (error) {
            showNotification('error', 'Failed to load users. Please refresh the page.');
        } finally {
            setLoadingData(false);
        }
    };

    const showNotification = (type: 'success' | 'error', message: string) => {
        setNotification({ show: true, type, message });
    };

    const handleInputChange = (field: keyof SupplierFormData) => (
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

        const validationErrors = validateSupplierForm(formData);
        setErrors(validationErrors);

        if (hasSupplierErrors(validationErrors)) {
            showNotification('error', 'Please fix the errors below before submitting.');
            return;
        }

        try {
            setLoading(true);

            if (mode === 'edit' && supplier) {
                const updatedSupplier = await updateSupplier(supplier._id, formData);
                showNotification('success', 'Supplier updated successfully!');
                onSave(updatedSupplier);
            } else {
                await createSupplier(formData);
                showNotification('success', 'Supplier created successfully!');
                setFormData(getInitialFormData());
                onSave({} as Supplier);
            }
        } catch (error) {
            showNotification('error', `Failed to ${mode === 'edit' ? 'update' : 'create'} supplier. Please try again.`);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setFormData(getInitialFormData());
        setErrors({});
        onClose();
    };

    const userOptions = users.map(u => ({
        value: u._id,
        label: `${u.userName} (${u.email})`
    }));

    const paymentTermOptions = [
        ...PAYMENT_TERMS.map(term => ({ value: term, label: term })),
        ...(formData.paymentTerms && !PAYMENT_TERMS.includes(formData.paymentTerms as any)
            ? [{ value: formData.paymentTerms, label: formData.paymentTerms }]
            : [])
    ];

    const supplierTypeOptions = [
        { value: 'Steel', label: 'Steel' },
        { value: 'Cement', label: 'Cement' },
        { value: 'Bricks', label: 'Bricks' },
        { value: 'Gravel', label: 'Gravel' },
        { value: 'Sand', label: 'Sand' },
        { value: 'Wood', label: 'Wood' },
        { value: 'Glass', label: 'Glass' },
        { value: 'Tiles', label: 'Tiles' },
        { value: 'Paint', label: 'Paint' },
        { value: 'Plumbing', label: 'Plumbing' },
        { value: 'Electrical', label: 'Electrical' },
        { value: 'Other', label: 'Other (Specify)' },
        ...(formData.supplierType && !['Steel', 'Cement', 'Bricks', 'Gravel', 'Sand', 'Wood', 'Glass', 'Tiles', 'Paint', 'Plumbing', 'Electrical', 'Other'].includes(formData.supplierType)
            ? [{ value: formData.supplierType, label: formData.supplierType }]
            : [])
    ];

    const selectedUser = users.find(u => u._id === formData.user);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div
                    className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                    onClick={mode !== 'view' ? handleClose : undefined}
                ></div>

                <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden border border-gray-200 transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
                    {/* Header */}
                    <div className="bg-amber-600 px-6 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                                    <Truck className="w-4 h-4 text-white" />
                                </div>
                                <h3 className="text-lg font-semibold text-white">
                                    {mode === 'view' ? 'View Supplier' : mode === 'edit' ? 'Edit Supplier' : 'Add New Supplier'}
                                </h3>
                            </div>
                            <button
                                onClick={handleClose}
                                className="text-white hover:text-amber-200 transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 max-h-[75vh] overflow-y-auto">
                        {mode === 'view' ? (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Left Column */}
                                <div className="space-y-6">
                                    <div>
                                        <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                                            <Building className="w-5 h-5 text-amber-600" />
                                            Business Information
                                        </h4>
                                        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium text-gray-500">Company Name:</span>
                                                <span className="text-sm text-gray-900 font-medium">
                                                    {supplier?.companyName || 'N/A'}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium text-gray-500">Type:</span>
                                                <span className="text-sm text-gray-900 capitalize">
                                                    {supplier?.supplierType || 'N/A'}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium text-gray-500">Status:</span>
                                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${supplier?.isActive ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'
                                                    }`}>
                                                    {supplier?.isActive ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                                    {supplier?.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                                            <UserIcon className="w-5 h-5 text-blue-600" />
                                            User Information
                                        </h4>
                                        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium text-gray-500">User Name:</span>
                                                <span className="text-sm text-gray-900">
                                                    {typeof supplier?.user === 'object' ? supplier.user.userName : 'N/A'}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium text-gray-500">Email:</span>
                                                <span className="text-sm text-gray-900">
                                                    {typeof supplier?.user === 'object' ? supplier.user.email : 'N/A'}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium text-gray-500">User Status:</span>
                                                <span className="text-sm text-gray-900">
                                                    {typeof supplier?.user === 'object' ? supplier.user.status : 'N/A'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                                            <Phone className="w-5 h-5 text-green-600" />
                                            Contact Information
                                        </h4>
                                        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium text-gray-500">Phone:</span>
                                                <span className="text-sm text-gray-900">{supplier?.phoneNumber || 'N/A'}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium text-gray-500">Address:</span>
                                                <span className="text-sm text-gray-900">{supplier?.address || 'N/A'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column */}
                                <div className="space-y-6">
                                    <div>
                                        <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                                            <Banknote className="w-5 h-5 text-orange-600" />
                                            Payment Information
                                        </h4>
                                        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium text-gray-500">Payment Terms:</span>
                                                <span className="text-sm text-gray-900">{supplier?.paymentTerms || 'N/A'}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium text-gray-500">Account Number:</span>
                                                <span className="text-sm text-gray-900">{supplier?.accountNumber || 'N/A'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                                            <Calendar className="w-5 h-5 text-purple-600" />
                                            Additional Information
                                        </h4>
                                        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium text-gray-500">Supplier ID:</span>
                                                <span className="text-sm text-gray-900 font-mono">{supplier?._id?.slice(-8) || 'N/A'}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium text-gray-500">Created:</span>
                                                <span className="text-sm text-gray-900">
                                                    {supplier?.createdAt ? new Date(supplier.createdAt).toLocaleDateString() : 'N/A'}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium text-gray-500">Last Updated:</span>
                                                <span className="text-sm text-gray-900">
                                                    {supplier?.updatedAt ? new Date(supplier.updatedAt).toLocaleDateString() : 'N/A'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-8">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    {/* User Assignment & Business details */}
                                    <div className="lg:col-span-2">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                                                <Users className="w-4 h-4 text-amber-600" />
                                            </div>
                                            <h3 className="text-lg font-medium text-gray-900">Business & User Assignment</h3>
                                        </div>

                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                            <div className="lg:col-span-2">
                                                <Select
                                                    label="Select User"
                                                    options={userOptions}
                                                    value={formData.user}
                                                    onChange={handleInputChange('user')}
                                                    error={errors.user}
                                                    required
                                                    placeholder={loadingData ? "Loading users..." : "Choose a user"}
                                                    disabled={loadingData || mode === 'edit'}
                                                />
                                                {selectedUser && (
                                                    <div className="mt-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                                                        <p className="text-sm text-amber-800">
                                                            <strong>Email:</strong> {selectedUser.email} | 
                                                            <strong> Status:</strong> {selectedUser.status}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>

                                            <Input
                                                label="Company Name"
                                                value={formData.companyName}
                                                onChange={handleInputChange('companyName')}
                                                error={errors.companyName}
                                                required
                                                placeholder="e.g. ABC Steels"
                                            />

                                            <Select
                                                label="Supplier Type"
                                                options={supplierTypeOptions}
                                                value={formData.supplierType}
                                                onChange={handleInputChange('supplierType')}
                                                error={errors.supplierType}
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Payment & Contact */}
                                    <div className="lg:col-span-2">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                                <CreditCard className="w-4 h-4 text-blue-600" />
                                            </div>
                                            <h3 className="text-lg font-medium text-gray-900">Payment & Contact</h3>
                                        </div>

                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                            <Select
                                                label="Payment Terms"
                                                options={paymentTermOptions}
                                                value={formData.paymentTerms || ''}
                                                onChange={handleInputChange('paymentTerms')}
                                                placeholder="Select payment terms"
                                            />

                                            <Input
                                                label="Account Number"
                                                value={formData.accountNumber || ''}
                                                onChange={handleInputChange('accountNumber')}
                                                placeholder="Bank account number"
                                            />

                                            <Input
                                                label="Phone Number"
                                                type="tel"
                                                value={formData.phoneNumber || ''}
                                                onChange={handleInputChange('phoneNumber')}
                                                placeholder="+1 (555) 123-4567"
                                            />

                                            <Textarea
                                                label="Address"
                                                value={formData.address || ''}
                                                onChange={handleInputChange('address')}
                                                placeholder="Enter complete address"
                                                rows={2}
                                            />
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
                        {(mode as string) !== 'view' && (
                            <Button
                                onClick={handleSubmit}
                                loading={loading}
                                disabled={loadingData}
                                className="bg-amber-600 hover:bg-amber-700"
                            >
                                {mode === 'edit' ? 'Update Supplier' : 'Create Supplier'}
                            </Button>
                        )}
                        {(mode as string) === 'view' && (
                            <Button
                                onClick={() => {
                                    onClose();
                                    // Let parent handle it. In our SuppliersManagement, we will need to change mode to 'edit' without closing if possible. Wait, ClientModal closes and parent sets mode to 'edit'. Actually, ClientModal didn't trigger parent edit mode this way.
                                }}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                OK
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
