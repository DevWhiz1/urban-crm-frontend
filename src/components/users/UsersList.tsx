import React, { useEffect, useMemo, useState } from 'react';
import { User, Search, RefreshCw, ArrowUpDown, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Notification } from '../ui/Notification';
import { Button } from '../ui/Button';
import { getAllUsers } from '../../services/userApi';
import { Input } from '../ui/Input';

interface UserType {
  _id: string;
  userName: string;
  email: string;
  role: string;
  status: string;
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
    return users.filter(u =>
      u.userName.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term) ||
      u.role.toLowerCase().includes(term) ||
      u.status.toLowerCase().includes(term)
    );
  }, [users, search]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
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
    <div className="max-w-4xl mx-auto p-8 bg-white rounded-2xl shadow-xl border border-gray-100">
      <div className="flex items-center mb-6">
        <User className="w-8 h-8 text-blue-600 mr-3" />
        <h2 className="text-2xl font-bold text-gray-900">All Users</h2>
      </div>
      <Notification
        show={notification.show}
        type={notification.type}
        message={notification.message}
        onClose={() => setNotification(prev => ({ ...prev, show: false }))}
      />
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search users..."
            className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={loadUsers}>
            <RefreshCw className="w-4 h-4 mr-1" />Refresh
          </Button>
          <Button to="/dashboard/users/add" size="sm" variant="primary">
            Add User
          </Button>
        </div>
      </div>
      <div className="overflow-x-auto border rounded-lg">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="bg-gray-50 text-gray-700 text-sm">
              <th className="py-3 px-4 text-left cursor-pointer" onClick={() => toggleSort('userName')}>Username <ArrowUpDown className="inline w-3 h-3 ml-1" /></th>
              <th className="py-3 px-4 text-left cursor-pointer" onClick={() => toggleSort('email')}>Email <ArrowUpDown className="inline w-3 h-3 ml-1" /></th>
              <th className="py-3 px-4 text-left">Role</th>
              <th className="py-3 px-4 text-left">Status</th>
              <th className="py-3 px-4 text-left cursor-pointer" onClick={() => toggleSort('createdAt')}>Created <ArrowUpDown className="inline w-3 h-3 ml-1" /></th>
              <th className="py-3 px-4 text-left cursor-pointer" onClick={() => toggleSort('updatedAt')}>Updated <ArrowUpDown className="inline w-3 h-3 ml-1" /></th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {loading ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-500">Loading...</td>
              </tr>
            ) : paginated.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-gray-500">No users found.</td>
              </tr>
            ) : (
              paginated.map(user => (
                <tr key={user._id} className="border-t hover:bg-blue-50/50 transition">
                  <td className="py-2.5 px-4 font-medium">{user.userName}</td>
                  <td className="py-2.5 px-4">{user.email}</td>
                  <td className="py-2.5 px-4">{user.role}</td>
                  <td className="py-2.5 px-4">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${user.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-4">{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td className="py-2.5 px-4">{new Date(user.updatedAt).toLocaleDateString()}</td>
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
      <div className="mt-6 flex justify-end">
        <Button to="/dashboard/users/add" size="md" variant="primary">
          Add User
        </Button>
      </div>
    </div>
  );
};