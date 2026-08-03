import React, { useState, useEffect } from 'react';
import { X, User, Mail, Shield, CheckCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { updateUser } from '../../services/userApi';
import { Notification } from '../ui/Notification';

interface EditUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpdate: () => void;
    user: any;
}

const ROLE_OPTIONS = [
    { value: 'Admin', label: 'Admin' },
    { value: 'Contractor', label: 'Contractor' },
    { value: 'Client', label: 'Client' },
];

const STATUS_OPTIONS = [
    { value: 'Active', label: 'Active' },
    { value: 'InActive', label: 'InActive' },
];

export const EditUserModal: React.FC<EditUserModalProps> = ({
    isOpen,
    onClose,
    onUpdate,
    user
}) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        userName: '',
        email: '',
        role: 'Client',
        status: 'Active',
        password: '',
    });
    const [notification, setNotification] = useState({
        show: false,
        type: 'success' as 'success' | 'error',
        message: ''
    });

    useEffect(() => {
        if (user && isOpen) {
            setFormData({
                userName: user.userName || '',
                email: user.email || '',
                role: user.role || 'Client',
                status: user.status || 'Active',
                password: '', // Keep empty unless admin wants to change it
            });
        }
    }, [user, isOpen]);

    const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, [field]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        try {
            setLoading(true);
            const dataToUpdate: any = {
                userName: formData.userName,
                email: formData.email,
                role: formData.role,
                status: formData.status,
            };
            if (formData.password.trim() !== '') {
                dataToUpdate.password = formData.password;
            }

            await updateUser(user._id, dataToUpdate);
            
            setNotification({
                show: true,
                type: 'success',
                message: 'User updated successfully!'
            });
            
            setTimeout(() => {
                onUpdate();
                onClose();
            }, 1000);
        } catch (error: any) {
            setNotification({
                show: true,
                type: 'error',
                message: error.response?.data?.message || 'Failed to update user'
            });
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div 
                    className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                    onClick={onClose}
                ></div>

                <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden border border-gray-200 transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
                    {/* Header */}
                    <div className="bg-blue-600 px-6 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                                    <User className="w-4 h-4 text-white" />
                                </div>
                                <h3 className="text-lg font-semibold text-white">
                                    Edit User
                                </h3>
                            </div>
                            <button onClick={onClose} className="text-white hover:text-blue-200 transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Input
                                    label="Username"
                                    value={formData.userName}
                                    onChange={handleChange('userName')}
                                    required
                                    icon={<User className="w-4 h-4 text-gray-400" />}
                                />
                                <Input
                                    label="Email Address"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange('email')}
                                    required
                                    icon={<Mail className="w-4 h-4 text-gray-400" />}
                                />
                                <Select
                                    label="Role"
                                    value={formData.role}
                                    onChange={handleChange('role')}
                                    options={ROLE_OPTIONS}
                                    icon={<Shield className="w-4 h-4 text-gray-400" />}
                                />
                                <Select
                                    label="Status"
                                    value={formData.status}
                                    onChange={handleChange('status')}
                                    options={STATUS_OPTIONS}
                                    icon={<CheckCircle className="w-4 h-4 text-gray-400" />}
                                />
                                <div className="md:col-span-2">
                                    <Input
                                        label="New Password (Optional)"
                                        type="password"
                                        value={formData.password}
                                        onChange={handleChange('password')}
                                        placeholder="Leave blank to keep current password"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">If you provide a new password, it will replace the user's existing password.</p>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                                <Button type="button" variant="outline" onClick={onClose}>
                                    Cancel
                                </Button>
                                <Button type="submit" loading={loading} className="bg-blue-600 hover:bg-blue-700 text-white">
                                    Save Changes
                                </Button>
                            </div>
                        </form>
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
