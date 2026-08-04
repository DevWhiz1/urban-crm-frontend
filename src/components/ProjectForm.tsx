import React, { useState, useEffect } from 'react';
import { Breadcrumbs } from './ui/Breadcrumbs';
import {
    FileText,
    MapPin,
    Building,
    Users,
    Calculator,
    Calendar,
    Banknote,
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
import { createProject, updateProject, fetchClients } from '../services/projectApi';
import { PROJECT_CATEGORIES, PROJECT_TYPES, PROJECT_STATUSES } from '../constants/project';
import { validateProjectForm, hasProjectErrors, calculateTotalCost, calculateTotalLabourCost, formatPKRCurrency, formatDateForInput } from '../utils/projectValidation';
import { ProjectFormData, ProjectFormErrors, ProjectNotificationState, Client, Project } from '../types/project';

interface ProjectFormProps {
    project?: Project;
    onSave?: (project: Project) => void;
    onCancel?: () => void;
    mode?: 'add' | 'edit';
}

export const ProjectForm: React.FC<ProjectFormProps> = ({
    project,
    onSave,
    onCancel,
    mode = 'add'
}) => {
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(true);
    const [notification, setNotification] = useState<ProjectNotificationState>({
        show: false,
        type: 'success',
        message: ''
    });

    const normalizeStringIds = (items?: any[]): string[] => {
        if (!items || !items.length) return [''];
        const ids = items
            .map(item => {
                if (!item) return '';
                if (typeof item === 'string') return item;
                if (typeof item === 'object') return item._id || item.id || '';
                return String(item);
            })
            .filter(Boolean);
        return ids.length ? ids : [''];
    };

    const [showOptionalFields, setShowOptionalFields] = useState(false);

    const [formData, setFormData] = useState<ProjectFormData>({
        name: project?.name || '',
        customer: typeof project?.customer === 'object' ? (project.customer._id || '') : (project?.customer || ''),
        location: project?.location || '',
        projectCategory: project?.projectCategory || '',
        projectType: project?.projectType || '',
        ratePerSquareFoot: project?.ratePerSquareFoot?.toString() || '',
        totalArea: project?.totalArea?.toString() || '',
        totalCoverageArea: project?.totalCoverageArea?.toString() || '',
        totalCost: project?.totalCost?.toString() || '',
        labouRate: project?.labouRate?.toString() || '',
        startDate: formatDateForInput(project?.startDate),
        estimatedDuration: formatDateForInput(project?.estimatedDuration),
        drawings: normalizeStringIds(project?.drawings),
        contracts: normalizeStringIds(project?.contracts),
        description: project?.description || '',
        status: project?.status || 'planning',
        progress: project?.progress !== undefined ? project?.progress.toString() : '0'
    });

    const [errors, setErrors] = useState<ProjectFormErrors>({});

    useEffect(() => {
        loadInitialData();
    }, []);

    useEffect(() => {
        if (project) {
            setFormData({
                name: project.name || '',
                customer: typeof project.customer === 'object' ? (project.customer._id || '') : (project.customer || ''),
                location: project.location || '',
                projectCategory: project.projectCategory || '',
                projectType: project.projectType || '',
                ratePerSquareFoot: project.ratePerSquareFoot?.toString() || '',
                totalArea: project.totalArea?.toString() || '',
                totalCoverageArea: project.totalCoverageArea?.toString() || '',
                totalCost: project.totalCost?.toString() || '',
                labouRate: project.labouRate?.toString() || '',
                startDate: formatDateForInput(project.startDate),
                estimatedDuration: formatDateForInput(project.estimatedDuration),
                drawings: normalizeStringIds(project.drawings),
                contracts: normalizeStringIds(project.contracts),
                description: project.description || '',
                status: project.status || 'planning',
                progress: project.progress !== undefined ? project.progress.toString() : '0'
            });
        }
    }, [project]);

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
                setFormData(prev => ({ ...prev, totalCost: total.toString() }));
            }
        }
    }, [formData.labouRate, formData.totalCoverageArea, formData.projectType]);

    const loadInitialData = async () => {
        try {
            setLoadingData(true);
            const clientsData = await fetchClients();

            setClients(clientsData);

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

            if (mode === 'edit' && project) {
                const updatedProject = await updateProject(project._id, formData);
                showNotification('success', 'Project updated successfully!');
                if (onSave) {
                    onSave(updatedProject);
                }
            } else {
                await createProject(formData);
                showNotification('success', 'Project created successfully!');
                if (onSave) {
                    onSave({} as Project); // This will trigger the parent to handle the success
                }
            }

            // Reset form only for add mode
            if (mode === 'add') {
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
                    startDate: '',
                    estimatedDuration: '',
                    contractors: [''],
                    drawings: [''],
                    contracts: [''],
                    description: '',
                    status: 'planning',
                    progress: '0'
                });
            }
        } catch (error) {
            showNotification('error', `Failed to ${mode === 'edit' ? 'update' : 'create'} project. Please try again.`);
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
            startDate: '',
            estimatedDuration: '',
            drawings: [''],
            contracts: [''],
            description: '',
            status: 'planning',
            progress: '0'
        });
        setErrors({});
    };

    const clientOptions = clients.map(client => ({
        value: client._id,
        label: `${client.user.userName} (${client.user.email})`
    }));

    const isWithMaterial = formData.projectType === 'withMaterial';
    const isLabourRate = formData.projectType === 'labourRate';

    const additionsTotal = (project?.additions || []).reduce((sum, item) => sum + (item.amount || 0), 0);
    const formEffectiveTotalCost = parseFloat(formData.totalCost || '0') || 0;
    const formBaseProjectCost = Math.max(0, formEffectiveTotalCost - additionsTotal);

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <Breadcrumbs
                items={[
                    { label: 'Dashboard', path: '/dashboard' },
                    { label: 'Projects', path: '/dashboard/projects', onClick: onCancel },
                    { label: mode === 'edit' ? 'Edit Project' : 'Create New Project' }
                ]}
            />

            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                    {mode === 'edit' ? 'Edit Project' : 'Create New Project'}
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                    {mode === 'edit'
                        ? 'Update project details, rate calculations, and contract links'
                        : 'Set up a comprehensive project with all details and cost calculations'
                    }
                </p>
            </div>

            {/* Form Card */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 sm:p-8">
                <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="space-y-8">
                            {/* Basic Information */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                                    <Building className="w-5 h-5 text-indigo-600" />
                                    Basic Information
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Input
                                        label="Project Name"
                                        value={formData.name}
                                        onChange={handleInputChange('name')}
                                        error={errors.name}
                                        placeholder="e.g., Al-Rehman Heights"
                                        required
                                    />

                                    <Select
                                        label="Customer"
                                        value={formData.customer}
                                        onChange={handleInputChange('customer')}
                                        options={clientOptions}
                                        error={errors.customer}
                                        placeholder={loadingData ? "Loading customers..." : "Select customer"}
                                        required
                                        disabled={loadingData}
                                    />

                                    <Input
                                        label="Location"
                                        value={formData.location}
                                        onChange={handleInputChange('location')}
                                        error={errors.location}
                                        placeholder="e.g., Gulberg III, Lahore"
                                        required
                                    />

                                    <Select
                                        label="Project Category"
                                        value={formData.projectCategory}
                                        onChange={handleInputChange('projectCategory')}
                                        options={[
                                            { value: 'residential', label: 'Residential' },
                                            { value: 'commercial', label: 'Commercial' },
                                            { value: 'industrial', label: 'Industrial' },
                                            { value: 'infrastructure', label: 'Infrastructure' },
                                            { value: 'other', label: 'Other' }
                                        ]}
                                        error={errors.projectCategory}
                                        placeholder="Select category"
                                        required
                                    />

                                    <Select
                                        label="Project Type"
                                        value={formData.projectType}
                                        onChange={handleInputChange('projectType')}
                                        options={[
                                            { value: 'withMaterial', label: 'With Material' },
                                            { value: 'labourRate', label: 'Labour Rate' }
                                        ]}
                                        error={errors.projectType}
                                        placeholder="Select type"
                                        required
                                    />
                                    <Select
                                        label="Phase (Status)"
                                        value={formData.status}
                                        onChange={handleInputChange('status')}
                                        options={[
                                            { value: 'planning', label: 'Planning' },
                                            { value: 'pending', label: 'Pending' },
                                            { value: 'ongoing', label: 'Ongoing' },
                                            { value: 'completed', label: 'Completed' },
                                            { value: 'on_hold', label: 'On Hold' },
                                            { value: 'cancelled', label: 'Cancelled' }
                                        ]}
                                        error={errors.status}
                                        placeholder="Select phase"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Cost & Area Calculations */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                                    <Calculator className="w-5 h-5 text-indigo-600" />
                                    Cost & Area Calculations
                                </h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Input
                                        label="Total Coverage Area (Sq Ft) - Calculation is based on this"
                                        type="number"
                                        value={formData.totalCoverageArea}
                                        onChange={handleInputChange('totalCoverageArea')}
                                        error={errors.totalCoverageArea}
                                        placeholder="e.g., 2400"
                                        step="0.01"
                                    />

                                    <Input
                                        label="Total Area (Plot Size in Sq Ft)"
                                        type="number"
                                        value={formData.totalArea}
                                        onChange={handleInputChange('totalArea')}
                                        error={errors.totalArea}
                                        placeholder="e.g., 4500"
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
                                                            Base Cost: {formatPKRCurrency(formData.totalCost)}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        {project?.additions && project.additions.length > 0 && (
                                            <div className="mt-4 p-4 bg-amber-50 rounded-lg border border-amber-200 space-y-2 text-sm">
                                                <div className="flex items-center justify-between font-medium text-amber-900">
                                                    <span>Base Project Cost:</span>
                                                    <span>{formatPKRCurrency(formBaseProjectCost.toString())}</span>
                                                </div>
                                                <div className="flex items-center justify-between font-medium text-amber-700">
                                                    <span>Recorded Additions ({project.additions.length}):</span>
                                                    <span>+{formatPKRCurrency(additionsTotal.toString())}</span>
                                                </div>
                                                <div className="flex items-center justify-between font-bold text-emerald-800 pt-2 border-t border-amber-200 text-base">
                                                    <span>Effective Final Total Cost:</span>
                                                    <span>{formatPKRCurrency(formEffectiveTotalCost.toString())}</span>
                                                </div>
                                            </div>
                                        )}
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
                                                            Calculated Total Cost: {formatPKRCurrency(formData.totalCost)}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        {project?.additions && project.additions.length > 0 && (
                                            <div className="mt-4 p-4 bg-amber-50 rounded-lg border border-amber-200 space-y-2 text-sm">
                                                <div className="flex items-center justify-between font-medium text-amber-900">
                                                    <span>Base Project Cost:</span>
                                                    <span>{formatPKRCurrency(formBaseProjectCost.toString())}</span>
                                                </div>
                                                <div className="flex items-center justify-between font-medium text-amber-700">
                                                    <span>Recorded Additions ({project.additions.length}):</span>
                                                    <span>+{formatPKRCurrency(additionsTotal.toString())}</span>
                                                </div>
                                                <div className="flex items-center justify-between font-bold text-emerald-800 pt-2 border-t border-amber-200 text-base">
                                                    <span>Effective Final Total Cost:</span>
                                                    <span>{formatPKRCurrency(formEffectiveTotalCost.toString())}</span>
                                                </div>
                                            </div>
                                        )}
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

                                    {mode === 'edit' && (
                                        <Input
                                            label="Progress (%)"
                                            type="number"
                                            min="0"
                                            max="100"
                                            value={formData.progress}
                                            onChange={handleInputChange('progress')}
                                            error={errors.progress}
                                            placeholder="e.g., 50"
                                        />
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-center mt-6 border-t border-gray-200 pt-6">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowOptionalFields(!showOptionalFields)}
                                    className="w-full sm:w-auto text-indigo-600 border-indigo-200 hover:bg-indigo-50"
                                >
                                    {showOptionalFields ? 'Hide Optional Fields (Documents & Details)' : 'Add Optional Fields (Documents & Details)'}
                                </Button>
                            </div>

                            {showOptionalFields && (
                                <>
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
                                </>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-end mt-12 pt-8 border-t border-gray-200">
                            {onCancel && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={onCancel}
                                    disabled={loading}
                                    className="sm:w-auto w-full"
                                >
                                    Cancel
                                </Button>
                            )}
                            {mode === 'add' && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleReset}
                                    disabled={loading}
                                    className="sm:w-auto w-full"
                                >
                                    Reset Form
                                </Button>
                            )}
                            <Button
                                type="submit"
                                loading={loading}
                                disabled={loadingData}
                                className="sm:w-auto w-full bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500"
                            >
                                {mode === 'edit' ? 'Update Project' : 'Create Project'}
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