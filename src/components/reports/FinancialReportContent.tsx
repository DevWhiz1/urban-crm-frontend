import React from 'react';
import { 
  Banknote, 
  TrendingUp, 
  TrendingDown,
  Building,
  FileText,
  CreditCard,
  Calculator,
  PieChart,
  BarChart3,
  Target,
  AlertCircle
} from 'lucide-react';
import { FinancialSummary } from '../../services/reportsApi';

interface FinancialReportContentProps {
  data: FinancialSummary;
}

export const FinancialReportContent: React.FC<FinancialReportContentProps> = ({ data }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const getProfitMarginColor = (margin: number) => {
    if (margin >= 20) return 'text-green-600';
    if (margin >= 10) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProfitMarginBgColor = (margin: number) => {
    if (margin >= 20) return 'bg-green-100';
    if (margin >= 10) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const revenueEfficiency = data.revenue.totalProjectRevenue > 0 
    ? (data.revenue.totalPayments / data.revenue.totalProjectRevenue) * 100 
    : 0;

  const collectionRate = data.revenue.totalPayments > 0 
    ? (data.revenue.paidPayments / data.revenue.totalPayments) * 100 
    : 0;

  return (
    <div className="space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Revenue */}
        <div className="bg-blue-50 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-blue-600">Total Project Revenue</p>
              <p className="text-3xl font-bold text-blue-900">{formatCurrency(data.revenue.totalProjectRevenue)}</p>
            </div>
            <Building className="w-10 h-10 text-blue-600" />
          </div>
          <div className="text-xs text-blue-600">
            From {data.projects} projects
          </div>
        </div>

        {/* Total Payments */}
        <div className="bg-green-50 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-green-600">Total Payments</p>
              <p className="text-3xl font-bold text-green-900">{formatCurrency(data.revenue.totalPayments)}</p>
            </div>
            <CreditCard className="w-10 h-10 text-green-600" />
          </div>
          <div className="text-xs text-green-600">
            {data.payments} payment transactions
          </div>
        </div>

        {/* Gross Profit */}
        <div className="bg-purple-50 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-purple-600">Gross Profit</p>
              <p className="text-3xl font-bold text-purple-900">{formatCurrency(data.costs.grossProfit)}</p>
            </div>
            <TrendingUp className="w-10 h-10 text-purple-600" />
          </div>
          <div className="text-xs text-purple-600">
            Revenue - Contract Costs
          </div>
        </div>

        {/* Profit Margin */}
        <div className={`rounded-xl p-6 ${getProfitMarginBgColor(data.costs.profitMargin)}`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-gray-600">Profit Margin</p>
              <p className={`text-3xl font-bold ${getProfitMarginColor(data.costs.profitMargin)}`}>
                {formatPercentage(data.costs.profitMargin)}
              </p>
            </div>
            <Target className="w-10 h-10 text-gray-600" />
          </div>
          <div className="text-xs text-gray-600">
            Gross Profit / Revenue
          </div>
        </div>
      </div>

      {/* Revenue Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Breakdown */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <PieChart className="w-5 h-5 text-gray-600 mr-2" />
            Revenue Analysis
          </h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <Building className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-gray-900">Project Revenue</span>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-gray-900">
                  {formatCurrency(data.revenue.totalProjectRevenue)}
                </div>
                <div className="text-xs text-gray-500">
                  {formatPercentage(100)} of total
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <CreditCard className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-gray-900">Collected Payments</span>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-gray-900">
                  {formatCurrency(data.revenue.paidPayments)}
                </div>
                <div className="text-xs text-gray-500">
                  {formatPercentage(collectionRate)} collection rate
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-yellow-600" />
                <span className="text-sm font-medium text-gray-900">Pending Payments</span>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-gray-900">
                  {formatCurrency(data.revenue.pendingPayments)}
                </div>
                <div className="text-xs text-gray-500">
                  {formatPercentage(100 - collectionRate)} pending
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Cost Analysis */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 text-gray-600 mr-2" />
            Cost Analysis
          </h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-orange-600" />
                <span className="text-sm font-medium text-gray-900">Contract Costs</span>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-gray-900">
                  {formatCurrency(data.costs.totalContractValue)}
                </div>
                <div className="text-xs text-gray-500">
                  From {data.contracts} contracts
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <Calculator className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium text-gray-900">Gross Profit</span>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-gray-900">
                  {formatCurrency(data.costs.grossProfit)}
                </div>
                <div className="text-xs text-gray-500">
                  Revenue - Costs
                </div>
              </div>
            </div>

            <div className={`flex items-center justify-between p-3 rounded-lg ${getProfitMarginBgColor(data.costs.profitMargin)}`}>
              <div className="flex items-center space-x-2">
                <Target className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-900">Profit Margin</span>
              </div>
              <div className="text-right">
                <div className={`text-sm font-semibold ${getProfitMarginColor(data.costs.profitMargin)}`}>
                  {formatPercentage(data.costs.profitMargin)}
                </div>
                <div className="text-xs text-gray-500">
                  Profit / Revenue
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Health Indicators */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <TrendingUp className="w-5 h-5 text-gray-600 mr-2" />
          Financial Health Indicators
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Collection Efficiency */}
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-900 mb-1">
              {formatPercentage(collectionRate)}
            </div>
            <div className="text-sm text-blue-600 mb-1">Collection Rate</div>
            <div className="text-xs text-gray-500">
              {collectionRate >= 80 ? 'Excellent' : 
               collectionRate >= 60 ? 'Good' : 
               collectionRate >= 40 ? 'Fair' : 'Needs Improvement'}
            </div>
          </div>

          {/* Revenue Efficiency */}
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-900 mb-1">
              {formatPercentage(revenueEfficiency)}
            </div>
            <div className="text-sm text-green-600 mb-1">Revenue Efficiency</div>
            <div className="text-xs text-gray-500">
              {revenueEfficiency >= 80 ? 'High' : 
               revenueEfficiency >= 60 ? 'Moderate' : 
               revenueEfficiency >= 40 ? 'Low' : 'Very Low'}
            </div>
          </div>

          {/* Profitability */}
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className={`text-2xl font-bold mb-1 ${getProfitMarginColor(data.costs.profitMargin)}`}>
              {formatPercentage(data.costs.profitMargin)}
            </div>
            <div className="text-sm text-purple-600 mb-1">Profit Margin</div>
            <div className="text-xs text-gray-500">
              {data.costs.profitMargin >= 20 ? 'Excellent' : 
               data.costs.profitMargin >= 10 ? 'Good' : 
               data.costs.profitMargin >= 5 ? 'Fair' : 'Needs Improvement'}
            </div>
          </div>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-50 rounded-xl p-6 text-center">
          <div className="text-3xl font-bold text-gray-900 mb-2">{data.projects}</div>
          <div className="text-sm text-gray-600">Total Projects</div>
        </div>
        <div className="bg-gray-50 rounded-xl p-6 text-center">
          <div className="text-3xl font-bold text-gray-900 mb-2">{data.contracts}</div>
          <div className="text-sm text-gray-600">Active Contracts</div>
        </div>
        <div className="bg-gray-50 rounded-xl p-6 text-center">
          <div className="text-3xl font-bold text-gray-900 mb-2">{data.payments}</div>
          <div className="text-sm text-gray-600">Payment Transactions</div>
        </div>
      </div>
    </div>
  );
};
