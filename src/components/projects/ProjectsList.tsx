import React, { useState, useEffect } from 'react';
import { Breadcrumbs } from '../ui/Breadcrumbs';
import { useAuth } from '../../contexts/AuthContext';
import {
    Building,
    MapPin,
    Calendar,
    Users,
    Eye,
    Edit,
    Trash2,
    Plus,
    Search,
    FileText,
    Clock,
    CheckCircle,
    AlertCircle,
    XCircle
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Notification } from '../ui/Notification';
import { getProjectsPaginated, deleteProject, updateProject } from '../../services/projectApi';
import { Project } from '../../types/project';
import { PROJECT_CATEGORIES, PROJECT_TYPES, PROJECT_STATUSES } from '../../constants/project';
import { formatPKRCurrency } from '../../utils/projectValidation';
import { DeleteConfirmationModal } from '../ui/DeleteConfirmationModal';

interface ProjectsListProps {
    onViewProject: (project: Project) => void;
    onEditProject: (project: Project) => void;
}

export const ProjectsList: React.FC<ProjectsListProps> = ({ onViewProject, onEditProject }) => {
    const { user } = useAuth();
    const isAdmin = user?.role === 'Admin';
    const [projects, setProjects] = useState<Project[]>([]);
    const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const pageSize = 9; // Grid of 3 columns looks better with 9 or 12 items
    const [notification, setNotification] = useState({
        show: false,
        type: 'success' as 'success' | 'error',
        message: ''
    });
    const [deleteModal, setDeleteModal] = useState({
        isOpen: false,
        projectId: '',
        projectName: '',
        isInactive: false
    });

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setPage(1);
        }, 500);
        return () => clearTimeout(handler);
    }, [searchTerm]);

    useEffect(() => {
        loadProjects();
    }, [page, debouncedSearch, statusFilter, categoryFilter, typeFilter]);

    const loadProjects = async () => {
        try {
            setLoading(true);
            const params: any = { page, limit: pageSize };
            if (debouncedSearch) params.search = debouncedSearch;
            if (statusFilter) params.status = statusFilter;
            if (categoryFilter) params.category = categoryFilter;
            if (typeFilter) params.type = typeFilter;

            const { data, pagination } = await getProjectsPaginated(params);
            setFilteredProjects(data);
            setProjects(data); // Using filteredProjects as main display
            if (pagination) {
                setTotalPages(pagination.totalPages || 1);
                setTotalCount(pagination.total || 0);
            }
        } catch (error) {
            showNotification('error', 'Failed to load projects. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleInitiateDelete = (project: Project) => {
        setDeleteModal({
            isOpen: true,
            projectId: project._id,
            projectName: project.name,
            isInactive: project.isActive === false
        });
    };

    const handleConfirmDeactivate = async () => {
        try {
            await updateProject(deleteModal.projectId, { isActive: false });
            setProjects(prev => prev.map(p => 
                p._id === deleteModal.projectId ? { ...p, isActive: false } : p
            ));
            showNotification('success', 'Project deactivated successfully');
        } catch (error) {
            showNotification('error', 'Failed to deactivate project. Please try again.');
            throw error;
        }
    };

    const handleActivateProject = async (project: Project) => {
        try {
            await updateProject(project._id, { isActive: true });
            setProjects(prev => prev.map(p => 
                p._id === project._id ? { ...p, isActive: true } : p
            ));
            showNotification('success', 'Project activated successfully');
        } catch (error) {
            showNotification('error', 'Failed to activate project. Please try again.');
        }
    };

    const handleConfirmDelete = async () => {
        try {
            await deleteProject(deleteModal.projectId);
            setProjects(prev => prev.filter(p => p._id !== deleteModal.projectId));
            showNotification('success', 'Project deleted successfully');
        } catch (error) {
            showNotification('error', 'Failed to delete project. Please try again.');
            throw error;
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
            case 'completed': return <CheckCircle className="w-4 h-4" />;
            case 'ongoing': return <Clock className="w-4 h-4" />;
            case 'planning': return <FileText className="w-4 h-4" />;
            case 'pending': return <AlertCircle className="w-4 h-4" />;
            case 'on_hold': return <XCircle className="w-4 h-4" />;
            case 'cancelled': return <XCircle className="w-4 h-4" />;
            default: return <Clock className="w-4 h-4" />;
        }
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'Not set';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getProjectCost = (project: Project) => {
        if (project.totalCost !== undefined && project.totalCost !== null) {
            return formatPKRCurrency(project.totalCost.toString());
        }
        return 'Not calculated';
    };

    const getProjectAdditionsTotal = (project: Project) => {
        if (!project.additions || project.additions.length === 0) return 0;
        return project.additions.reduce((sum, item) => sum + (item.amount || 0), 0);
    };

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <Breadcrumbs />

            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">All Projects</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage and monitor all your construction projects</p>
                </div>
                {isAdmin && (
                    <Button to="/dashboard/projects/add" variant="primary" size="md">
                        <Plus className="w-4 h-4 mr-2" /> Create Project
                    </Button>
                )}
            </div>

            {/* Filters and Search */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        <div className="lg:col-span-2">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input
                                    label="Search Projects"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search by name, location, or code..."
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        <Select
                            label="Status"
                            options={[
                                { value: '', label: 'All Statuses' },
                                ...PROJECT_STATUSES
                            ]}
                            value={statusFilter}
                            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                        />

                        <Select
                            label="Category"
                            options={[
                                { value: '', label: 'All Categories' },
                                ...PROJECT_CATEGORIES
                            ]}
                            value={categoryFilter}
                            onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
                        />

                        <Select
                            label="Type"
                            options={[
                                { value: '', label: 'All Types' },
                                ...PROJECT_TYPES
                            ]}
                            value={typeFilter}
                            onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
                        />
                    </div>
                </div>

                {/* Projects Grid */}
                {filteredProjects.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
                        <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Projects Found</h3>
                        <p className="text-gray-600 mb-6">
                            {projects.length === 0
                                ? "You haven't created any projects yet. Start by adding your first project."
                                : "No projects match your current filters. Try adjusting your search criteria."
                            }
                        </p>
                        {totalCount === 0 && (
                            <Button
                                onClick={() => window.location.href = '/dashboard/projects/add'}
                                className="bg-indigo-600 hover:bg-indigo-700"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Create First Project
                            </Button>
                        )}
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Project Info
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Details
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Financials
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredProjects.map((project) => (
                                        <tr key={project._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center mr-4 shrink-0">
                                                        <Building className="w-5 h-5 text-indigo-600" />
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {project.name}
                                                        </div>
                                                        <div className="text-sm text-gray-500 font-mono">
                                                            {project.projectCode}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="space-y-1">
                                                    <div className="flex items-center text-sm text-gray-900">
                                                        <MapPin className="w-4 h-4 text-gray-400 mr-2 shrink-0" />
                                                        <span className="truncate max-w-[200px]">{project.location}</span>
                                                    </div>
                                                    <div className="flex items-center text-sm text-gray-500">
                                                        <Calendar className="w-4 h-4 text-gray-400 mr-2 shrink-0" />
                                                        {formatDate(project.startDate)}
                                                    </div>
                                                    <div className="text-xs text-gray-500 capitalize mt-1">
                                                        {project.projectCategory} • {project.projectType.replace(/([A-Z])/g, ' $1').trim()}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="space-y-1">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {getProjectCost(project)}
                                                    </div>
                                                    {getProjectAdditionsTotal(project) > 0 && (
                                                        <div className="text-xs text-amber-700 font-medium">
                                                            +{formatPKRCurrency(getProjectAdditionsTotal(project).toString())} (Additions)
                                                        </div>
                                                    )}
                                                    <div className="w-24 bg-gray-200 rounded-full h-1.5 mt-2">
                                                        <div
                                                            className="bg-indigo-600 h-1.5 rounded-full transition-all duration-300"
                                                            style={{ width: `${project.progress || 0}%` }}
                                                        ></div>
                                                    </div>
                                                    <div className="text-[10px] text-gray-500 mt-0.5">{project.progress || 0}% Progress</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="space-y-2">
                                                    {project.isActive === false ? (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium text-red-700 bg-red-100 border border-red-200">
                                                            <XCircle className="w-4 h-4" />
                                                            INACTIVE
                                                        </span>
                                                    ) : (
                                                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(project.status).replace('text-', 'border-').replace('-600', '-200')} ${getStatusColor(project.status)}`}>
                                                            {getStatusIcon(project.status)}
                                                            {project.status.replace('_', ' ').toUpperCase()}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => onViewProject(project)}
                                                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 p-2"
                                                        title="View Project"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </Button>
                                                    {isAdmin && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => onEditProject(project)}
                                                            className="text-green-600 hover:text-green-700 hover:bg-green-50 p-2"
                                                            title="Edit Project"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </Button>
                                                    )}
                                                    {isAdmin && (
                                                        <>
                                                            {project.isActive === false && (
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => handleActivateProject(project)}
                                                                    className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 p-2"
                                                                    title="Activate Project"
                                                                >
                                                                    <CheckCircle className="w-4 h-4" />
                                                                </Button>
                                                            )}
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => handleInitiateDelete(project)}
                                                                className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2"
                                                                title={project.isActive === false ? "Permanently Delete" : "Deactivate"}
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Pagination Controls */}
                {totalCount > 0 && (
                    <div className="flex flex-col md:flex-row items-center justify-between mt-6 gap-4 text-sm bg-white p-4 rounded-xl border border-gray-200">
                        <p className="text-gray-600">Showing {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, totalCount)} of {totalCount} projects</p>
                        <div className="flex items-center gap-2">
                            <Button
                                size="sm"
                                variant="secondary"
                                disabled={page === 1}
                                onClick={() => setPage(1)}
                            >
                                First
                            </Button>
                            <Button
                                size="sm"
                                variant="secondary"
                                disabled={page === 1}
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                            >
                                Prev
                            </Button>
                            <span className="px-2 font-medium">Page {page} / {totalPages}</span>
                            <Button
                                size="sm"
                                variant="secondary"
                                disabled={page === totalPages}
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            >
                                Next
                            </Button>
                            <Button
                                size="sm"
                                variant="secondary"
                                disabled={page === totalPages}
                                onClick={() => setPage(totalPages)}
                            >
                                Last
                            </Button>
                        </div>
                    </div>
                )}

                {/* Stats Summary */}
                {projects.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
                        <div className="bg-white rounded-xl p-6 border border-gray-200">
                            <div className="flex items-center">
                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <Building className="w-5 h-5 text-blue-600" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Total Projects</p>
                                    <p className="text-2xl font-bold text-gray-900">{projects.length}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl p-6 border border-gray-200">
                            <div className="flex items-center">
                                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                    <CheckCircle className="w-5 h-5 text-green-600" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Completed</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {projects.filter(p => p.status === 'completed').length}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl p-6 border border-gray-200">
                            <div className="flex items-center">
                                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                                    <Clock className="w-5 h-5 text-orange-600" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">In Progress</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {projects.filter(p => p.status === 'ongoing').length}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl p-6 border border-gray-200">
                            <div className="flex items-center">
                                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                    <FileText className="w-5 h-5 text-purple-600" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Planning</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {projects.filter(p => p.status === 'planning').length}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <Notification
                    show={notification.show}
                    type={notification.type}
                    message={notification.message}
                    onClose={() => setNotification(prev => ({ ...prev, show: false }))}
                />

                <DeleteConfirmationModal
                    isOpen={deleteModal.isOpen}
                    onClose={() => setDeleteModal(prev => ({ ...prev, isOpen: false }))}
                    onConfirmDeactivate={handleConfirmDeactivate}
                    onConfirmDelete={handleConfirmDelete}
                    itemName={deleteModal.projectName}
                    itemType="Project"
                    isInactive={deleteModal.isInactive}
                />
            </div>
    );
};
