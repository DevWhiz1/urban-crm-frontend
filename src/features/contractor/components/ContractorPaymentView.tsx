import React from 'react';
import { DollarSign, CheckCircle, Clock, ArrowLeft, Briefcase, Receipt } from 'lucide-react';
import { useContractorPayments } from '../hooks/useContractorPayments';

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

interface ContractorPaymentViewProps {
  contractId: string;
  onBack: () => void;
}

export const ContractorPaymentView: React.FC<ContractorPaymentViewProps> = ({ contractId, onBack }) => {
  const { summary, payments, loading, error } = useContractorPayments(contractId);

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
          <button onClick={onBack} className="mt-3 text-sm text-blue-600 hover:underline">
            ← Back to Contracts
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Contracts
      </button>

      {/* Summary Header */}
      {summary && (
        <>
          <div className="bg-gradient-to-r from-slate-700 to-slate-900 rounded-2xl p-6 text-white shadow-lg">
            {summary.project && (
              <p className="text-slate-300 text-sm mb-1">{summary.project.projectCode} — {summary.project.name}</p>
            )}
            <h1 className="text-xl font-bold">
              {summary.contractType ? `${summary.contractType} Contract` : 'Contract'} Payments
            </h1>
            <p className="text-slate-400 text-sm mt-1">Payment details for your contract</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <SummaryCard
              icon={<DollarSign className="w-5 h-5 text-blue-600" />}
              label="Contract Value"
              value={formatCurrency(summary.totalAmount)}
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
        </>
      )}

      {/* Payments Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800 text-lg">Payment History</h2>
          <p className="text-sm text-gray-500 mt-0.5">Payments issued to you for this contract</p>
        </div>

        {payments.length === 0 ? (
          <div className="p-10 text-center">
            <Receipt className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No payments recorded for this contract yet.</p>
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
                  <th className="px-5 py-3 text-left font-medium">Description</th>
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
                    <td className="px-5 py-3.5 text-gray-500 text-xs">
                      {payment.workDescription || '—'}
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
