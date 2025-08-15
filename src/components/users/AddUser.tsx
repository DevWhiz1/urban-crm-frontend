import React, { useState } from 'react';
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
    <div className="w-full max-w-md mx-auto p-8 bg-white rounded-2xl shadow-xl border border-gray-100">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Add New User</h2>
        <p className="text-gray-600">Fill in the details to create a new user</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="relative">
          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            label="Username"
            type="text"
            value={formData.userName}
            onChange={handleInputChange('userName')}
            error={errors.userName}
            placeholder="Enter username"
            className="pl-12"
            required
          />
        </div>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            label="Email Address"
            type="email"
            value={formData.email}
            onChange={handleInputChange('email')}
            error={errors.email}
            placeholder="Enter email"
            className="pl-12"
            required
          />
        </div>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            label="Password"
            type="password"
            value={formData.password}
            onChange={handleInputChange('password')}
            error={errors.password}
            placeholder="Create a password (min. 6 characters)"
            className="pl-12"
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
        <Button
          type="submit"
          loading={loading}
          className="w-full"
          size="lg"
        >
          Add User
        </Button>
      </form>
      <Notification
        show={notification.show}
        type={notification.type}
        message={notification.message}
        onClose={() => setNotification(prev => ({ ...prev, show: false }))}
      />
    </div>
  );
};