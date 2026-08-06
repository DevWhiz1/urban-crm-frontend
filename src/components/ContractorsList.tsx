import React, { useState, useEffect } from 'react';
import { Breadcrumbs } from './ui/Breadcrumbs';
import {
    Wrench,
    Plus,
    Search,
    Eye,
    Edit,
    Trash2,
    Phone,
    Mail,
    MapPin,
    Building,
    Star,
    CheckCircle,
    XCircle,
    User
} from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Notification } from './ui/Notification';
import { DeleteConfirmationModal } from './ui/DeleteConfirmationModal';
import { getContractorsPaginated, deleteContractor } from '../services/contractorApi';
import { updateUser } from '../services/userApi';
import { Contractor } from '../types/contractor';

interface ContractorsListProps {
    onViewContractor: (contractor: Contractor) => void;
    onEditContractor: (contractor: Contractor) => void;
    onAddContractor: () => void;
}

export const ContractorsList: React.FC<ContractorsListProps> = ({
    onViewContractor,
    onEditContractor,
    onAddContractor
}) => {
    const [contractors, setContractors] = useState<Contractor[]>([]);
    const [filteredContractors, setFilteredContractors] = useState<Contractor[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const pageSize = 10;
    const [notification, setNotification] = useState({
        show: false,
        type: 'success' as 'success' | 'error',
        message: ''
    });
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [contractorToDelete, setContractorToDelete] = useState<Contractor | null>(null);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setPage(1);
        }, 500);
        return () => clearTimeout(handler);
    }, [searchTerm]);

    useEffect(() => {
        loadContractors();
    }, [page, debouncedSearch]);

    const loadContractors = async () => {
        try {
            setLoading(true);
            const params: any = { page, limit: pageSize };
            if (debouncedSearch) params.search = debouncedSearch;

            const { data, pagination } = await getContractorsPaginated(params);
            setFilteredContractors(data);
            setContractors(data); // Using filtered as main display array
            if (pagination) {
                setTotalPages(pagination.totalPages || 1);
                setTotalCount(pagination.total || 0);
            }
        } catch (error) {
            showNotification('error', 'Failed to load contractors. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteContractor = (contractor: Contractor) => {
        setContractorToDelete(contractor);
        setIsDeleteModalOpen(true);
    };

    const showNotification = (type: 'success' | 'error', message: string) => {
        setNotification({ show: true, type, message });
    };

    const getStatusColor = (isActive: boolean) => {
        return isActive
            ? 'text-green-600 bg-green-100'
            : 'text-red-600 bg-red-100';
    };

    const getStatusIcon = (isActive: boolean) => {
        return isActive
            ? <CheckCircle className="w-4 h-4" />
            : <XCircle className="w-4 h-4" />;
    };

    const getUserName = (user: Contractor['user']) => {
        return user && typeof user === 'object' ? user.userName : 'Unknown User';
    };

    const getUserEmail = (user: Contractor['user']) => {
        return user && typeof user === 'object' ? user.email : 'N/A';
    };

    const getUserPhone = (user: Contractor['user']) => {
        return user && typeof user === 'object' ? user.phoneNumber : 'N/A';
    };

    const getUserAddress = (user: Contractor['user']) => {
        return user && typeof user === 'object' ? user.address : 'N/A';
    };

    const getUserStatus = (user: Contractor['user']) => {
        return user && typeof user === 'object' ? user.status : 'Unknown';
    };



    if (loading) {
        return (
            <div className="max-w-7xl mx-auto flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <Breadcrumbs />

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">All Contractors</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage contractor profiles, types, and assignment details</p>
                </div>
                <Button
                    onClick={onAddContractor}
                    variant="primary"
                    size="md"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Add New Contractor
                </Button>
            </div>

            {/* Search Card */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search by company name, type, user name, or email..."
                            className="pl-10"
                        />
                    </div>
                </div>

                {/* Contractors Table */}
                {filteredContractors.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
                        <Wrench className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Contractors Found</h3>
                        {totalCount === 0 && (
                            <Button
                                onClick={onAddContractor}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Add First Contractor
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
                                            Company & User
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Contact Info
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Type
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
                                    {filteredContractors.map((contractor) => (
                                        <tr key={contractor._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                                                        <Building className="w-5 h-5 text-blue-600" />
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {contractor.companyName || 'N/A'}
                                                        </div>
                                                        <div className="text-sm text-gray-500 flex items-center gap-1">
                                                            <User className="w-3 h-3" />
                                                            {getUserName(contractor.user)}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="space-y-1">
                                                    <div className="flex items-center text-sm text-gray-900">
                                                        <Mail className="w-4 h-4 text-gray-400 mr-2" />
                                                        {getUserEmail(contractor.user)}
                                                    </div>
                                                    <div className="flex items-center text-sm text-gray-500">
                                                        <Phone className="w-4 h-4 text-gray-400 mr-2" />
                                                        {contractor.phoneNumber || getUserPhone(contractor.user) || 'N/A'}
                                                    </div>
                                                    <div className="flex items-center text-sm text-gray-500">
                                                        <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                                                        {contractor.address || getUserAddress(contractor.user) || 'N/A'}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="space-y-2">
                                                    <div className="text-sm text-gray-900 capitalize">
                                                        {contractor.contractorType || 'N/A'}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="space-y-1">
                                                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(getUserStatus(contractor.user) === 'Active')}`}>
                                                        {getStatusIcon(getUserStatus(contractor.user) === 'Active')}
                                                        {getUserStatus(contractor.user) === 'Active' ? 'Active' : 'Inactive'}
                                                    </span>
                                                    <div className="text-xs text-gray-500">
                                                        User: {getUserStatus(contractor.user)}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => onViewContractor(contractor)}
                                                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => onEditContractor(contractor)}
                                                        className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleDeleteContractor(contractor)}
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

                {/* Pagination Controls */}
                {totalCount > 0 && (
                    <div className="flex flex-col md:flex-row items-center justify-between mt-6 gap-4 text-sm bg-white p-4 rounded-xl border border-gray-200">
                        <p className="text-gray-600">Showing {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, totalCount)} of {totalCount} contractors</p>
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
                {contractors.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
                        <div className="bg-white rounded-xl p-6 border border-gray-200">
                            <div className="flex items-center">
                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <Wrench className="w-5 h-5 text-blue-600" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Total Contractors</p>
                                    <p className="text-2xl font-bold text-gray-900">{contractors.length}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl p-6 border border-gray-200">
                            <div className="flex items-center">
                                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                    <CheckCircle className="w-5 h-5 text-green-600" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Active</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {contractors.filter(c => getUserStatus(c.user) === 'Active').length}
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
                                    <p className="text-sm font-medium text-gray-600">Inactive</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {contractors.filter(c => getUserStatus(c.user) !== 'Active').length}
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
                isOpen={isDeleteModalOpen}
                onClose={() => { setIsDeleteModalOpen(false); setContractorToDelete(null); }}
                itemName={contractorToDelete?.companyName || 'Unknown'}
                itemType="Contractor"
                isInactive={contractorToDelete?.user && typeof contractorToDelete.user === 'object' ? contractorToDelete.user.status === 'InActive' : false}
                onConfirmDeactivate={async () => {
                    if (!contractorToDelete || typeof contractorToDelete.user !== 'object') return;
                    await updateUser(contractorToDelete.user._id, { status: 'InActive' });
                    setNotification({ show: true, type: 'success', message: 'Contractor deactivated successfully' });
                    loadContractors();
                }}
                onConfirmDelete={async () => {
                    if (!contractorToDelete) return;
                    await deleteContractor(contractorToDelete._id);
                    setContractors(prev => prev.filter(c => c._id !== contractorToDelete._id));
                    setNotification({ show: true, type: 'success', message: 'Contractor permanently deleted' });
                }}
            />
        </div>
    );
};
