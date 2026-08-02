import React, { useState } from 'react';
import { Breadcrumbs } from '../ui/Breadcrumbs';
import { Mail, Lock, User } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Notification } from '../ui/Notification';
import { Select } from '../ui/Select'; // Import your Select component
import { useAuth } from '../../contexts/AuthContext';

const ROLE_OPTIONS = [
    { value: 'Admin', label: 'Admin' },
    { value: 'Contractor', label: 'Contractor' },
    { value: 'User', label: 'User' },
];

export const AddUser: React.FC = () => {
    const { register } = useAuth();
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
        role: 'User'
    });

    const [errors, setErrors] = useState<{ userName?: string; email?: string; password?: string; role?: string }>({});

    const handleInputChange = (field: keyof typeof formData) => (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        setFormData(prev => ({ ...prev, [field]: e.target.value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };

    const validateForm = () => {
        const newErrors: { userName?: string; email?: string; password?: string; role?: string } = {};
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
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;
        try {
            setLoading(true);
            await register(formData); // <-- Call your API here
            setNotification({
                show: true,
                type: 'success',
                message: 'User added successfully!'
            });
            setFormData({ userName: '', email: '', password: '', role: 'User' });
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

            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Add New User</h1>
                <p className="text-sm text-gray-500 mt-1">Fill in the details below to create a new user profile</p>
            </div>

            {/* Form Card */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 sm:p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <Input
                                label="Username"
                                type="text"
                                value={formData.userName}
                                onChange={handleInputChange('userName')}
                                error={errors.userName}
                                placeholder="Enter username"
                                required
                            />
                        </div>
                        <div>
                            <Input
                                label="Email Address"
                                type="email"
                                value={formData.email}
                                onChange={handleInputChange('email')}
                                error={errors.email}
                                placeholder="Enter email address"
                                required
                            />
                        </div>
                        <div>
                            <Input
                                label="Password"
                                type="password"
                                value={formData.password}
                                onChange={handleInputChange('password')}
                                error={errors.password}
                                placeholder="Create password (min. 6 chars)"
                                required
                            />
                        </div>
                        <div>
                            <Select
                                label="Role"
                                value={formData.role}
                                onChange={handleInputChange('role')}
                                error={errors.role}
                                required
                                options={ROLE_OPTIONS}
                                className="w-full"
                            />
                        </div>
                    </div>

                    <div className="pt-4 border-t border-gray-100 flex justify-end">
                        <Button
                            type="submit"
                            loading={loading}
                            size="lg"
                            className="px-8"
                        >
                            Add User
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