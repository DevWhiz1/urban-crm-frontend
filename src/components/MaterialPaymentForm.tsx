import React, { useState, useEffect } from 'react';
import { Breadcrumbs } from './ui/Breadcrumbs';
import {
    Package,
    Building,
    Calculator,
    Calendar,
    Banknote,
    Truck,
    User,
    FileSpreadsheet,
    Receipt,
    Upload,
    CreditCard,
    CheckCircle,
    Hash,
    FileText
} from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { Textarea } from './ui/Textarea';
import { Notification } from './ui/Notification';
import { MaterialExcelImportModal } from './MaterialExcelImportModal';
import { createMaterialPayment, fetchProjectsForMaterial } from '../services/materialPaymentApi';
import { fetchAllSuppliers } from '../services/supplierApi';
import { uploadApi } from '../services/uploadApi';
import { validateMaterialPaymentForm, hasMaterialPaymentErrors, formatPKRCurrency } from '../utils/materialPaymentValidation';
import { formatCurrencyToWords } from '../utils/currencyFormatter';
import { getPaymentStatusColor } from '../utils/paymentValidation';
import { PAYMENT_METHODS, PAYMENT_STATUSES } from '../constants/payment';
import { MaterialPaymentFormData, MaterialPaymentFormErrors, MaterialPaymentNotificationState, MaterialProjectOption } from '../types/materialPayment';
import { Supplier } from '../types/supplier';

const MATERIAL_TYPES = [
    { value: 'Cement', label: 'Cement' },
    { value: 'Steel', label: 'Steel' },
    { value: 'Bricks', label: 'Bricks' },
    { value: 'Sand', label: 'Sand' },
    { value: 'Crush', label: 'Crush' },
    { value: 'Wood', label: 'Wood' },
    { value: 'Paint', label: 'Paint' },
    { value: 'Tiles', label: 'Tiles' },
    { value: 'Electrical', label: 'Electrical' },
    { value: 'Plumbing', label: 'Plumbing' },
    { value: 'Other', label: 'Other (Specify)' }
];

export const MaterialPaymentForm: React.FC = () => {
    const [projects, setProjects] = useState<MaterialProjectOption[]>([]);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(true);
    const [uploadingReceipt, setUploadingReceipt] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [isOtherMaterial, setIsOtherMaterial] = useState(false);
    const [notification, setNotification] = useState<MaterialPaymentNotificationState>({
        show: false,
        type: 'success',
        message: ''
    });

    const [formData, setFormData] = useState<MaterialPaymentFormData>({
        project: '',
        materialDetail: '',
        materialProvider: '',
        supplier: '',
        MaterialQuantity: '',
        MaterialRate: '',
        totalAmount: '',
        date: new Date().toISOString().split('T')[0],
        status: 'paid',
        paymentMethod: 'online',
        transactionType: 'purchase',
        receiptPhoto: '',
        description: ''
    });

    const [errors, setErrors] = useState<MaterialPaymentFormErrors>({});

    useEffect(() => {
        loadInitialData();
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

    const loadInitialData = async () => {
        try {
            setLoadingData(true);
            const [projectsData, suppliersData] = await Promise.all([
                fetchProjectsForMaterial(),
                fetchAllSuppliers()
            ]);
            setProjects(projectsData);
            setSuppliers(suppliersData);

            if (projectsData.length === 0) {
                showNotification('error', 'No projects found. Please create projects first.');
            }
        } catch (error) {
            showNotification('error', 'Failed to load necessary data. Please refresh the page.');
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
                supplier: '',
                MaterialQuantity: '',
                MaterialRate: '',
                totalAmount: '',
                date: new Date().toISOString().split('T')[0],
                status: 'paid',
                paymentMethod: 'online',
                transactionType: 'purchase',
                receiptPhoto: '',
                description: ''
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
            supplier: '',
            MaterialQuantity: '',
            MaterialRate: '',
            totalAmount: '',
            date: new Date().toISOString().split('T')[0],
            status: 'paid',
            paymentMethod: 'online',
            transactionType: 'purchase',
            receiptPhoto: '',
            description: ''
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

    const projectOptions = projects
        .map(project => ({
            value: project._id,
            label: `${project.name} (${project.status})`
        }));

    const supplierOptions = [
        { value: '', label: 'Select a supplier...' },
        ...suppliers.map(s => ({ value: s._id, label: s.companyName }))
    ];

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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Add Material Payment</h1>
                    <p className="text-sm text-gray-500 mt-1">Record single or bulk Excel material payments for project work</p>
                </div>
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                        if (!formData.project) {
                            showNotification('error', 'Please select a Project first before importing Excel material payments.');
                            return;
                        }
                        setIsImportModalOpen(true);
                    }}
                    className="flex items-center space-x-2 border-amber-600 text-amber-700 hover:bg-amber-50 self-start sm:self-auto"
                >
                    <FileSpreadsheet className="w-4 h-4 text-amber-600" />
                    <span>Import from Excel / CSV</span>
                </Button>
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
                                        <div className="mt-2 p-3 bg-amber-50 rounded-lg border border-amber-200 flex items-center justify-between">
                                            <p className="text-sm text-amber-900">
                                                <strong>Selected Project:</strong> {selectedProject.name}
                                            </p>
                                            <Button
                                                type="button"
                                                size="sm"
                                                onClick={() => setIsImportModalOpen(true)}
                                                className="bg-amber-600 hover:bg-amber-700 text-white"
                                            >
                                                Upload Material Excel Sheet
                                            </Button>
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

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                                    <Select
                                        label="Transaction Type"
                                        options={[
                                            { value: 'purchase', label: 'Purchase' },
                                            { value: 'return', label: 'Return (Refund)' }
                                        ]}
                                        value={formData.transactionType}
                                        onChange={handleInputChange('transactionType')}
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <Select
                                            label="Material Type"
                                            options={MATERIAL_TYPES}
                                            value={isOtherMaterial ? 'Other' : (MATERIAL_TYPES.find(m => m.value === formData.materialDetail) ? formData.materialDetail : (formData.materialDetail ? 'Other' : ''))}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                if (val === 'Other') {
                                                    setIsOtherMaterial(true);
                                                    setFormData(prev => ({ ...prev, materialDetail: '' }));
                                                } else {
                                                    setIsOtherMaterial(false);
                                                    setFormData(prev => ({ ...prev, materialDetail: val }));
                                                }
                                            }}
                                            placeholder="Select material type"
                                            required
                                        />
                                        
                                        {isOtherMaterial && (
                                            <Textarea
                                                label="Specify Material Detail"
                                                value={formData.materialDetail}
                                                onChange={handleInputChange('materialDetail')}
                                                error={errors.materialDetail}
                                                placeholder="Describe the materials purchased (e.g., Cement bags, Steel rods, Paint, etc.)"
                                                rows={2}
                                            />
                                        )}
                                    </div>

                                    <Select
                                        label="Supplier / Vendor"
                                        options={supplierOptions}
                                        value={formData.supplier || ''}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            const selectedSupplier = suppliers.find(s => s._id === val);
                                            setFormData(prev => ({ 
                                                ...prev, 
                                                supplier: val,
                                                materialProvider: selectedSupplier ? selectedSupplier.companyName : ''
                                            }));
                                        }}
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
                                        required
                                    />

                                    <Input
                                        label="Material Rate (PKR per unit)"
                                        type="number"
                                        value={formData.MaterialRate}
                                        onChange={handleInputChange('MaterialRate')}
                                        error={errors.MaterialRate}
                                        placeholder="Enter rate per unit"
                                        step="0.01"
                                        required
                                    />

                                    <div>
                                        <Input
                                            label="Total Amount (PKR)"
                                            type="number"
                                            value={formData.totalAmount}
                                            onChange={handleInputChange('totalAmount')}
                                            placeholder="Auto-calculated"
                                            helperText={formatCurrencyToWords(formData.totalAmount)}
                                            disabled
                                            className="bg-gray-50"
                                            required
                                        />
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

                            {/* Payment Method, Status & Receipt */}
                            <div>
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                                        <CreditCard className="w-4 h-4 text-indigo-600" />
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900">Payment Status & Method</h3>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

                                    <Select
                                        label="Payment Method"
                                        options={PAYMENT_METHODS}
                                        value={formData.paymentMethod}
                                        onChange={handleInputChange('paymentMethod')}
                                        placeholder="Select payment method"
                                    />
                                </div>
                            </div>

                            {/* Receipt */}
                            <div>
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                                        <Receipt className="w-4 h-4 text-gray-600" />
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900">Receipt</h3>
                                </div>

                                <div className="grid grid-cols-1 gap-6">
                                    <Textarea
                                        label="Description (Optional)"
                                        value={formData.description || ''}
                                        onChange={handleInputChange('description')}
                                        placeholder="Enter any additional description or notes about this material purchase..."
                                        rows={3}
                                    />
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

            {selectedProject && (
                <MaterialExcelImportModal
                    isOpen={isImportModalOpen}
                    onClose={() => setIsImportModalOpen(false)}
                    project={{ id: selectedProject._id, name: selectedProject.name }}
                    onSuccess={(count) => {
                        showNotification('success', `Successfully imported ${count} material payments from Excel!`);
                    }}
                />
            )}
        </div>
    );
};