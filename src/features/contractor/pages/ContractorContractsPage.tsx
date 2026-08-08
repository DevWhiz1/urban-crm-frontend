import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import apiClient from '../../../services/apiClient';
import { Pagination } from '../../../components/shared/Pagination';

const fmt = (n: number | undefined) => (n != null ? `PKR ${n.toLocaleString()}` : '—');

const statusColors: Record<string, string> = {
  planning: 'bg-blue-100 text-blue-700',
  pending: 'bg-yellow-100 text-yellow-700',
  in_progress: 'bg-purple-100 text-purple-700',
  completed: 'bg-green-100 text-green-700',
  on_hold: 'bg-orange-100 text-orange-700',
};

export const ContractorContractsPage: React.FC = () => {
  const [contracts, setContracts] = useState<any[]>([]);
  const [paginationInfo, setPaginationInfo] = useState({ currentPage: 1, totalPages: 1, totalItems: 0, pageSize: 10 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    apiClient
      .get(`/api/portal/contractor/contracts?page=${page}&limit=10`)
      .then((r) => {
        setContracts(r.data.contracts || []);
        if (r.data.pagination) setPaginationInfo(r.data.pagination);
      })
      .catch((e) => setError(e?.response?.data?.message || 'Failed to load contracts.'))
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      <nav className="flex items-center text-sm text-gray-500 gap-1.5">
        <Link to="/contractor/dashboard" className="hover:text-blue-600">Dashboard</Link>
        <ChevronRight className="w-4 h-4 text-gray-400" />
        <span className="text-gray-900 font-semibold">My Contracts</span>
      </nav>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 tracking-tight">My Contracts</h1>
          <p className="text-sm text-gray-500 mt-1">All assigned projects and contracts</p>
        </div>
      </div>

      {loading && (
        <div className="bg-white rounded-lg border border-gray-200 p-10 flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      )}

      {!loading && error && (
        <div className="bg-white rounded-lg border border-gray-200 p-10 text-center text-gray-500">{error}</div>
      )}

      {!loading && !error && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
            <h2 className="text-sm font-semibold text-gray-900">Contract List</h2>
            <span className="text-xs text-gray-400">{paginationInfo.totalItems} contract{paginationInfo.totalItems !== 1 ? 's' : ''}</span>
          </div>

          {contracts.length === 0 ? (
            <div className="p-10 text-center">
              <p className="text-gray-400 text-sm">No contracts found.</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">#</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Project</th>
                      <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Total Value</th>
                      <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Received</th>
                      <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Pending</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Project Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {contracts.map((contract, idx) => (
                      <tr key={contract.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-3.5 text-gray-400 text-xs">
                          {(paginationInfo.currentPage - 1) * paginationInfo.pageSize + idx + 1}
                        </td>
                        <td className="px-5 py-3.5">
                          <div>
                            <p className="font-medium text-gray-800 text-sm">
                              {contract.project?.name || '—'}
                            </p>
                            <p className="text-xs text-gray-400 font-mono mt-0.5">
                              {contract.project?.projectCode || ''} • {contract.contractType}
                            </p>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-right font-semibold text-gray-800">
                          {fmt(contract.totalAmount)}
                        </td>
                        <td className="px-5 py-3.5 text-right font-semibold text-green-600">
                          {fmt(contract.totalReceived)}
                        </td>
                        <td className="px-5 py-3.5 text-right font-semibold text-orange-500">
                          {fmt(contract.pendingBalance)}
                        </td>
                        <td className="px-5 py-3.5">
                          {contract.isTerminated ? (
                            <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                              Terminated
                            </span>
                          ) : (
                            <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                              Active
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3.5">
                          {contract.project?.status ? (
                            <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                              statusColors[contract.project.status] || 'bg-gray-100 text-gray-600'
                            }`}>
                              {contract.project.status.replace('_', ' ')}
                            </span>
                          ) : '—'}
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
