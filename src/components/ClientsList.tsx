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
import { fetchAllClients, deleteClient } from '../services/clientApi';
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
    const [notification, setNotification] = useState({
        show: false,
        type: 'success' as 'success' | 'error',
        message: ''
    });

    useEffect(() => {
        loadClients();
    }, []);

    useEffect(() => {
        filterClients();
    }, [clients, searchTerm]);

    const loadClients = async () => {
        try {
            setLoading(true);
            const clientsData = await fetchAllClients();
            setClients(clientsData);
        } catch (error) {
            showNotification('error', 'Failed to load clients. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const filterClients = () => {
        let filtered = [...clients];

        if (searchTerm) {
            filtered = filtered.filter(client => {
                const userName = typeof client.user === 'object' ? client.user.userName : '';
                const email = typeof client.user === 'object' ? client.user.email : '';
                const phoneNumber = client.phoneNumber || '';
                const address = client.address || '';

                return (
                    userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    phoneNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    address.toLowerCase().includes(searchTerm.toLowerCase())
                );
            });
        }

        setFilteredClients(filtered);
    };

    const handleDeleteClient = async (clientId: string, userName: string) => {
        if (!window.confirm(`Are you sure you want to delete "${userName}"? This action cannot be undone.`)) {
            return;
        }

        try {
            await deleteClient(clientId);
            setClients(prev => prev.filter(c => c._id !== clientId));
            showNotification('success', 'Client deleted successfully');
        } catch (error) {
            showNotification('error', 'Failed to delete client. Please try again.');
        }
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
        return typeof user === 'object' ? user.userName : 'Unknown User';
    };

    const getUserEmail = (user: Client['user']) => {
        return typeof user === 'object' ? user.email : 'N/A';
    };

    const getUserPhone = (user: Client['user']) => {
        return typeof user === 'object' ? user.phoneNumber : 'N/A';
    };

    const getUserAddress = (user: Client['user']) => {
        return typeof user === 'object' ? user.address : 'N/A';
    };

    const getUserStatus = (user: Client['user']) => {
        return typeof user === 'object' ? user.status : 'Unknown';
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

            {/* Search Card */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search by name, email, phone, or address..."
                            className="pl-10"
                        />
                    </div>
                </div>

                {/* Clients Table */}
                {filteredClients.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
                        <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Clients Found</h3>
                        <p className="text-gray-600 mb-6">
                            {clients.length === 0
                                ? "You haven't added any clients yet. Start by adding your first client."
                                : "No clients match your current search. Try adjusting your search criteria."
                            }
                        </p>
                        {clients.length === 0 && (
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
                                                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(client.isActive)}`}>
                                                        {getStatusIcon(client.isActive)}
                                                        {client.isActive ? 'Active' : 'Inactive'}
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
                                                        onClick={() => handleDeleteClient(
                                                            client._id,
                                                            getUserName(client.user)
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
                                        {clients.filter(c => c.isActive).length}
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
                                        {clients.filter(c => !c.isActive).length}
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
            </div>
    );
};
