import React, { useState, useEffect } from 'react';
import { Breadcrumbs } from '../ui/Breadcrumbs';
import { Briefcase, User, Phone, MapPin, FileText, Upload, Trash2, Activity } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Textarea } from '../ui/Textarea';
import { Notification } from '../ui/Notification';
import { employeeApi } from '../../services/employeeApi';
import { uploadApi } from '../../services/uploadApi';
import { validateEmployeeForm, hasEmployeeErrors } from '../../utils/employeeValidation';
import { EmployeeFormData, EmployeeDocument } from '../../types/employee';
import { useNavigate, useParams } from 'react-router-dom';

export const EmployeeForm: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>(); // If we want to support edit on a dedicated route later
    
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [docType, setDocType] = useState<'CNIC' | 'Contract' | 'Certificate' | 'Other'>('CNIC');

    const [notification, setNotification] = useState<{show: boolean, type: 'success'|'error', message: string}>({
        show: false,
        type: 'success',
        message: ''
    });

    const [formData, setFormData] = useState<EmployeeFormData>({
        fullName: '',
        cnic: '',
        phone: '',
        email: '',
        address: '',
        designation: '',
        department: '',
        employmentType: 'Permanent',
        joiningDate: new Date().toISOString().split('T')[0],
        salary: 0,
        status: 'Active',
        emergencyContact: '',
        documents: [],
        role: 'Support Staff',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (id) {
            loadEmployee(id);
        }
    }, [id]);

    const loadEmployee = async (employeeId: string) => {
        try {
            const data = await employeeApi.getEmployeeById(employeeId);
            setFormData({
                fullName: data.fullName,
                cnic: data.cnic || '',
                phone: data.phone || '',
                email: data.email || '',
                address: data.address || '',
                designation: data.designation || '',
                department: data.department || '',
                employmentType: data.employmentType,
                joiningDate: data.joiningDate ? data.joiningDate.split('T')[0] : '',
                salary: data.salary || 0,
                status: data.status,
                emergencyContact: data.emergencyContact || '',
                documents: data.documents || [],
                role: data.role,
            });
        } catch (error) {
            showNotification('error', 'Failed to load employee data.');
        }
    };

    const showNotification = (type: 'success' | 'error', message: string) => {
        setNotification({ show: true, type, message });
    };

    const handleInputChange = (field: keyof EmployeeFormData) => (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const value = e.target.type === 'number' ? Number(e.target.value) : e.target.value;
        
        setFormData(prev => {
            const newData = { ...prev, [field]: value };
            if (field === 'role') {
                newData.designation = String(value);
            }
            return newData;
        });

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
                documents: [...(prev.documents || []), { url: result.url, name: file.name, type: docType }]
            }));
            showNotification('success', 'Document uploaded successfully');
        } catch (error) {
            console.error('File upload failed', error);
            showNotification('error', 'Failed to upload document');
        } finally {
            setUploading(false);
            if (e.target) e.target.value = '';
        }
    };

    const removeDocument = (index: number) => {
        setFormData(prev => ({
            ...prev,
            documents: prev.documents?.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const validationErrors = validateEmployeeForm(formData);
        
        if (!id && !formData.password) {
            validationErrors.password = "System Login Password is required for new employees.";
        }
        
        setErrors(validationErrors);

        if (hasEmployeeErrors(validationErrors) || (!id && !formData.password)) {
            showNotification('error', 'Please fix the errors below before submitting.');
            return;
        }

        try {
            setLoading(true);
            if (id) {
                await employeeApi.updateEmployee(id, formData);
                showNotification('success', 'Employee updated successfully!');
            } else {
                await employeeApi.createEmployee(formData);
                showNotification('success', 'Employee created successfully!');
                handleReset();
            }
        } catch (error) {
            showNotification('error', 'Failed to save employee. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        if (id) {
            loadEmployee(id);
        } else {
            setFormData({
                fullName: '',
                cnic: '',
                phone: '',
                email: '',
                address: '',
                designation: '',
                department: '',
                employmentType: 'Permanent',
                joiningDate: new Date().toISOString().split('T')[0],
                salary: 0,
                status: 'Active',
                emergencyContact: '',
                documents: [],
                role: 'Support Staff',
            });
        }
        setErrors({});
    };

    const roleOptions = [
        'Super Admin', 'Admin', 'Project Manager', 'Site Engineer', 
        'Civil Engineer', 'Site Supervisor', 'Accountant', 'Sales', 
        'Guard', 'Support Staff'
    ].map(r => ({ value: r, label: r }));

    const employmentTypeOptions = [
        { value: 'Permanent', label: 'Permanent' },
        { value: 'Contract', label: 'Contract' },
        { value: 'Daily Wage', label: 'Daily Wage' },
        { value: 'Intern', label: 'Intern' }
    ];

    const statusOptions = [
        { value: 'Active', label: 'Active' },
        { value: 'Inactive', label: 'Inactive' },
        { value: 'On Leave', label: 'On Leave' },
        { value: 'Resigned', label: 'Resigned' },
        { value: 'Terminated', label: 'Terminated' }
    ];

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-12">
            <Breadcrumbs
                items={[
                    { label: 'Dashboard', path: '/dashboard' },
                    { label: 'Employees', path: '/dashboard/employees' },
                    { label: id ? 'Edit Employee' : 'Add New Employee' }
                ]}
            />

            <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                    {id ? 'Edit Employee' : 'Add New Employee'}
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                    Enter the details below to {id ? 'update the' : 'create a new'} employee profile.
                </p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 sm:p-8">
                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Core Info */}
                        <div className="lg:col-span-2">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <User className="w-4 h-4 text-blue-600" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900">Personal Information</h3>
                            </div>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <Input
                                    label="Full Name *"
                                    value={formData.fullName}
                                    onChange={handleInputChange('fullName')}
                                    error={errors.fullName}
                                    placeholder="e.g. John Doe"
                                />
                                <Input
                                    label="CNIC (Optional)"
                                    value={formData.cnic}
                                    onChange={handleInputChange('cnic')}
                                    error={errors.cnic}
                                    placeholder="00000-0000000-0"
                                />
                                <Input
                                    label="Phone Number (Optional)"
                                    value={formData.phone}
                                    onChange={handleInputChange('phone')}
                                    error={errors.phone}
                                    placeholder="+1 (555) 123-4567"
                                />
                                <Input
                                    label="Email Address *"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleInputChange('email')}
                                    error={errors.email}
                                    placeholder="john@example.com"
                                />
                                <Input
                                    label="Emergency Contact"
                                    value={formData.emergencyContact}
                                    onChange={handleInputChange('emergencyContact')}
                                    error={errors.emergencyContact}
                                    placeholder="Name and Phone"
                                />
                            </div>
                            <div className="mt-6">
                                <Textarea
                                    label="Home Address"
                                    value={formData.address}
                                    onChange={handleInputChange('address')}
                                    error={errors.address}
                                    placeholder="Enter complete address"
                                    rows={2}
                                />
                            </div>
                        </div>

                        {/* Employment Details */}
                        <div className="lg:col-span-2 border-t border-gray-100 pt-8">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                    <Briefcase className="w-4 h-4 text-green-600" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900">Employment Details</h3>
                            </div>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <Select
                                    label="System Role *"
                                    options={roleOptions}
                                    value={formData.role}
                                    onChange={handleInputChange('role')}
                                    error={errors.role}
                                />
                                {!id && (
                                    <Input
                                        label="System Login Password *"
                                        type="password"
                                        value={formData.password || ''}
                                        onChange={handleInputChange('password')}
                                        error={errors.password}
                                        placeholder="Enter password to create a user account"
                                    />
                                )}
                                <Select
                                    label="Employment Type *"
                                    options={employmentTypeOptions}
                                    value={formData.employmentType}
                                    onChange={handleInputChange('employmentType')}
                                    error={errors.employmentType}
                                />
                                <Input
                                    label="Joining Date *"
                                    type="date"
                                    value={formData.joiningDate}
                                    onChange={handleInputChange('joiningDate')}
                                    error={errors.joiningDate}
                                />
                                <Input
                                    label="Designation"
                                    value={formData.designation}
                                    onChange={handleInputChange('designation')}
                                    error={errors.designation}
                                    placeholder="e.g. Senior Developer"
                                />
                                <Input
                                    label="Department"
                                    value={formData.department}
                                    onChange={handleInputChange('department')}
                                    error={errors.department}
                                    placeholder="e.g. Engineering"
                                />
                                <Input
                                    label="Salary"
                                    type="number"
                                    value={formData.salary?.toString()}
                                    onChange={handleInputChange('salary')}
                                    error={errors.salary}
                                    placeholder="0.00"
                                />
                                <Select
                                    label="Status"
                                    options={statusOptions}
                                    value={formData.status || 'Active'}
                                    onChange={handleInputChange('status')}
                                    error={errors.status}
                                />
                            </div>
                        </div>

                        {/* Documents */}
                        <div className="lg:col-span-2 border-t border-gray-100 pt-8">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                    <FileText className="w-4 h-4 text-purple-600" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900">Documents Upload</h3>
                            </div>
                            
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                                <div className="flex flex-col sm:flex-row gap-4 items-end mb-4">
                                    <div className="flex-1 w-full">
                                        <Select
                                            label="Document Type"
                                            options={[
                                                { value: 'CNIC', label: 'CNIC' },
                                                { value: 'Contract', label: 'Contract' },
                                                { value: 'Certificate', label: 'Certificate' },
                                                { value: 'Other', label: 'Other' },
                                            ]}
                                            value={docType}
                                            onChange={(e) => setDocType(e.target.value as any)}
                                        />
                                    </div>
                                    <div className="w-full sm:w-auto pb-1">
                                        <input
                                            type="file"
                                            id="doc-upload"
                                            className="hidden"
                                            onChange={handleFileUpload}
                                            disabled={uploading}
                                        />
                                        <label
                                            htmlFor="doc-upload"
                                            className={`cursor-pointer w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        >
                                            <Upload className="w-4 h-4 mr-2" />
                                            {uploading ? 'Uploading...' : 'Upload File'}
                                        </label>
                                    </div>
                                </div>
                                
                                {formData.documents && formData.documents.length > 0 ? (
                                    <ul className="space-y-2 mt-4">
                                        {formData.documents.map((doc, index) => (
                                            <li key={index} className="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
                                                <div className="flex items-center">
                                                    <span className="text-xs font-bold text-gray-500 uppercase bg-gray-100 px-2 py-1 rounded mr-3">
                                                        {doc.type || 'Other'}
                                                    </span>
                                                    <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm font-medium">
                                                        {doc.name}
                                                    </a>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => removeDocument(index)}
                                                    className="text-red-500 hover:bg-red-50 p-1.5 rounded transition-colors"
                                                    title="Remove document"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-sm text-gray-500 italic mt-4 text-center py-4">No documents attached.</p>
                                )}
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
                            {id ? 'Update Employee' : 'Create Employee'}
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

export default EmployeeForm;
