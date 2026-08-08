import React from 'react';
import { MapPin, Tag, Layers, DollarSign, Activity, Calendar, TrendingUp } from 'lucide-react';
import { useClientProject } from '../hooks/useClientProject';

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
  d ? new Date(d).toLocaleDateString('en-PK', { year: 'numeric', month: 'long', day: 'numeric' }) : '—';

export const ClientProjectView: React.FC = () => {
  const { project, loading, error } = useClientProject();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
          <p className="text-sm text-gray-500">Loading your project...</p>
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

  if (!project) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">No project found for your account.</p>
      </div>
    );
  }

  const statusClass = statusColors[project.status] || 'bg-gray-100 text-gray-700';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <p className="text-blue-200 text-sm font-medium mb-1">{project.projectCode}</p>
            <h1 className="text-2xl font-bold">{project.name}</h1>
            <div className="flex items-center gap-2 mt-2 text-blue-100">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">{project.location}</span>
            </div>
          </div>
          <span className={`px-3 py-1.5 rounded-full text-sm font-semibold capitalize ${statusClass}`}>
            {project.status.replace('_', ' ')}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="mt-5">
          <div className="flex justify-between text-blue-200 text-xs mb-1.5">
            <span>Progress</span>
            <span>{project.progress ?? 0}%</span>
          </div>
          <div className="h-2 bg-blue-500/40 rounded-full overflow-hidden">
            <div
              className="h-2 bg-white rounded-full transition-all duration-700"
              style={{ width: `${project.progress ?? 0}%` }}
            />
          </div>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <InfoCard
          icon={<DollarSign className="w-5 h-5 text-blue-600" />}
          label="Total Project Cost"
          value={formatCurrency(project.totalCost)}
          bg="bg-blue-50"
        />
        <InfoCard
          icon={<Layers className="w-5 h-5 text-purple-600" />}
          label="Total Coverage Area"
          value={project.totalCoverageArea ? `${project.totalCoverageArea.toLocaleString()} sq ft` : '—'}
          bg="bg-purple-50"
        />
        <InfoCard
          icon={<Tag className="w-5 h-5 text-green-600" />}
          label="Project Type"
          value={project.projectType === 'labourRate' ? 'Labour Rate' : 'With Material'}
          bg="bg-green-50"
        />
        <InfoCard
          icon={<Activity className="w-5 h-5 text-orange-600" />}
          label="Category"
          value={project.projectCategory ? project.projectCategory.charAt(0).toUpperCase() + project.projectCategory.slice(1) : '—'}
          bg="bg-orange-50"
        />
        <InfoCard
          icon={<Calendar className="w-5 h-5 text-sky-600" />}
          label="Start Date"
          value={formatDate(project.startDate)}
          bg="bg-sky-50"
        />
        <InfoCard
          icon={<TrendingUp className="w-5 h-5 text-rose-600" />}
          label="Est. Completion"
          value={formatDate(project.estimatedDuration)}
          bg="bg-rose-50"
        />
      </div>
    </div>
  );
};

interface InfoCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  bg: string;
}

const InfoCard: React.FC<InfoCardProps> = ({ icon, label, value, bg }) => (
  <div className={`${bg} rounded-xl p-4 flex items-start gap-3 shadow-sm border border-white`}>
    <div className="mt-0.5 flex-shrink-0">{icon}</div>
    <div>
      <p className="text-xs text-gray-500 font-medium mb-0.5">{label}</p>
      <p className="text-sm font-semibold text-gray-800">{value}</p>
    </div>
  </div>
);
