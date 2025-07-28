import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Handshake, 
  Building, 
  Users, 
  Calculator, 
  Calendar, 
  DollarSign,
  Wrench,
  CheckCircle,
  AlertTriangle,
  Clock,
  Edit3
} from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { Textarea } from './ui/Textarea';
import { Notification } from './ui/Notification';
import { createProjectContract, fetchProjects, fetchContractorsForContract } from '../services/projectContractApi';
import { validateProjectContractForm, hasProjectContractErrors, formatPKRCurrency } from '../utils/projectContractValidation';
import { ProjectContractFormData, ProjectContractFormErrors, ProjectContractNotificationState, ProjectOption, ContractorOption } from '../types/projectContract';

export const ProjectContractForm: React.FC = () => {
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
    project: '',
    contractor: '',
    contractType: '',
    totalAmount: '',
    startDate: '',
    endDate: '',
    Description: ''
  });

  const [errors, setErrors] = useState<ProjectContractFormErrors>({});

  useEffect(() => {
    loadInitialData();
  }, []);

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
      await createProjectContract(formData);
      
      // Reset form
      setFormData({
        project: '',
        contractor: '',
        contractType: '',
        totalAmount: '',
        startDate: '',
        endDate: '',
        Description: ''
      });
      
      showNotification('success', 'Project contract created successfully!');
    } catch (error) {
      showNotification('error', 'Failed to create project contract. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-amber-100 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-600 rounded-full mb-4">
            <Handshake className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Project Contract</h1>
          <p className="text-gray-600">Assign projects to sub-contractors with detailed contract terms</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-orange-600 to-amber-600 px-8 py-6">
            <h2 className="text-xl font-semibold text-white">Contract Information</h2>
            <p className="text-orange-100 mt-1">Create a contract between project and contractor</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8">
            <div className="space-y-8">
              {/* Project & Contractor Selection */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Building className="w-4 h-4 text-orange-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">Project & Contractor Assignment</h3>
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
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-4 h-4 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">Contract Details</h3>
                </div>
                
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
                          Amount: {formatPKRCurrency(formData.totalAmount)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">Contract Timeline</h3>
                </div>
                
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
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-4 h-4 text-gray-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">Contract Description</h3>
                </div>
                
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
                className="sm:w-auto w-full bg-orange-600 hover:bg-orange-700 focus:ring-orange-500"
              >
                Create Contract
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
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Wrench className="w-5 h-5 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Available Contractors</p>
                <p className="text-2xl font-bold text-gray-900">{contractors.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Handshake className="w-5 h-5 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Contracts</p>
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