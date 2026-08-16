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
    Truck,
    CheckCircle,
    XCircle,
    Banknote,
    CreditCard
} from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Notification } from './ui/Notification';
import { DeleteConfirmationModal } from './ui/DeleteConfirmationModal';
import { getSuppliersPaginated, deleteSupplier } from '../services/supplierApi';
import { updateUser } from '../services/userApi';
import { Supplier } from '../types/supplier';

interface SuppliersListProps {
    onViewSupplier: (supplier: Supplier) => void;
    onEditSupplier: (supplier: Supplier) => void;
    onAddSupplier: () => void;
    refreshTrigger?: number;
}

export const SuppliersList: React.FC<SuppliersListProps> = ({
    onViewSupplier,
    onEditSupplier,
    onAddSupplier,
    refreshTrigger = 0
}) => {
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [filteredSuppliers, setFilteredSuppliers] = useState<Supplier[]>([]);
    const [loading, setLoading] = useState(false);
    const [initialLoad, setInitialLoad] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [typeFilter, setTypeFilter] = useState('All');
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
    const [supplierToDelete, setSupplierToDelete] = useState<Supplier | null>(null);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setPage(1);
        }, 500);
        return () => clearTimeout(handler);
    }, [searchTerm]);

    useEffect(() => {
        loadSuppliers();
    }, [page, debouncedSearch, statusFilter, typeFilter, refreshTrigger]);

    const loadSuppliers = async () => {
        try {
            setLoading(true);
            const params: any = { page, limit: pageSize };
            if (debouncedSearch) params.search = debouncedSearch;
            if (statusFilter !== 'All') params.status = statusFilter;
            if (typeFilter !== 'All') params.supplierType = typeFilter;

            const { data, pagination } = await getSuppliersPaginated(params);
            setFilteredSuppliers(data);
            setSuppliers(data);
            if (pagination) {
                setTotalPages(pagination.totalPages || 1);
                setTotalCount(pagination.total || 0);
            }
        } catch (error) {
            showNotification('error', 'Failed to load suppliers. Please try again.');
        } finally {
            setLoading(false);
            setInitialLoad(false);
        }
    };

    const handleDeleteSupplier = (supplier: Supplier) => {
        setSupplierToDelete(supplier);
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

    const getUserName = (user: Supplier['user']) => {
        return user && typeof user === 'object' ? user.userName : 'Unknown User';
    };

    const getUserEmail = (user: Supplier['user']) => {
        return user && typeof user === 'object' ? user.email : 'N/A';
    };

    const getUserPhone = (user: Supplier['user']) => {
        return user && typeof user === 'object' ? user.phoneNumber : 'N/A';
    };

    const getUserAddress = (user: Supplier['user']) => {
        return user && typeof user === 'object' ? user.address : 'N/A';
    };

    const getUserStatus = (user: Supplier['user']) => {
        return user && typeof user === 'object' ? user.status : 'Unknown';
    };

    if (initialLoad) {
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
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">All Suppliers</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage supplier accounts and materials</p>
                </div>
                <Button
                    onClick={onAddSupplier}
                    variant="primary"
                    size="md"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Add New Supplier
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
                            placeholder="Search by company name, type, email..."
                            className="pl-10"
                        />
                    </div>
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <select
                            value={typeFilter}
                            onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
                            className="w-full md:w-auto px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                        >
                            <option value="All">All Types</option>
                            <option value="Steel">Steel</option>
                            <option value="Cement">Cement</option>
                            <option value="Bricks">Bricks</option>
                            <option value="Gravel">Gravel</option>
                            <option value="Sand">Sand</option>
                            <option value="Wood">Wood</option>
                            <option value="Glass">Glass</option>
                            <option value="Tiles">Tiles</option>
                            <option value="Paint">Paint</option>
                            <option value="Plumbing">Plumbing</option>
                            <option value="Electrical">Electrical</option>
                            <option value="Other">Other</option>
                        </select>
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

                {/* Suppliers Table */}
                {filteredSuppliers.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
                        <Truck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Suppliers Found</h3>
                        {totalCount === 0 && (
                            <Button
                                onClick={onAddSupplier}
                                className="bg-green-600 hover:bg-green-700"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Add First Supplier
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
                                            Supplier Info
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Contact Details
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Business Info
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
                                    {filteredSuppliers.map((supplier) => (
                                        <tr key={supplier._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center mr-4">
                                                        <Truck className="w-5 h-5 text-amber-600" />
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {supplier.companyName || getUserName(supplier.user)}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            User: {getUserName(supplier.user)}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="space-y-1">
                                                    <div className="flex items-center text-sm text-gray-900">
                                                        <Mail className="w-4 h-4 text-gray-400 mr-2" />
                                                        {getUserEmail(supplier.user)}
                                                    </div>
                                                    <div className="flex items-center text-sm text-gray-500">
                                                        <Phone className="w-4 h-4 text-gray-400 mr-2" />
                                                        {supplier.phoneNumber || getUserPhone(supplier.user) || 'N/A'}
                                                    </div>
                                                    <div className="flex items-center text-sm text-gray-500">
                                                        <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                                                        {supplier.address || getUserAddress(supplier.user) || 'N/A'}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="space-y-1">
                                                    <div className="flex items-center text-sm text-gray-900">
                                                        <span className="font-semibold text-gray-700 mr-2">Type:</span>
                                                        <span className="truncate max-w-32 capitalize">
                                                            {supplier.supplierType || 'N/A'}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center text-sm text-gray-500">
                                                        <Banknote className="w-4 h-4 text-gray-400 mr-2" />
                                                        <span className="truncate max-w-32">
                                                            {supplier.paymentTerms || 'N/A'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="space-y-1">
                                                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(getUserStatus(supplier.user) === 'Active')}`}>
                                                        {getStatusIcon(getUserStatus(supplier.user) === 'Active')}
                                                        {getUserStatus(supplier.user) === 'Active' ? 'Active' : 'Inactive'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => onViewSupplier(supplier)}
                                                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => onEditSupplier(supplier)}
                                                        className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleDeleteSupplier(supplier)}
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
                        <p className="text-gray-600">Showing {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, totalCount)} of {totalCount} suppliers</p>
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

                <Notification
                    show={notification.show}
                    type={notification.type}
                    message={notification.message}
                    onClose={() => setNotification(prev => ({ ...prev, show: false }))}
                />
                <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => { setIsDeleteModalOpen(false); setSupplierToDelete(null); }}
                itemName={supplierToDelete?.companyName || (supplierToDelete?.user && typeof supplierToDelete.user === 'object' ? supplierToDelete.user.userName : 'Unknown')}
                itemType="Supplier"
                isInactive={supplierToDelete?.user && typeof supplierToDelete.user === 'object' ? supplierToDelete.user.status === 'InActive' : false}
                onConfirmDeactivate={async () => {
                    if (!supplierToDelete || typeof supplierToDelete.user !== 'object') return;
                    await updateUser(supplierToDelete.user._id, { status: 'InActive' });
                    setNotification({ show: true, type: 'success', message: 'Supplier deactivated successfully' });
                    loadSuppliers();
                }}
                onConfirmDelete={async () => {
                    if (!supplierToDelete) return;
                    await deleteSupplier(supplierToDelete._id);
                    setSuppliers(prev => prev.filter(s => s._id !== supplierToDelete._id));
                    setNotification({ show: true, type: 'success', message: 'Supplier permanently deleted' });
                }}
            />
        </div>
    );
};
