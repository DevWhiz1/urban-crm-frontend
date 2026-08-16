import React, { useState, useEffect } from 'react';
import { Breadcrumbs } from './ui/Breadcrumbs';
import {
    FileText,
    Handshake,
    Building,
    Users,
    Calculator,
    Calendar,
    Banknote,
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
import { formatCurrencyToWords } from '../utils/currencyFormatter';
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
        label: `${project.name} (${project.status})`
    }));

    const contractorOptions = contractors.map(contractor => ({
        value: contractor._id,
        label: `${contractor.companyName} (${contractor.contractorType})`
    }));

    const selectedProject = projects.find(p => p._id === formData.project);
    const selectedContractor = contractors.find(c => c._id === formData.contractor);

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <Breadcrumbs
                items={[
                    { label: 'Dashboard', path: '/dashboard' },
                    { label: 'Project Contracts', path: '/dashboard/project-contracts' },
                    { label: 'Create Project Contract' }
                ]}
            />

            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Create Project Contract</h1>
                <p className="text-sm text-gray-500 mt-1">Assign contractors to projects with rate and coverage area specifications</p>
            </div>

            {/* Form Card */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 sm:p-8">
                <form onSubmit={handleSubmit} className="space-y-8">
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
                                            placeholder={
                                                !formData.project 
                                                    ? "Please select a project first" 
                                                    : loadingData 
                                                        ? "Loading contractors..." 
                                                        : contractors.length === 0 
                                                            ? "No contractors found for this project" 
                                                            : "Search and select a contractor..."
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
                                            label="Total Amount"
                                            type="number"
                                            value={formData.totalAmount}
                                            onChange={handleInputChange('totalAmount')}
                                            error={errors.totalAmount}
                                            helperText={formatCurrencyToWords(formData.totalAmount)}
                                            placeholder="Enter contract amount"
                                            step="0.01"
                                            required
                                        />
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
                                        label="Start Date (Optional)"
                                        type="date"
                                        value={formData.startDate}
                                        onChange={handleInputChange('startDate')}
                                        error={errors.startDate}
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

            <Notification
                show={notification.show}
                type={notification.type}
                message={notification.message}
                onClose={() => setNotification(prev => ({ ...prev, show: false }))}
            />
        </div>
    );
};