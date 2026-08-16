import React, { useState, useEffect, useRef } from 'react';
import { Breadcrumbs } from '../ui/Breadcrumbs';
import { 
  Download, 
  Filter, 
  BarChart3,
  PieChart,
  Users,
  Wrench,
  CreditCard,
  Building,
  Banknote,
  RefreshCw,
  Check,
  ChevronDown
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
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
} from '../../services/reportsApi';
import { fetchAllProjects } from '../../services/projectApi';
import { Project } from '../../types/project';
import { 
  ContractorReportContent,
  ClientReportContent,
  PaymentReportContent,
  FinancialReportContent
} from './index';
import { ProjectReportContent } from './ProjectReportContent';

type ReportType = 'projects' | 'contractors' | 'clients' | 'payments' | 'financial';

export const Reports: React.FC = () => {
  const [activeReport, setActiveReport] = useState<ReportType>('projects');
  const [loading, setLoading] = useState(false);
  
  const [filters, setFilters] = useState<ReportFilters>({
    startDate: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    projectIds: []
  });

  const [projectList, setProjectList] = useState<Project[]>([]);
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
  const projectDropdownRef = useRef<HTMLDivElement>(null);

  const [reportData, setReportData] = useState<{
    projects?: ProjectReport;
    contractors?: ContractorReport;
    clients?: ClientReport;
    payments?: PaymentReport;
    financial?: FinancialSummary;
  }>({});

  useEffect(() => {
    loadProjects();
  }, []);

  // Fetch report only on tab change or explicit "Apply Filters" click
  useEffect(() => {
    loadReport();
  }, [activeReport]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (projectDropdownRef.current && !projectDropdownRef.current.contains(event.target as Node)) {
        setIsProjectDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadProjects = async () => {
    try {
      const data = await fetchAllProjects();
      setProjectList(data);
    } catch (error) {
      console.error('Failed to load projects for filters:', error);
    }
  };

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

  const toggleProjectSelection = (projectId: string) => {
    setFilters(prev => {
      const currentIds = prev.projectIds || [];
      if (currentIds.includes(projectId)) {
        return { ...prev, projectIds: currentIds.filter(id => id !== projectId) };
      } else {
        return { ...prev, projectIds: [...currentIds, projectId] };
      }
    });
  };

  const toggleAllProjects = () => {
    setFilters(prev => {
      if (prev.projectIds && prev.projectIds.length === projectList.length) {
        return { ...prev, projectIds: [] }; // deselect all
      } else {
        return { ...prev, projectIds: projectList.map(p => p._id) }; // select all
      }
    });
  };

  const exportReport = () => {
    console.log('Export report:', activeReport, reportData[activeReport]);
  };

  const reportTypes = [
    { id: 'projects', name: 'Projects', icon: Building },
    { id: 'contractors', name: 'Contractors', icon: Wrench },
    { id: 'clients', name: 'Clients', icon: Users },
    { id: 'payments', name: 'Payments', icon: CreditCard },
    { id: 'financial', name: 'Financial', icon: Banknote }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      <Breadcrumbs />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Reports & Analytics</h1>
        </div>
        <div className="flex items-center space-x-3">
          <Button onClick={exportReport} variant="outline" size="sm" className="bg-white border-gray-200 shadow-sm hover:bg-gray-50">
            <Download className="w-4 h-4 mr-2 text-gray-500" />
            Export
          </Button>
        </div>
      </div>

      {/* Toolbar Area (Tabs + Filters in one visually grouped section) */}
      <div className="bg-white border border-gray-200 shadow-sm rounded-lg">
        {/* Compact Navigation */}
        <div className="flex px-2 pt-2 border-b border-gray-100 overflow-x-auto">
          {reportTypes.map((report) => {
            const Icon = report.icon;
            const isActive = activeReport === report.id;
            return (
              <button
                key={report.id}
                onClick={() => setActiveReport(report.id as ReportType)}
                className={`flex items-center px-4 py-2.5 text-sm font-medium transition-colors whitespace-nowrap border-b-2 ${
                  isActive
                    ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                    : 'border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Icon className={`w-4 h-4 mr-2 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                {report.name}
              </button>
            );
          })}
        </div>

        {/* Filters Toolbar */}
        <div className="p-3 bg-gray-50/50 flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3 rounded-b-lg">
          <div className="flex items-center text-sm font-medium text-gray-500 mb-1 sm:mb-0">
            <Filter className="w-4 h-4 mr-1.5" />
            Filters
          </div>
          
          <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center sm:gap-3 w-full sm:w-auto">
            <div className="w-full sm:w-36">
              <Input
                type="date"
                value={filters.startDate || ''}
                onChange={handleFilterChange('startDate')}
                className="h-8 text-sm !py-1 !px-2 w-full"
              />
            </div>
            <span className="hidden sm:inline text-gray-400 text-sm">to</span>
            <div className="w-full sm:w-36">
              <Input
                type="date"
                value={filters.endDate || ''}
                onChange={handleFilterChange('endDate')}
                className="h-8 text-sm !py-1 !px-2 w-full"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:items-center gap-2 sm:gap-3 w-full sm:w-auto flex-1">
            {activeReport === 'projects' && (
              <>
                <div className="w-full lg:w-36">
                  <Select
                    options={[
                      { value: '', label: 'All Statuses' },
                      { value: 'planning', label: 'Planning' },
                      { value: 'pending', label: 'Pending' },
                      { value: 'ongoing', label: 'Ongoing' },
                      { value: 'completed', label: 'Completed' },
                      { value: 'on_hold', label: 'On Hold' },
                      { value: 'cancelled', label: 'Cancelled' }
                    ]}
                    value={filters.status || ''}
                    onChange={handleFilterChange('status')}
                    className="h-8 text-sm !py-1 !px-2 w-full"
                  />
                </div>

                {/* Custom Multi-Select for Projects */}
                <div className="w-full lg:w-48 relative" ref={projectDropdownRef}>
                  <div 
                    className="w-full px-3 bg-white border border-gray-300 rounded-md shadow-sm cursor-pointer flex justify-between items-center text-sm focus:outline-none hover:bg-gray-50 h-8"
                    onClick={() => setIsProjectDropdownOpen(!isProjectDropdownOpen)}
                  >
                    <span className="truncate text-gray-700">
                      {filters.projectIds?.length === 0 || !filters.projectIds 
                        ? 'All Projects' 
                        : `${filters.projectIds.length} Selected`}
                    </span>
                    <ChevronDown className="w-3 h-3 text-gray-400" />
                  </div>
                  
                  {isProjectDropdownOpen && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                      <div className="p-1.5 border-b border-gray-100">
                        <button
                          onClick={toggleAllProjects}
                          className="text-xs font-medium text-blue-600 hover:text-blue-800 w-full text-left px-2 py-1 rounded hover:bg-blue-50"
                        >
                          {filters.projectIds?.length === projectList.length ? 'Deselect All' : 'Select All'}
                        </button>
                      </div>
                      {projectList.map(project => (
                        <div 
                          key={project._id}
                          className="flex items-center px-2.5 py-1.5 hover:bg-gray-50 cursor-pointer text-sm"
                          onClick={() => toggleProjectSelection(project._id)}
                        >
                          <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center mr-2 flex-shrink-0 ${filters.projectIds?.includes(project._id) ? 'bg-blue-600 border-blue-600' : 'border-gray-300'}`}>
                            {filters.projectIds?.includes(project._id) && <Check className="w-2.5 h-2.5 text-white" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-gray-700 truncate">{project.name}</p>
                          </div>
                        </div>
                      ))}
                      {projectList.length === 0 && (
                        <div className="p-3 text-sm text-gray-500 text-center">No projects found</div>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}

            {activeReport === 'contractors' && (
              <div className="w-full sm:w-40">
                <Select
                  options={[
                    { value: '', label: 'All Types' },
                    { value: 'greyStructure', label: 'Grey Structure' },
                    { value: 'finishing', label: 'Finishing' },
                    { value: 'interior', label: 'Interior' },
                    { value: 'exterior', label: 'Exterior' },
                    { value: 'landscaping', label: 'Landscaping' },
                    { value: 'painting', label: 'Painting' },
                    { value: 'tiling', label: 'Tiling' },
                    { value: 'general', label: 'General' },
                    { value: 'electrical', label: 'Electrical' },
                    { value: 'plumbing', label: 'Plumbing' },
                    { value: 'masonry', label: 'Masonry' },
                    { value: 'carpentry', label: 'Carpentry' },
                    { value: 'roofing', label: 'Roofing' },
                    { value: 'bricks', label: 'Bricks' },
                    { value: 'steel', label: 'Steel' },
                    { value: 'plaster', label: 'Plaster' },
                    { value: 'woodwork', label: 'Woodwork' },
                    { value: 'concreteMixer', label: 'Concrete Mixer' },
                    { value: 'excavation', label: 'Excavation' },
                    { value: 'boring', label: 'Boring' },
                    { value: 'other', label: 'Other' }
                  ]}
                  value={filters.contractorType || ''}
                  onChange={handleFilterChange('contractorType')}
                  className="h-8 text-sm !py-1 !px-2 w-full"
                />
              </div>
            )}
          </div>

          {/* Apply Filters Button */}
          <div className="mt-1 sm:mt-0 lg:ml-auto w-full sm:w-auto">
            <Button onClick={loadReport} loading={loading} variant="primary" size="sm" className="h-8 text-xs px-4 w-full justify-center">
              Apply Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Report Content */}
      <div className="min-h-[400px]">
        {loading ? (
          <div className="flex items-center justify-center h-full min-h-[300px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
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
