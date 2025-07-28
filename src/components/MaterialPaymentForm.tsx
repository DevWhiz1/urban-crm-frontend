import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Building, 
  Calculator, 
  Calendar, 
  DollarSign,
  Truck,
  Hash,
  FileText,
  User
} from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { Textarea } from './ui/Textarea';
import { Notification } from './ui/Notification';
import { createMaterialPayment, fetchProjectsForMaterial } from '../services/materialPaymentApi';
import { validateMaterialPaymentForm, hasMaterialPaymentErrors, formatPKRCurrency } from '../utils/materialPaymentValidation';
import { MaterialPaymentFormData, MaterialPaymentFormErrors, MaterialPaymentNotificationState, MaterialProjectOption } from '../types/materialPayment';

export const MaterialPaymentForm: React.FC = () => {
  const [projects, setProjects] = useState<MaterialProjectOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [notification, setNotification] = useState<MaterialPaymentNotificationState>({
    show: false,
    type: 'success',
    message: ''
  });

  const [formData, setFormData] = useState<MaterialPaymentFormData>({
    project: '',
    materialDetail: '',
    materialProvider: '',
    MaterialQuantity: '',
    MaterialRate: '',
    totalAmount: '',
    date: new Date().toISOString().split('T')[0]
  });

  const [errors, setErrors] = useState<MaterialPaymentFormErrors>({});

  useEffect(() => {
    loadProjects();
  }, []);

  // Auto-calculate total amount when quantity or rate changes
  useEffect(() => {
    if (formData.MaterialQuantity && formData.MaterialRate) {
      const quantity = parseFloat(formData.MaterialQuantity);
      const rate = parseFloat(formData.MaterialRate);
      if (!isNaN(quantity) && !isNaN(rate)) {
        const total = quantity * rate;
        setFormData(prev => ({ ...prev, totalAmount: total.toString() }));
      }
    }
  }, [formData.MaterialQuantity, formData.MaterialRate]);

  const loadProjects = async () => {
    try {
      setLoadingData(true);
      const projectsData = await fetchProjectsForMaterial();
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

  const handleInputChange = (field: keyof MaterialPaymentFormData) => (
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
    
    const validationErrors = validateMaterialPaymentForm(formData);
    setErrors(validationErrors);

    if (hasMaterialPaymentErrors(validationErrors)) {
      showNotification('error', 'Please fix the errors below before submitting.');
      return;
    }

    try {
      setLoading(true);
      await createMaterialPayment(formData);
      
      // Reset form
      setFormData({
        project: '',
        materialDetail: '',
        materialProvider: '',
        MaterialQuantity: '',
        MaterialRate: '',
        totalAmount: '',
        date: new Date().toISOString().split('T')[0]
      });
      
      showNotification('success', 'Material payment recorded successfully!');
    } catch (error) {
      showNotification('error', 'Failed to record material payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      project: '',
      materialDetail: '',
      materialProvider: '',
      MaterialQuantity: '',
      MaterialRate: '',
      totalAmount: '',
      date: new Date().toISOString().split('T')[0]
    });
    setErrors({});
  };

  const projectOptions = projects.map(project => ({
    value: project._id,
    label: `${project.name} (${project.projectCode}) - ${project.status}`
  }));

  const selectedProject = projects.find(p => p._id === formData.project);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 rounded-full mb-4">
            <Package className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Add Material Payment</h1>
          <p className="text-gray-600">Record payments for materials, supplies, and equipment purchases</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-8 py-6">
            <h2 className="text-xl font-semibold text-white">Material Payment Information</h2>
            <p className="text-green-100 mt-1">Record material purchase and payment details</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8">
            <div className="space-y-8">
              {/* Project Selection */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <Building className="w-4 h-4 text-green-600" />
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

              {/* Material Details */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Package className="w-4 h-4 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">Material Details</h3>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Textarea
                    label="Material Detail"
                    value={formData.materialDetail}
                    onChange={handleInputChange('materialDetail')}
                    error={errors.materialDetail}
                    placeholder="Describe the materials purchased (e.g., Cement bags, Steel rods, Paint, etc.)"
                    rows={3}
                  />
                  
                  <Input
                    label="Material Provider"
                    value={formData.materialProvider}
                    onChange={handleInputChange('materialProvider')}
                    error={errors.materialProvider}
                    placeholder="Enter supplier/vendor name"
                  />
                </div>
              </div>

              {/* Quantity & Rate Calculation */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Calculator className="w-4 h-4 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">Quantity & Rate Calculation</h3>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <Input
                    label="Material Quantity"
                    type="number"
                    value={formData.MaterialQuantity}
                    onChange={handleInputChange('MaterialQuantity')}
                    error={errors.MaterialQuantity}
                    placeholder="Enter quantity"
                    step="0.01"
                  />

                  <Input
                    label="Material Rate (PKR per unit)"
                    type="number"
                    value={formData.MaterialRate}
                    onChange={handleInputChange('MaterialRate')}
                    error={errors.MaterialRate}
                    placeholder="Enter rate per unit"
                    step="0.01"
                  />

                  <div>
                    <Input
                      label="Total Amount (PKR)"
                      type="number"
                      value={formData.totalAmount}
                      onChange={handleInputChange('totalAmount')}
                      placeholder="Auto-calculated"
                      disabled
                      className="bg-gray-50"
                      required
                    />
                    {formData.totalAmount && !isNaN(parseFloat(formData.totalAmount)) && (
                      <div className="mt-2 p-2 bg-green-50 rounded border border-green-200">
                        <p className="text-sm text-green-800 font-medium">
                          Total: {formatPKRCurrency(formData.totalAmount)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Calculation Display */}
                {formData.MaterialQuantity && formData.MaterialRate && (
                  <div className="mt-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="flex items-center justify-center text-purple-800">
                      <Hash className="w-4 h-4 mr-2" />
                      <span className="text-sm font-medium">
                        Calculation: {formData.MaterialQuantity} × {formatPKRCurrency(formData.MaterialRate)} = {formatPKRCurrency(formData.totalAmount)}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Payment Date */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-orange-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">Payment Date</h3>
                </div>
                
                <div className="max-w-md">
                  <Input
                    label="Payment Date"
                    type="date"
                    value={formData.date}
                    onChange={handleInputChange('date')}
                    error={errors.date}
                    required
                  />
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
                className="sm:w-auto w-full bg-green-600 hover:bg-green-700 focus:ring-green-500"
              >
                Record Material Payment
              </Button>
            </div>
          </form>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
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
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Material Payments</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Currency</p>
                <p className="text-2xl font-bold text-gray-900">PKR</p>
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