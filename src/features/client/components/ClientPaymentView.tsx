import React from 'react';
import { DollarSign, CheckCircle, Clock, TrendingDown, Receipt } from 'lucide-react';
import { useClientPayments } from '../hooks/useClientPayments';

const formatCurrency = (n: number | undefined) =>
  n != null ? `PKR ${n.toLocaleString()}` : '—';

const formatDate = (d: string | undefined) =>
  d ? new Date(d).toLocaleDateString('en-PK', { year: 'numeric', month: 'short', day: 'numeric' }) : '—';

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

export const ClientPaymentView: React.FC = () => {
  const { summary, payments, loading, error } = useClientPayments();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
          <p className="text-sm text-gray-500">Loading payments...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-500 text-5xl mb-4">⚠</div>
          <p className="text-gray-700 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Summary Cards */}
      {summary && (
        <>
          <div className="bg-gradient-to-r from-slate-700 to-slate-900 rounded-2xl p-6 text-white shadow-lg">
            <p className="text-slate-300 text-sm mb-1">{summary.projectCode}</p>
            <h1 className="text-xl font-bold">{summary.projectName}</h1>
            <p className="text-slate-400 text-sm mt-1">Payment Summary</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <SummaryCard
              icon={<DollarSign className="w-5 h-5 text-blue-600" />}
              label="Total Project Cost"
              value={formatCurrency(summary.totalCost)}
              bg="bg-blue-50"
              border="border-blue-200"
            />
            <SummaryCard
              icon={<CheckCircle className="w-5 h-5 text-green-600" />}
              label="Total Received"
              value={formatCurrency(summary.totalReceived)}
              bg="bg-green-50"
              border="border-green-200"
            />
            <SummaryCard
              icon={<Clock className="w-5 h-5 text-orange-600" />}
              label="Pending Balance"
              value={formatCurrency(summary.pendingBalance)}
              bg={summary.pendingBalance > 0 ? 'bg-orange-50' : 'bg-gray-50'}
              border={summary.pendingBalance > 0 ? 'border-orange-200' : 'border-gray-200'}
            />
          </div>

          {/* Material Costs */}
          {(summary.materialPurchaseCost > 0 || summary.netMaterialCost > 0) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SummaryCard
                icon={<TrendingDown className="w-5 h-5 text-purple-600" />}
                label="Material Purchase Cost"
                value={formatCurrency(summary.materialPurchaseCost)}
                bg="bg-purple-50"
                border="border-purple-200"
              />
              <SummaryCard
                icon={<Receipt className="w-5 h-5 text-rose-600" />}
                label="Net Material Cost"
                value={formatCurrency(summary.netMaterialCost)}
                bg="bg-rose-50"
                border="border-rose-200"
              />
            </div>
          )}
        </>
      )}

      {/* Payments Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800 text-lg">Payment History</h2>
          <p className="text-sm text-gray-500 mt-0.5">All payments received from your account</p>
        </div>

        {payments.length === 0 ? (
          <div className="p-10 text-center">
            <Receipt className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No payments recorded yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                  <th className="px-5 py-3 text-left font-medium">Payment ID</th>
                  <th className="px-5 py-3 text-left font-medium">Date</th>
                  <th className="px-5 py-3 text-left font-medium">Amount</th>
                  <th className="px-5 py-3 text-left font-medium">Method</th>
                  <th className="px-5 py-3 text-left font-medium">Status</th>
                  <th className="px-5 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5 font-mono text-xs text-gray-600">
                      {payment.paymentId || '—'}
                    </td>
                    <td className="px-5 py-3.5 text-gray-700">{formatDate(payment.date)}</td>
                    <td className="px-5 py-3.5 font-semibold text-gray-800">
                      {formatCurrency(payment.amount)}
                    </td>
                    <td className="px-5 py-3.5 text-gray-600">
                      {methodLabel[payment.paymentMethod] || payment.paymentMethod || '—'}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${statusColors[payment.status] || 'bg-gray-100 text-gray-600'}`}>
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <a 
                        href={`/client/receipt/${payment.id}`}
                        className="inline-flex items-center justify-center bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 w-8 h-8 rounded shadow-sm transition-all"
                        title="View Receipt"
                      >
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

interface SummaryCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  bg: string;
  border: string;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ icon, label, value, bg, border }) => (
  <div className={`${bg} border ${border} rounded-xl p-4 flex items-start gap-3`}>
    <div className="mt-0.5 flex-shrink-0">{icon}</div>
    <div>
      <p className="text-xs text-gray-500 font-medium mb-0.5">{label}</p>
      <p className="text-base font-bold text-gray-800">{value}</p>
    </div>
  </div>
);
