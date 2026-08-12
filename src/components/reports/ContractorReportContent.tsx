import React from 'react';
import { 
  Wrench, 
  Users, 
  TrendingUp, 
  BarChart3,
  CheckCircle,
  XCircle,
  Clock,
  CreditCard
} from 'lucide-react';
import { ContractorReport } from '../../services/reportsApi';

interface ContractorReportContentProps {
  data: ContractorReport;
}

export const ContractorReportContent: React.FC<ContractorReportContentProps> = ({ data }) => {


  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      greyStructure: 'bg-blue-100 text-blue-800',
      finishing: 'bg-green-100 text-green-800',
      interior: 'bg-purple-100 text-purple-800',
      exterior: 'bg-orange-100 text-orange-800',
      bricks: 'bg-red-100 text-red-800',
      steel: 'bg-slate-100 text-slate-800',
      plaster: 'bg-yellow-100 text-yellow-800',
      woodwork: 'bg-amber-100 text-amber-800',
      concreteMixer: 'bg-stone-100 text-stone-800',
      excavation: 'bg-emerald-100 text-emerald-800',
      boring: 'bg-cyan-100 text-cyan-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-orange-50 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">Total Contractors</p>
              <p className="text-2xl font-bold text-orange-900">{data.summary.totalContractors}</p>
            </div>
            <Wrench className="w-8 h-8 text-orange-600" />
          </div>
        </div>
        
        <div className="bg-green-50 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Active Contractors</p>
              <p className="text-2xl font-bold text-green-900">{data.summary.activeContractors}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-blue-50 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Contractor Types</p>
              <p className="text-2xl font-bold text-blue-900">{Object.keys(data.summary.typeBreakdown).length}</p>
            </div>
            <BarChart3 className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-purple-50 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Active Rate</p>
              <p className="text-2xl font-bold text-purple-900">
                {data.summary.totalContractors > 0 
                  ? Math.round((data.summary.activeContractors / data.summary.totalContractors) * 100)
                  : 0}%
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Type Distribution */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 text-gray-600 mr-2" />
            Contractor Type Distribution
          </h4>
          <div className="space-y-3">
            {Object.entries(data.summary.typeBreakdown).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between">
                <span className="text-sm text-gray-600 capitalize">
                  {type.replace(/([A-Z])/g, ' $1').trim()}
                </span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-orange-500 h-2 rounded-full"
                      style={{ width: `${(count / data.summary.totalContractors) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-semibold text-gray-900 w-8">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Terms Distribution */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <CreditCard className="w-5 h-5 text-gray-600 mr-2" />
            Payment Terms Distribution
          </h4>
          <div className="space-y-3">
            {Object.entries(data.contractors.reduce((acc, contractor) => {
              const terms = contractor.paymentTerms || 'Not Specified';
              acc[terms] = (acc[terms] || 0) + 1;
              return acc;
            }, {} as Record<string, number>)).map(([terms, count]) => (
              <div key={terms} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{terms}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${(count / data.summary.totalContractors) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-semibold text-gray-900 w-6">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Contractors Table */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h4 className="text-lg font-semibold text-gray-900 flex items-center">
            <Users className="w-5 h-5 text-gray-600 mr-2" />
            Contractor Details
          </h4>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Company
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment Terms
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.contractors.map((contractor) => (
                <tr key={contractor._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {contractor.companyName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {contractor.user?.userName || 'N/A'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(contractor.contractorType)}`}>
                      {contractor.contractorType.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">
                      {contractor.paymentTerms || 'Not Specified'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
                      contractor.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {contractor.isActive ? (
                        <>
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Active
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3 mr-1" />
                          Inactive
                        </>
                      )}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>
                      <div>{contractor.user?.email || 'N/A'}</div>
                      <div className="text-gray-500">{contractor.user?.phoneNumber || 'N/A'}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {new Date(contractor.createdAt).toLocaleDateString()}
                    </div>
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
