import React, { useState, useEffect } from 'react';
import {
  X,
  Handshake,
  Building,
  User,
  FileText,
  Calendar,
  DollarSign,
  Edit3
} from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { Textarea } from './ui/Textarea';
import { Notification } from './ui/Notification';
import {
  createProjectContract,
  updateProjectContract,
  fetchProjects,
  fetchContractorsForContract
} from '../services/projectContractApi';
import { validateProjectContractForm, hasProjectContractErrors, formatPKRCurrency } from '../utils/projectContractValidation';
import { formatDateForInput } from '../utils/projectValidation';
import { ProjectContractFormData, ProjectContractFormErrors, ProjectContractNotificationState, ProjectOption, ContractorOption, ProjectContract } from '../types/projectContract';

interface ProjectContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (contract: ProjectContract) => void;
  contract?: ProjectContract;
  mode: 'add' | 'edit';
}

export const ProjectContractModal: React.FC<ProjectContractModalProps> = ({
  isOpen,
  onClose,
  onSave,
  contract,
  mode
}) => {
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [contractors, setContractors] = useState<ContractorOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [notification, setNotification] = useState<ProjectContractNotificationState>({
    show: false,
    type: 'success',
    message: ''
  });

  const [formData, setFormData] = useState<ProjectContractFormData>({
    project: typeof contract?.project === 'object' ? (contract.project._id || '') : (contract?.project || ''),
    contractor: typeof contract?.contractor === 'object' ? (contract.contractor._id || '') : (contract?.contractor || ''),
    contractType: contract?.contractType || '',
    totalAmount: contract?.totalAmount?.toString() || '',
    startDate: formatDateForInput(contract?.startDate),
    endDate: formatDateForInput(contract?.endDate),
    Description: contract?.Description || ''
  });

  const [errors, setErrors] = useState<ProjectContractFormErrors>({});

  useEffect(() => {
    if (isOpen) {
      loadInitialData();
    }
  }, [isOpen]);

  useEffect(() => {
    if (contract && mode === 'edit') {
      setFormData({
        project: typeof contract.project === 'object' ? (contract.project._id || '') : (contract.project || ''),
        contractor: typeof contract.contractor === 'object' ? (contract.contractor._id || '') : (contract.contractor || ''),
        contractType: contract.contractType || '',
        totalAmount: contract.totalAmount?.toString() || '',
        startDate: formatDateForInput(contract.startDate),
        endDate: formatDateForInput(contract.endDate),
        Description: contract.Description || ''
      });
    }
  }, [contract, mode]);

  const loadInitialData = async () => {
    try {
      setLoadingData(true);
      const [projectsData, contractorsData] = await Promise.all([
        fetchProjects(),
        fetchContractorsForContract()
      ]);

      setProjects(projectsData);
      setContractors(contractorsData);

      if (projectsData.length === 0) {
        showNotification('error', 'No projects found. Please create projects first.');
      }
      if (contractorsData.length === 0) {
        showNotification('error', 'No contractors found. Please add contractors first.');
      }
    } catch (error) {
      showNotification('error', 'Failed to load data. Please refresh the page.');
    } finally {
      setLoadingData(false);
    }
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ show: true, type, message });
  };

  const handleInputChange = (field: keyof ProjectContractFormData) => (
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

    const validationErrors = validateProjectContractForm(formData);
    setErrors(validationErrors);

    if (hasProjectContractErrors(validationErrors)) {
      showNotification('error', 'Please fix the errors below before submitting.');
      return;
    }

    try {
      setLoading(true);

      if (mode === 'edit' && contract) {
        const updatedContract = await updateProjectContract(contract._id, formData);
        showNotification('success', 'Project contract updated successfully!');
        onSave(updatedContract);
      } else {
        await createProjectContract(formData);
        showNotification('success', 'Project contract created successfully!');
        // Reset form for add mode
        setFormData({
          project: '',
          contractor: '',
          contractType: '',
          totalAmount: '',
          startDate: '',
          endDate: '',
          Description: ''
        });
        onSave({} as ProjectContract); // Trigger parent to refresh list
      }
    } catch (error) {
      showNotification('error', `Failed to ${mode === 'edit' ? 'update' : 'create'} project contract. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      project: '',
      contractor: '',
      contractType: '',
      totalAmount: '',
      startDate: '',
      endDate: '',
      Description: ''
    });
    setErrors({});
    onClose();
  };

  const projectOptions = projects.map(project => ({
    value: project._id,
    label: `${project.name} (${project.projectCode}) - ${project.status}`
  }));

  const contractorOptions = contractors.map(contractor => ({
    value: contractor._id,
    label: `${contractor.companyName} - ${contractor.user.userName} (${contractor.contractorType})`
  }));

  const selectedProject = projects.find(p => p._id === formData.project);
  const selectedContractor = contractors.find(c => c._id === formData.contractor);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={handleClose}
        ></div>

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden border border-gray-200 transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          {/* Header */}
          <div className="bg-orange-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                  <Handshake className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white">
                  {mode === 'edit' ? 'Edit Project Contract' : 'Create Project Contract'}
                </h3>
              </div>
              <button
                onClick={handleClose}
                className="text-white hover:text-orange-200 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6">
            <div className="space-y-6">
              {/* Project & Contractor Selection */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <Building className="w-4 h-4 text-orange-600" />
                  Project & Contractor Assignment
                </h4>

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
                          <strong>Status:</strong> {selectedProject.status} |
                          <strong> Code:</strong> {selectedProject.projectCode}
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
                      placeholder={loadingData ? "Loading contractors..." : "Choose a contractor"}
                      disabled={loadingData}
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

              {/* Contract Details */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  Contract Details
                </h4>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <Input
                      label="Contract Type"
                      value={formData.contractType}
                      onChange={handleInputChange('contractType')}
                      error={errors.contractType}
                      placeholder="Enter custom contract type (e.g., Fixed Price, Time & Material, etc.)"
                      required
                    />
                    <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center text-gray-600">
                        <Edit3 className="w-4 h-4 mr-2" />
                        <span className="text-sm">
                          Enter your own contract type description
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Input
                      label="Total Amount (PKR)"
                      type="number"
                      value={formData.totalAmount}
                      onChange={handleInputChange('totalAmount')}
                      error={errors.totalAmount}
                      placeholder="Enter contract amount"
                      step="0.01"
                      required
                    />
                    {formData.totalAmount && !isNaN(parseFloat(formData.totalAmount)) && (
                      <div className="mt-2 p-2 bg-green-50 rounded border border-green-200">
                        <p className="text-sm text-green-800 font-medium">
                          Base Amount: {formatPKRCurrency(formData.totalAmount)}
                        </p>
                      </div>
                    )}
                    {contract?.additions && contract.additions.length > 0 && (
                      <div className="mt-3 p-3 bg-amber-50 rounded-lg border border-amber-200 space-y-1.5 text-xs">
                        <div className="flex items-center justify-between font-medium text-amber-900">
                          <span>Base Contract Amount:</span>
                          <span>{formatPKRCurrency(formData.totalAmount || '0')}</span>
                        </div>
                        <div className="flex items-center justify-between font-medium text-amber-700">
                          <span>Recorded Additions ({contract.additions.length}):</span>
                          <span>+{formatPKRCurrency(contract.additions.reduce((sum, item) => sum + (item.amount || 0), 0).toString())}</span>
                        </div>
                        <div className="flex items-center justify-between font-bold text-emerald-800 pt-1.5 border-t border-amber-200 text-sm">
                          <span>Revised Total Amount:</span>
                          <span>
                            {formatPKRCurrency(
                              ((parseFloat(formData.totalAmount || '0') || 0) + contract.additions.reduce((sum, item) => sum + (item.amount || 0), 0)).toString()
                            )}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-purple-600" />
                  Contract Timeline
                </h4>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Input
                    label="Start Date"
                    type="date"
                    value={formData.startDate}
                    onChange={handleInputChange('startDate')}
                    error={errors.startDate}
                    required
                  />

                  <Input
                    label="End Date (Optional)"
                    type="date"
                    value={formData.endDate}
                    onChange={handleInputChange('endDate')}
                    error={errors.endDate}
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gray-600" />
                  Contract Description
                </h4>

                <Textarea
                  label="Description"
                  value={formData.Description}
                  onChange={handleInputChange('Description')}
                  error={errors.Description}
                  placeholder="Enter contract description, scope of work, terms and conditions..."
                  rows={4}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-end mt-8 pt-6 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={loading}
                className="sm:w-auto w-full"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                loading={loading}
                disabled={loadingData}
                className="sm:w-auto w-full bg-orange-600 hover:bg-orange-700 focus:ring-orange-500"
              >
                {mode === 'edit' ? 'Update Contract' : 'Create Contract'}
              </Button>
            </div>
          </form>
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
