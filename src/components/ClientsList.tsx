import React, { useState, useEffect } from 'react';
import { Breadcrumbs } from './ui/Breadcrumbs';
import {
    User,
    Plus,
    Search,
    Eye,
    Edit,
    Trash2,
    Phone,
    Mail,
    MapPin,
    Building,
    CheckCircle,
    XCircle,
    Banknote,
    CreditCard
} from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Notification } from './ui/Notification';
import { DeleteConfirmationModal } from './ui/DeleteConfirmationModal';
import { getClientsPaginated, deleteClient } from '../services/clientApi';
import { updateUser } from '../services/userApi';
import { Client } from '../types/client';

interface ClientsListProps {
    onViewClient: (client: Client) => void;
    onEditClient: (client: Client) => void;
    onAddClient: () => void;
}

export const ClientsList: React.FC<ClientsListProps> = ({
    onViewClient,
    onEditClient,
    onAddClient
}) => {
    const [clients, setClients] = useState<Client[]>([]);
    const [filteredClients, setFilteredClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
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
    const [clientToDelete, setClientToDelete] = useState<Client | null>(null);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setPage(1);
        }, 500);
        return () => clearTimeout(handler);
    }, [searchTerm]);

    useEffect(() => {
        loadClients();
    }, [page, debouncedSearch, statusFilter]);

    const loadClients = async () => {
        try {
            setLoading(true);
            const params: any = { page, limit: pageSize };
            if (debouncedSearch) params.search = debouncedSearch;
            if (statusFilter !== 'All') params.status = statusFilter;

            const { data, pagination } = await getClientsPaginated(params);
            setFilteredClients(data);
            setClients(data); // Using filtered as main display array
            if (pagination) {
                setTotalPages(pagination.totalPages || 1);
                setTotalCount(pagination.total || 0);
            }
        } catch (error) {
            showNotification('error', 'Failed to load clients. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClient = (client: Client) => {
        setClientToDelete(client);
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

    const getUserName = (user: Client['user']) => {
        return user && typeof user === 'object' ? user.userName : 'Unknown User';
    };

    const getUserEmail = (user: Client['user']) => {
        return user && typeof user === 'object' ? user.email : 'N/A';
    };

    const getUserPhone = (user: Client['user']) => {
        return user && typeof user === 'object' ? user.phoneNumber : 'N/A';
    };

    const getUserAddress = (user: Client['user']) => {
        return user && typeof user === 'object' ? user.address : 'N/A';
    };

    const getUserStatus = (user: Client['user']) => {
        return user && typeof user === 'object' ? user.status : 'Unknown';
    };

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <Breadcrumbs />

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">All Clients</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage customer accounts and contact information</p>
                </div>
                <Button
                    onClick={onAddClient}
                    variant="primary"
                    size="md"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Add New Client
                </Button>
            </div>

            {/* Search and Filters Card */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search by name, email, phone, or address..."
                            className="pl-10"
                        />
                    </div>
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <select
                            value={statusFilter}
                            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                            className="w-full md:w-auto px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                        >
                            <option value="All">All Status</option>
                            <option value="Active">Active</option>
                            <option value="InActive">Inactive</option>
                        </select>
                    </div>
                </div>
            </div>

                {/* Clients Table */}
                {filteredClients.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
                        <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Clients Found</h3>
                        {totalCount === 0 && (
                            <Button
                                onClick={onAddClient}
                                className="bg-green-600 hover:bg-green-700"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Add First Client
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
                                            Client Info
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Contact Details
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Payment Info
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
                                    {filteredClients.map((client) => (
                                        <tr key={client._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                                                        <User className="w-5 h-5 text-green-600" />
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {getUserName(client.user)}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            ID: {client._id.slice(-8)}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="space-y-1">
                                                    <div className="flex items-center text-sm text-gray-900">
                                                        <Mail className="w-4 h-4 text-gray-400 mr-2" />
                                                        {getUserEmail(client.user)}
                                                    </div>
                                                    <div className="flex items-center text-sm text-gray-500">
                                                        <Phone className="w-4 h-4 text-gray-400 mr-2" />
                                                        {client.phoneNumber || getUserPhone(client.user) || 'N/A'}
                                                    </div>
                                                    <div className="flex items-center text-sm text-gray-500">
                                                        <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                                                        {client.address || getUserAddress(client.user) || 'N/A'}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="space-y-1">
                                                    <div className="flex items-center text-sm text-gray-900">
                                                        <Banknote className="w-4 h-4 text-gray-400 mr-2" />
                                                        <span className="truncate max-w-32">
                                                            {client.paymentTerms || 'N/A'}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center text-sm text-gray-500">
                                                        <CreditCard className="w-4 h-4 text-gray-400 mr-2" />
                                                        <span className="truncate max-w-32">
                                                            {client.bankDetails || 'N/A'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="space-y-1">
                                                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(getUserStatus(client.user) === 'Active')}`}>
                                                        {getStatusIcon(getUserStatus(client.user) === 'Active')}
                                                        {getUserStatus(client.user) === 'Active' ? 'Active' : 'Inactive'}
                                                    </span>
                                                    <div className="text-xs text-gray-500">
                                                        User: {getUserStatus(client.user)}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => onViewClient(client)}
                                                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => onEditClient(client)}
                                                        className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleDeleteClient(client)}
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
                        <p className="text-gray-600">Showing {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, totalCount)} of {totalCount} clients</p>
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
                {clients.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
                        <div className="bg-white rounded-xl p-6 border border-gray-200">
                            <div className="flex items-center">
                                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                    <User className="w-5 h-5 text-green-600" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Total Clients</p>
                                    <p className="text-2xl font-bold text-gray-900">{clients.length}</p>
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
                                        {clients.filter(c => getUserStatus(c.user) === 'Active').length}
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
                                        {clients.filter(c => getUserStatus(c.user) !== 'Active').length}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl p-6 border border-gray-200">
                            <div className="flex items-center">
                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <Banknote className="w-5 h-5 text-blue-600" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">With Payment Terms</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {clients.filter(c => c.paymentTerms).length}
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
                onClose={() => { setIsDeleteModalOpen(false); setClientToDelete(null); }}
                itemName={clientToDelete?.user && typeof clientToDelete.user === 'object' ? clientToDelete.user.userName : 'Unknown'}
                itemType="Client"
                isInactive={clientToDelete?.user && typeof clientToDelete.user === 'object' ? clientToDelete.user.status === 'InActive' : false}
                onConfirmDeactivate={async () => {
                    if (!clientToDelete || typeof clientToDelete.user !== 'object') return;
                    await updateUser(clientToDelete.user._id, { status: 'InActive' });
                    setNotification({ show: true, type: 'success', message: 'Client deactivated successfully' });
                    loadClients();
                }}
                onConfirmDelete={async () => {
                    if (!clientToDelete) return;
                    await deleteClient(clientToDelete._id);
                    setClients(prev => prev.filter(c => c._id !== clientToDelete._id));
                    setNotification({ show: true, type: 'success', message: 'Client permanently deleted' });
                }}
            />
        </div>
    );
};
