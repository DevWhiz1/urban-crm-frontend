import React, { useState, useEffect } from 'react';
import { Breadcrumbs } from '../ui/Breadcrumbs';
import {
    Building,
    MapPin,
    Calendar,
    Banknote,
    Users,
    Edit,
    Trash2,
    FileText,
    Clock,
    CheckCircle,
    AlertCircle,
    XCircle,
    Link as LinkIcon,
    User,
    Phone,
    Mail,
    Ruler,
    Calculator,
    Wrench,
    File,
    ExternalLink,
    PlusCircle,
    Layers,
    ClipboardList,
    TrendingUp,
    CalendarDays,
    Home,
    CreditCard,
    Briefcase,
    FolderOpen,
    Pencil,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Notification } from '../ui/Notification';
import { DeleteConfirmationModal } from '../ui/DeleteConfirmationModal';
import { fetchProjectById, deleteProject, addProjectAddition, updateProjectAddition, deleteProjectAddition } from '../../services/projectApi';
import { fetchProjectContractsByProjectId } from '../../services/projectContractApi';
import { Project } from '../../types/project';
import { PriceAddition } from '../../types/project';
import { ProjectContract } from '../../types/projectContract';
import { formatPKRCurrency } from '../../utils/projectValidation';
import { PriceAdditionModal } from '../materials/PriceAdditionModal';



interface ProjectViewProps {
    projectId: string;
    onBack: () => void;
    onEdit: (project: Project) => void;
    onDelete: () => void;
}

export const ProjectView: React.FC<ProjectViewProps> = ({
    projectId,
    onBack,
    onEdit,
    onDelete,
}) => {
    const [project, setProject] = useState<Project | null>(null);
    const [projectContracts, setProjectContracts] = useState<ProjectContract[]>([]);
    const [loading, setLoading] = useState(true);

    const [isAdditionModalOpen, setIsAdditionModalOpen] = useState(false);
    const [editingAddition, setEditingAddition] = useState<PriceAddition | null>(null);
    const [deleteAdditionTarget, setDeleteAdditionTarget] = useState<PriceAddition | null>(null);
    const [isDeleteAdditionModalOpen, setIsDeleteAdditionModalOpen] = useState(false);
    const [notification, setNotification] = useState({
        show: false,
        type: 'success' as 'success' | 'error',
        message: '',
    });

    useEffect(() => {
        loadProject();
    }, [projectId]);

    const handleAddAddition = async (amount: number, reason: string) => {
        if (!project) return;
        if (editingAddition && editingAddition._id) {
            // Edit mode
            const updatedProject = await updateProjectAddition(project._id, editingAddition._id, amount, reason);
            setProject(updatedProject);
            showNotification('success', 'Price addition updated successfully!');
        } else {
            // Add mode
            const updatedProject = await addProjectAddition(project._id, amount, reason);
            setProject(updatedProject);
            showNotification('success', 'Price addition recorded successfully!');
        }
    };

    const handleEditAddition = (addition: PriceAddition) => {
        setEditingAddition(addition);
        setIsAdditionModalOpen(true);
    };

    const handleDeleteAdditionClick = (addition: PriceAddition) => {
        setDeleteAdditionTarget(addition);
        setIsDeleteAdditionModalOpen(true);
    };

    const handleConfirmDeleteAddition = async () => {
        if (!project || !deleteAdditionTarget?._id) return;
        try {
            const updatedProject = await deleteProjectAddition(project._id, deleteAdditionTarget._id);
            setProject(updatedProject);
            showNotification('success', 'Price addition deleted successfully!');
        } catch (error: any) {
            showNotification('error', error.message || 'Failed to delete price addition.');
        } finally {
            setIsDeleteAdditionModalOpen(false);
            setDeleteAdditionTarget(null);
        }
    };

    const getTotalAdditions = (proj: Project) => {
        if (!proj.additions || proj.additions.length === 0) return 0;
        return proj.additions.reduce((sum, item) => sum + (item.amount || 0), 0);
    };

    const getRevisedCost = (proj: Project) => {
        return proj.totalCost || 0;
    };

    const getBaseCost = (proj: Project) => {
        return Math.max(0, getRevisedCost(proj) - getTotalAdditions(proj));
    };

    const formatAddedBy = (addedBy?: string): string => {
        if (!addedBy) return 'Admin';
        if (!addedBy.includes('@')) return addedBy;
        const handle = addedBy.split('@')[0];
        if (!handle) return 'Admin';
        const words = handle.replace(/[._\-]/g, ' ').split(' ').filter(Boolean);
        return words.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    };

    const loadProject = async () => {
        try {
            setLoading(true);
            const [projectData, contractsData] = await Promise.all([
                fetchProjectById(projectId),
                fetchProjectContractsByProjectId(projectId),
            ]);
            setProject(projectData);
            setProjectContracts(contractsData);
        } catch (error) {
            showNotification('error', 'Failed to load project details. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!project) return;
        if (!window.confirm(`Are you sure you want to delete "${project.name}"? This action cannot be undone.`)) {
            return;
        }
        try {
            await deleteProject(project._id);
            showNotification('success', 'Project deleted successfully');
            onDelete();
        } catch (error) {
            showNotification('error', 'Failed to delete project. Please try again.');
        }
    };

    const showNotification = (type: 'success' | 'error', message: string) => {
        setNotification({ show: true, type, message });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'text-green-700 bg-green-100 border-green-200';
            case 'ongoing': return 'text-blue-700 bg-blue-100 border-blue-200';
            case 'planning': return 'text-amber-700 bg-amber-100 border-amber-200';
            case 'pending': return 'text-yellow-700 bg-yellow-100 border-yellow-200';
            case 'on_hold': return 'text-purple-700 bg-purple-100 border-purple-200';
            case 'cancelled': return 'text-red-700 bg-red-100 border-red-200';
            default: return 'text-gray-700 bg-gray-100 border-gray-200';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed': return <CheckCircle className="w-5 h-5" />;
            case 'ongoing': return <Clock className="w-5 h-5" />;
            case 'planning': return <FileText className="w-5 h-5" />;
            case 'pending': return <AlertCircle className="w-5 h-5" />;
            case 'on_hold': return <XCircle className="w-5 h-5" />;
            case 'cancelled': return <XCircle className="w-5 h-5" />;
            default: return <Clock className="w-5 h-5" />;
        }
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'Not set';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const getProjectCost = (project: Project) => {
        if (project.totalCost !== undefined && project.totalCost !== null) {
            return formatPKRCurrency(project.totalCost.toString());
        }
        return 'Not calculated';
    };



    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (!project) {
        return (
            <div className="min-h-screen bg-slate-50 py-8 px-4">
                <div className="max-w-4xl mx-auto">
                    <Breadcrumbs
                        items={[
                            { label: 'Dashboard', path: '/dashboard' },
                            { label: 'Projects', onClick: onBack },
                            { label: 'Project Not Found' },
                        ]}
                    />
                    <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-lg mt-6">
                        <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                        <h3 className="text-2xl font-semibold text-gray-900 mb-2">Project Not Found</h3>
                        <p className="text-gray-600">The project you're looking for doesn't exist or has been deleted.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-7xl mx-auto px-4 py-6">
                {/* Breadcrumbs */}
                <Breadcrumbs
                    items={[
                        { label: 'Dashboard', path: '/dashboard' },
                        { label: 'Projects', onClick: onBack },
                        { label: project.name },
                    ]}
                    className="mb-6"
                />

                {/* Header */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        <div className="p-3 bg-indigo-50 rounded-xl w-14 h-14 flex items-center justify-center shrink-0">
                            <Building className="w-8 h-8 text-indigo-600" />
                        </div>
                        <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-1">
                                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">{project.name}</h1>
                                <span className={`inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium border ${getStatusColor(project.status)}`}>
                                    {getStatusIcon(project.status)}
                                    {project.status.replace('_', ' ').toUpperCase()}
                                </span>
                                <span className="text-xs sm:text-sm text-gray-500 font-mono bg-gray-100 px-2 py-0.5 rounded">
                                    {project.projectCode}
                                </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-500 mt-2">
                                <span className="flex items-center gap-1.5">
                                    <MapPin className="w-4 h-4 shrink-0" />
                                    <span className="break-words">{project.location}</span>
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <Calendar className="w-4 h-4 shrink-0" />
                                    Started {formatDate(project.startDate)}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 mt-2 md:mt-0 w-full md:w-auto">
                        <Button
                            onClick={() => onEdit(project)}
                            className="flex-1 md:flex-none bg-indigo-600 hover:bg-indigo-700 text-white justify-center"
                        >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                        </Button>
                        <Button
                            onClick={handleDelete}
                            variant="outline"
                            className="flex-1 md:flex-none text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 justify-center"
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                        </Button>
                    </div>
                </div>

                {/* Content Sections */}
                <div className="space-y-4">
                    {/* Financials Section */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-5 space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <h2 className="text-base sm:text-lg font-semibold text-gray-800 flex items-center gap-2">
                                    <Banknote className="w-5 h-5 text-indigo-600 shrink-0" />
                                    Financial Breakdown
                                </h2>
                                <Button
                                    onClick={() => setIsAdditionModalOpen(true)}
                                    size="sm"
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white whitespace-nowrap w-full sm:w-auto justify-center"
                                >
                                    <PlusCircle className="w-4 h-4 mr-1.5" />
                                    Add Addition
                                </Button>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div className="bg-white rounded-xl p-3 sm:p-4 border border-gray-200 shadow-sm">
                                    <div className="text-[10px] sm:text-xs uppercase text-gray-500 font-semibold tracking-wider mb-1">Base Cost</div>
                                    <div className="text-lg sm:text-xl font-bold text-gray-900">{formatPKRCurrency(getBaseCost(project).toString())}</div>
                                </div>
                                <div className="bg-white rounded-xl p-3 sm:p-4 border border-gray-200 shadow-sm">
                                    <div className="text-[10px] sm:text-xs uppercase text-gray-500 font-semibold tracking-wider mb-1">Total Additions</div>
                                    <div className="text-lg sm:text-xl font-bold text-amber-600">+{formatPKRCurrency(getTotalAdditions(project).toString())}</div>
                                </div>
                                <div className="bg-white rounded-xl p-3 sm:p-4 border border-gray-200 shadow-sm">
                                    <div className="text-[10px] sm:text-xs uppercase text-gray-500 font-semibold tracking-wider mb-1">Revised Total</div>
                                    <div className="text-lg sm:text-xl font-bold text-emerald-600">{formatPKRCurrency(getRevisedCost(project).toString())}</div>
                                </div>
                            </div>

                            {/* Additions Log */}
                            {project.additions && project.additions.length > 0 ? (
                                <div className="mt-4">
                                    <h3 className="text-xs sm:text-sm font-semibold text-gray-700 flex items-center gap-2 mb-2">
                                        <PlusCircle className="w-4 h-4 text-amber-500" />
                                        Addition History ({project.additions.length})
                                    </h3>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200 text-xs sm:text-sm">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-3 py-2 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                                    <th className="px-3 py-2 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                                    <th className="px-3 py-2 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                                                    <th className="px-3 py-2 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">Added By</th>
                                                    <th className="px-3 py-2 text-center text-[10px] sm:text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-100">
                                                {project.additions.map((item, idx) => (
                                                    <tr key={item._id || idx} className="hover:bg-amber-50/50">
                                                        <td className="px-3 py-1.5 whitespace-nowrap text-gray-600">{new Date(item.date).toLocaleDateString()}</td>
                                                        <td className="px-3 py-1.5 whitespace-nowrap font-semibold text-emerald-700">+{formatPKRCurrency(item.amount.toString())}</td>
                                                        <td className="px-3 py-1.5 text-gray-900">{item.reason}</td>
                                                        <td className="px-3 py-1.5 whitespace-nowrap text-gray-500 text-[10px] sm:text-xs font-medium">{formatAddedBy(item.addedBy)}</td>
                                                        <td className="px-3 py-1.5 whitespace-nowrap text-center">
                                                            <div className="flex items-center justify-center gap-1">
                                                                <button
                                                                    onClick={() => handleEditAddition(item)}
                                                                    className="p-1 rounded-md text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                                                                    title="Edit addition"
                                                                >
                                                                    <Pencil className="w-3.5 h-3.5" />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteAdditionClick(item)}
                                                                    className="p-1 rounded-md text-red-500 hover:bg-red-50 hover:text-red-700 transition-colors"
                                                                    title="Delete addition"
                                                                >
                                                                    <Trash2 className="w-3.5 h-3.5" />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-gray-500 text-xs sm:text-sm mt-3">No price additions recorded.</p>
                            )}
                    </div>

                    {/* Overview Section */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-5 space-y-4">
                            {/* Metric Cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                <div className="bg-white rounded-xl p-3 sm:p-4 border border-gray-200 shadow-sm">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] sm:text-xs text-gray-500 font-medium uppercase">Total Cost</span>
                                        <div className="p-1.5 bg-indigo-50 rounded-lg">
                                            <Banknote className="w-4 h-4 text-indigo-600" />
                                        </div>
                                    </div>
                                    <p className="text-lg sm:text-xl font-bold text-gray-900 mt-2">{getProjectCost(project)}</p>
                                </div>
                                <div className="bg-white rounded-xl p-3 sm:p-4 border border-gray-200 shadow-sm">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] sm:text-xs text-gray-500 font-medium uppercase">Progress</span>
                                        <div className="p-1.5 bg-emerald-50 rounded-lg">
                                            <TrendingUp className="w-4 h-4 text-emerald-600" />
                                        </div>
                                    </div>
                                    <p className="text-lg sm:text-xl font-bold text-gray-900 mt-2">{project.progress || 0}%</p>
                                    <div className="w-full h-1.5 bg-gray-100 rounded-full mt-1.5 overflow-hidden">
                                        <div
                                            className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                                            style={{ width: `${project.progress || 0}%` }}
                                        ></div>
                                    </div>
                                </div>
                                <div className="bg-white rounded-xl p-3 sm:p-4 border border-gray-200 shadow-sm">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] sm:text-xs text-gray-500 font-medium uppercase">Coverage Area</span>
                                        <div className="p-1.5 bg-purple-50 rounded-lg">
                                            <Ruler className="w-4 h-4 text-purple-600" />
                                        </div>
                                    </div>
                                    <p className="text-lg sm:text-xl font-bold text-gray-900 mt-2">
                                        {project.totalCoverageArea ? `${project.totalCoverageArea} sq ft` : 'N/A'}
                                    </p>
                                </div>
                                <div className="bg-white rounded-xl p-3 sm:p-4 border border-gray-200 shadow-sm">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] sm:text-xs text-gray-500 font-medium uppercase">Contracts</span>
                                        <div className="p-1.5 bg-amber-50 rounded-lg">
                                            <Briefcase className="w-4 h-4 text-amber-600" />
                                        </div>
                                    </div>
                                    <p className="text-lg sm:text-xl font-bold text-gray-900 mt-2">{projectContracts.length}</p>
                                </div>
                            </div>

                            {/* Project Details & Customer */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-gray-100">
                                <div>
                                    <h3 className="text-sm sm:text-base font-semibold text-gray-800 flex items-center gap-1.5 mb-3">
                                        <Layers className="w-4 h-4 text-indigo-500" />
                                        Project Details
                                    </h3>
                                    <div className="space-y-2">
                                        <div>
                                            <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Category</label>
                                            <p className="text-xs sm:text-sm text-gray-900 capitalize">{project.projectCategory}</p>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Type</label>
                                            <p className="text-xs sm:text-sm text-gray-900 capitalize">{project.projectType.replace(/([A-Z])/g, ' $1').trim()}</p>
                                        </div>
                                        {project.projectType === 'withMaterial' && (
                                            <div>
                                                <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Rate per sq ft</label>
                                                <p className="text-xs sm:text-sm text-gray-900">{project.ratePerSquareFoot ? formatPKRCurrency(project.ratePerSquareFoot.toString()) : 'Not set'}</p>
                                            </div>
                                        )}
                                        {project.projectType === 'labourRate' && (
                                            <div>
                                                <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Labour Rate / sq ft</label>
                                                <p className="text-xs sm:text-sm text-gray-900">{project.labouRate ? formatPKRCurrency(project.labouRate.toString()) : 'Not set'}</p>
                                            </div>
                                        )}
                                        <div>
                                            <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Total Area</label>
                                            <p className="text-xs sm:text-sm text-gray-900">{project.totalArea ? `${project.totalArea} sq ft` : 'Not set'}</p>
                                        </div>
                                        {project.description && (
                                            <div>
                                                <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Description</label>
                                                <p className="text-gray-700 whitespace-pre-wrap text-[10px] sm:text-xs mt-0.5">{project.description}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-sm sm:text-base font-semibold text-gray-800 flex items-center gap-1.5 mb-3">
                                        <User className="w-4 h-4 text-blue-500" />
                                        Customer
                                    </h3>
                                    {project.customer && typeof project.customer === 'object' ? (
                                        <div className="space-y-2">
                                            <div>
                                                <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Name</label>
                                                <p className="text-xs sm:text-sm text-gray-900 font-medium">{project.customer.user?.userName || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Email</label>
                                                <p className="text-xs sm:text-sm text-gray-900 flex items-center gap-1">
                                                    <Mail className="w-3 h-3 text-gray-400" />
                                                    {project.customer.user?.email || 'N/A'}
                                                </p>
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Phone</label>
                                                <p className="text-xs sm:text-sm text-gray-900 flex items-center gap-1">
                                                    <Phone className="w-3 h-3 text-gray-400" />
                                                    {project.customer.phoneNumber || 'N/A'}
                                                </p>
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Address</label>
                                                <p className="text-xs sm:text-sm text-gray-900">{project.customer.address || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Payment Terms</label>
                                                <p className="text-xs sm:text-sm text-gray-900">{project.customer.paymentTerms || 'N/A'}</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-xs sm:text-sm text-gray-500">No customer information available.</p>
                                    )}
                                </div>
                            </div>

                            {/* Contractors (if any) */}
                            {project.contractors && project.contractors.length > 0 && (
                                <div className="pt-3 border-t border-gray-100">
                                    <h3 className="text-sm sm:text-base font-semibold text-gray-800 flex items-center gap-1.5 mb-3">
                                        <Wrench className="w-4 h-4 text-green-500" />
                                        Contractors ({project.contractors.length})
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {project.contractors.map((contractor, index) => (
                                            <div key={index} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                                <p className="text-xs sm:text-sm font-medium text-gray-900">{contractor.companyName || 'N/A'}</p>
                                                <p className="text-[10px] sm:text-xs text-gray-600">{contractor.user?.userName || 'N/A'}</p>
                                                <p className="text-[10px] sm:text-xs text-gray-500 capitalize">{contractor.contractorType || 'N/A'}</p>
                                                <p className="text-[10px] sm:text-xs text-gray-600 flex items-center gap-1 mt-1">
                                                    <Phone className="w-3 h-3 text-gray-400" />
                                                    {contractor.phoneNumber || 'N/A'}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                    </div>

                    {/* Contracts Section */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-5 space-y-4">
                            <h2 className="text-base sm:text-lg font-semibold text-gray-800 flex items-center gap-2">
                                <Briefcase className="w-5 h-5 text-indigo-600" />
                                Associated Contracts ({projectContracts.length})
                            </h2>
                            {projectContracts.length > 0 ? (
                                <div className="space-y-3">
                                    {projectContracts.map((contract) => {
                                        const contractor = typeof contract.contractor === 'object' ? contract.contractor : null;
                                        const totalAdditions = (contract.additions || []).reduce((sum, a) => sum + (a.amount || 0), 0);
                                        const revisedTotal = contract.totalAmount || 0;
                                        return (
                                            <div key={contract._id} className="bg-gray-50 rounded-xl p-3 sm:p-4 border border-gray-200 hover:shadow-md transition-shadow">
                                                <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <Wrench className="w-4 h-4 text-teal-600" />
                                                        <span className="text-sm font-semibold text-gray-900">{contractor?.companyName || 'N/A'}</span>
                                                        {contract.contractType && (
                                                            <span className="text-[10px] px-2 py-0.5 bg-teal-100 text-teal-700 rounded-full font-medium">
                                                                {contract.contractType}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <span
                                                        className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${contract.isTerminated ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                                                            }`}
                                                    >
                                                        {contract.isTerminated ? 'Terminated' : 'Active'}
                                                    </span>
                                                </div>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs sm:text-sm">
                                                    <div>
                                                        <span className="text-gray-500">Contact:</span>
                                                        <span className="ml-1 text-gray-900">{contractor?.user?.userName || 'N/A'}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500">Type:</span>
                                                        <span className="ml-1 text-gray-900 capitalize">{contractor?.contractorType || 'N/A'}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500">Start:</span>
                                                        <span className="ml-1 text-gray-900">{formatDate(contract.startDate)}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500">End:</span>
                                                        <span className="ml-1 text-gray-900">{formatDate(contract.endDate)}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-500">Base Amount:</span>
                                                        <span className="ml-1 text-gray-900 font-medium">
                                                            {formatPKRCurrency(contract.totalAmount.toString())}
                                                        </span>
                                                    </div>
                                                    {totalAdditions > 0 && (
                                                        <div>
                                                            <span className="text-gray-500">Additions:</span>
                                                            <span className="ml-1 text-amber-700 font-medium">+{formatPKRCurrency(totalAdditions.toString())}</span>
                                                        </div>
                                                    )}
                                                </div>
                                                {totalAdditions > 0 && (
                                                    <div className="mt-2 pt-2 border-t border-gray-200 flex items-center justify-between">
                                                        <span className="text-xs sm:text-sm font-medium text-gray-700">Revised Total:</span>
                                                        <span className="text-xs sm:text-sm font-bold text-teal-700">{formatPKRCurrency(revisedTotal.toString())}</span>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <p className="text-xs sm:text-sm text-gray-500">No contracts associated with this project.</p>
                            )}
                    </div>

                    {/* Timeline Section */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-5 space-y-4">
                            <h2 className="text-base sm:text-lg font-semibold text-gray-800 flex items-center gap-2">
                                <CalendarDays className="w-5 h-5 text-indigo-600" />
                                Project Timeline
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div className="bg-white rounded-xl p-3 sm:p-4 border border-gray-200 shadow-sm">
                                    <div className="text-[10px] sm:text-xs uppercase text-gray-500 font-semibold tracking-wider mb-1">Start Date</div>
                                    <p className="text-sm sm:text-base font-bold text-gray-900">{formatDate(project.startDate)}</p>
                                </div>
                                <div className="bg-white rounded-xl p-3 sm:p-4 border border-gray-200 shadow-sm">
                                    <div className="text-[10px] sm:text-xs uppercase text-gray-500 font-semibold tracking-wider mb-1">Estimated Completion</div>
                                    <p className="text-sm sm:text-base font-bold text-gray-900">{formatDate(project.estimatedDuration)}</p>
                                </div>
                                <div className="bg-white rounded-xl p-3 sm:p-4 border border-gray-200 shadow-sm">
                                    <div className="text-[10px] sm:text-xs uppercase text-gray-500 font-semibold tracking-wider mb-1">Actual Completion</div>
                                    <p className="text-sm sm:text-base font-bold text-gray-900">{formatDate(project.actualCompletionDate)}</p>
                                </div>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-3 sm:p-4 border border-gray-200">
                                <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-xs sm:text-sm font-medium text-gray-700">Overall Progress</span>
                                    <span className="text-xs sm:text-sm font-bold text-indigo-600">{project.progress || 0}%</span>
                                </div>
                                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                                        style={{ width: `${project.progress || 0}%` }}
                                    ></div>
                                </div>
                            </div>
                    </div>

                    {/* Documents Section */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-5 space-y-4">
                            <h2 className="text-base sm:text-lg font-semibold text-gray-800 flex items-center gap-2">
                                <FolderOpen className="w-5 h-5 text-indigo-600" />
                                Project Documents
                            </h2>
                            {(project.drawings && project.drawings.filter(d => d.trim() !== '').length > 0) ||
                                (project.contracts && project.contracts.filter(c => c.trim() !== '').length > 0) ? (
                                <div className="space-y-4">
                                    {project.drawings && project.drawings.filter(d => d.trim() !== '').length > 0 && (
                                        <div>
                                            <h3 className="text-xs sm:text-sm font-semibold text-gray-700 flex items-center gap-1.5 mb-2">
                                                <FileText className="w-3.5 h-3.5 text-gray-500" />
                                                Drawings ({project.drawings.filter(d => d.trim() !== '').length})
                                            </h3>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                                {project.drawings.filter(d => d.trim() !== '').map((drawing, index) => (
                                                    <a
                                                        key={index}
                                                        href={drawing}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-2.5 p-2 sm:p-2.5 bg-gray-50 rounded-lg border border-gray-200 hover:bg-indigo-50 hover:border-indigo-200 transition-colors"
                                                    >
                                                        <File className="w-4 h-4 text-indigo-500" />
                                                        <span className="text-xs sm:text-sm font-medium text-indigo-600">Drawing {index + 1}</span>
                                                        <ExternalLink className="w-3 h-3 text-gray-400 ml-auto" />
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {project.contracts && project.contracts.filter(c => c.trim() !== '').length > 0 && (
                                        <div>
                                            <h3 className="text-xs sm:text-sm font-semibold text-gray-700 flex items-center gap-1.5 mb-2">
                                                <FileText className="w-3.5 h-3.5 text-gray-500" />
                                                Contract Documents ({project.contracts.filter(c => c.trim() !== '').length})
                                            </h3>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                                {project.contracts.filter(c => c.trim() !== '').map((contract, index) => (
                                                    <a
                                                        key={index}
                                                        href={contract}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-2.5 p-2 sm:p-2.5 bg-gray-50 rounded-lg border border-gray-200 hover:bg-indigo-50 hover:border-indigo-200 transition-colors"
                                                    >
                                                        <File className="w-4 h-4 text-indigo-500" />
                                                        <span className="text-xs sm:text-sm font-medium text-indigo-600">Contract {index + 1}</span>
                                                        <ExternalLink className="w-3 h-3 text-gray-400 ml-auto" />
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <p className="text-xs sm:text-sm text-gray-500">No documents uploaded for this project.</p>
                            )}
                    </div>
                </div>
            </div>

            {/* Modal & Notification */}
            <PriceAdditionModal
                isOpen={isAdditionModalOpen}
                onClose={() => {
                    setIsAdditionModalOpen(false);
                    setEditingAddition(null);
                }}
                onSubmit={handleAddAddition}
                title="Add Price Addition to Project"
                entityName={project.name}
                editData={editingAddition}
            />

            <DeleteConfirmationModal
                isOpen={isDeleteAdditionModalOpen}
                onClose={() => {
                    setIsDeleteAdditionModalOpen(false);
                    setDeleteAdditionTarget(null);
                }}
                onConfirmDelete={handleConfirmDeleteAddition}
                itemName={deleteAdditionTarget ? `addition of ${formatPKRCurrency(deleteAdditionTarget.amount.toString())}` : 'this addition'}
                itemType="Price Addition"
                isInactive={true}
            />

            <Notification
                show={notification.show}
                type={notification.type}
                message={notification.message}
                onClose={() => setNotification(prev => ({ ...prev, show: false }))}
            />
        </div>
    );
};