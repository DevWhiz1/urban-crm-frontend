import React, { useState, useEffect } from 'react';
import { Breadcrumbs } from './ui/Breadcrumbs';
import {
    Building,
    MapPin,
    Calendar,
    DollarSign,
    Users,
    ArrowLeft,
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
    Banknote,
    Ruler,
    Calculator,
    Wrench,
    File,
    ExternalLink,
    PlusCircle
} from 'lucide-react';
import { Button } from './ui/Button';
import { Notification } from './ui/Notification';
import { fetchProjectById, deleteProject, addProjectAddition } from '../services/projectApi';
import { fetchProjectContractsByProjectId } from '../services/projectContractApi';
import { Project } from '../types/project';
import { ProjectContract } from '../types/projectContract';
import { formatPKRCurrency } from '../utils/projectValidation';
import { PriceAdditionModal } from './PriceAdditionModal';

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
    onDelete
}) => {
    const [project, setProject] = useState<Project | null>(null);
    const [projectContracts, setProjectContracts] = useState<ProjectContract[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdditionModalOpen, setIsAdditionModalOpen] = useState(false);
    const [notification, setNotification] = useState({
        show: false,
        type: 'success' as 'success' | 'error',
        message: ''
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
                fetchProjectContractsByProjectId(projectId)
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
            case 'completed': return 'text-green-600 bg-green-100';
            case 'ongoing': return 'text-blue-600 bg-blue-100';
            case 'planning': return 'text-orange-600 bg-orange-100';
            case 'pending': return 'text-yellow-600 bg-yellow-100';
            case 'on_hold': return 'text-purple-600 bg-purple-100';
            case 'cancelled': return 'text-red-600 bg-red-100';
            default: return 'text-gray-600 bg-gray-100';
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
            day: 'numeric'
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
            <div className="min-h-screen bg-slate-50 py-8 px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (!project) {
        return (
            <div className="min-h-screen bg-slate-50 py-8 px-4">
                <div className="max-w-6xl mx-auto">
                    <Breadcrumbs
                        items={[
                            { label: 'Dashboard', path: '/dashboard' },
                            { label: 'Projects', onClick: onBack },
                            { label: 'Project Not Found' }
                        ]}
                    />
                    <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
                        <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">Project Not Found</h3>
                        <p className="text-gray-600">The project you're looking for doesn't exist or has been deleted.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 py-8 px-4">
            <div className="max-w-6xl mx-auto">
                <Breadcrumbs
                    items={[
                        { label: 'Dashboard', path: '/dashboard' },
                        { label: 'Projects', onClick: onBack },
                        { label: project.name }
                    ]}
                />

                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
                        <p className="text-gray-600 font-mono">{project.projectCode}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(project.status)}`}>
                            {getStatusIcon(project.status)}
                            {project.status.replace('_', ' ').toUpperCase()}
                        </span>
                        <Button
                            onClick={() => onEdit(project)}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                        </Button>
                        <Button
                            onClick={handleDelete}
                            variant="outline"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Basic Information */}
                        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                            <div className="bg-indigo-600 px-6 py-4">
                                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                                    <Building className="w-5 h-5" />
                                    Project Information
                                </h2>
                            </div>
                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 mb-1">Project Name</label>
                                        <p className="text-lg font-semibold text-gray-900">{project.name}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 mb-1">Project Code</label>
                                        <p className="text-lg font-mono text-gray-900">{project.projectCode}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 mb-1">Location</label>
                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-4 h-4 text-gray-400" />
                                            <p className="text-gray-900">{project.location}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 mb-1">Category</label>
                                        <p className="text-gray-900 capitalize">{project.projectCategory}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 mb-1">Type</label>
                                        <p className="text-gray-900 capitalize">{project.projectType.replace(/([A-Z])/g, ' $1').trim()}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 mb-1">Status</label>
                                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(project.status)}`}>
                                            {getStatusIcon(project.status)}
                                            {project.status.replace('_', ' ').toUpperCase()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Financial Information */}
                        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                            <div className="bg-green-600 px-6 py-4 flex items-center justify-between">
                                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                                    <DollarSign className="w-5 h-5" />
                                    Financial Details
                                </h2>
                                <Button
                                    onClick={() => setIsAdditionModalOpen(true)}
                                    className="bg-white/20 hover:bg-white/30 text-white text-xs font-medium border border-white/30"
                                >
                                    <PlusCircle className="w-4 h-4 mr-1.5" />
                                    Add Price Addition
                                </Button>
                            </div>
                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Base Project Cost</label>
                                        <p className="text-xl font-semibold text-gray-900">
                                            {formatPKRCurrency(getBaseCost(project).toString())}
                                        </p>
                                    </div>
                                    <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                                        <label className="block text-xs font-medium text-amber-700 uppercase tracking-wider mb-1">Total Additions</label>
                                        <p className="text-xl font-semibold text-amber-700">
                                            +{formatPKRCurrency(getTotalAdditions(project).toString())}
                                        </p>
                                    </div>
                                    <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                                        <label className="block text-xs font-medium text-emerald-700 uppercase tracking-wider mb-1">Revised Total Cost</label>
                                        <p className="text-xl font-bold text-emerald-700">
                                            {formatPKRCurrency(getRevisedCost(project).toString())}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
                                    {project.projectType === 'withMaterial' && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500 mb-1">Rate per Square Foot</label>
                                            <p className="text-lg font-semibold text-gray-900">
                                                {project.ratePerSquareFoot ? formatPKRCurrency(project.ratePerSquareFoot.toString()) : 'Not set'}
                                            </p>
                                        </div>
                                    )}

                                    {project.projectType === 'labourRate' && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500 mb-1">Labour Rate per Sq Ft</label>
                                            <p className="text-lg font-semibold text-gray-900">
                                                {project.labouRate ? formatPKRCurrency(project.labouRate.toString()) : 'Not set'}
                                            </p>
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 mb-1">Total Area</label>
                                        <div className="flex items-center gap-2">
                                            <Ruler className="w-4 h-4 text-gray-400" />
                                            <p className="text-gray-900">{project.totalArea ? `${project.totalArea} sq ft` : 'Not set'}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 mb-1">Coverage Area</label>
                                        <div className="flex items-center gap-2">
                                            <Ruler className="w-4 h-4 text-gray-400" />
                                            <p className="text-gray-900">{project.totalCoverageArea ? `${project.totalCoverageArea} sq ft` : 'Not set'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Price Additions History Log */}
                        {project.additions && project.additions.length > 0 && (
                            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                                <div className="bg-amber-600 px-6 py-4 flex items-center justify-between">
                                    <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                                        <PlusCircle className="w-5 h-5" />
                                        Price Additions Log ({project.additions.length})
                                    </h2>
                                </div>
                                <div className="divide-y divide-gray-100 overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason / Scope</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Added By</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-100">
                                            {project.additions.map((item, idx) => (
                                                <tr key={item._id || idx} className="hover:bg-amber-50/50 transition-colors">
                                                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                                                        {new Date(item.date).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap font-semibold text-emerald-700">
                                                        +{formatPKRCurrency(item.amount.toString())}
                                                    </td>
                                                    <td className="px-6 py-4 text-gray-900">
                                                        {item.reason}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-gray-500 text-xs font-medium">
                                                        {formatAddedBy(item.addedBy)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Timeline */}
                        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                            <div className="bg-purple-600 px-6 py-4">
                                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                                    <Calendar className="w-5 h-5" />
                                    Timeline
                                </h2>
                            </div>
                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 mb-1">Start Date</label>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-gray-400" />
                                            <p className="text-gray-900">{formatDate(project.startDate)}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 mb-1">Estimated Completion</label>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-gray-400" />
                                            <p className="text-gray-900">{formatDate(project.estimatedDuration)}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 mb-1">Actual Completion</label>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-gray-400" />
                                            <p className="text-gray-900">{formatDate(project.actualCompletionDate)}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 mb-1">Progress</label>
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-gray-600">Completion</span>
                                                <span className="font-medium text-gray-900">{project.progress || 0}%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div
                                                    className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                                                    style={{ width: `${project.progress || 0}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        {project.description && (
                            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                                <div className="bg-gray-700 px-6 py-4">
                                    <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                                        <FileText className="w-5 h-5" />
                                        Description
                                    </h2>
                                </div>
                                <div className="p-6">
                                    <p className="text-gray-900 whitespace-pre-wrap">{project.description}</p>
                                </div>
                            </div>
                        )}

                        {/* Documents */}
                        {(project.drawings && project.drawings.length > 0) || (project.contracts && project.contracts.length > 0) ? (
                            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                                <div className="bg-orange-600 px-6 py-4">
                                    <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                                        <File className="w-5 h-5" />
                                        Documents
                                    </h2>
                                </div>
                                <div className="p-6">
                                    <div className="space-y-6">
                                        {project.drawings && project.drawings.length > 0 && (
                                            <div>
                                                <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center gap-2">
                                                    <LinkIcon className="w-4 h-4" />
                                                    Drawings
                                                </h3>
                                                <div className="space-y-2">
                                                    {project.drawings.map((drawing, index) => (
                                                        <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                                            <FileText className="w-4 h-4 text-gray-400" />
                                                            <a
                                                                href={drawing}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
                                                            >
                                                                Drawing {index + 1}
                                                                <ExternalLink className="w-3 h-3" />
                                                            </a>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {project.contracts && project.contracts.length > 0 && (
                                            <div>
                                                <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center gap-2">
                                                    <LinkIcon className="w-4 h-4" />
                                                    Contracts
                                                </h3>
                                                <div className="space-y-2">
                                                    {project.contracts.map((contract, index) => (
                                                        <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                                            <FileText className="w-4 h-4 text-gray-400" />
                                                            <a
                                                                href={contract}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
                                                            >
                                                                Contract {index + 1}
                                                                <ExternalLink className="w-3 h-3" />
                                                            </a>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : null}

                        {/* Associated Project Contracts */}
                        {projectContracts.length > 0 && (
                            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                                <div className="bg-teal-600 px-6 py-4">
                                    <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                                        <Wrench className="w-5 h-5" />
                                        Associated Contracts ({projectContracts.length})
                                    </h2>
                                </div>
                                <div className="p-6">
                                    <div className="space-y-4">
                                        {projectContracts.map((contract) => {
                                            const contractor = typeof contract.contractor === 'object' ? contract.contractor : null;
                                            const totalAdditions = (contract.additions || []).reduce((sum, a) => sum + (a.amount || 0), 0);
                                            const revisedTotal = contract.totalAmount || 0;
                                            return (
                                                <div key={contract._id} className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <div className="flex items-center gap-2">
                                                            <Wrench className="w-4 h-4 text-teal-600" />
                                                            <span className="font-semibold text-gray-900">
                                                                {contractor?.companyName || 'N/A'}
                                                            </span>
                                                            {contract.contractType && (
                                                                <span className="text-xs px-2 py-0.5 bg-teal-100 text-teal-700 rounded-full">
                                                                    {contract.contractType}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                                            contract.isTerminated
                                                                ? 'bg-red-100 text-red-700'
                                                                : 'bg-green-100 text-green-700'
                                                        }`}>
                                                            {contract.isTerminated ? 'Terminated' : 'Active'}
                                                        </span>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-3 text-sm">
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
                                                                <span className="ml-1 text-amber-700 font-medium">
                                                                    +{formatPKRCurrency(totalAdditions.toString())}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    {totalAdditions > 0 && (
                                                        <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between">
                                                            <span className="text-sm font-medium text-gray-700">Revised Total:</span>
                                                            <span className="text-sm font-bold text-teal-700">
                                                                {formatPKRCurrency(revisedTotal.toString())}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-8">
                        {/* Customer Information */}
                        {project.customer && typeof project.customer === 'object' && (
                            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                                <div className="bg-blue-600 px-6 py-4">
                                    <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                                        <User className="w-5 h-5" />
                                        Customer
                                    </h2>
                                </div>
                                <div className="p-6">
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500 mb-1">Name</label>
                                            <p className="text-gray-900 font-medium">{project.customer.user?.userName || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
                                            <div className="flex items-center gap-2">
                                                <Mail className="w-4 h-4 text-gray-400" />
                                                <p className="text-gray-900">{project.customer.user?.email || 'N/A'}</p>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500 mb-1">Phone</label>
                                            <div className="flex items-center gap-2">
                                                <Phone className="w-4 h-4 text-gray-400" />
                                                <p className="text-gray-900">{project.customer.phoneNumber || 'N/A'}</p>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500 mb-1">Address</label>
                                            <p className="text-gray-900">{project.customer.address || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500 mb-1">Payment Terms</label>
                                            <p className="text-gray-900">{project.customer.paymentTerms || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Contractors */}
                        {project.contractors && project.contractors.length > 0 && (
                            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                                <div className="bg-green-600 px-6 py-4">
                                    <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                                        <Wrench className="w-5 h-5" />
                                        Contractors ({project.contractors.length})
                                    </h2>
                                </div>
                                <div className="p-6">
                                    <div className="space-y-4">
                                        {project.contractors.map((contractor, index) => (
                                            <div key={index} className="p-4 bg-gray-50 rounded-lg">
                                                <div className="space-y-2">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-500 mb-1">Company</label>
                                                        <p className="text-gray-900 font-medium">{contractor.companyName || 'N/A'}</p>
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-500 mb-1">Contact</label>
                                                        <p className="text-gray-900">{contractor.user?.userName || 'N/A'}</p>
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-500 mb-1">Type</label>
                                                        <p className="text-gray-900 capitalize">{contractor.contractorType || 'N/A'}</p>
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-500 mb-1">Phone</label>
                                                        <div className="flex items-center gap-2">
                                                            <Phone className="w-4 h-4 text-gray-400" />
                                                            <p className="text-gray-900">{contractor.phoneNumber || 'N/A'}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Project Summary */}
                        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                            <div className="bg-indigo-600 px-6 py-4">
                                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                                    <Calculator className="w-5 h-5" />
                                    Summary
                                </h2>
                            </div>
                            <div className="p-6">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-600">Total Cost:</span>
                                        <span className="font-semibold text-gray-900">{getProjectCost(project)}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-600">Coverage Area:</span>
                                        <span className="font-semibold text-gray-900">
                                            {project.totalCoverageArea ? `${project.totalCoverageArea} sq ft` : 'N/A'}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-600">Progress:</span>
                                        <span className="font-semibold text-gray-900">{project.progress || 0}%</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-600">Status:</span>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                                            {project.status.replace('_', ' ').toUpperCase()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

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
