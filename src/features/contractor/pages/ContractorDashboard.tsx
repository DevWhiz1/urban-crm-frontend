import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Handshake, Banknote, Clock } from 'lucide-react';
import apiClient from '../../../services/apiClient';

const fmt = (n: number | undefined) => (n != null ? `PKR ${n.toLocaleString()}` : '—');

export const ContractorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient
      .get('/api/portal/contractor/summary')
      .then((r) => setSummary(r.data.summary))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 tracking-tight">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Welcome back!</p>
        </div>
        {!loading && summary && (
          <span className="mt-2 sm:mt-0 self-start sm:self-auto px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
            {summary.activeContracts} Active Contract{summary.activeContracts !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
        <NavCard
          icon={<Handshake className="w-5 h-5 text-gray-600" />}
          title="My Contracts"
          description="View assigned contracts"
          onClick={() => navigate('/contractor/contracts')}
          loading={loading}
        />
        <NavCard
          icon={<Banknote className="w-5 h-5 text-gray-600" />}
          title="Payments"
          description="View payment history"
          onClick={() => navigate('/contractor/payments')}
          loading={loading}
        />
        <NavCard
          icon={<Clock className="w-5 h-5 text-gray-600" />}
          title="Pending Balance"
          description="Outstanding amount"
          onClick={() => navigate('/contractor/payments')}
          loading={loading}
        />
      </div>
    </div>
  );
};

interface NavCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
  loading?: boolean;
  badge?: string;
  badgeLabel?: string;
  highlight?: boolean;
}

const NavCard: React.FC<NavCardProps> = ({
  icon, title, description, onClick, loading, badge, badgeLabel, highlight,
}) => (
  <button
    onClick={onClick}
    className="bg-white rounded-lg border border-gray-200 p-4 hover:border-gray-400 hover:shadow-sm transition-all group text-left w-full focus:outline-none focus:ring-2 focus:ring-gray-200"
  >
    <div className="flex items-center space-x-3">
      <div className={`w-10 h-10 rounded-lg border flex items-center justify-center group-hover:bg-gray-100 transition-colors ${
        highlight ? 'bg-orange-50 border-orange-100' : 'bg-gray-50 border-gray-100'
      }`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-base font-medium text-gray-900">{title}</h3>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
    </div>
    {badge && !loading && (
      <div className="mt-3 pt-3 border-t border-gray-100">
        <p className="text-xs text-gray-400">{badgeLabel}</p>
        <p className={`text-sm font-semibold ${highlight ? 'text-orange-600' : 'text-gray-800'}`}>
          {badge}
        </p>
      </div>
    )}
    {loading && (
      <div className="mt-3 pt-3 border-t border-gray-100">
        <div className="h-3 bg-gray-100 rounded animate-pulse w-24" />
      </div>
    )}
  </button>
);
