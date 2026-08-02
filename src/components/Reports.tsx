import React, { useState, useEffect } from 'react';
import { Breadcrumbs } from './ui/Breadcrumbs';
import { 
  Download, 
  Filter, 
  BarChart3,
  PieChart,
  Users,
  Wrench,
  CreditCard,
  Building,
  DollarSign,
  RefreshCw
} from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { 
  getProjectReports, 
  getContractorReports, 
  getClientReports, 
  getPaymentReports, 
  getFinancialSummary,
  ReportFilters,
  ProjectReport,
  ContractorReport,
  ClientReport,
  PaymentReport,
  FinancialSummary
} from '../services/reportsApi';
import { 
  ContractorReportContent,
  ClientReportContent,
  PaymentReportContent,
  FinancialReportContent
} from './reports/index';

type ReportType = 'projects' | 'contractors' | 'clients' | 'payments' | 'financial';

export const Reports: React.FC = () => {
  const [activeReport, setActiveReport] = useState<ReportType>('projects');
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<ReportFilters>({
    startDate: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  const [reportData, setReportData] = useState<{
    projects?: ProjectReport;
    contractors?: ContractorReport;
    clients?: ClientReport;
    payments?: PaymentReport;
    financial?: FinancialSummary;
  }>({});

  useEffect(() => {
    loadReport();
  }, [activeReport, filters]);

  const loadReport = async () => {
    try {
      setLoading(true);
      
      switch (activeReport) {
        case 'projects':
          const projectData = await getProjectReports(filters);
          setReportData(prev => ({ ...prev, projects: projectData }));
          break;
        case 'contractors':
          const contractorData = await getContractorReports(filters);
          setReportData(prev => ({ ...prev, contractors: contractorData }));
          break;
        case 'clients':
          const clientData = await getClientReports(filters);
          setReportData(prev => ({ ...prev, clients: clientData }));
          break;
        case 'payments':
          const paymentData = await getPaymentReports(filters);
          setReportData(prev => ({ ...prev, payments: paymentData }));
          break;
        case 'financial':
          const financialData = await getFinancialSummary(filters);
          setReportData(prev => ({ ...prev, financial: financialData }));
          break;
      }
    } catch (error) {
      console.error('Failed to load report:', error);
    } finally {
      setLoading(false);
    }
  };


  const handleFilterChange = (field: keyof ReportFilters) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFilters(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const exportReport = () => {
    // TODO: Implement export functionality
    console.log('Export report:', activeReport, reportData[activeReport]);
  };

  const reportTypes = [
    { id: 'projects', name: 'Project Reports', icon: Building, color: 'blue' },
    { id: 'contractors', name: 'Contractor Reports', icon: Wrench, color: 'orange' },
    { id: 'clients', name: 'Client Reports', icon: Users, color: 'purple' },
    { id: 'payments', name: 'Payment Reports', icon: CreditCard, color: 'green' },
    { id: 'financial', name: 'Financial Summary', icon: DollarSign, color: 'emerald' }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <Breadcrumbs />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Reports & Analytics</h1>
          <p className="text-sm text-gray-500 mt-1">Generate comprehensive reports, financial summaries, and business insights</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            onClick={exportReport}
            variant="primary"
            size="sm"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
          <Button
            onClick={loadReport}
            loading={loading}
            variant="outline"
            size="sm"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

        {/* Report Type Tabs */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {reportTypes.map((report) => {
              const Icon = report.icon;
              return (
                <button
                  key={report.id}
                  onClick={() => setActiveReport(report.id as ReportType)}
                  className={`p-4 rounded-xl transition-all duration-200 ${
                    activeReport === report.id
                      ? `bg-${report.color}-100 border-2 border-${report.color}-500 text-${report.color}-700`
                      : 'bg-gray-50 border-2 border-transparent text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm font-medium">{report.name}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Filter className="w-5 h-5 text-gray-600 mr-2" />
              Filters
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              label="Start Date"
              type="date"
              value={filters.startDate || ''}
              onChange={handleFilterChange('startDate')}
            />
            <Input
              label="End Date"
              type="date"
              value={filters.endDate || ''}
              onChange={handleFilterChange('endDate')}
            />
            {activeReport === 'projects' && (
              <Select
                label="Status"
                options={[
                  { value: '', label: 'All Statuses' },
                  { value: 'planning', label: 'Planning' },
                  { value: 'active', label: 'Active' },
                  { value: 'completed', label: 'Completed' },
                  { value: 'on-hold', label: 'On Hold' }
                ]}
                value={filters.status || ''}
                onChange={handleFilterChange('status')}
              />
            )}
            {activeReport === 'contractors' && (
              <Select
                label="Contractor Type"
                options={[
                  { value: '', label: 'All Types' },
                  { value: 'greyStructure', label: 'Grey Structure' },
                  { value: 'finishing', label: 'Finishing' },
                  { value: 'interior', label: 'Interior' },
                  { value: 'exterior', label: 'Exterior' }
                ]}
                value={filters.contractorType || ''}
                onChange={handleFilterChange('contractorType')}
              />
            )}
          </div>
        </div>

        {/* Report Content */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div>
              {activeReport === 'projects' && reportData.projects && (
                <ProjectReportContent data={reportData.projects} />
              )}
              {activeReport === 'contractors' && reportData.contractors && (
                <ContractorReportContent data={reportData.contractors} />
              )}
              {activeReport === 'clients' && reportData.clients && (
                <ClientReportContent data={reportData.clients} />
              )}
              {activeReport === 'payments' && reportData.payments && (
                <PaymentReportContent data={reportData.payments} />
              )}
              {activeReport === 'financial' && reportData.financial && (
                <FinancialReportContent data={reportData.financial} />
              )}
            </div>
          )}
        </div>
      </div>
  );
};

// Project Report Content Component
const ProjectReportContent: React.FC<{ data: ProjectReport }> = ({ data }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-blue-50 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total Projects</p>
              <p className="text-2xl font-bold text-blue-900">{data.summary.totalProjects}</p>
            </div>
            <Building className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-green-50 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Total Revenue</p>
              <p className="text-2xl font-bold text-green-900">{formatCurrency(data.summary.totalRevenue)}</p>
            </div>
            <DollarSign className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-purple-50 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Average Value</p>
              <p className="text-2xl font-bold text-purple-900">{formatCurrency(data.summary.averageProjectValue)}</p>
            </div>
            <BarChart3 className="w-8 h-8 text-purple-600" />
          </div>
        </div>
        <div className="bg-orange-50 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">Status Breakdown</p>
              <p className="text-2xl font-bold text-orange-900">{Object.keys(data.summary.statusBreakdown).length}</p>
            </div>
            <PieChart className="w-8 h-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Status Distribution</h4>
          <div className="space-y-3">
            {Object.entries(data.summary.statusBreakdown).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <span className="text-sm text-gray-600 capitalize">{status}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${(count / data.summary.totalProjects) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-semibold text-gray-900 w-8">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Category Distribution</h4>
          <div className="space-y-3">
            {Object.entries(data.summary.categoryBreakdown).map(([category, count]) => (
              <div key={category} className="flex items-center justify-between">
                <span className="text-sm text-gray-600 capitalize">{category}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${(count / data.summary.totalProjects) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-semibold text-gray-900 w-8">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Projects Table */}
      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Project Details</h4>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.projects.map((project) => (
                <tr key={project._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{project.name}</div>
                      <div className="text-sm text-gray-500">{project.projectCode}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      project.status === 'active' ? 'bg-green-100 text-green-800' :
                      project.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                      project.status === 'planning' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {project.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                    {project.projectCategory}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(project.totalCost)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(project.createdAt).toLocaleDateString()}
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

