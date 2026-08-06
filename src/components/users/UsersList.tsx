import React, { useEffect, useMemo, useState } from 'react';
import { Breadcrumbs } from '../ui/Breadcrumbs';
import { User, Search, RefreshCw, ArrowUpDown, ChevronsLeft, ChevronsRight, Plus, Edit, Trash2, AlertTriangle } from 'lucide-react';
import { Notification } from '../ui/Notification';
import { Button } from '../ui/Button';
import { getAllUsers, updateUser, deleteUser } from '../../services/userApi';
import { EditUserModal } from './EditUserModal';
import { DeleteConfirmationModal } from '../ui/DeleteConfirmationModal';

interface UserType {
    _id: string;
    userName: string;
    email: string;
    role: string;
    status: string;
    plainPassword?: string;
    createdAt: string;
    updatedAt: string;
}

export const UsersList: React.FC = () => {
    const [users, setUsers] = useState<UserType[]>([]);
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState({
        show: false,
        type: 'error' as 'success' | 'error',
        message: ''
    });
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All');
    
    const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<UserType | null>(null);

    const [sortKey, setSortKey] = useState<keyof UserType>('createdAt');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const pageSize = 10;

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1);
        }, 500);
        return () => clearTimeout(handler);
    }, [search]);

    const loadUsers = async () => {
        setLoading(true);
        try {
            const params: any = { page, limit: pageSize };
            if (debouncedSearch) params.search = debouncedSearch;
            if (roleFilter !== 'All') params.role = roleFilter;
            if (statusFilter !== 'All') params.status = statusFilter;
            
            const { data, pagination } = await getAllUsers(params);
            
            // local sorting since backend doesn't support dynamic sort yet, or we can just sort the current page
            const sortedData = [...data].sort((a, b) => {
                const av = a[sortKey] || '';
                const bv = b[sortKey] || '';
                if (av === bv) return 0;
                if (sortDir === 'asc') return av > bv ? 1 : -1;
                return av < bv ? 1 : -1;
            });

            setUsers(sortedData);
            if (pagination) {
                setTotalPages(pagination.totalPages || 1);
                setTotalCount(pagination.total || 0);
            }
        } catch (error: any) {
            setNotification({
                show: true,
                type: 'error',
                message: error.message || 'Failed to fetch users'
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUsers();
    }, [page, debouncedSearch, roleFilter, statusFilter, sortKey, sortDir]);

    const toggleSort = (key: keyof UserType) => {
        if (sortKey === key) {
            setSortDir(prev => (prev === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortKey(key);
            setSortDir('asc');
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <Breadcrumbs />

            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Users & Credentials</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage system user accounts and view authorization details</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="secondary" size="sm" onClick={loadUsers}>
                        <RefreshCw className="w-4 h-4 mr-1.5" />Refresh
                    </Button>
                    <Button to="/dashboard/users/add" size="sm" variant="primary">
                        <Plus className="w-4 h-4 mr-1.5" />
                        Add User
                    </Button>
                </div>
            </div>

            <Notification
                show={notification.show}
                type={notification.type}
                message={notification.message}
                onClose={() => setNotification(prev => ({ ...prev, show: false }))}
            />

            {/* Main Content Card */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
                    <div className="relative w-full md:w-80">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search users by name, email or role..."
                            className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                    </div>
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <select
                            value={roleFilter}
                            onChange={e => { setRoleFilter(e.target.value); setPage(1); }}
                            className="w-full md:w-auto px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                        >
                            <option value="All">All Roles</option>
                            <option value="Admin">Admin</option>
                            <option value="Contractor">Contractor</option>
                            <option value="Client">Client</option>
                        </select>
                        <select
                            value={statusFilter}
                            onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
                            className="w-full md:w-auto px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                        >
                            <option value="All">All Status</option>
                            <option value="Active">Active</option>
                            <option value="InActive">Inactive</option>
                        </select>
                    </div>
                </div>
            <div className="overflow-x-auto border rounded-lg">
                <table className="min-w-full bg-white">
                    <thead>
                        <tr className="bg-gray-50 text-gray-700 text-sm">
                            <th className="py-3 px-4 text-left cursor-pointer" onClick={() => toggleSort('userName')}>Username <ArrowUpDown className="inline w-3 h-3 ml-1" /></th>
                            <th className="py-3 px-4 text-left cursor-pointer" onClick={() => toggleSort('email')}>Email <ArrowUpDown className="inline w-3 h-3 ml-1" /></th>
                            <th className="py-3 px-4 text-left">Password (Plain)</th>
                            <th className="py-3 px-4 text-left">Role</th>
                            <th className="py-3 px-4 text-left">Status</th>
                            <th className="py-3 px-4 text-left cursor-pointer" onClick={() => toggleSort('createdAt')}>Created <ArrowUpDown className="inline w-3 h-3 ml-1" /></th>
                            <th className="py-3 px-4 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                        {loading ? (
                            <tr>
                                <td colSpan={6} className="py-8 text-center text-gray-500">Loading users...</td>
                            </tr>
                        ) : users.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="py-8 text-center text-gray-500">No users found.</td>
                            </tr>
                        ) : (
                            users.map(user => (
                                <tr key={user._id} className="border-t hover:bg-blue-50/50 transition">
                                    <td className="py-2.5 px-4 font-medium">{user.userName}</td>
                                    <td className="py-2.5 px-4">{user.email}</td>
                                    <td className="py-2.5 px-4">
                                        <span className="font-mono text-xs bg-slate-100 text-slate-800 px-2.5 py-1 rounded font-semibold border border-slate-200">
                                            {user.plainPassword || 'N/A (legacy user)'}
                                        </span>
                                    </td>
                                    <td className="py-2.5 px-4">
                                        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                                            user.role === 'Admin' ? 'bg-purple-100 text-purple-700' : 
                                            user.role === 'Contractor' ? 'bg-orange-100 text-orange-700' : 
                                            'bg-emerald-100 text-emerald-700'
                                        }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="py-2.5 px-4">
                                        <span className={`px-2 py-1 rounded text-xs font-semibold ${user.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                            {user.status}
                                        </span>
                                    </td>
                                    <td className="py-2.5 px-4 text-xs text-gray-500">{new Date(user.createdAt).toLocaleDateString()}</td>
                                    <td className="py-2.5 px-4 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <button 
                                                onClick={() => { setSelectedUser(user); setIsEditModalOpen(true); }}
                                                className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                title="Edit User"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={() => { setUserToDelete(user); setIsDeleteModalOpen(true); }}
                                                className={`p-1 rounded transition-colors font-bold flex items-center justify-center ${user.status === 'InActive' ? 'text-red-700 hover:bg-red-100' : 'text-red-600 hover:bg-red-50'}`}
                                                title={user.status === 'InActive' ? "Permanently Delete User" : "Deactivate User"}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            <div className="flex flex-col md:flex-row items-center justify-between mt-4 gap-4 text-sm">
                <p className="text-gray-600">Showing {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, totalCount)} of {totalCount} users</p>
                <div className="flex items-center gap-2">
                    <Button
                        size="sm"
                        variant="secondary"
                        disabled={page === 1}
                        onClick={() => setPage(1)}
                    >
                        <ChevronsLeft className="w-4 h-4" />
                    </Button>
                    <Button
                        size="sm"
                        variant="secondary"
                        disabled={page === 1}
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                    >
                        Prev
                    </Button>
                    <span className="px-2">Page {page} / {totalPages}</span>
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
                        <ChevronsRight className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            <EditUserModal 
                isOpen={isEditModalOpen}
                onClose={() => { setIsEditModalOpen(false); setSelectedUser(null); }}
                onUpdate={loadUsers}
                user={selectedUser}
            />

            <DeleteConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => { setIsDeleteModalOpen(false); setUserToDelete(null); }}
                itemName={userToDelete?.userName || ''}
                itemType="User"
                isInactive={userToDelete?.status === 'InActive'}
                onConfirmDeactivate={async () => {
                    if (!userToDelete) return;
                    await updateUser(userToDelete._id, { status: 'InActive' });
                    setNotification({ show: true, type: 'success', message: 'User deactivated successfully' });
                    loadUsers();
                }}
                onConfirmDelete={async () => {
                    if (!userToDelete) return;
                    await deleteUser(userToDelete._id);
                    setNotification({ show: true, type: 'success', message: 'User permanently deleted' });
                    loadUsers();
                }}
            />
        </div>
    </div>
);
};