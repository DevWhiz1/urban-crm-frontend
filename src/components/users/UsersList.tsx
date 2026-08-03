import React, { useEffect, useMemo, useState } from 'react';
import { Breadcrumbs } from '../ui/Breadcrumbs';
import { User, Search, RefreshCw, ArrowUpDown, ChevronsLeft, ChevronsRight, Plus, Edit, Trash2, AlertTriangle } from 'lucide-react';
import { Notification } from '../ui/Notification';
import { Button } from '../ui/Button';
import { getAllUsers, updateUser, deleteUser } from '../../services/userApi';
import { EditUserModal } from './EditUserModal';

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
    const [roleFilter, setRoleFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All');
    
    const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    
    const [deletePhase, setDeletePhase] = useState(0); 
    // 0: none, 1: deactivate confirm 1, 2: deactivate confirm 2, 3: permanent delete confirm 1, 4: permanent delete confirm 2
    const [userToDelete, setUserToDelete] = useState<UserType | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const [sortKey, setSortKey] = useState<keyof UserType>('createdAt');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
    const [page, setPage] = useState(1);
    const pageSize = 10;

    const loadUsers = async () => {
        setLoading(true);
        try {
            const data = await getAllUsers();
            setUsers(data);
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
    }, []);

    const filtered = useMemo(() => {
        const term = search.toLowerCase();
        return users.filter(u => {
            const matchesSearch = u.userName.toLowerCase().includes(term) ||
                u.email.toLowerCase().includes(term) ||
                u.role.toLowerCase().includes(term) ||
                u.status.toLowerCase().includes(term);
            const matchesRole = roleFilter === 'All' || u.role === roleFilter;
            const matchesStatus = statusFilter === 'All' || u.status === statusFilter;
            return matchesSearch && matchesRole && matchesStatus;
        });
    }, [users, search, roleFilter, statusFilter]);

    const sorted = useMemo(() => {
        return [...filtered].sort((a, b) => {
            const av = a[sortKey] || '';
            const bv = b[sortKey] || '';
            if (av === bv) return 0;
            if (sortDir === 'asc') return av > bv ? 1 : -1;
            return av < bv ? 1 : -1;
        });
    }, [filtered, sortKey, sortDir]);

    const paginated = useMemo(() => {
        const start = (page - 1) * pageSize;
        return sorted.slice(start, start + pageSize);
    }, [sorted, page]);

    const totalPages = Math.ceil(sorted.length / pageSize) || 1;

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
                            onChange={e => { setSearch(e.target.value); setPage(1); }}
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
                        ) : paginated.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="py-8 text-center text-gray-500">No users found.</td>
                            </tr>
                        ) : (
                            paginated.map(user => (
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
                                            {user.status === 'InActive' ? (
                                                <button 
                                                    onClick={() => { setUserToDelete(user); setDeletePhase(3); }}
                                                    className="p-1 text-red-700 hover:bg-red-100 rounded transition-colors font-bold flex items-center justify-center"
                                                    title="Permanently Delete User"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            ) : (
                                                <button 
                                                    onClick={() => { setUserToDelete(user); setDeletePhase(1); }}
                                                    className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                                                    title="Deactivate User"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            <div className="flex flex-col md:flex-row items-center justify-between mt-4 gap-4 text-sm">
                <p className="text-gray-600">Showing {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, sorted.length)} of {sorted.length} users</p>
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

            {/* Delete/Deactivate Confirmation Modal */}
            {deletePhase > 0 && userToDelete && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setDeletePhase(0)}></div>
                        <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden border border-gray-200 shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full">
                            <div className="p-6">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${deletePhase === 1 || deletePhase === 3 ? 'bg-orange-100' : 'bg-red-100'}`}>
                                        <AlertTriangle className={`w-6 h-6 ${deletePhase === 1 || deletePhase === 3 ? 'text-orange-600' : 'text-red-600'}`} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            {deletePhase === 1 ? 'Deactivate User?' : 
                                             deletePhase === 2 ? 'Are you absolutely sure?' :
                                             deletePhase === 3 ? 'Permanently Delete User?' :
                                             'WARNING: Permanent Action'}
                                        </h3>
                                        <p className="text-sm text-gray-500 mt-1">
                                            {deletePhase === 1 ? `Are you sure you want to deactivate ${userToDelete.userName}? They will no longer be able to access the system.` : 
                                             deletePhase === 2 ? `This action will mark ${userToDelete.userName} as Inactive.` :
                                             deletePhase === 3 ? `Are you sure you want to PERMANENTLY delete ${userToDelete.userName} from the database?` :
                                             `This action CANNOT BE UNDONE. ${userToDelete.userName} will be completely wiped from the system.`}
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-6 flex justify-end gap-3">
                                    <Button variant="outline" onClick={() => setDeletePhase(0)} disabled={isDeleting}>
                                        Cancel
                                    </Button>
                                    {deletePhase === 1 || deletePhase === 3 ? (
                                        <Button className="bg-orange-600 hover:bg-orange-700 text-white" onClick={() => setDeletePhase(deletePhase + 1)}>
                                            Yes, proceed
                                        </Button>
                                    ) : (
                                        <Button className="bg-red-600 hover:bg-red-700 text-white" loading={isDeleting} onClick={async () => {
                                            try {
                                                setIsDeleting(true);
                                                if (deletePhase === 4) {
                                                    await deleteUser(userToDelete._id);
                                                    setNotification({ show: true, type: 'success', message: 'User permanently deleted' });
                                                } else {
                                                    await updateUser(userToDelete._id, { status: 'InActive' });
                                                    setNotification({ show: true, type: 'success', message: 'User deactivated successfully' });
                                                }
                                                setDeletePhase(0);
                                                loadUsers();
                                            } catch(err) {
                                                setNotification({ show: true, type: 'error', message: 'Failed to perform action' });
                                            } finally {
                                                setIsDeleting(false);
                                            }
                                        }}>
                                            {deletePhase === 4 ? 'Yes, Delete Permanently' : 'Yes, Deactivate'}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    </div>
);
};