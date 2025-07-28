import React, { useState, useEffect } from 'react';
import { Users, Building, Wrench, CreditCard, MapPin, Phone, Banknote } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { Textarea } from './ui/Textarea';
import { Notification } from './ui/Notification';
import { fetchUsers, createContractor } from '../services/api';
import { CONTRACTOR_TYPES, PAYMENT_TERMS } from '../constants/contractor';
import { validateForm, hasErrors } from '../utils/validation';
import { User, ContractorFormData, FormErrors, NotificationState } from '../types/contractor';

export const ContractorForm: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [notification, setNotification] = useState<NotificationState>({
    show: false,
    type: 'success',
    message: ''
  });

  const [formData, setFormData] = useState<ContractorFormData>({
    user: '',
    companyName: '',
    contractorType: '',
    paymentTerms: '',
    bankDetails: '',
    address: '',
    phoneNumber: ''
  });

  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoadingUsers(true);
      const userData = await fetchUsers();
      setUsers(userData);
      
      if (userData.length === 0) {
        showNotification('error', 'No users found. Please add users first.');
      }
    } catch (error) {
      showNotification('error', 'Failed to load users. Please refresh the page.');
    } finally {
      setLoadingUsers(false);
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
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors = validateForm(formData);
    setErrors(validationErrors);

    if (hasErrors(validationErrors)) {
      showNotification('error', 'Please fix the errors below before submitting.');
      return;
    }

    try {
      setLoading(true);
      await createContractor(formData);
      
      // Reset form
      setFormData({
        user: '',
        companyName: '',
        contractorType: '',
        paymentTerms: '',
        bankDetails: '',
        address: '',
        phoneNumber: ''
      });
      
      showNotification('success', 'Contractor created successfully!');
    } catch (error) {
      showNotification('error', 'Failed to create contractor. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      user: '',
      companyName: '',
      contractorType: '',
      paymentTerms: '',
      bankDetails: '',
      address: '',
      phoneNumber: ''
    });
    setErrors({});
  };

  const userOptions = users.map(user => ({
    value: user._id,
    label: `${user.userName} (${user.email})`
  }));

  const contractorTypeOptions = CONTRACTOR_TYPES.map(type => ({
    value: type,
    label: type
  }));

  const paymentTermOptions = PAYMENT_TERMS.map(term => ({
    value: term,
    label: term
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <Building className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Add New Contractor</h1>
          <p className="text-gray-600">Create a comprehensive contractor profile with all necessary details</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
            <h2 className="text-xl font-semibold text-white">Contractor Information</h2>
            <p className="text-blue-100 mt-1">Fill in the details below to create a new contractor profile</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* User Selection */}
              <div className="lg:col-span-2">
                <div className="flex items-center gap-3 mb-6">
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
                  placeholder={loadingUsers ? "Loading users..." : "Choose a user"}
                  disabled={loadingUsers}
                />
              </div>

              {/* Company Details */}
              <div className="lg:col-span-2">
                <div className="flex items-center gap-3 mb-6">
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
                  />
                  
                  <Select
                    label="Contractor Type"
                    options={contractorTypeOptions}
                    value={formData.contractorType}
                    onChange={handleInputChange('contractorType')}
                    error={errors.contractorType}
                    placeholder="Select contractor type"
                  />
                </div>
              </div>

              {/* Payment & Contact */}
              <div className="lg:col-span-2">
                <div className="flex items-center gap-3 mb-6">
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
                <div className="flex items-center gap-3 mb-6">
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
                      rows={4}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-end mt-12 pt-8 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
                disabled={loading}
                className="sm:w-auto w-full"
              >
                Reset Form
              </Button>
              <Button
                type="submit"
                loading={loading}
                disabled={loadingUsers}
                className="sm:w-auto w-full"
              >
                Create Contractor
              </Button>
            </div>
          </form>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{users.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Wrench className="w-5 h-5 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Contractor Types</p>
                <p className="text-2xl font-bold text-gray-900">{CONTRACTOR_TYPES.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Payment Options</p>
                <p className="text-2xl font-bold text-gray-900">{PAYMENT_TERMS.length}</p>
              </div>
            </div>
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