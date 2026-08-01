import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Calendar,
  DollarSign,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { getPaymentAnalytics, PaymentAnalytics as PaymentAnalyticsType } from '../../services/reportsApi';

interface PaymentAnalyticsProps {
  className?: string;
}

export const PaymentAnalytics: React.FC<PaymentAnalyticsProps> = ({ className = '' }) => {
  const [analytics, setAnalytics] = useState<PaymentAnalyticsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('monthly');

  useEffect(() => {
    loadAnalytics();
  }, [period]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const data = await getPaymentAnalytics(period);
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to load payment analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    switch (period) {
      case 'daily':
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      case 'weekly':
        return `Week of ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
      case 'monthly':
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
      case 'yearly':
        return date.getFullYear().toString();
      default:
        return date.toLocaleDateString();
    }
  };

  const getMaxAmount = () => {
    if (!analytics) return 1;
    return Math.max(
      ...analytics.analytics.map(item => Math.max(item.credit, item.debit))
    );
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-xl border border-gray-200 p-6 ${className}`}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className={`bg-white rounded-xl border border-gray-200 p-6 ${className}`}>
        <div className="text-center text-gray-500">
          <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p>No payment data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl border border-gray-200 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <BarChart3 className="w-5 h-5 text-gray-600 mr-2" />
            Payment Analytics
          </h3>
          <p className="text-sm text-gray-500">Credit vs Debit transactions over time</p>
        </div>
        
        {/* Period Selector */}
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-gray-500" />
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="text-sm border border-gray-300 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Total Credit</p>
              <p className="text-xl font-bold text-green-900">
                {formatCurrency(analytics.summary.totalCredit)}
              </p>
            </div>
            <ArrowUpRight className="w-8 h-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-red-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600">Total Debit</p>
              <p className="text-xl font-bold text-red-900">
                {formatCurrency(analytics.summary.totalDebit)}
              </p>
            </div>
            <ArrowDownRight className="w-8 h-8 text-red-600" />
          </div>
        </div>
        
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Net Amount</p>
              <p className={`text-xl font-bold ${
                analytics.summary.netAmount >= 0 ? 'text-green-900' : 'text-red-900'
              }`}>
                {formatCurrency(analytics.summary.netAmount)}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Transactions</p>
              <p className="text-xl font-bold text-purple-900">
                {analytics.summary.totalTransactions}
              </p>
            </div>
            <CreditCard className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="space-y-4">
        <h4 className="text-md font-semibold text-gray-900">Payment Trends</h4>
        <div className="space-y-3">
          {analytics.analytics.slice(-12).map((item, index) => {
            const maxAmount = getMaxAmount();
            const creditPercentage = (item.credit / maxAmount) * 100;
            const debitPercentage = (item.debit / maxAmount) * 100;
            
            return (
              <div key={item.date} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">
                    {formatDate(item.date)}
                  </span>
                  <div className="flex items-center space-x-4 text-xs">
                    <span className="text-green-600">
                      +{formatCurrency(item.credit)}
                    </span>
                    <span className="text-red-600">
                      -{formatCurrency(item.debit)}
                    </span>
                    <span className={`font-semibold ${
                      item.net >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatCurrency(item.net)}
                    </span>
                  </div>
                </div>
                
                {/* Credit Bar */}
                <div className="w-full bg-gray-200 rounded-full h-3 relative">
                  <div 
                    className="bg-green-500 h-3 rounded-l-full absolute left-0"
                    style={{ width: `${creditPercentage}%` }}
                  ></div>
                  <div 
                    className="bg-red-500 h-3 rounded-r-full absolute right-0"
                    style={{ width: `${debitPercentage}%` }}
                  ></div>
                </div>
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{item.count} transactions</span>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Credit</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span>Debit</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
