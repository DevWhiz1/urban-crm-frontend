import React, { useState, useEffect } from 'react';
import { 
  Building, 
  DollarSign, 
  Calendar, 
  CreditCard,
  FileText,
  Receipt,
  Hash,
  CheckCircle,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { Textarea } from './ui/Textarea';
import { Notification } from './ui/Notification';
import { createProjectPayment, fetchProjectsForProjectPayment } from '../services/projectPaymentApi';
import { PAYMENT_METHODS, PAYMENT_STATUSES, PAYMENT_TYPES } from '../constants/payment';
import { validateProjectPaymentForm, hasProjectPaymentErrors, formatPKRCurrency, getPaymentStatusColor, getPaymentTypeColor } from '../utils/projectPaymentValidation';
import { ProjectPaymentFormData, ProjectPaymentFormErrors, ProjectPaymentNotificationState, ProjectPaymentProjectOption } from '../types/projectPayment';

export const ProjectPaymentForm: React.FC = () => {
  const [projects, setProjects] = useState<ProjectPaymentProjectOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [notification, setNotification] = useState<ProjectPaymentNotificationState>({
    show: false,
    type: 'success',
    message: ''
  });

  const [formData, setFormData] = useState<ProjectPaymentFormData>({
    project: '',
    type: 'credit',
    paymentAmount: '',
    paymentDate: new Date().toISOString().split('T')[0],
    paymentStatus: 'paid',
    paymentMethod: '',
    transactionId: '',
    receiptPhoto: '',
    notes: ''
  });

  const [errors, setErrors] = useState<ProjectPaymentFormErrors>({});

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoadingData(true);
      const projectsData = await fetchProjectsForProjectPayment();
      setProjects(projectsData);
      
      if (projectsData.length === 0) {
        showNotification('error', 'No projects found. Please create projects first.');
      }
    } catch (error) {
      showNotification('error', 'Failed to load projects. Please refresh the page.');
    } finally {
      setLoadingData(false);
    }
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ show: true, type, message });
  };

  const handleInputChange = (field: keyof ProjectPaymentFormData) => (
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
    
    const validationErrors = validateProjectPaymentForm(formData);
    setErrors(validationErrors);

    if (hasProjectPaymentErrors(validationErrors)) {
      showNotification('error', 'Please fix the errors below before submitting.');
      return;
    }

    try {
      setLoading(true);
      await createProjectPayment(formData);
      
      // Reset form
      setFormData({
        project: '',
        type: 'credit',
        paymentAmount: '',
        paymentDate: new Date().toISOString().split('T')[0],
        paymentStatus: 'paid',
        paymentMethod: '',
        transactionId: '',
        receiptPhoto: '',
        notes: ''
      });
      
      showNotification('success', 'Project payment recorded successfully!');
    } catch (error) {
      showNotification('error', 'Failed to record project payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      project: '',
      type: 'credit',
      paymentAmount: '',
      paymentDate: new Date().toISOString().split('T')[0],
      paymentStatus: 'paid',
      paymentMethod: '',
      transactionId: '',
      receiptPhoto: '',
      notes: ''
    });
    setErrors({});
  };

  const projectOptions = projects.map(project => ({
    value: project._id,
    label: `${project.name} (${project.projectCode}) - ${project.status}`
  }));

  const selectedProject = projects.find(p => p._id === formData.project);
  const requiresTransactionId = formData.paymentMethod && formData.paymentMethod !== 'cash';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-violet-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-600 rounded-full mb-4">
            <Building className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Add Payment for Project</h1>
          <p className="text-gray-600">Record general project payments and miscellaneous expenses</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-violet-600 px-8 py-6">
            <h2 className="text-xl font-semibold text-white">Project Payment Information</h2>
            <p className="text-purple-100 mt-1">Record payment details for project expenses</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8">
            <div className="space-y-8">
              {/* Project Selection */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Building className="w-4 h-4 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">Project Selection</h3>
                </div>
                
                <div>
                  <Select
                    label="Select Project"
                    options={projectOptions}
                    value={formData.project}
                    onChange={handleInputChange('project')}
                    error={errors.project}
                    required
                    placeholder={loadingData ? "Loading projects..." : "Choose a project"}
                    disabled={loadingData}
                  />
                  {selectedProject && (
                    <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-sm text-blue-800">
                        <strong>Status:</strong> {selectedProject.status} | 
                        <strong> Code:</strong> {selectedProject.projectCode}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Type & Details */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-4 h-4 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">Payment Details</h3>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  <div>
                    <Select
                      label="Payment Type"
                      options={PAYMENT_TYPES}
                      value={formData.type}
                      onChange={handleInputChange('type')}
                      error={errors.type}
                      required
                      placeholder="Select type"
                    />
                    {formData.type && (
                      <div className="mt-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPaymentTypeColor(formData.type)}`}>
                          {formData.type === 'credit' ? (
                            <><TrendingUp className="w-3 h-3 inline mr-1" />Credit</>
                          ) : (
                            <><TrendingDown className="w-3 h-3 inline mr-1" />Debit</>
                          )}
                        </span>
                      </div>
                    )}
                  </div>

                  <div>
                    <Input
                      label="Payment Amount (PKR)"
                      type="number"
                      value={formData.paymentAmount}
                      onChange={handleInputChange('paymentAmount')}
                      error={errors.paymentAmount}
                      placeholder="Enter payment amount"
                      step="0.01"
                      required
                    />
                    {formData.paymentAmount && !isNaN(parseFloat(formData.paymentAmount)) && (
                      <div className="mt-2 p-2 bg-green-50 rounded border border-green-200">
                        <p className="text-sm text-green-800 font-medium">
                          Amount: {formatPKRCurrency(formData.paymentAmount)}
                        </p>
                      </div>
                    )}
                  </div>

                  <Input
                    label="Payment Date"
                    type="date"
                    value={formData.paymentDate}
                    onChange={handleInputChange('paymentDate')}
                    error={errors.paymentDate}
                    required
                  />

                  <div>
                    <Select
                      label="Payment Status"
                      options={PAYMENT_STATUSES}
                      value={formData.paymentStatus}
                      onChange={handleInputChange('paymentStatus')}
                      placeholder="Select status"
                    />
                    {formData.paymentStatus && (
                      <div className="mt-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPaymentStatusColor(formData.paymentStatus)}`}>
                          {PAYMENT_STATUSES.find(s => s.value === formData.paymentStatus)?.label}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Payment Method & Transaction */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <CreditCard className="w-4 h-4 text-green-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">Payment Method & Transaction</h3>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Select
                    label="Payment Method"
                    options={PAYMENT_METHODS}
                    value={formData.paymentMethod}
                    onChange={handleInputChange('paymentMethod')}
                    error={errors.paymentMethod}
                    required
                    placeholder="Select payment method"
                  />

                  <Input
                    label={`Transaction ID ${requiresTransactionId ? '*' : '(Optional)'}`}
                    value={formData.transactionId}
                    onChange={handleInputChange('transactionId')}
                    error={errors.transactionId}
                    placeholder="Enter transaction/reference ID"
                    required={requiresTransactionId}
                  />
                </div>
              </div>

              {/* Receipt & Notes */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Receipt className="w-4 h-4 text-orange-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">Receipt & Additional Notes</h3>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Input
                    label="Receipt Photo URL (Optional)"
                    value={formData.receiptPhoto}
                    onChange={handleInputChange('receiptPhoto')}
                    error={errors.receiptPhoto}
                    placeholder="https://example.com/receipt.jpg"
                  />

                  <div className="lg:row-span-1">
                    <Textarea
                      label="Additional Notes (Optional)"
                      value={formData.notes}
                      onChange={handleInputChange('notes')}
                      error={errors.notes}
                      placeholder="Any additional notes about this payment..."
                      rows={3}
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
                disabled={loadingData}
                className="sm:w-auto w-full bg-purple-600 hover:bg-purple-700 focus:ring-purple-500"
              >
                Record Project Payment
              </Button>
            </div>
          </form>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Building className="w-5 h-5 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Available Projects</p>
                <p className="text-2xl font-bold text-gray-900">{projects.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Payment Methods</p>
                <p className="text-2xl font-bold text-gray-900">{PAYMENT_METHODS.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Currency</p>
                <p className="text-2xl font-bold text-gray-900">PKR</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Payment Types</p>
                <p className="text-2xl font-bold text-gray-900">{PAYMENT_TYPES.length}</p>
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