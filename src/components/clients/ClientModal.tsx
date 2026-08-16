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
    Calendar
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Textarea } from '../ui/Textarea';
import { Notification } from '../ui/Notification';
import {
    createClient,
    updateClient,
    fetchUsersForClient,
    User
} from '../../services/clientApi';
import { PAYMENT_TERMS } from '../../constants/contractor';
import { validateClientForm, hasClientErrors } from '../../utils/clientValidation';
import { Client, ClientFormData, ClientFormErrors } from '../../types/client';

interface ClientModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (client: Client) => void;
    client?: Client;
    mode: 'add' | 'edit' | 'view';
}

export const ClientModal: React.FC<ClientModalProps> = ({
    isOpen,
    onClose,
    onSave,
    client,
    mode
}) => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(true);
    const [notification, setNotification] = useState({
        show: false,
        type: 'success' as 'success' | 'error',
        message: ''
    });

    const getInitialFormData = (c?: Client): ClientFormData => ({
        user: c?.user && typeof c.user === 'object' ? c.user._id : (typeof c?.user === 'string' ? c.user : ''),
        paymentTerms: c?.paymentTerms || '',
        bankDetails: c?.bankDetails || '',
        address: c?.address || (c?.user && typeof c.user === 'object' ? c.user.address : '') || '',
        phoneNumber: c?.phoneNumber || (c?.user && typeof c.user === 'object' ? c.user.phoneNumber : '') || ''
    });

    const [formData, setFormData] = useState<ClientFormData>(getInitialFormData(client));
    const [errors, setErrors] = useState<ClientFormErrors>({});

    useEffect(() => {
        if (isOpen) {
            loadInitialData();
            setFormData(getInitialFormData(client));
            setErrors({});
        }
    }, [isOpen, client, mode]);

    const loadInitialData = async () => {
        try {
            setLoadingData(true);
            const usersData = await fetchUsersForClient();
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

    const handleInputChange = (field: keyof ClientFormData) => (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const value = e.target.value;
        setFormData(prev => ({ ...prev, [field]: value }));

        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const validationErrors = validateClientForm(formData);
        setErrors(validationErrors);

        if (hasClientErrors(validationErrors)) {
            showNotification('error', 'Please fix the errors below before submitting.');
            return;
        }

        try {
            setLoading(true);

            if (mode === 'edit' && client) {
                const updatedClient = await updateClient(client._id, formData);
                showNotification('success', 'Client updated successfully!');
                onSave(updatedClient);
            } else {
                await createClient(formData);
                showNotification('success', 'Client created successfully!');
                setFormData(getInitialFormData());
                onSave({} as Client); // Trigger parent to refresh list
            }
        } catch (error) {
            showNotification('error', `Failed to ${mode === 'edit' ? 'update' : 'create'} client. Please try again.`);
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
                    <div className="bg-green-600 px-6 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                                    <UserIcon className="w-4 h-4 text-white" />
                                </div>
                                <h3 className="text-lg font-semibold text-white">
                                    {mode === 'view' ? 'View Client' : mode === 'edit' ? 'Edit Client' : 'Add New Client'}
                                </h3>
                            </div>
                            <button
                                onClick={handleClose}
                                className="text-white hover:text-green-200 transition-colors"
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
                                    {/* Client Information */}
                                    <div>
                                        <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                                            <UserIcon className="w-5 h-5 text-green-600" />
                                            Client Information
                                        </h4>
                                        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium text-gray-500">Name:</span>
                                                <span className="text-sm text-gray-900">
                                                    {typeof client?.user === 'object' ? client.user.userName : 'N/A'}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium text-gray-500">Email:</span>
                                                <span className="text-sm text-gray-900">
                                                    {typeof client?.user === 'object' ? client.user.email : 'N/A'}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium text-gray-500">Status:</span>
                                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${client?.isActive ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'
                                                    }`}>
                                                    {client?.isActive ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                                    {client?.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium text-gray-500">User Status:</span>
                                                <span className="text-sm text-gray-900">
                                                    {typeof client?.user === 'object' ? client.user.status : 'N/A'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Contact Information */}
                                    <div>
                                        <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                                            <Phone className="w-5 h-5 text-blue-600" />
                                            Contact Information
                                        </h4>
                                        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium text-gray-500">Phone:</span>
                                                <span className="text-sm text-gray-900">{client?.phoneNumber || 'N/A'}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium text-gray-500">Address:</span>
                                                <span className="text-sm text-gray-900">{client?.address || 'N/A'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column */}
                                <div className="space-y-6">
                                    {/* Payment Information */}
                                    <div>
                                        <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                                            <Banknote className="w-5 h-5 text-orange-600" />
                                            Payment Information
                                        </h4>
                                        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium text-gray-500">Payment Terms:</span>
                                                <span className="text-sm text-gray-900">{client?.paymentTerms || 'N/A'}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium text-gray-500">Bank Details:</span>
                                                <span className="text-sm text-gray-900">{client?.bankDetails || 'N/A'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Additional Information */}
                                    <div>
                                        <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                                            <Calendar className="w-5 h-5 text-purple-600" />
                                            Additional Information
                                        </h4>
                                        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium text-gray-500">Client ID:</span>
                                                <span className="text-sm text-gray-900 font-mono">{client?._id?.slice(-8) || 'N/A'}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium text-gray-500">Created:</span>
                                                <span className="text-sm text-gray-900">
                                                    {client?.createdAt ? new Date(client.createdAt).toLocaleDateString() : 'N/A'}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium text-gray-500">Last Updated:</span>
                                                <span className="text-sm text-gray-900">
                                                    {client?.updatedAt ? new Date(client.updatedAt).toLocaleDateString() : 'N/A'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            // Add/Edit Mode Form matching ClientForm layout & fields
                            <form onSubmit={handleSubmit} className="space-y-8">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    {/* User Assignment */}
                                    <div className="lg:col-span-2">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                                <Users className="w-4 h-4 text-green-600" />
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
                                            <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                                                <p className="text-sm text-green-800">
                                                    <strong>Email:</strong> {selectedUser.email} | 
                                                    <strong> Status:</strong> {selectedUser.status}
                                                </p>
                                            </div>
                                        )}
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
                                                value={formData.paymentTerms}
                                                onChange={handleInputChange('paymentTerms')}
                                                error={errors.paymentTerms}
                                                placeholder="Select payment terms"
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
                                            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                                <MapPin className="w-4 h-4 text-purple-600" />
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
                        {(mode as string) !== 'view' && (
                            <Button
                                onClick={handleSubmit}
                                loading={loading}
                                disabled={loadingData}
                                className="bg-green-600 hover:bg-green-700"
                            >
                                {mode === 'edit' ? 'Update Client' : 'Create Client'}
                            </Button>
                        )}
                        {(mode as string) === 'view' && (
                            <Button
                                onClick={() => {
                                    onClose();
                                    // Trigger edit mode in parent
                                }}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                Edit Client
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

