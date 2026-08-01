import React from 'react';
import { 
  CreditCard, 
  DollarSign, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  TrendingUp,
  Calendar,
  BarChart3,
  PieChart
} from 'lucide-react';
import { PaymentReport } from '../../services/reportsApi';

interface PaymentReportContentProps {
  data: PaymentReport;
}

export const PaymentReportContent: React.FC<PaymentReportContentProps> = ({ data }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      paid: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      overdue: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPaymentTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      cash: 'bg-green-100 text-green-800',
      bank_transfer: 'bg-blue-100 text-blue-800',
      check: 'bg-purple-100 text-purple-800',
      online: 'bg-orange-100 text-orange-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const getPaymentMethodColor = (method: string) => {
    const colors: Record<string, string> = {
      cash: 'bg-green-100 text-green-800',
      bank_transfer: 'bg-blue-100 text-blue-800',
      check: 'bg-purple-100 text-purple-800',
      online: 'bg-orange-100 text-orange-800',
    };
    return colors[method] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="w-3 h-3" />;
      case 'pending':
        return <Clock className="w-3 h-3" />;
      case 'overdue':
        return <AlertTriangle className="w-3 h-3" />;
      default:
        return <Clock className="w-3 h-3" />;
    }
  };

  const paidPercentage = data.summary.totalAmount > 0 
    ? (data.summary.paidAmount / data.summary.totalAmount) * 100 
    : 0;

  const pendingPercentage = data.summary.totalAmount > 0 
    ? (data.summary.pendingAmount / data.summary.totalAmount) * 100 
    : 0;

  const overduePercentage = data.summary.totalAmount > 0 
    ? (data.summary.overdueAmount / data.summary.totalAmount) * 100 
    : 0;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-blue-50 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total Amount</p>
              <p className="text-2xl font-bold text-blue-900">{formatCurrency(data.summary.totalAmount)}</p>
            </div>
            <DollarSign className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-green-50 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Paid Amount</p>
              <p className="text-2xl font-bold text-green-900">{formatCurrency(data.summary.paidAmount)}</p>
              <p className="text-xs text-green-600">{paidPercentage.toFixed(1)}% of total</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-yellow-50 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-600">Pending Amount</p>
              <p className="text-2xl font-bold text-yellow-900">{formatCurrency(data.summary.pendingAmount)}</p>
              <p className="text-xs text-yellow-600">{pendingPercentage.toFixed(1)}% of total</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
        
        <div className="bg-red-50 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600">Overdue Amount</p>
              <p className="text-2xl font-bold text-red-900">{formatCurrency(data.summary.overdueAmount)}</p>
              <p className="text-xs text-red-600">{overduePercentage.toFixed(1)}% of total</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Payment Status Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <PieChart className="w-5 h-5 text-gray-600 mr-2" />
            Payment Status Distribution
          </h4>
          <div className="space-y-4">
            {Object.entries(data.summary.statusBreakdown).map(([status, count]) => {
              const percentage = data.payments.length > 0 ? (count / data.payments.length) * 100 : 0;
              return (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(status)}
                    <span className="text-sm text-gray-600 capitalize">{status}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          status === 'paid' ? 'bg-green-500' :
                          status === 'pending' ? 'bg-yellow-500' :
                          status === 'overdue' ? 'bg-red-500' :
                          'bg-gray-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-semibold text-gray-900 w-8">{count}</span>
                    <span className="text-xs text-gray-500 w-10">({percentage.toFixed(1)}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Monthly Breakdown */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 text-gray-600 mr-2" />
            Monthly Payment Trends
          </h4>
          <div className="space-y-3">
            {Object.entries(data.summary.monthlyBreakdown)
              .sort(([a], [b]) => b.localeCompare(a))
              .slice(0, 6)
              .map(([month, monthData]) => {
                const maxAmount = Math.max(...Object.values(data.summary.monthlyBreakdown).map(d => d.amount));
                return (
                  <div key={month} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      {new Date(month + '-01').toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'short' 
                      })}
                    </span>
                    <div className="flex items-center space-x-2">
                      <div className="text-right">
                        <div className="text-sm font-semibold text-gray-900">
                          {formatCurrency(monthData.amount)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {monthData.count} payments • 
                          <span className="text-green-600"> +{formatCurrency(monthData.credit)}</span>
                          <span className="text-red-600"> -{formatCurrency(monthData.debit)}</span>
                        </div>
                      </div>
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ 
                            width: `${Math.min(100, (monthData.amount / maxAmount) * 100)}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h4 className="text-lg font-semibold text-gray-900 flex items-center">
            <CreditCard className="w-5 h-5 text-gray-600 mr-2" />
            Payment Details
          </h4>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment Method
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.payments.map((payment) => (
                <tr key={payment._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {formatCurrency(payment.amount)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(payment.status)}`}>
                      {getStatusIcon(payment.status)}
                      <span className="ml-1 capitalize">{payment.status}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentMethodColor(payment.paymentMethod)}`}>
                      {payment.paymentMethod.replace('_', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      payment.type === 'credit' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {payment.type.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      {new Date(payment.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                    {payment._id.slice(-8)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
