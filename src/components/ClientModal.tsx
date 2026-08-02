import React, { useState, useEffect } from 'react';
import {
    X,
    User as UserIcon,
    Phone,
    CheckCircle,
    XCircle,
    Banknote,
    Calendar
} from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { Textarea } from './ui/Textarea';
import { Notification } from './ui/Notification';
import {
    createClient,
    updateClient,
    fetchUsersForClient,
    User
} from '../services/clientApi';
import { Client, ClientFormData } from '../types/client';

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

    const [formData, setFormData] = useState<ClientFormData>({
        user: typeof client?.user === 'object' ? client.user._id : client?.user || '',
        paymentTerms: client?.paymentTerms || '',
        bankDetails: client?.bankDetails || '',
        address: client?.address || '',
        phoneNumber: client?.phoneNumber || ''
    });

    const [errors, setErrors] = useState<Record<string, string | undefined>>({});

    useEffect(() => {
        if (isOpen) {
            loadInitialData();
        }
    }, [isOpen]);

    useEffect(() => {
        if (client && (mode === 'edit' || mode === 'view')) {
            setFormData({
                user: typeof client.user === 'object' ? client.user._id : client.user || '',
                paymentTerms: client.paymentTerms || '',
                bankDetails: client.bankDetails || '',
                address: client.address || '',
                phoneNumber: client.phoneNumber || ''
            });
        }
    }, [client, mode]);

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

        // Basic validation
        const newErrors: Record<string, string> = {};
        if (!formData.user) newErrors.user = 'User is required';
        if (!formData.paymentTerms) newErrors.paymentTerms = 'Payment terms are required';
        if (!formData.address) newErrors.address = 'Address is required';
        if (!formData.phoneNumber) newErrors.phoneNumber = 'Phone number is required';

        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0) {
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
                // Reset form for add mode
                setFormData({
                    user: '',
                    paymentTerms: '',
                    bankDetails: '',
                    address: '',
                    phoneNumber: ''
                });
                onSave({} as Client); // Trigger parent to refresh list
            }
        } catch (error) {
            showNotification('error', `Failed to ${mode === 'edit' ? 'update' : 'create'} client. Please try again.`);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setFormData({
            user: '',
            paymentTerms: '',
            bankDetails: '',
            address: '',
            phoneNumber: ''
        });
        setErrors({});
        onClose();
    };

    const userOptions = users.map(user => ({
        value: user._id,
        label: `${user.userName} (${user.email})`
    }));

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
                    <div className="p-6 max-h-96 overflow-y-auto">
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
                            // Add/Edit Mode
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <div>
                                        <Select
                                            label="Select User"
                                            options={userOptions}
                                            value={formData.user}
                                            onChange={handleInputChange('user')}
                                            error={errors.user}
                                            required
                                            placeholder={loadingData ? "Loading users..." : "Choose a user"}
                                            disabled={loadingData || (mode as string) === 'view'}
                                        />
                                        {selectedUser && (
                                            <div className="mt-2 p-3 bg-green-50 rounded-lg border border-green-200">
                                                <p className="text-sm text-green-800">
                                                    <strong>Email:</strong> {selectedUser.email} |
                                                    <strong> Status:</strong> {selectedUser.status}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    <Input
                                        label="Phone Number"
                                        value={formData.phoneNumber}
                                        onChange={handleInputChange('phoneNumber')}
                                        error={errors.phoneNumber}
                                        placeholder="Enter phone number"
                                        required
                                        disabled={(mode as string) === 'view'}
                                    />

                                    <Input
                                        label="Payment Terms"
                                        value={formData.paymentTerms}
                                        onChange={handleInputChange('paymentTerms')}
                                        error={errors.paymentTerms}
                                        placeholder="Enter payment terms"
                                        required
                                        disabled={(mode as string) === 'view'}
                                    />

                                    <div className="lg:col-span-2">
                                        <Textarea
                                            label="Address"
                                            value={formData.address}
                                            onChange={handleInputChange('address')}
                                            error={errors.address}
                                            placeholder="Enter address"
                                            rows={3}
                                            required
                                            disabled={(mode as string) === 'view'}
                                        />
                                    </div>

                                    <div className="lg:col-span-2">
                                        <Textarea
                                            label="Bank Details"
                                            value={formData.bankDetails}
                                            onChange={handleInputChange('bankDetails')}
                                            placeholder="Enter bank details"
                                            rows={2}
                                            disabled={(mode as string) === 'view'}
                                        />
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
