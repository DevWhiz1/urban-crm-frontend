import React, { useState, useEffect } from 'react';
import { Breadcrumbs } from './ui/Breadcrumbs';
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
        <div className="max-w-4xl mx-auto space-y-6">
            <Breadcrumbs
                items={[
                    { label: 'Dashboard', path: '/dashboard' },
                    { label: 'Payments', path: '/dashboard/payments' },
                    { label: 'Add Material Payment' }
                ]}
            />

            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Add Material Payment</h1>
                <p className="text-sm text-gray-500 mt-1">Record payments for materials, supplies, and equipment purchases</p>
            </div>

            {/* Form Card */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 sm:p-8">
                <form onSubmit={handleSubmit} className="space-y-8">
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

            <Notification
                show={notification.show}
                type={notification.type}
                message={notification.message}
                onClose={() => setNotification(prev => ({ ...prev, show: false }))}
            />
        </div>
    );
};