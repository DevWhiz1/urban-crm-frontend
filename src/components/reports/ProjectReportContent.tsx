import React from 'react';
import { ProjectReport } from '../../services/reportsApi';
import { 
  Building, 
  Banknote, 
  BarChart3, 
  PieChart, 
  CreditCard,
  Wallet,
  TrendingUp,
  Receipt,
  Wrench
} from 'lucide-react';

export const ProjectReportContent: React.FC<{ data: ProjectReport }> = ({ data }) => {
  const formatCurrency = (amount: number | undefined) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  return (
    <div className="space-y-6">
      {/* Unified Metric Cards Grid */}
      <div className="bg-gray-200 border border-gray-200 rounded-xl overflow-hidden shadow-sm grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px">
        {/* Core Metrics */}
        <div className="bg-white p-4 flex flex-col justify-between">
          <div className="flex items-center text-gray-500 mb-1.5 text-xs font-semibold uppercase tracking-wider">
            <Building className="w-3.5 h-3.5 mr-1.5" />
            Total Projects
          </div>
          <p className="text-2xl font-semibold text-gray-900 tracking-tight">{data.summary.totalProjects}</p>
        </div>

        <div className="bg-white p-4 flex flex-col justify-between">
          <div className="flex items-center text-gray-500 mb-1.5 text-xs font-semibold uppercase tracking-wider">
            <Banknote className="w-3.5 h-3.5 mr-1.5" />
            Total Budget
          </div>
          <p className="text-2xl font-semibold text-gray-900 tracking-tight">{formatCurrency(data.summary.totalRevenue)}</p>
        </div>

        <div className="bg-white p-4 flex flex-col justify-between">
          <div className="flex items-center text-gray-500 mb-1.5 text-xs font-semibold uppercase tracking-wider">
            <TrendingUp className="w-3.5 h-3.5 mr-1.5" />
            Total Credit
          </div>
          <p className="text-2xl font-semibold text-emerald-600 tracking-tight">{formatCurrency(data.summary.totalCredit)}</p>
        </div>

        <div className="bg-white p-4 flex flex-col justify-between">
          <div className="flex items-center text-gray-500 mb-1.5 text-xs font-semibold uppercase tracking-wider">
            <Wallet className="w-3.5 h-3.5 mr-1.5" />
            Net Volume
          </div>
          <p className={`text-2xl font-semibold tracking-tight ${data.summary.netVolume >= 0 ? 'text-gray-900' : 'text-red-600'}`}>
            {formatCurrency(data.summary.netVolume)}
          </p>
        </div>

        {/* Expenses Breakdown */}
        <div className="bg-white p-4 flex flex-col justify-between">
          <div className="flex items-center text-gray-500 mb-1.5 text-xs font-semibold uppercase tracking-wider">
            <Receipt className="w-3.5 h-3.5 mr-1.5" />
            Total Expenses
          </div>
          <p className="text-2xl font-semibold text-red-600 tracking-tight">{formatCurrency(data.summary.totalExpenses)}</p>
        </div>
        
        <div className="bg-white p-4 flex flex-col justify-between">
          <div className="flex items-center text-gray-500 mb-1.5 text-xs font-semibold uppercase tracking-wider">
            <Wrench className="w-3.5 h-3.5 mr-1.5" />
            Material & Contractors
          </div>
          <div className="flex flex-col space-y-1">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500">Materials</span>
              <span className="font-medium text-gray-900">{formatCurrency(data.summary.materialCosts)}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500">Contractors</span>
              <span className="font-medium text-gray-900">{formatCurrency(data.summary.contractorCosts)}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 flex flex-col justify-between">
          <div className="flex items-center text-gray-500 mb-1.5 text-xs font-semibold uppercase tracking-wider">
            <CreditCard className="w-3.5 h-3.5 mr-1.5" />
            Other Expenses
          </div>
          <p className="text-2xl font-semibold text-gray-900 tracking-tight">{formatCurrency(data.summary.otherExpenses)}</p>
        </div>

        <div className="bg-white p-4 flex flex-col justify-between">
          <div className="flex items-center text-gray-500 mb-1.5 text-xs font-semibold uppercase tracking-wider">
            <PieChart className="w-3.5 h-3.5 mr-1.5" />
            Pending Amount
          </div>
          <p className="text-2xl font-semibold text-gray-900 tracking-tight">{formatCurrency(data.summary.pendingAmount)}</p>
        </div>
      </div>

      {/* Projects Table */}
      <div>
        <h3 className="text-base font-semibold text-gray-900 mb-3">Project Breakdown</h3>
        <div className="overflow-hidden border border-gray-200 rounded-lg shadow-sm">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Project</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
                <th className="px-4 py-3 text-right font-medium text-gray-500">Budget</th>
                <th className="px-4 py-3 text-right font-medium text-gray-500">Credit Received</th>
                <th className="px-4 py-3 text-right font-medium text-gray-500">Total Expenses</th>
                <th className="px-4 py-3 text-right font-medium text-gray-500">Pending</th>
                <th className="px-4 py-3 text-right font-medium text-gray-500">Net Volume</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {data.projects.map((project) => (
                <tr key={project._id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-2.5 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{project.name}</div>
                    <div className="text-xs text-gray-500">{project.projectCode}</div>
                  </td>
                  <td className="px-4 py-2.5 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      project.status === 'active' ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20 ring-inset' :
                      project.status === 'completed' ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-600/20 ring-inset' :
                      project.status === 'planning' ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/20 ring-inset' :
                      'bg-gray-50 text-gray-600 ring-1 ring-gray-500/20 ring-inset'
                    }`}>
                      {project.status}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 whitespace-nowrap text-right font-medium text-gray-900">
                    {formatCurrency(project.totalCost)}
                  </td>
                  <td className="px-4 py-2.5 whitespace-nowrap text-right text-gray-900">
                    {formatCurrency(project.totalCredit)}
                  </td>
                  <td className="px-4 py-2.5 whitespace-nowrap text-right text-gray-900">
                    {formatCurrency(project.totalExpenses)}
                  </td>
                  <td className="px-4 py-2.5 whitespace-nowrap text-right text-gray-900">
                    {formatCurrency(project.pendingAmount)}
                  </td>
                  <td className={`px-4 py-2.5 whitespace-nowrap text-right font-semibold ${
                    (project.netVolume || 0) >= 0 ? 'text-gray-900' : 'text-red-600'
                  }`}>
                    {formatCurrency(project.netVolume)}
                  </td>
                </tr>
              ))}
              
              {data.projects.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    No projects match the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
