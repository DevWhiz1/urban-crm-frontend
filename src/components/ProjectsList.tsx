import React, { useState, useEffect } from 'react';
import { Breadcrumbs } from './ui/Breadcrumbs';
import { useAuth } from '../contexts/AuthContext';
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
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { Notification } from './ui/Notification';
import { fetchAllProjects, deleteProject } from '../services/projectApi';
import { Project } from '../types/project';
import { PROJECT_CATEGORIES, PROJECT_TYPES, PROJECT_STATUSES } from '../constants/project';
import { formatPKRCurrency } from '../utils/projectValidation';

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
    const [statusFilter, setStatusFilter] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [notification, setNotification] = useState({
        show: false,
        type: 'success' as 'success' | 'error',
        message: ''
    });

    useEffect(() => {
        loadProjects();
    }, []);

    useEffect(() => {
        filterProjects();
    }, [projects, searchTerm, statusFilter, categoryFilter, typeFilter]);

    const loadProjects = async () => {
        try {
            setLoading(true);
            const projectsData = await fetchAllProjects();
            setProjects(projectsData);
        } catch (error) {
            showNotification('error', 'Failed to load projects. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const filterProjects = () => {
        let filtered = [...projects];

        if (searchTerm) {
            filtered = filtered.filter(project =>
                project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                project.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                project.projectCode.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (statusFilter) {
            filtered = filtered.filter(project => project.status === statusFilter);
        }

        if (categoryFilter) {
            filtered = filtered.filter(project => project.projectCategory === categoryFilter);
        }

        if (typeFilter) {
            filtered = filtered.filter(project => project.projectType === typeFilter);
        }

        setFilteredProjects(filtered);
    };

    const handleDeleteProject = async (projectId: string, projectName: string) => {
        if (!window.confirm(`Are you sure you want to delete "${projectName}"? This action cannot be undone.`)) {
            return;
        }

        try {
            await deleteProject(projectId);
            setProjects(prev => prev.filter(p => p._id !== projectId));
            showNotification('success', 'Project deleted successfully');
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
        const totalAdditions = (project.additions || []).reduce((sum, item) => sum + (item.amount || 0), 0);
        if (project.projectType === 'withMaterial' && project.totalCost !== undefined) {
            return formatPKRCurrency((project.totalCost + totalAdditions).toString());
        }
        if (project.projectType === 'labourRate' && project.totalLabourCost !== undefined) {
            return formatPKRCurrency((project.totalLabourCost + totalAdditions).toString());
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
                            onChange={(e) => setStatusFilter(e.target.value)}
                        />

                        <Select
                            label="Category"
                            options={[
                                { value: '', label: 'All Categories' },
                                ...PROJECT_CATEGORIES
                            ]}
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                        />

                        <Select
                            label="Type"
                            options={[
                                { value: '', label: 'All Types' },
                                ...PROJECT_TYPES
                            ]}
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
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
                        {projects.length === 0 && (
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
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filteredProjects.map((project) => (
                            <div key={project._id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden transition-all duration-300">
                                {/* Project Header */}
                                <div className="p-6 border-b border-gray-100">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <h3 className="text-xl font-semibold text-gray-900 mb-1">{project.name}</h3>
                                            <p className="text-sm text-gray-600 font-mono">{project.projectCode}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                                                {getStatusIcon(project.status)}
                                                {project.status.replace('_', ' ').toUpperCase()}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 text-sm text-gray-600">
                                        <div className="flex items-center gap-1">
                                            <MapPin className="w-4 h-4" />
                                            <span>{project.location}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Calendar className="w-4 h-4" />
                                            <span>{formatDate(project.startDate)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Project Details */}
                                <div className="p-6">
                                    <div className="space-y-4">
                                        {/* Project Info */}
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <span className="text-gray-500">Category:</span>
                                                <p className="font-medium text-gray-900 capitalize">{project.projectCategory}</p>
                                            </div>
                                            <div>
                                                <span className="text-gray-500">Type:</span>
                                                <p className="font-medium text-gray-900 capitalize">{project.projectType.replace(/([A-Z])/g, ' $1').trim()}</p>
                                            </div>
                                        </div>

                                        {/* Cost Information */}
                                        <div className="bg-gray-50 rounded-lg p-4">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-600">Revised Total Cost:</span>
                                                <span className="font-semibold text-gray-900">{getProjectCost(project)}</span>
                                            </div>
                                            {getProjectAdditionsTotal(project) > 0 && (
                                                <div className="flex items-center justify-between mt-1 text-xs text-amber-700 font-medium">
                                                    <span>Includes Additions:</span>
                                                    <span>+{formatPKRCurrency(getProjectAdditionsTotal(project).toString())}</span>
                                                </div>
                                            )}
                                            {project.totalCoverageArea && (
                                                <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200/60">
                                                    <span className="text-sm text-gray-600">Coverage Area:</span>
                                                    <span className="text-sm font-medium text-gray-900">{project.totalCoverageArea} sq ft</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Contractors */}
                                        {project.contractors && project.contractors.length > 0 && (
                                            <div>
                                                <span className="text-sm text-gray-500">Contractors:</span>
                                                <div className="flex items-center gap-1 mt-1">
                                                    <Users className="w-4 h-4 text-gray-400" />
                                                    <span className="text-sm font-medium text-gray-900">
                                                        {project.contractors.length} assigned
                                                    </span>
                                                </div>
                                            </div>
                                        )}

                                        {/* Progress */}
                                        <div>
                                            <div className="flex items-center justify-between text-sm mb-2">
                                                <span className="text-gray-600">Progress</span>
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

                                {/* Action Buttons */}
                                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => onViewProject(project)}
                                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                            >
                                                <Eye className="w-4 h-4 mr-1" />
                                                View
                                            </Button>
                                            {isAdmin && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => onEditProject(project)}
                                                    className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                                >
                                                    <Edit className="w-4 h-4 mr-1" />
                                                    Edit
                                                </Button>
                                            )}
                                        </div>
                                        {isAdmin && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleDeleteProject(project._id, project.name)}
                                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
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
            </div>
    );
};
