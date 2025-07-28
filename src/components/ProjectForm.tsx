import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  MapPin, 
  Building, 
  Users, 
  Calculator, 
  Calendar, 
  DollarSign,
  Wrench,
  UserCheck,
  Plus,
  Minus,
  Upload,
  Link as LinkIcon,
  File
} from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { Textarea } from './ui/Textarea';
import { Notification } from './ui/Notification';
import { createProject, fetchClients, fetchContractors } from '../services/projectApi';
import { PROJECT_CATEGORIES, PROJECT_TYPES, PROJECT_STATUSES } from '../constants/project';
import { validateProjectForm, hasProjectErrors, calculateTotalCost, calculateTotalLabourCost, formatPKRCurrency } from '../utils/projectValidation';
import { ProjectFormData, ProjectFormErrors, ProjectNotificationState, Client, Contractor } from '../types/project';

export const ProjectForm: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [notification, setNotification] = useState<ProjectNotificationState>({
    show: false,
    type: 'success',
    message: ''
  });

  const [formData, setFormData] = useState<ProjectFormData>({
    name: '',
    customer: '',
    location: '',
    projectCategory: '',
    projectType: '',
    ratePerSquareFoot: '',
    totalArea: '',
    totalCoverageArea: '',
    totalCost: '',
    labouRate: '',
    totalLabourCost: '',
    startDate: '',
    estimatedDuration: '',
    contractors: [''],
    drawings: [''],
    contracts: [''],
    description: '',
    status: 'planning'
  });

  const [errors, setErrors] = useState<ProjectFormErrors>({});

  useEffect(() => {
    loadInitialData();
  }, []);

  // Auto-calculate costs when relevant fields change
  useEffect(() => {
    if (formData.projectType === 'withMaterial' && formData.ratePerSquareFoot && formData.totalCoverageArea) {
      const rate = parseFloat(formData.ratePerSquareFoot);
      const area = parseFloat(formData.totalCoverageArea);
      if (!isNaN(rate) && !isNaN(area)) {
        const total = calculateTotalCost(rate, area);
        setFormData(prev => ({ ...prev, totalCost: total.toString() }));
      }
    }
  }, [formData.ratePerSquareFoot, formData.totalCoverageArea, formData.projectType]);

  useEffect(() => {
    if (formData.projectType === 'labourRate' && formData.labouRate && formData.totalCoverageArea) {
      const rate = parseFloat(formData.labouRate);
      const area = parseFloat(formData.totalCoverageArea);
      if (!isNaN(rate) && !isNaN(area)) {
        const total = calculateTotalLabourCost(rate, area);
        setFormData(prev => ({ ...prev, totalLabourCost: total.toString() }));
      }
    }
  }, [formData.labouRate, formData.totalCoverageArea, formData.projectType]);

  const loadInitialData = async () => {
    try {
      setLoadingData(true);
      const [clientsData, contractorsData] = await Promise.all([
        fetchClients(),
        fetchContractors()
      ]);
      
      setClients(clientsData);
      setContractors(contractorsData);
      
      if (clientsData.length === 0) {
        showNotification('error', 'No clients found. Please add clients first.');
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

  const handleInputChange = (field: keyof ProjectFormData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleContractorChange = (index: number, value: string) => {
    const newContractors = [...formData.contractors];
    newContractors[index] = value;
    setFormData(prev => ({ ...prev, contractors: newContractors }));
  };

  const addContractor = () => {
    setFormData(prev => ({ ...prev, contractors: [...prev.contractors, ''] }));
  };

  const removeContractor = (index: number) => {
    if (formData.contractors.length > 1) {
      const newContractors = formData.contractors.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, contractors: newContractors }));
    }
  };

  const handleDrawingChange = (index: number, value: string) => {
    const newDrawings = [...formData.drawings];
    newDrawings[index] = value;
    setFormData(prev => ({ ...prev, drawings: newDrawings }));
  };

  const addDrawing = () => {
    setFormData(prev => ({ ...prev, drawings: [...prev.drawings, ''] }));
  };

  const removeDrawing = (index: number) => {
    if (formData.drawings.length > 1) {
      const newDrawings = formData.drawings.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, drawings: newDrawings }));
    }
  };

  const handleContractChange = (index: number, value: string) => {
    const newContracts = [...formData.contracts];
    newContracts[index] = value;
    setFormData(prev => ({ ...prev, contracts: newContracts }));
  };

  const addContract = () => {
    setFormData(prev => ({ ...prev, contracts: [...prev.contracts, ''] }));
  };

  const removeContract = (index: number) => {
    if (formData.contracts.length > 1) {
      const newContracts = formData.contracts.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, contracts: newContracts }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors = validateProjectForm(formData);
    setErrors(validationErrors);

    if (hasProjectErrors(validationErrors)) {
      showNotification('error', 'Please fix the errors below before submitting.');
      return;
    }

    try {
      setLoading(true);
      await createProject(formData);
      
      // Reset form
      setFormData({
        name: '',
        customer: '',
        location: '',
        projectCategory: '',
        projectType: '',
        ratePerSquareFoot: '',
        totalArea: '',
        totalCoverageArea: '',
        totalCost: '',
        labouRate: '',
        totalLabourCost: '',
        startDate: '',
        estimatedDuration: '',
        contractors: [''],
        drawings: [''],
        contracts: [''],
        description: '',
        status: 'planning'
      });
      
      showNotification('success', 'Project created successfully!');
    } catch (error) {
      showNotification('error', 'Failed to create project. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      name: '',
      customer: '',
      location: '',
      projectCategory: '',
      projectType: '',
      ratePerSquareFoot: '',
      totalArea: '',
      totalCoverageArea: '',
      totalCost: '',
      labouRate: '',
      totalLabourCost: '',
      startDate: '',
      estimatedDuration: '',
      contractors: [''],
      drawings: [''],
      contracts: [''],
      description: '',
      status: 'planning'
    });
    setErrors({});
  };

  const clientOptions = clients.map(client => ({
    value: client._id,
    label: `${client.user.userName} (${client.user.email})`
  }));

  const contractorOptions = contractors.map(contractor => ({
    value: contractor._id,
    label: `${contractor.companyName} - ${contractor.user.userName}`
  }));

  const isWithMaterial = formData.projectType === 'withMaterial';
  const isLabourRate = formData.projectType === 'labourRate';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-full mb-4">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Project</h1>
          <p className="text-gray-600">Set up a comprehensive project with all necessary details and calculations</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-6">
            <h2 className="text-xl font-semibold text-white">Project Information</h2>
            <p className="text-indigo-100 mt-1">Fill in the details below to create a new project</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8">
            <div className="space-y-8">
              {/* Basic Information */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <Building className="w-4 h-4 text-indigo-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Input
                    label="Project Name"
                    value={formData.name}
                    onChange={handleInputChange('name')}
                    error={errors.name}
                    placeholder="Enter project name"
                    required
                  />
                  
                  <Select
                    label="Customer"
                    options={clientOptions}
                    value={formData.customer}
                    onChange={handleInputChange('customer')}
                    error={errors.customer}
                    required
                    placeholder={loadingData ? "Loading clients..." : "Select a client"}
                    disabled={loadingData}
                  />

                  <Input
                    label="Location"
                    value={formData.location}
                    onChange={handleInputChange('location')}
                    error={errors.location}
                    placeholder="Enter project location"
                    required
                  />

                  <Select
                    label="Project Category"
                    options={PROJECT_CATEGORIES}
                    value={formData.projectCategory}
                    onChange={handleInputChange('projectCategory')}
                    error={errors.projectCategory}
                    placeholder="Select project category"
                    required
                  />

                  <Select
                    label="Project Type"
                    options={PROJECT_TYPES}
                    value={formData.projectType}
                    onChange={handleInputChange('projectType')}
                    error={errors.projectType}
                    placeholder="Select project type"
                    required
                  />

                  <Select
                    label="Status"
                    options={PROJECT_STATUSES}
                    value={formData.status}
                    onChange={handleInputChange('status')}
                    placeholder="Select status"
                  />
                </div>
              </div>

              {/* Project Calculations */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <Calculator className="w-4 h-4 text-green-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">Project Calculations</h3>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Input
                    label="Total Area (sq ft)"
                    type="number"
                    value={formData.totalArea}
                    onChange={handleInputChange('totalArea')}
                    error={errors.totalArea}
                    placeholder="Enter total area"
                    step="0.01"
                  />

                  <Input
                    label="Total Coverage Area (sq ft)"
                    type="number"
                    value={formData.totalCoverageArea}
                    onChange={handleInputChange('totalCoverageArea')}
                    error={errors.totalCoverageArea}
                    placeholder="Enter coverage area"
                    step="0.01"
                  />
                </div>

                {/* Conditional Fields Based on Project Type */}
                {isWithMaterial && (
                  <div className="mt-6 p-6 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="text-md font-medium text-blue-900 mb-4">Material Project Calculations</h4>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <Input
                        label="Rate per Square Foot (PKR)"
                        type="number"
                        value={formData.ratePerSquareFoot}
                        onChange={handleInputChange('ratePerSquareFoot')}
                        error={errors.ratePerSquareFoot}
                        placeholder="Enter rate per sq ft"
                        step="0.01"
                        required
                      />

                      <div>
                        <Input
                          label="Total Cost (PKR)"
                          type="number"
                          value={formData.totalCost}
                          onChange={handleInputChange('totalCost')}
                          placeholder="Auto-calculated"
                          disabled
                          className="bg-gray-50"
                        />
                        {formData.totalCost && !isNaN(parseFloat(formData.totalCost)) && (
                          <div className="mt-2 p-2 bg-green-50 rounded border border-green-200">
                            <p className="text-sm text-green-800 font-medium">
                              Total: {formatPKRCurrency(formData.totalCost)}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {isLabourRate && (
                  <div className="mt-6 p-6 bg-orange-50 rounded-lg border border-orange-200">
                    <h4 className="text-md font-medium text-orange-900 mb-4">Labour Rate Calculations</h4>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <Input
                        label="Labour Rate per Sq Ft (PKR)"
                        type="number"
                        value={formData.labouRate}
                        onChange={handleInputChange('labouRate')}
                        error={errors.labouRate}
                        placeholder="Enter labour rate per sq ft"
                        step="0.01"
                        required
                      />

                      <div>
                        <Input
                          label="Total Labour Cost (PKR)"
                          type="number"
                          value={formData.totalLabourCost}
                          onChange={handleInputChange('totalLabourCost')}
                          placeholder="Auto-calculated"
                          disabled
                          className="bg-gray-50"
                        />
                        {formData.totalLabourCost && !isNaN(parseFloat(formData.totalLabourCost)) && (
                          <div className="mt-2 p-2 bg-green-50 rounded border border-green-200">
                            <p className="text-sm text-green-800 font-medium">
                              Total: {formatPKRCurrency(formData.totalLabourCost)}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Timeline */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">Timeline</h3>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Input
                    label="Start Date"
                    type="date"
                    value={formData.startDate}
                    onChange={handleInputChange('startDate')}
                    error={errors.startDate}
                  />

                  <Input
                    label="Estimated Completion Date"
                    type="date"
                    value={formData.estimatedDuration}
                    onChange={handleInputChange('estimatedDuration')}
                    error={errors.estimatedDuration}
                  />
                </div>
              </div>

              {/* People Assignment */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="w-4 h-4 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">Contractors Assignment</h3>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Contractors
                  </label>
                  <div className="space-y-3">
                    {formData.contractors.map((contractorId, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="flex-1">
                          <Select
                            label=""
                            options={contractorOptions}
                            value={contractorId}
                            onChange={(e) => handleContractorChange(index, e.target.value)}
                            placeholder="Select a contractor"
                          />
                        </div>
                        <div className="flex gap-2">
                          {index === formData.contractors.length - 1 && (
                            <button
                              type="button"
                              onClick={addContractor}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          )}
                          {formData.contractors.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeContractor(index)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Documents */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                    <File className="w-4 h-4 text-orange-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">Project Documents</h3>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Drawings */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      <LinkIcon className="w-4 h-4 inline mr-2" />
                      Drawing URLs
                    </label>
                    <div className="space-y-3">
                      {formData.drawings.map((drawing, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <div className="flex-1">
                            <Input
                              label=""
                              value={drawing}
                              onChange={(e) => handleDrawingChange(index, e.target.value)}
                              placeholder="https://example.com/drawing.pdf"
                            />
                          </div>
                          <div className="flex gap-2">
                            {index === formData.drawings.length - 1 && (
                              <button
                                type="button"
                                onClick={addDrawing}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            )}
                            {formData.drawings.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeDrawing(index)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    {errors.drawings && (
                      <p className="text-red-600 text-sm mt-2">{errors.drawings}</p>
                    )}
                  </div>

                  {/* Contracts */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      <LinkIcon className="w-4 h-4 inline mr-2" />
                      Contract URLs
                    </label>
                    <div className="space-y-3">
                      {formData.contracts.map((contract, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <div className="flex-1">
                            <Input
                              label=""
                              value={contract}
                              onChange={(e) => handleContractChange(index, e.target.value)}
                              placeholder="https://example.com/contract.pdf"
                            />
                          </div>
                          <div className="flex gap-2">
                            {index === formData.contracts.length - 1 && (
                              <button
                                type="button"
                                onClick={addContract}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            )}
                            {formData.contracts.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeContract(index)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    {errors.contracts && (
                      <p className="text-red-600 text-sm mt-2">{errors.contracts}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-4 h-4 text-gray-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">Additional Details</h3>
                </div>
                
                <Textarea
                  label="Project Description"
                  value={formData.description}
                  onChange={handleInputChange('description')}
                  error={errors.description}
                  placeholder="Enter project description, requirements, and any additional notes..."
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
                className="sm:w-auto w-full bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500"
              >
                Create Project
              </Button>
            </div>
          </form>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <UserCheck className="w-5 h-5 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Clients</p>
                <p className="text-2xl font-bold text-gray-900">{clients.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Wrench className="w-5 h-5 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Contractors</p>
                <p className="text-2xl font-bold text-gray-900">{contractors.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Building className="w-5 h-5 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Project Categories</p>
                <p className="text-2xl font-bold text-gray-900">{PROJECT_CATEGORIES.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-orange-600" />
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