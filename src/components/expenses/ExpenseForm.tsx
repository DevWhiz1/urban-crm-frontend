import React, { useState, useEffect } from 'react';
import { Breadcrumbs } from '../ui/Breadcrumbs';
import { Receipt, DollarSign, Building2, User, Paperclip, Upload, Trash2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Textarea } from '../ui/Textarea';
import { Notification } from '../ui/Notification';
import { expenseApi } from '../../services/expenseApi';
import { uploadApi } from '../../services/uploadApi';
import { fetchAllProjects } from '../../services/projectApi';
import { employeeApi } from '../../services/employeeApi';
import { validateExpenseForm, hasExpenseErrors } from '../../utils/expenseValidation';
import { ExpenseFormData, ExpenseCategory } from '../../types/expense';
import { useNavigate, useParams } from 'react-router-dom';

export const ExpenseForm: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();

    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [categories, setCategories] = useState<ExpenseCategory[]>([]);
    const [projects, setProjects] = useState<any[]>([]);
    const [employees, setEmployees] = useState<any[]>([]);

    const [notification, setNotification] = useState<{show: boolean, type: 'success'|'error', message: string}>({
        show: false,
        type: 'success',
        message: ''
    });

    const [formData, setFormData] = useState<ExpenseFormData>({
        date: new Date().toISOString().split('T')[0],
        category: '',
        amount: 0,
        paymentMethod: 'Online',
        vendor: '',
        approvalStatus: 'Paid',
        description: '',
        expenseType: 'Company',
        project: '',
        employee: '',
        attachReceipt: '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        fetchDependencies();
        if (id) {
            loadExpense(id);
        }
    }, [id]);

    const fetchDependencies = async () => {
        try {
            const [catData, projData, empData] = await Promise.all([
                expenseApi.getCategories(),
                fetchAllProjects(),
                employeeApi.getEmployees({ limit: 'all' })
            ]);
            setCategories(catData);
            setProjects(projData);
            setEmployees(empData);
        } catch (error) {
            showNotification('error', 'Failed to load form dependencies.');
        }
    };

    const loadExpense = async (expenseId: string) => {
        try {
            const data = await expenseApi.getExpenseById(expenseId);
            setFormData({
                date: data.date ? data.date.split('T')[0] : '',
                category: typeof data.category === 'object' ? data.category._id : data.category,
                amount: data.amount,
                paymentMethod: data.paymentMethod || 'Online',
                vendor: data.vendor || '',
                approvalStatus: data.approvalStatus || 'Paid',
                description: data.description || '',
                expenseType: data.expenseType,
                project: data.project?._id || '',
                employee: data.employee?._id || '',
                attachReceipt: data.attachReceipt || '',
            });
        } catch (error) {
            showNotification('error', 'Failed to load expense data.');
        }
    };

    const showNotification = (type: 'success' | 'error', message: string) => {
        setNotification({ show: true, type, message });
    };

    const handleInputChange = (field: keyof ExpenseFormData) => (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const value = e.target.type === 'number' ? Number(e.target.value) : e.target.value;
        setFormData(prev => ({ ...prev, [field]: value }));

        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined as any }));
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        const file = e.target.files[0];
        setUploading(true);
        try {
            const result = await uploadApi.uploadFile(file);
            setFormData(prev => ({
                ...prev,
                attachReceipt: result.url
            }));
            showNotification('success', 'Receipt uploaded successfully');
        } catch (error) {
            console.error('Receipt upload failed', error);
            showNotification('error', 'Failed to upload receipt');
        } finally {
            setUploading(false);
            if (e.target) e.target.value = '';
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const validationErrors = validateExpenseForm(formData);
        setErrors(validationErrors);

        if (hasExpenseErrors(validationErrors)) {
            showNotification('error', 'Please fix the errors below before submitting.');
            return;
        }

        try {
            setLoading(true);
            if (id) {
                await expenseApi.updateExpense(id, formData);
                showNotification('success', 'Expense updated successfully!');
            } else {
                await expenseApi.createExpense(formData);
                showNotification('success', 'Expense created successfully!');
                handleReset();
            }
        } catch (error) {
            showNotification('error', 'Failed to save expense. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        if (id) {
            loadExpense(id);
        } else {
            setFormData({
                date: new Date().toISOString().split('T')[0],
                category: categories.length > 0 ? categories[0]._id : '',
                amount: 0,
                paymentMethod: 'Online',
                vendor: '',
                approvalStatus: 'Paid',
                description: '',
                expenseType: 'Company',
                project: '',
                employee: '',
                attachReceipt: '',
            });
        }
        setErrors({});
    };

    const categoryOptions = categories.map(c => ({ value: c._id, label: c.name }));
    const projectOptions = projects.map(p => ({ value: p._id, label: p.title || p.name || 'Unnamed Project' }));
    const employeeOptions = employees.map(e => ({ value: e._id, label: e.fullName }));

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-12">
            <Breadcrumbs
                items={[
                    { label: 'Dashboard', path: '/dashboard' },
                    { label: 'Expenses', path: '/dashboard/expenses' },
                    { label: id ? 'Edit Expense' : 'Add New Expense' }
                ]}
            />

            <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                    {id ? 'Edit Expense' : 'Add New Expense'}
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                    Enter the details below to record a company, project, or employee expense.
                </p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 sm:p-8">
                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Core Info */}
                        <div className="lg:col-span-2">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <Receipt className="w-4 h-4 text-blue-600" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900">Expense Details</h3>
                            </div>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <Select
                                    label="Expense Type *"
                                    options={[
                                        { value: 'Company', label: 'Company Expense' },
                                        { value: 'Project', label: 'Project Expense' },
                                        { value: 'Employee', label: 'Employee Expense' }
                                    ]}
                                    value={formData.expenseType}
                                    onChange={handleInputChange('expenseType')}
                                    error={errors.expenseType}
                                />
                                <Input
                                    label="Date *"
                                    type="date"
                                    value={formData.date}
                                    onChange={handleInputChange('date')}
                                    error={errors.date}
                                />
                                <Select
                                    label="Category *"
                                    options={categoryOptions}
                                    value={formData.category}
                                    onChange={handleInputChange('category')}
                                    error={errors.category}
                                    placeholder="Select a category"
                                />
                                <Input
                                    label="Amount (Rs) *"
                                    type="number"
                                    value={formData.amount?.toString()}
                                    onChange={handleInputChange('amount')}
                                    error={errors.amount}
                                    placeholder="0.00"
                                />
                            </div>
                        </div>

                        {/* Conditional Associations */}
                        {(formData.expenseType === 'Project' || formData.expenseType === 'Employee') && (
                            <div className="lg:col-span-2 border-t border-gray-100 pt-8">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                                        {formData.expenseType === 'Project' ? (
                                            <Building2 className="w-4 h-4 text-indigo-600" />
                                        ) : (
                                            <User className="w-4 h-4 text-indigo-600" />
                                        )}
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900">Association</h3>
                                </div>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {formData.expenseType === 'Project' && (
                                        <Select
                                            label="Select Project *"
                                            options={projectOptions}
                                            value={formData.project || ''}
                                            onChange={handleInputChange('project')}
                                            error={errors.project}
                                            placeholder="Choose an active project"
                                        />
                                    )}
                                    {formData.expenseType === 'Employee' && (
                                        <Select
                                            label="Select Employee *"
                                            options={employeeOptions}
                                            value={formData.employee || ''}
                                            onChange={handleInputChange('employee')}
                                            error={errors.employee}
                                            placeholder="Choose an employee"
                                        />
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Payment Details */}
                        <div className="lg:col-span-2 border-t border-gray-100 pt-8">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                    <DollarSign className="w-4 h-4 text-green-600" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900">Payment & Vendor Info</h3>
                            </div>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <Input
                                    label="Vendor / Receiver (Optional)"
                                    value={formData.vendor || ''}
                                    onChange={handleInputChange('vendor')}
                                    error={errors.vendor}
                                    placeholder="Name of vendor or receiver"
                                />
                                <Select
                                    label="Payment Method (Optional)"
                                    options={[
                                        { value: 'Cash', label: 'Cash' },
                                        { value: 'Online', label: 'Online' },
                                        { value: 'Bank Transfer', label: 'Bank Transfer' },
                                        { value: 'Check', label: 'Check' }
                                    ]}
                                    value={formData.paymentMethod || 'Online'}
                                    onChange={handleInputChange('paymentMethod')}
                                    error={errors.paymentMethod}
                                />
                                <Select
                                    label="Status *"
                                    options={[
                                        { value: 'Pending', label: 'Pending' },
                                        { value: 'Paid', label: 'Paid' },
                                        { value: 'Approved', label: 'Approved' },
                                        { value: 'Rejected', label: 'Rejected' }
                                    ]}
                                    value={formData.approvalStatus || 'Paid'}
                                    onChange={handleInputChange('approvalStatus')}
                                    error={errors.approvalStatus}
                                />
                            </div>
                            <div className="mt-6">
                                <Textarea
                                    label="Description"
                                    value={formData.description}
                                    onChange={handleInputChange('description')}
                                    error={errors.description}
                                    placeholder="Any additional details..."
                                    rows={3}
                                />
                            </div>
                        </div>

                        {/* Receipt Upload */}
                        <div className="lg:col-span-2 border-t border-gray-100 pt-8">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                    <Paperclip className="w-4 h-4 text-purple-600" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900">Attach Receipt</h3>
                            </div>
                            
                            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div className="flex items-center space-x-4 w-full">
                                    <input
                                        type="file"
                                        id="receipt-upload"
                                        className="hidden"
                                        accept="image/*,.pdf"
                                        onChange={handleFileUpload}
                                        disabled={uploading}
                                    />
                                    <label
                                        htmlFor="receipt-upload"
                                        className={`cursor-pointer inline-flex items-center px-6 py-2.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        <Upload className="w-4 h-4 mr-2" />
                                        {uploading ? 'Uploading...' : 'Upload Receipt'}
                                    </label>

                                    {formData.attachReceipt && (
                                        <div className="flex items-center bg-white px-4 py-2 rounded-lg border border-gray-200 flex-1 justify-between shadow-sm">
                                            <div className="flex items-center">
                                                <Paperclip className="w-4 h-4 text-blue-600 mr-2" />
                                                <a href={formData.attachReceipt} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline max-w-[200px] truncate font-medium">
                                                    View Uploaded Receipt
                                                </a>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setFormData({ ...formData, attachReceipt: '' })}
                                                className="text-red-500 hover:bg-red-50 p-1.5 rounded transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-end mt-12 pt-8 border-t border-gray-200">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleReset}
                            disabled={loading || uploading}
                            className="sm:w-auto w-full"
                        >
                            Reset Form
                        </Button>
                        <Button
                            type="submit"
                            loading={loading}
                            disabled={uploading}
                            className="sm:w-auto w-full bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
                        >
                            {id ? 'Update Expense' : 'Create Expense'}
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

export default ExpenseForm;
