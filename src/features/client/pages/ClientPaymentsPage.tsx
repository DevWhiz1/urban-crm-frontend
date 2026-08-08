import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Filter } from 'lucide-react';
import apiClient from '../../../services/apiClient';
import { Pagination } from '../../../components/shared/Pagination';

const fmt = (n: number | undefined) => (n != null ? `PKR ${n.toLocaleString()}` : '—');
const fmtDate = (d: string | undefined) =>
  d ? new Date(d).toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const methodLabel: Record<string, string> = {
  cash: 'Cash',
  check: 'Cheque',
  bank_transfer: 'Bank Transfer',
  upi: 'UPI',
  digital_wallet: 'Digital Wallet',
  online: 'Online',
};

const statusColors: Record<string, string> = {
  paid: 'bg-green-100 text-green-700',
  verified: 'bg-emerald-100 text-emerald-700',
  pending: 'bg-yellow-100 text-yellow-700',
  disputed: 'bg-orange-100 text-orange-700',
  rejected: 'bg-red-100 text-red-700',
};

const uniqueStatuses = ['paid', 'verified', 'pending', 'disputed', 'rejected'];
const uniqueMethods = ['cash', 'check', 'bank_transfer', 'upi', 'digital_wallet', 'online'];

export const ClientPaymentsPage: React.FC = () => {
  const [summary, setSummary] = useState<any>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [paginationInfo, setPaginationInfo] = useState({ currentPage: 1, totalPages: 1, totalItems: 0, pageSize: 10 });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters & Pagination State
  const [statusFilter, setStatusFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date_desc');
  const [page, setPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({
      page: page.toString(),
      limit: '10',
      status: statusFilter,
      method: methodFilter,
      sortBy
    });

    apiClient
      .get(`/api/portal/client/payments?${params.toString()}`)
      .then((r) => {
        setSummary(r.data.summary);
        setPayments(r.data.payments || []);
        if (r.data.pagination) setPaginationInfo(r.data.pagination);
      })
      .catch((e) => setError(e?.response?.data?.message || 'Failed to load payments.'))
      .finally(() => setLoading(false));
  }, [page, statusFilter, methodFilter, sortBy]);

  const handleFilterChange = (setter: React.Dispatch<React.SetStateAction<string>>, value: string) => {
    setter(value);
    setPage(1); // Reset to page 1 on filter change
  };

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      {/* Breadcrumb */}
      <nav className="flex items-center text-sm text-gray-500 gap-1.5">
        <Link to="/client/dashboard" className="hover:text-blue-600">Dashboard</Link>
        <ChevronRight className="w-4 h-4 text-gray-400" />
        <span className="text-gray-900 font-semibold">Payments</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 tracking-tight">Payments</h1>
          <p className="text-sm text-gray-500 mt-1">
            {summary ? `${summary.projectName} — ${summary.projectCode}` : 'Payment History'}
          </p>
        </div>
      </div>

      {/* Summary row */}
      {!loading && summary && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-white rounded-lg border border-gray-200 px-5 py-4">
            <p className="text-xs text-gray-500 font-medium">Total Project Cost</p>
            <p className="text-lg font-bold text-gray-800 mt-1">{fmt(summary.totalCost)}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 px-5 py-4">
            <p className="text-xs text-gray-500 font-medium">Total Received</p>
            <p className="text-lg font-bold text-green-700 mt-1">{fmt(summary.totalReceived)}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 px-5 py-4">
            <p className="text-xs text-gray-500 font-medium">Pending Balance</p>
            <p className={`text-lg font-bold mt-1 ${summary.pendingBalance > 0 ? 'text-orange-600' : 'text-gray-800'}`}>
              {fmt(summary.pendingBalance)}
            </p>
          </div>
        </div>
      )}

      {loading && (
        <div className="bg-white rounded-lg border border-gray-200 p-10 flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      )}

      {!loading && error && (
        <div className="bg-white rounded-lg border border-gray-200 p-10 text-center text-gray-500">{error}</div>
      )}

      {/* Filters and Table */}
      {!loading && !error && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          
          {/* Filters Bar */}
          <div className="px-5 py-3 border-b border-gray-100 bg-gray-50 flex flex-col sm:flex-row sm:items-center justify-start gap-6">
            <div className="flex items-center gap-2 text-sm text-gray-600 font-medium whitespace-nowrap">
              <Filter className="w-4 h-4 text-gray-400" />
              <span>Filters</span>
            </div>
            <div className="flex flex-wrap items-center gap-3 w-full">
              <select
                value={statusFilter}
                onChange={(e) => handleFilterChange(setStatusFilter, e.target.value)}
                className="bg-white border border-gray-300 text-gray-700 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 py-1.5 px-3"
              >
                <option value="all">All Statuses</option>
                {uniqueStatuses.map(s => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
              
              <select
                value={methodFilter}
                onChange={(e) => handleFilterChange(setMethodFilter, e.target.value)}
                className="bg-white border border-gray-300 text-gray-700 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 py-1.5 px-3"
              >
                <option value="all">All Methods</option>
                {uniqueMethods.map(m => (
                  <option key={m} value={m}>{methodLabel[m] || m}</option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => handleFilterChange(setSortBy, e.target.value)}
                className="bg-white border border-gray-300 text-gray-700 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 py-1.5 px-3"
              >
                <option value="date_desc">Date: Newest First</option>
                <option value="date_asc">Date: Oldest First</option>
                <option value="amount_desc">Amount: High to Low</option>
                <option value="amount_asc">Amount: Low to High</option>
              </select>
            </div>
          </div>

          {payments.length === 0 ? (
            <div className="p-10 text-center">
              <p className="text-gray-400 text-sm">No payments found matching the filters.</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-white border-b border-gray-100">
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">#</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Payment ID</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</th>
                      <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Amount</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Method</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Ref.</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {payments.map((payment, idx) => (
                      <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-3.5 text-gray-400 text-xs">
                          {(paginationInfo.currentPage - 1) * paginationInfo.pageSize + idx + 1}
                        </td>
                        <td className="px-5 py-3.5 font-mono text-xs text-gray-600">
                          {payment.paymentId || '—'}
                        </td>
                        <td className="px-5 py-3.5 text-gray-700">{fmtDate(payment.date)}</td>
                        <td className="px-5 py-3.5 text-right font-semibold text-gray-800">
                          {fmt(payment.amount)}
                        </td>
                        <td className="px-5 py-3.5 text-gray-600">
                          {methodLabel[payment.paymentMethod] || payment.paymentMethod || '—'}
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                            statusColors[payment.status] || 'bg-gray-100 text-gray-600'
                          }`}>
                            {payment.status}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-gray-400 text-xs font-mono">
                          {payment.transactionId || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination
                currentPage={paginationInfo.currentPage}
                totalPages={paginationInfo.totalPages}
                totalItems={paginationInfo.totalItems}
                pageSize={paginationInfo.pageSize}
                onPageChange={setPage}
              />
            </>
          )}
        </div>
      )}
    </div>
  );
};
