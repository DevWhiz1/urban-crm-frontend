import React from 'react';
import { 
  Users, 
  UserPlus, 
  CheckCircle, 
  XCircle, 
  CreditCard,
  Calendar,
  Phone,
  Mail,
  MapPin,
  TrendingUp
} from 'lucide-react';
import { ClientReport } from '../../services/reportsApi';

interface ClientReportContentProps {
  data: ClientReport;
}

export const ClientReportContent: React.FC<ClientReportContentProps> = ({ data }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getPaymentTermsColor = (terms: string) => {
    const colors: Record<string, string> = {
      'net-30': 'bg-blue-100 text-blue-800',
      'net-15': 'bg-green-100 text-green-800',
      'net-45': 'bg-yellow-100 text-yellow-800',
      'net-60': 'bg-orange-100 text-orange-800',
      'cash': 'bg-purple-100 text-purple-800',
      'advance': 'bg-red-100 text-red-800',
    };
    return colors[terms] || 'bg-gray-100 text-gray-800';
  };

  const formatPaymentTerms = (terms: string) => {
    return terms.replace('net-', 'Net ').toUpperCase();
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-purple-50 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Total Clients</p>
              <p className="text-2xl font-bold text-purple-900">{data.summary.totalClients}</p>
            </div>
            <Users className="w-8 h-8 text-purple-600" />
          </div>
        </div>
        
        <div className="bg-green-50 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Active Clients</p>
              <p className="text-2xl font-bold text-green-900">{data.summary.activeClients}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-blue-50 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">New This Month</p>
              <p className="text-2xl font-bold text-blue-900">{data.summary.newClientsThisMonth}</p>
            </div>
            <UserPlus className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-orange-50 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">Active Rate</p>
              <p className="text-2xl font-bold text-orange-900">
                {data.summary.totalClients > 0 
                  ? Math.round((data.summary.activeClients / data.summary.totalClients) * 100)
                  : 0}%
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Payment Terms Distribution */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <CreditCard className="w-5 h-5 text-gray-600 mr-2" />
          Payment Terms Distribution
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(data.summary.paymentTermsBreakdown).map(([terms, count]) => (
            <div key={terms} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentTermsColor(terms)}`}>
                  {formatPaymentTerms(terms)}
                </span>
                <span className="text-lg font-bold text-gray-900">{count}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-purple-500 h-2 rounded-full"
                  style={{ width: `${(count / data.summary.totalClients) * 100}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {Math.round((count / data.summary.totalClients) * 100)}% of total clients
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Clients Table */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h4 className="text-lg font-semibold text-gray-900 flex items-center">
            <Users className="w-5 h-5 text-gray-600 mr-2" />
            Client Details
          </h4>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment Terms
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bank Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.clients.map((client) => (
                <tr key={client._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {client.user?.userName || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-500">
                        ID: {client._id.slice(-8)}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      <div className="flex items-center text-sm text-gray-900">
                        <Mail className="w-3 h-3 mr-2 text-gray-400" />
                        {client.user?.email || 'N/A'}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Phone className="w-3 h-3 mr-2 text-gray-400" />
                        {client.user?.phoneNumber || 'N/A'}
                      </div>
                      {client.user?.address && (
                        <div className="flex items-center text-sm text-gray-500">
                          <MapPin className="w-3 h-3 mr-2 text-gray-400" />
                          {client.user.address}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentTermsColor(client.paymentTerms)}`}>
                      {formatPaymentTerms(client.paymentTerms)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
                      client.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {client.isActive ? (
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
                      {client.bankDetails ? (
                        <div className="space-y-1">
                          <div className="text-xs text-gray-500">Bank: {client.bankDetails.bankName || 'N/A'}</div>
                          <div className="text-xs text-gray-500">Account: {client.bankDetails.accountNumber ? `****${client.bankDetails.accountNumber.slice(-4)}` : 'N/A'}</div>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-xs">No bank details</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      {new Date(client.createdAt).toLocaleDateString()}
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
