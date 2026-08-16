import React, { useState, useEffect } from 'react';
import { Download, Calendar, Filter, FileText, RotateCcw } from 'lucide-react';
import apiClient from '../../services/apiClient';
import { Breadcrumbs } from '../ui/Breadcrumbs';
import { Select } from '../ui/Select';

// Components
import ClientStatement from '../receipts/client/ClientStatement';
import ContractorStatement from '../receipts/contractor/ContractorStatement';
import AdminMaterialStatement from '../receipts/admin/AdminMaterialStatement';
import AdminStatement from '../receipts/admin/AdminStatement';

export const StatementGenerator: React.FC = () => {
  const [statementType, setStatementType] = useState('client');
  const [projects, setProjects] = useState<any[]>([]);
  const [contractors, setContractors] = useState<any[]>([]);
  const [projectContractorIds, setProjectContractorIds] = useState<Set<string>>(new Set());
  
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedContractor, setSelectedContractor] = useState('');
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 1);
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  
  const [loading, setLoading] = useState(false);
  const [statementData, setStatementData] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch all projects for dropdown
    apiClient.get('/api/project/get-all-projects?limit=1000')
      .then(res => setProjects(res.data.data))
      .catch(console.error);
      
    // Fetch contractors for dropdown
    apiClient.get('/api/contractor/get-all-contractors?limit=1000')
      .then(res => setContractors(res.data.data || []))
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    if (selectedProject) {
      apiClient.get('/api/project-contract/get-all-project-contracts', { params: { project: selectedProject } })
        .then(res => {
          const contracts = res.data.data || [];
          const ids = new Set<string>(contracts.map((c: any) => c.contractor?._id || c.contractor));
          setProjectContractorIds(ids);
          
          if (selectedContractor && !ids.has(selectedContractor)) {
            setSelectedContractor('');
          }
        })
        .catch(console.error);
    } else {
      setProjectContractorIds(new Set());
    }
  }, [selectedProject]); // selectedContractor omitted intentionally so it doesn't loop
  
  const filteredContractors = selectedProject 
    ? contractors.filter(c => projectContractorIds.has(c._id))
    : contractors;

  const handleGenerate = async () => {
    if (!selectedProject) {
      setError('Please select a project');
      return;
    }
    if (statementType === 'contractor' && !selectedContractor) {
      setError('Please select a contractor for the Contractor Statement');
      return;
    }

    setError('');
    setLoading(true);
    setStatementData(null);

    try {
      const params = new URLSearchParams({
        statementType,
        projectId: selectedProject,
      });
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (selectedContractor) params.append('contractorId', selectedContractor);

      const res = await apiClient.get(`/api/payment/statement?${params.toString()}`);
      setStatementData(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to generate statement');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStatementType('client');
    setSelectedProject('');
    setSelectedContractor('');
    const date = new Date();
    setEndDate(date.toISOString().split('T')[0]);
    date.setFullYear(date.getFullYear() - 1);
    setStartDate(date.toISOString().split('T')[0]);
    setStatementData(null);
    setError('');
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 min-h-[calc(100vh-4rem)]">
      <div className="px-6 py-4 bg-white border-b border-gray-200 print:hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <Breadcrumbs
            items={[
              { label: 'Dashboard', path: '/dashboard' },
              { label: 'Statement Generator' }
            ]}
          />
          <h1 className="text-2xl font-bold text-gray-900 mt-2">Statement Generator</h1>
        </div>
      </div>

      <div className="flex-1 p-6 flex flex-col xl:flex-row gap-6 items-start overflow-hidden print:p-0 print:gap-0">
        {/* Filter Sidebar */}
        <div className="w-full xl:w-80 bg-white rounded-xl shadow-sm border border-gray-200 p-5 shrink-0 print:hidden">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Filter className="w-5 h-5 text-blue-600" />
              Report Settings
            </h2>
            <button
              onClick={handleReset}
              className="text-sm text-gray-500 hover:text-blue-600 flex items-center gap-1 transition-colors"
              title="Reset all filters"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Statement Type</label>
              <Select
                value={statementType}
                onChange={(e) => {
                  setStatementType(e.target.value);
                  setStatementData(null);
                }}
                options={[
                  { value: 'client', label: 'Client Statement (Income)' },
                  { value: 'contractor', label: 'Contractor Statement (Expenses)' },
                  { value: 'material', label: 'Material Statement (Expenses)' },
                  { value: 'admin', label: 'Admin Summary (All)' }
                ]}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
              <Select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                placeholder="-- Select Project --"
                options={projects.map(p => ({ value: p._id, label: `${p.name} (${p.status})` }))}
              />
            </div>

            {statementType === 'contractor' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contractor</label>
                <Select
                  value={selectedContractor}
                  onChange={(e) => setSelectedContractor(e.target.value)}
                  placeholder="-- Select Contractor --"
                  options={filteredContractors.map(c => ({ value: c._id, label: `${c.companyName} (${c.contractorType})` }))}
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm py-2 px-3 border"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm py-2 px-3 border"
                />
              </div>
            </div>

            {error && <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</p>}

            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg shadow transition-colors flex justify-center items-center gap-2"
            >
              {loading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" /> : <FileText className="w-4 h-4" />}
              Generate Statement
            </button>
          </div>
        </div>

        {/* Preview Area */}
        <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-auto w-full h-[calc(100vh-12rem)] print:h-auto print:border-none print:shadow-none print:bg-transparent">
          {!statementData && !loading && (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 print:hidden">
              <FileText className="w-16 h-16 mb-4 opacity-20" />
              <p>Select filters and click Generate Statement</p>
            </div>
          )}
          
          {loading && (
            <div className="h-full flex items-center justify-center print:hidden">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
            </div>
          )}

          {statementData && (
            <div className="w-full min-h-full">
              {statementType === 'client' && <ClientStatement data={statementData} dateRange={{ startDate, endDate }} />}
              {statementType === 'contractor' && <ContractorStatement data={statementData} dateRange={{ startDate, endDate }} />}
              {statementType === 'material' && <AdminMaterialStatement data={statementData} dateRange={{ startDate, endDate }} />}
              {statementType === 'admin' && <AdminStatement data={statementData} dateRange={{ startDate, endDate }} />}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
