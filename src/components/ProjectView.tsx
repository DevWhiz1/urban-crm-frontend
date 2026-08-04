import React, { useState, useEffect } from 'react';
import { Breadcrumbs } from './ui/Breadcrumbs';
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
} from 'lucide-react';
import { Button } from './ui/Button';
import { Notification } from './ui/Notification';
import { fetchProjectById, deleteProject, addProjectAddition } from '../services/projectApi';
import { fetchProjectContractsByProjectId } from '../services/projectContractApi';
import { Project } from '../types/project';
import { ProjectContract } from '../types/projectContract';
import { formatPKRCurrency } from '../utils/projectValidation';
import { PriceAdditionModal } from './PriceAdditionModal';

type Tab = 'overview' | 'financials' | 'contracts' | 'timeline' | 'documents';

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
    const [activeTab, setActiveTab] = useState<Tab>('overview');
    const [isAdditionModalOpen, setIsAdditionModalOpen] = useState(false);
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
        const updatedProject = await addProjectAddition(project._id, amount, reason);
        setProject(updatedProject);
        showNotification('success', 'Price addition recorded successfully!');
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

    const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
        { id: 'overview', label: 'Overview', icon: <Home className="w-4 h-4" /> },
        { id: 'financials', label: 'Financials', icon: <CreditCard className="w-4 h-4" /> },
        { id: 'contracts', label: 'Contracts', icon: <Briefcase className="w-4 h-4" /> },
        { id: 'timeline', label: 'Timeline', icon: <CalendarDays className="w-4 h-4" /> },
        { id: 'documents', label: 'Documents', icon: <FolderOpen className="w-4 h-4" /> },
    ];

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
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-indigo-50 rounded-xl">
                            <Building className="w-8 h-8 text-indigo-600" />
                        </div>
                        <div>
                            <div className="flex items-center gap-3 flex-wrap">
                                <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(project.status)}`}>
                                    {getStatusIcon(project.status)}
                                    {project.status.replace('_', ' ').toUpperCase()}
                                </span>
                                <span className="text-sm text-gray-500 font-mono bg-gray-100 px-2 py-0.5 rounded">
                                    {project.projectCode}
                                </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mt-1">
                                <span className="flex items-center gap-1.5">
                                    <MapPin className="w-4 h-4" />
                                    {project.location}
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <Calendar className="w-4 h-4" />
                                    Started {formatDate(project.startDate)}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button
                            onClick={() => onEdit(project)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white"
                        >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                        </Button>
                        <Button
                            onClick={handleDelete}
                            variant="outline"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                        </Button>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-x-auto">
                    <div className="flex border-b border-gray-200">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`
                  flex items-center gap-2 px-5 py-3 text-sm font-medium whitespace-nowrap transition-colors
                  ${activeTab === tab.id
                                        ? 'border-b-2 border-indigo-600 text-indigo-600 bg-indigo-50/50'
                                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                    }
                `}
                            >
                                {tab.icon}
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tab Content */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    {/* Overview Tab */}
                    {activeTab === 'overview' && (
                        <div className="space-y-6">
                            {/* Metric Cards */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-indigo-700 font-medium">Total Cost</span>
                                        <Banknote className="w-5 h-5 text-indigo-600" />
                                    </div>
                                    <p className="text-2xl font-bold text-gray-900 mt-1">{getProjectCost(project)}</p>
                                </div>
                                <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-emerald-700 font-medium">Progress</span>
                                        <TrendingUp className="w-5 h-5 text-emerald-600" />
                                    </div>
                                    <p className="text-2xl font-bold text-gray-900 mt-1">{project.progress || 0}%</p>
                                    <div className="w-full h-1.5 bg-emerald-200 rounded-full mt-1 overflow-hidden">
                                        <div
                                            className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                                            style={{ width: `${project.progress || 0}%` }}
                                        ></div>
                                    </div>
                                </div>
                                <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-purple-700 font-medium">Coverage Area</span>
                                        <Ruler className="w-5 h-5 text-purple-600" />
                                    </div>
                                    <p className="text-2xl font-bold text-gray-900 mt-1">
                                        {project.totalCoverageArea ? `${project.totalCoverageArea} sq ft` : 'N/A'}
                                    </p>
                                </div>
                                <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-amber-700 font-medium">Contracts</span>
                                        <Briefcase className="w-5 h-5 text-amber-600" />
                                    </div>
                                    <p className="text-2xl font-bold text-gray-900 mt-1">{projectContracts.length}</p>
                                </div>
                            </div>

                            {/* Project Details & Customer */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-4">
                                        <Layers className="w-5 h-5 text-indigo-500" />
                                        Project Details
                                    </h3>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Category</label>
                                            <p className="text-gray-900 capitalize">{project.projectCategory}</p>
                                        </div>
                                        <div>
                                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Type</label>
                                            <p className="text-gray-900 capitalize">{project.projectType.replace(/([A-Z])/g, ' $1').trim()}</p>
                                        </div>
                                        {project.projectType === 'withMaterial' && (
                                            <div>
                                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Rate per sq ft</label>
                                                <p className="text-gray-900">{project.ratePerSquareFoot ? formatPKRCurrency(project.ratePerSquareFoot.toString()) : 'Not set'}</p>
                                            </div>
                                        )}
                                        {project.projectType === 'labourRate' && (
                                            <div>
                                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Labour Rate / sq ft</label>
                                                <p className="text-gray-900">{project.labouRate ? formatPKRCurrency(project.labouRate.toString()) : 'Not set'}</p>
                                            </div>
                                        )}
                                        <div>
                                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Area</label>
                                            <p className="text-gray-900">{project.totalArea ? `${project.totalArea} sq ft` : 'Not set'}</p>
                                        </div>
                                        {project.description && (
                                            <div>
                                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Description</label>
                                                <p className="text-gray-700 whitespace-pre-wrap text-sm mt-1">{project.description}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-4">
                                        <User className="w-5 h-5 text-blue-500" />
                                        Customer
                                    </h3>
                                    {project.customer && typeof project.customer === 'object' ? (
                                        <div className="space-y-3">
                                            <div>
                                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Name</label>
                                                <p className="text-gray-900 font-medium">{project.customer.user?.userName || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Email</label>
                                                <p className="text-gray-900 flex items-center gap-1.5">
                                                    <Mail className="w-4 h-4 text-gray-400" />
                                                    {project.customer.user?.email || 'N/A'}
                                                </p>
                                            </div>
                                            <div>
                                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</label>
                                                <p className="text-gray-900 flex items-center gap-1.5">
                                                    <Phone className="w-4 h-4 text-gray-400" />
                                                    {project.customer.phoneNumber || 'N/A'}
                                                </p>
                                            </div>
                                            <div>
                                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Address</label>
                                                <p className="text-gray-900">{project.customer.address || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Terms</label>
                                                <p className="text-gray-900">{project.customer.paymentTerms || 'N/A'}</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-gray-500">No customer information available.</p>
                                    )}
                                </div>
                            </div>

                            {/* Contractors (if any) */}
                            {project.contractors && project.contractors.length > 0 && (
                                <div className="pt-4 border-t border-gray-100">
                                    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-4">
                                        <Wrench className="w-5 h-5 text-green-500" />
                                        Contractors ({project.contractors.length})
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {project.contractors.map((contractor, index) => (
                                            <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                                <p className="font-medium text-gray-900">{contractor.companyName || 'N/A'}</p>
                                                <p className="text-sm text-gray-600">{contractor.user?.userName || 'N/A'}</p>
                                                <p className="text-sm text-gray-500 capitalize">{contractor.contractorType || 'N/A'}</p>
                                                <p className="text-sm text-gray-600 flex items-center gap-1.5 mt-1">
                                                    <Phone className="w-4 h-4 text-gray-400" />
                                                    {contractor.phoneNumber || 'N/A'}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Financials Tab */}
                    {activeTab === 'financials' && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                                    <Banknote className="w-6 h-6 text-indigo-600" />
                                    Financial Breakdown
                                </h2>
                                <Button
                                    onClick={() => setIsAdditionModalOpen(true)}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                                >
                                    <PlusCircle className="w-4 h-4 mr-1.5" />
                                    Add Addition
                                </Button>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                                    <div className="text-xs uppercase text-gray-500 tracking-wider">Base Cost</div>
                                    <div className="text-2xl font-bold text-gray-800 mt-1">{formatPKRCurrency(getBaseCost(project).toString())}</div>
                                </div>
                                <div className="bg-amber-50 rounded-xl p-5 border border-amber-200">
                                    <div className="text-xs uppercase text-amber-700 tracking-wider">Total Additions</div>
                                    <div className="text-2xl font-bold text-amber-700 mt-1">+{formatPKRCurrency(getTotalAdditions(project).toString())}</div>
                                </div>
                                <div className="bg-emerald-50 rounded-xl p-5 border border-emerald-200">
                                    <div className="text-xs uppercase text-emerald-700 tracking-wider">Revised Total</div>
                                    <div className="text-2xl font-bold text-emerald-700 mt-1">{formatPKRCurrency(getRevisedCost(project).toString())}</div>
                                </div>
                            </div>

                            {/* Additions Log */}
                            {project.additions && project.additions.length > 0 ? (
                                <div className="mt-6">
                                    <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-3">
                                        <PlusCircle className="w-4 h-4 text-amber-500" />
                                        Addition History ({project.additions.length})
                                    </h3>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200 text-sm">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Added By</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-100">
                                                {project.additions.map((item, idx) => (
                                                    <tr key={item._id || idx} className="hover:bg-amber-50/50">
                                                        <td className="px-4 py-2 whitespace-nowrap text-gray-600">{new Date(item.date).toLocaleDateString()}</td>
                                                        <td className="px-4 py-2 whitespace-nowrap font-semibold text-emerald-700">+{formatPKRCurrency(item.amount.toString())}</td>
                                                        <td className="px-4 py-2 text-gray-900">{item.reason}</td>
                                                        <td className="px-4 py-2 whitespace-nowrap text-gray-500 text-xs font-medium">{formatAddedBy(item.addedBy)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-gray-500 text-sm mt-4">No price additions recorded.</p>
                            )}
                        </div>
                    )}

                    {/* Contracts Tab */}
                    {activeTab === 'contracts' && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                                <Briefcase className="w-6 h-6 text-indigo-600" />
                                Associated Contracts ({projectContracts.length})
                            </h2>
                            {projectContracts.length > 0 ? (
                                <div className="space-y-4">
                                    {projectContracts.map((contract) => {
                                        const contractor = typeof contract.contractor === 'object' ? contract.contractor : null;
                                        const totalAdditions = (contract.additions || []).reduce((sum, a) => sum + (a.amount || 0), 0);
                                        const revisedTotal = contract.totalAmount || 0;
                                        return (
                                            <div key={contract._id} className="bg-gray-50 rounded-xl p-5 border border-gray-200 hover:shadow-md transition-shadow">
                                                <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                                                    <div className="flex items-center gap-2">
                                                        <Wrench className="w-5 h-5 text-teal-600" />
                                                        <span className="font-semibold text-gray-900">{contractor?.companyName || 'N/A'}</span>
                                                        {contract.contractType && (
                                                            <span className="text-xs px-2 py-0.5 bg-teal-100 text-teal-700 rounded-full font-medium">
                                                                {contract.contractType}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <span
                                                        className={`text-xs px-3 py-1 rounded-full font-medium ${contract.isTerminated ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                                                            }`}
                                                    >
                                                        {contract.isTerminated ? 'Terminated' : 'Active'}
                                                    </span>
                                                </div>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
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
                                                    <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between">
                                                        <span className="text-sm font-medium text-gray-700">Revised Total:</span>
                                                        <span className="text-sm font-bold text-teal-700">{formatPKRCurrency(revisedTotal.toString())}</span>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <p className="text-gray-500">No contracts associated with this project.</p>
                            )}
                        </div>
                    )}

                    {/* Timeline Tab */}
                    {activeTab === 'timeline' && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                                <CalendarDays className="w-6 h-6 text-indigo-600" />
                                Project Timeline
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">
                                    <div className="text-xs uppercase text-blue-700 tracking-wider">Start Date</div>
                                    <p className="text-lg font-bold text-gray-900 mt-1">{formatDate(project.startDate)}</p>
                                </div>
                                <div className="bg-purple-50 rounded-xl p-5 border border-purple-100">
                                    <div className="text-xs uppercase text-purple-700 tracking-wider">Estimated Completion</div>
                                    <p className="text-lg font-bold text-gray-900 mt-1">{formatDate(project.estimatedDuration)}</p>
                                </div>
                                <div className="bg-emerald-50 rounded-xl p-5 border border-emerald-100">
                                    <div className="text-xs uppercase text-emerald-700 tracking-wider">Actual Completion</div>
                                    <p className="text-lg font-bold text-gray-900 mt-1">{formatDate(project.actualCompletionDate)}</p>
                                </div>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-gray-700">Overall Progress</span>
                                    <span className="text-sm font-bold text-indigo-600">{project.progress || 0}%</span>
                                </div>
                                <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                                        style={{ width: `${project.progress || 0}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Documents Tab */}
                    {activeTab === 'documents' && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                                <FolderOpen className="w-6 h-6 text-indigo-600" />
                                Project Documents
                            </h2>
                            {(project.drawings && project.drawings.filter(d => d.trim() !== '').length > 0) ||
                                (project.contracts && project.contracts.filter(c => c.trim() !== '').length > 0) ? (
                                <div className="space-y-6">
                                    {project.drawings && project.drawings.filter(d => d.trim() !== '').length > 0 && (
                                        <div>
                                            <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-3">
                                                <FileText className="w-4 h-4 text-gray-500" />
                                                Drawings ({project.drawings.filter(d => d.trim() !== '').length})
                                            </h3>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                {project.drawings.filter(d => d.trim() !== '').map((drawing, index) => (
                                                    <a
                                                        key={index}
                                                        href={drawing}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-indigo-50 hover:border-indigo-200 transition-colors"
                                                    >
                                                        <File className="w-5 h-5 text-indigo-500" />
                                                        <span className="text-sm font-medium text-indigo-600">Drawing {index + 1}</span>
                                                        <ExternalLink className="w-4 h-4 text-gray-400 ml-auto" />
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {project.contracts && project.contracts.filter(c => c.trim() !== '').length > 0 && (
                                        <div>
                                            <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-3">
                                                <FileText className="w-4 h-4 text-gray-500" />
                                                Contract Documents ({project.contracts.filter(c => c.trim() !== '').length})
                                            </h3>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                {project.contracts.filter(c => c.trim() !== '').map((contract, index) => (
                                                    <a
                                                        key={index}
                                                        href={contract}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-indigo-50 hover:border-indigo-200 transition-colors"
                                                    >
                                                        <File className="w-5 h-5 text-indigo-500" />
                                                        <span className="text-sm font-medium text-indigo-600">Contract {index + 1}</span>
                                                        <ExternalLink className="w-4 h-4 text-gray-400 ml-auto" />
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <p className="text-gray-500">No documents uploaded for this project.</p>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal & Notification */}
            <PriceAdditionModal
                isOpen={isAdditionModalOpen}
                onClose={() => setIsAdditionModalOpen(false)}
                onSubmit={handleAddAddition}
                title="Add Price Addition to Project"
                entityName={project.name}
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