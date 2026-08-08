import React from 'react';
import { MapPin, Calendar, Briefcase, DollarSign, AlertCircle, ChevronRight } from 'lucide-react';
import { useContractorContracts } from '../hooks/useContractorContracts';
import { ContractorContractDTO } from '../api/contractorPortalApi';

const statusColors: Record<string, string> = {
  planning: 'bg-blue-100 text-blue-700',
  pending: 'bg-yellow-100 text-yellow-700',
  ongoing: 'bg-green-100 text-green-700',
  completed: 'bg-emerald-100 text-emerald-700',
  on_hold: 'bg-orange-100 text-orange-700',
  cancelled: 'bg-red-100 text-red-700',
};

const formatCurrency = (n: number | undefined) =>
  n != null ? `PKR ${n.toLocaleString()}` : '—';

const formatDate = (d: string | undefined) =>
  d ? new Date(d).toLocaleDateString('en-PK', { year: 'numeric', month: 'short', day: 'numeric' }) : '—';

interface ContractorContractViewProps {
  onSelectContract: (contractId: string) => void;
}

export const ContractorContractView: React.FC<ContractorContractViewProps> = ({ onSelectContract }) => {
  const { contracts, loading, error } = useContractorContracts();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
          <p className="text-sm text-gray-500">Loading your contracts...</p>
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
        </div>
      </div>
    );
  }

  if (contracts.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No contracts found for your account.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="mb-2">
        <h1 className="text-xl font-bold text-gray-800">My Contracts</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {contracts.length} contract{contracts.length !== 1 ? 's' : ''} assigned to you
        </p>
      </div>

      {contracts.map((contract) => (
        <ContractCard
          key={contract.id}
          contract={contract}
          onSelect={() => onSelectContract(contract.id)}
        />
      ))}
    </div>
  );
};

interface ContractCardProps {
  contract: ContractorContractDTO;
  onSelect: () => void;
}

const ContractCard: React.FC<ContractCardProps> = ({ contract, onSelect }) => {
  const projectStatus = contract.project?.status;
  const statusClass = projectStatus ? (statusColors[projectStatus] || 'bg-gray-100 text-gray-600') : '';

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
      {/* Project Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-5 py-4 flex items-center justify-between">
        <div>
          <p className="text-blue-200 text-xs font-medium">{contract.project?.projectCode || 'N/A'}</p>
          <h2 className="text-white font-semibold text-base">{contract.project?.name || 'Unknown Project'}</h2>
          {contract.project?.location && (
            <div className="flex items-center gap-1.5 mt-1 text-blue-100">
              <MapPin className="w-3.5 h-3.5" />
              <span className="text-xs">{contract.project.location}</span>
            </div>
          )}
        </div>
        {projectStatus && (
          <span className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize ${statusClass}`}>
            {projectStatus.replace('_', ' ')}
          </span>
        )}
      </div>

      {/* Contract Details */}
      <div className="p-5">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
          <DetailItem
            icon={<DollarSign className="w-4 h-4 text-green-600" />}
            label="Contract Value"
            value={formatCurrency(contract.totalAmount)}
          />
          <DetailItem
            icon={<Briefcase className="w-4 h-4 text-blue-600" />}
            label="Contract Type"
            value={contract.contractType || '—'}
          />
          <DetailItem
            icon={<Calendar className="w-4 h-4 text-purple-600" />}
            label="Start Date"
            value={formatDate(contract.startDate)}
          />
        </div>

        {contract.isTerminated && (
          <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 rounded-lg px-3 py-2 mb-4">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>This contract has been terminated.</span>
          </div>
        )}

        <button
          onClick={onSelect}
          className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
        >
          View Payments
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

interface DetailItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

const DetailItem: React.FC<DetailItemProps> = ({ icon, label, value }) => (
  <div className="flex items-start gap-2">
    <div className="mt-0.5 flex-shrink-0">{icon}</div>
    <div>
      <p className="text-xs text-gray-400 font-medium">{label}</p>
      <p className="text-sm font-semibold text-gray-700">{value}</p>
    </div>
  </div>
);
