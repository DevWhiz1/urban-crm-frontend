import React, { useState, useEffect } from 'react';
import { Breadcrumbs } from './ui/Breadcrumbs';
import {
  CreditCard,
  Banknote,
  Building,
  Users,
  Calendar,
  FileText,
  Wrench,
  CheckCircle,
  AlertTriangle,
  Clock,
  Receipt,
  Camera,
  Hash,
  Handshake,
  FileSpreadsheet,
  Plus,
  Minus,
  Upload
} from 'lucide-react';
import { uploadApi } from '../services/uploadApi';
import { ExcelImportModal } from './ExcelImportModal';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { Textarea } from './ui/Textarea';
import { Notification } from './ui/Notification';
import {
  createPayment,
  fetchProjectsForPayment,
  fetchContractorsForPayment,
  fetchContractsForPayment,
  getFilteredContracts
} from '../services/paymentApi';
import { PAYMENT_METHODS, PAYMENT_STATUSES } from '../constants/payment';
import {
  validatePaymentForm,
  hasPaymentErrors,
  formatPKRCurrency,
  getPaymentStatusColor
} from '../utils/paymentValidation';
import {
  PaymentFormData,
  PaymentFormErrors,
  PaymentNotificationState,
  PaymentProjectOption,
  PaymentContractorOption,
  PaymentContractOption
} from '../types/payment';

export const PaymentForm: React.FC = () => {
  const [projects, setProjects] = useState<PaymentProjectOption[]>([]);
  const [contractors, setContractors] = useState<PaymentContractorOption[]>([]);
  const [contracts, setContracts] = useState<PaymentContractOption[]>([]);
  const [filteredContracts, setFilteredContracts] = useState<PaymentContractOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [uploadingReceipt, setUploadingReceipt] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [showOptionalFields, setShowOptionalFields] = useState(false);
  const [notification, setNotification] = useState<PaymentNotificationState>({
    show: false,
    type: 'success',
    message: ''
  });

  const [formData, setFormData] = useState<PaymentFormData>({
    project: '',
    contractor: '',
    contract: '',
    date: new Date().toISOString().split('T')[0], // Today's date
    amount: '',
    paymentMethod: 'online',
    transactionId: '',
    workDescription: '',
    status: 'paid',
    receiptPhoto: '',
    notes: ''
  });

  const [errors, setErrors] = useState<PaymentFormErrors>({});

  useEffect(() => {
    loadInitialData();
  }, []);

  // Fetch contractors when project changes
  useEffect(() => {
    if (formData.project) {
      loadContractors(formData.project);
    } else {
      setContractors([]);
      setFormData(prev => ({ ...prev, contractor: '', contract: '' }));
    }
  }, [formData.project]);

  // Fetch contracts when project AND contractor are selected
  useEffect(() => {
    if (formData.project && formData.contractor) {
      loadContracts(formData.project, formData.contractor);
    } else {
      setContracts([]);
      setFilteredContracts([]);
      setFormData(prev => ({ ...prev, contract: '' }));
    }
  }, [formData.project, formData.contractor]);

  const loadInitialData = async () => {
    try {
      setLoadingData(true);
      const projectsData = await fetchProjectsForPayment();
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

  const loadContractors = async (projectId: string) => {
    try {
      setLoadingData(true);
      const contractorsData = await fetchContractorsForPayment(projectId);
      setContractors(contractorsData);
      
      if (contractorsData.length === 0) {
        setFormData(prev => ({ ...prev, contractor: '' }));
      } else {
        const stillExists = contractorsData.some(c => c._id === formData.contractor);
        if (!stillExists) {
          setFormData(prev => ({ ...prev, contractor: '' }));
        }
      }
    } catch (error) {
      showNotification('error', 'Failed to load contractors for this project.');
    } finally {
      setLoadingData(false);
    }
  };

  const loadContracts = async (projectId: string, contractorId: string) => {
    try {
      setLoadingData(true);
      const contractsData = await fetchContractsForPayment(projectId);
      setContracts(contractsData);
      
      const filtered = getFilteredContracts(contractsData, projectId, contractorId);
      setFilteredContracts(filtered);

      // Reset contract selection if current selection is not valid
      if (formData.contract && !filtered.find(c => c._id === formData.contract)) {
        setFormData(prev => ({ ...prev, contract: '' }));
      }
    } catch (error) {
      showNotification('error', 'Failed to load contracts.');
    } finally {
      setLoadingData(false);
    }
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ show: true, type, message });
  };

  const handleInputChange = (field: keyof PaymentFormData) => (
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

    const validationErrors = validatePaymentForm(formData);
    setErrors(validationErrors);

    if (hasPaymentErrors(validationErrors)) {
      showNotification('error', 'Please fix the errors below before submitting.');
      return;
    }

    try {
      setLoading(true);
      await createPayment(formData);

      // Reset form
      setFormData({
        project: '',
        contractor: '',
        contract: '',
        date: new Date().toISOString().split('T')[0],
        amount: '',
        paymentMethod: 'online',
        transactionId: '',
        workDescription: '',
        status: 'paid',
        receiptPhoto: '',
        notes: ''
      });

      showNotification('success', 'Payment recorded successfully!');
    } catch (error) {
      showNotification('error', 'Failed to record payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      project: '',
      contractor: '',
      contract: '',
      date: new Date().toISOString().split('T')[0],
      amount: '',
      paymentMethod: 'online',
      transactionId: '',
      workDescription: '',
      status: 'paid',
      receiptPhoto: '',
      notes: ''
    });
    setErrors({});
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingReceipt(true);
      const data = await uploadApi.uploadFile(file);
      setFormData(prev => ({ ...prev, receiptPhoto: data.url }));
      showNotification('success', 'Receipt uploaded successfully!');
    } catch (error) {
      showNotification('error', 'Failed to upload receipt.');
    } finally {
      setUploadingReceipt(false);
    }
  };

  const projectOptions = projects.map(project => ({
    value: project._id,
    label: `${project.name} (${project.projectCode}) - ${project.status}`
  }));

  const contractorOptions = contractors.map(contractor => ({
    value: contractor._id,
    label: `${contractor.companyName} - ${contractor.user.userName} (${contractor.contractorType})`
  }));

  const contractOptions = filteredContracts.map(contract => ({
    value: contract._id,
    label: `${contract.contractType} - ${formatPKRCurrency(contract.totalAmount.toString())}`
  }));

  const selectedProject = projects.find(p => p._id === formData.project);
  const selectedContractor = contractors.find(c => c._id === formData.contractor);
  const selectedContract = filteredContracts.find(c => c._id === formData.contract);


  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Breadcrumbs
        items={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Payments', path: '/dashboard/payments' },
          { label: 'Add Contractor Payment' }
        ]}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Add Payment for Contractor</h1>
          <p className="text-sm text-gray-500 mt-1">Record single payments or import bulk payment records from Excel</p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            if (!formData.project || !formData.contractor) {
              showNotification('error', 'Please select a Project and Contractor first before importing Excel payments.');
              return;
            }
            setIsImportModalOpen(true);
          }}
          className="flex items-center space-x-2 border-emerald-600 text-emerald-700 hover:bg-emerald-50 self-start sm:self-auto"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
          <span>Import from Excel / CSV</span>
        </Button>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-8">
              {/* Project & Contractor Selection */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <Building className="w-4 h-4 text-emerald-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">Project & Contractor</h3>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                          <strong>Client:</strong> {selectedProject.customer?.user?.userName} |
                          <strong> Status:</strong> {selectedProject.status}
                        </p>
                      </div>
                    )}
                  </div>

                  <div>
                    <Select
                      label="Select Contractor"
                      options={contractorOptions}
                      value={formData.contractor}
                      onChange={handleInputChange('contractor')}
                      error={errors.contractor}
                      required
                      placeholder={
                        !formData.project 
                            ? "Please select a project first" 
                            : loadingData 
                                ? "Loading contractors..." 
                                : contractors.length === 0 
                                    ? "No contractors found for this project" 
                                    : "Choose a contractor"
                      }
                      disabled={loadingData || !formData.project || contractors.length === 0}
                    />
                    {selectedContractor && (
                      <div className="mt-2 p-3 bg-green-50 rounded-lg border border-green-200">
                        <p className="text-sm text-green-800">
                          <strong>Type:</strong> {selectedContractor.contractorType} |
                          <strong> Contact:</strong> {selectedContractor.user.email}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Excel Import Highlight Banner */}
              {formData.project && formData.contractor && (
                <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-emerald-600 text-white rounded-lg shrink-0">
                      <FileSpreadsheet className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-emerald-950">Bulk Import Payments from Excel?</p>
                      <p className="text-xs text-emerald-700">
                        Upload your Excel sheet to log all past payments for <strong className="font-bold">{selectedContractor?.companyName}</strong> automatically.
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => setIsImportModalOpen(true)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white shrink-0"
                  >
                    Upload Excel Sheet
                  </Button>
                </div>
              )}

              {/* Contract Selection */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Handshake className="w-4 h-4 text-orange-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">Related Contract</h3>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <Select
                      label="Project Contract"
                      options={contractOptions}
                      value={formData.contract}
                      onChange={handleInputChange('contract')}
                      error={errors.contract}
                      required
                      placeholder={
                        !formData.project || !formData.contractor
                          ? "Please select project and contractor first"
                          : filteredContracts.length > 0
                            ? "Select a contract"
                            : "No contracts found for this combination"
                      }
                      disabled={!formData.project || !formData.contractor || filteredContracts.length === 0}
                    />
                    {selectedContract && (
                      <div className="mt-2 p-4 bg-purple-50 rounded-lg border border-purple-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-purple-800">
                              <strong>Contract Type:</strong> {selectedContract.contractType}
                            </p>
                            <p className="text-sm text-purple-800">
                              <strong>Total Amount:</strong> {formatPKRCurrency(selectedContract.totalAmount.toString())}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-purple-800">
                              <strong>Start Date:</strong> {new Date(selectedContract.startDate).toLocaleDateString()}
                            </p>
                            {selectedContract.endDate && (
                              <p className="text-sm text-purple-800">
                                <strong>End Date:</strong> {new Date(selectedContract.endDate).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                    {!formData.project || !formData.contractor ? (
                      <div className="mt-2 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                        <p className="text-sm text-yellow-800">
                          💡 Select both project and contractor to see available contracts
                        </p>
                      </div>
                    ) : filteredContracts.length === 0 && formData.project && formData.contractor ? (
                      <div className="mt-2 p-3 bg-red-50 rounded-lg border border-red-200">
                        <p className="text-sm text-red-600">
                          ⚠️ No contracts found. You must create a contract for this contractor on this project before recording a payment.
                        </p>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>

              {/* Payment Details */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Banknote className="w-4 h-4 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">Payment Details</h3>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div>
                    <Input
                      label="Payment Amount ($)"
                      type="number"
                      value={formData.amount}
                      onChange={handleInputChange('amount')}
                      error={errors.amount}
                      placeholder="Enter payment amount"
                      step="0.01"
                      required
                    />
                    {formData.amount && !isNaN(parseFloat(formData.amount)) && (
                      <div className="mt-2 p-2 bg-green-50 rounded border border-green-200">
                        <p className="text-sm text-green-800 font-medium">
                          Amount: {formatPKRCurrency(formData.amount)}
                        </p>
                      </div>
                    )}
                  </div>

                  <Input
                    label="Payment Date"
                    type="date"
                    value={formData.date}
                    onChange={handleInputChange('date')}
                    error={errors.date}
                    required
                  />

                  <div>
                    <Select
                      label="Payment Status"
                      options={PAYMENT_STATUSES}
                      value={formData.status}
                      onChange={handleInputChange('status')}
                      placeholder="Select status"
                    />
                    {formData.status && (
                      <div className="mt-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPaymentStatusColor(formData.status)}`}>
                          {PAYMENT_STATUSES.find(s => s.value === formData.status)?.label}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Payment Method & Transaction */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Banknote className="w-4 h-4 text-purple-600" />
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
                    placeholder="Select payment method"
                  />

                  <Input
                    label="Transaction ID (Optional)"
                    value={formData.transactionId}
                    onChange={handleInputChange('transactionId')}
                    error={errors.transactionId}
                    placeholder="Enter transaction/reference ID"
                  />
                </div>
              </div>

              {/* Optional Fields Toggle */}
              {!showOptionalFields ? (
                <div className="flex justify-center mt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowOptionalFields(true)}
                    className="flex items-center space-x-2 border-dashed border-gray-300 text-gray-600 hover:text-gray-900 hover:border-gray-400 w-full justify-center py-4"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Optional Details (Work Description, Receipt, Notes)</span>
                  </Button>
                </div>
              ) : (
                <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-300">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-medium text-gray-900">Optional Details</h3>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowOptionalFields(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <Minus className="w-4 h-4 mr-2" /> Hide
                    </Button>
                  </div>

                  {/* Work Description */}
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                        <FileText className="w-4 h-4 text-indigo-600" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900">Work Description</h3>
                    </div>

                    <Textarea
                      label="Work Description"
                      value={formData.workDescription}
                      onChange={handleInputChange('workDescription')}
                      error={errors.workDescription}
                      placeholder="Describe the work completed for this payment..."
                      rows={3}
                    />
                  </div>

                  {/* Receipt & Notes */}
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Receipt className="w-4 h-4 text-gray-600" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900">Receipt & Additional Notes</h3>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <label className="block text-sm font-medium text-gray-700">Receipt Photo (Optional)</label>
                        <div className="flex items-center space-x-4">
                            <label className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none">
                                <div className="px-4 py-2 border border-gray-300 rounded-md flex items-center space-x-2">
                                    <Upload className="w-4 h-4" />
                                    <span>{uploadingReceipt ? 'Uploading...' : 'Upload Receipt'}</span>
                                </div>
                                <input
                                    type="file"
                                    className="sr-only"
                                    accept="image/*"
                                    onChange={handleFileUpload}
                                    disabled={uploadingReceipt}
                                />
                            </label>
                            {formData.receiptPhoto && (
                                <div className="text-sm text-green-600 flex items-center">
                                    <CheckCircle className="w-4 h-4 mr-1" />
                                    Uploaded
                                </div>
                            )}
                        </div>
                      </div>

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
              )}
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
                className="sm:w-auto w-full bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500"
              >
                Record Payment
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

      {selectedProject && selectedContractor && (
        <ExcelImportModal
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
          project={{ id: selectedProject._id, name: selectedProject.name }}
          contractor={{ id: selectedContractor._id, name: selectedContractor.companyName }}
          contract={selectedContract ? { id: selectedContract._id, type: selectedContract.contractType } : null}
          onSuccess={(count) => {
            showNotification('success', `Successfully imported ${count} payments from Excel!`);
          }}
        />
      )}
    </div>
  );
};