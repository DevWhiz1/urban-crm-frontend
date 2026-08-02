import React, { useState, useEffect } from 'react';
import { Breadcrumbs } from './ui/Breadcrumbs';
import {
    Handshake,
    Plus,
    Search,
    Eye,
    Edit,
    Trash2,
    Calendar,
    DollarSign,
    Building,
    User,
    AlertCircle,
    CheckCircle,
    XCircle
} from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Notification } from './ui/Notification';
import { fetchAllProjectContracts, deleteProjectContract } from '../services/projectContractApi';
import { ProjectContract } from '../types/projectContract';
import { formatPKRCurrency } from '../utils/projectContractValidation';

interface ProjectContractsListProps {
    onViewContract: (contract: ProjectContract) => void;
    onEditContract: (contract: ProjectContract) => void;
    onAddContract: () => void;
}

export const ProjectContractsList: React.FC<ProjectContractsListProps> = ({
    onViewContract,
    onEditContract,
    onAddContract
}) => {
    const [contracts, setContracts] = useState<ProjectContract[]>([]);
    const [filteredContracts, setFilteredContracts] = useState<ProjectContract[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [notification, setNotification] = useState({
        show: false,
        type: 'success' as 'success' | 'error',
        message: ''
    });

    useEffect(() => {
        loadContracts();
    }, []);

    useEffect(() => {
        filterContracts();
    }, [contracts, searchTerm]);

    const loadContracts = async () => {
        try {
            setLoading(true);
            const contractsData = await fetchAllProjectContracts();
            setContracts(contractsData);
        } catch (error) {
            showNotification('error', 'Failed to load project contracts. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const filterContracts = () => {
        let filtered = [...contracts];

        if (searchTerm) {
            filtered = filtered.filter(contract => {
                const projectName = typeof contract.project === 'object' ? contract.project.name : '';
                const contractorName = typeof contract.contractor === 'object' ? contract.contractor.companyName : '';
                const contractType = contract.contractType || '';

                return (
                    projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    contractorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    contractType.toLowerCase().includes(searchTerm.toLowerCase())
                );
            });
        }

        setFilteredContracts(filtered);
    };

    const handleDeleteContract = async (contractId: string, projectName: string, contractorName: string) => {
        if (!window.confirm(`Are you sure you want to delete the contract between "${projectName}" and "${contractorName}"? This action cannot be undone.`)) {
            return;
        }

        try {
            await deleteProjectContract(contractId);
            setContracts(prev => prev.filter(c => c._id !== contractId));
            showNotification('success', 'Project contract deleted successfully');
        } catch (error) {
            showNotification('error', 'Failed to delete project contract. Please try again.');
        }
    };

    const showNotification = (type: 'success' | 'error', message: string) => {
        setNotification({ show: true, type, message });
    };

    const getStatusColor = (isTerminated: boolean) => {
        return isTerminated
            ? 'text-red-600 bg-red-100'
            : 'text-green-600 bg-green-100';
    };

    const getStatusIcon = (isTerminated: boolean) => {
        return isTerminated
            ? <XCircle className="w-4 h-4" />
            : <CheckCircle className="w-4 h-4" />;
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getProjectName = (project: ProjectContract['project']) => {
        return typeof project === 'object' ? project.name : 'Unknown Project';
    };

    const getProjectCode = (project: ProjectContract['project']) => {
        return typeof project === 'object' ? project.projectCode : 'N/A';
    };

    const getContractorName = (contractor: ProjectContract['contractor']) => {
        return typeof contractor === 'object' ? contractor.companyName : 'Unknown Contractor';
    };

    const getContractorType = (contractor: ProjectContract['contractor']) => {
        return typeof contractor === 'object' ? contractor.contractorType : 'N/A';
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 py-8 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 py-8 px-4">
            <div className="max-w-7xl mx-auto">
                <Breadcrumbs />

                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Project Contracts</h1>
                        <p className="text-gray-600">Manage contracts between projects and contractors</p>
                    </div>
                    <Button
                        onClick={onAddContract}
                        className="bg-orange-600 hover:bg-orange-700"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add New Contract
                    </Button>
                </div>

                {/* Search */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search by project name, contractor, or contract type..."
                            className="pl-10"
                        />
                    </div>
                </div>

                {/* Contracts Table */}
                {filteredContracts.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
                        <Handshake className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Contracts Found</h3>
                        <p className="text-gray-600 mb-6">
                            {contracts.length === 0
                                ? "You haven't created any project contracts yet. Start by adding your first contract."
                                : "No contracts match your current search. Try adjusting your search criteria."
                            }
                        </p>
                        {contracts.length === 0 && (
                            <Button
                                onClick={onAddContract}
                                className="bg-orange-600 hover:bg-orange-700"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Create First Contract
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
                                            Project
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Contractor
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Contract Type
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Amount
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Timeline
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
                                    {filteredContracts.map((contract) => (
                                        <tr key={contract._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                                                        <Building className="w-4 h-4 text-blue-600" />
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {getProjectName(contract.project)}
                                                        </div>
                                                        <div className="text-sm text-gray-500 font-mono">
                                                            {getProjectCode(contract.project)}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                                                        <User className="w-4 h-4 text-green-600" />
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {getContractorName(contract.contractor)}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {getContractorType(contract.contractor)}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{contract.contractType}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <DollarSign className="w-4 h-4 text-gray-400 mr-1" />
                                                    <span className="text-sm font-medium text-gray-900">
                                                        {formatPKRCurrency(contract.totalAmount.toString())}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    <div className="flex items-center">
                                                        <Calendar className="w-4 h-4 text-gray-400 mr-1" />
                                                        {formatDate(contract.startDate)}
                                                    </div>
                                                    {contract.endDate && (
                                                        <div className="text-xs text-gray-500 mt-1">
                                                            to {formatDate(contract.endDate)}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(contract.isTerminated)}`}>
                                                    {getStatusIcon(contract.isTerminated)}
                                                    {contract.isTerminated ? 'Terminated' : 'Active'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => onViewContract(contract)}
                                                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => onEditContract(contract)}
                                                        className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleDeleteContract(
                                                            contract._id,
                                                            getProjectName(contract.project),
                                                            getContractorName(contract.contractor)
                                                        )}
                                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Stats Summary */}
                {contracts.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
                        <div className="bg-white rounded-xl p-6 border border-gray-200">
                            <div className="flex items-center">
                                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                                    <Handshake className="w-5 h-5 text-orange-600" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Total Contracts</p>
                                    <p className="text-2xl font-bold text-gray-900">{contracts.length}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl p-6 border border-gray-200">
                            <div className="flex items-center">
                                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                    <CheckCircle className="w-5 h-5 text-green-600" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Active Contracts</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {contracts.filter(c => !c.isTerminated).length}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl p-6 border border-gray-200">
                            <div className="flex items-center">
                                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                                    <XCircle className="w-5 h-5 text-red-600" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Terminated</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {contracts.filter(c => c.isTerminated).length}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl p-6 border border-gray-200">
                            <div className="flex items-center">
                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <DollarSign className="w-5 h-5 text-blue-600" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Total Value</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {formatPKRCurrency(contracts.reduce((sum, c) => sum + c.totalAmount, 0).toString())}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
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
