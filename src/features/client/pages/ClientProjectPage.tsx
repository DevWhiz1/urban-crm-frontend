import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import apiClient from '../../../services/apiClient';

const statusColors: Record<string, string> = {
  planning: 'bg-blue-100 text-blue-700',
  pending: 'bg-yellow-100 text-yellow-700',
  ongoing: 'bg-green-100 text-green-700',
  completed: 'bg-emerald-100 text-emerald-700',
  on_hold: 'bg-orange-100 text-orange-700',
  cancelled: 'bg-red-100 text-red-700',
};

const fmt = (n: number | undefined) => (n != null ? `PKR ${n.toLocaleString()}` : '—');
const fmtDate = (d: string | undefined) =>
  d ? new Date(d).toLocaleDateString('en-PK', { year: 'numeric', month: 'long', day: 'numeric' }) : '—';

export const ClientProjectPage: React.FC = () => {
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    apiClient
      .get('/api/portal/client/project')
      .then((r) => setProject(r.data.project))
      .catch((e) => setError(e?.response?.data?.message || 'Failed to load project.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      {/* Breadcrumb */}
      <nav className="flex items-center text-sm text-gray-500 gap-1.5">
        <Link to="/client/dashboard" className="hover:text-blue-600">Dashboard</Link>
        <ChevronRight className="w-4 h-4 text-gray-400" />
        <span className="text-gray-900 font-semibold">My Project</span>
      </nav>

      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 tracking-tight">My Project</h1>
          <p className="text-sm text-gray-500 mt-1">
            {project ? `${project.projectCode} — ${project.name}` : 'Project details'}
          </p>
        </div>
        {project?.status && (
          <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${statusColors[project.status] || 'bg-gray-100 text-gray-600'}`}>
            {project.status.replace('_', ' ')}
          </span>
        )}
      </div>

      {loading && (
        <div className="bg-white rounded-lg border border-gray-200 p-10 flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      )}

      {!loading && error && (
        <div className="bg-white rounded-lg border border-gray-200 p-10 text-center text-gray-500">{error}</div>
      )}

      {!loading && !error && !project && (
        <div className="bg-white rounded-lg border border-gray-200 p-10 text-center text-gray-500">No project found for your account.</div>
      )}

      {!loading && !error && project && (
        <div className="space-y-4">
          {/* Progress bar */}
          {typeof project.progress === 'number' && (
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium text-gray-600">Progress</span>
                <span className="font-semibold text-gray-800">{project.progress}%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-2 bg-blue-600 rounded-full" style={{ width: `${project.progress}%` }} />
              </div>
            </div>
          )}

          {/* Detail table */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <tbody className="divide-y divide-gray-50">
                {[
                  ['Project Name', project.name],
                  ['Project Code', project.projectCode],
                  ['Location', project.location],
                  ['Category', project.projectCategory],
                  ['Type', project.projectType === 'labourRate' ? 'Labour Rate' : 'With Material'],
                  ['Coverage Area', project.totalCoverageArea ? `${project.totalCoverageArea.toLocaleString()} sq ft` : '—'],
                  ['Total Cost', fmt(project.totalCost)],
                  ['Start Date', fmtDate(project.startDate)],
                  ['Est. Completion', fmtDate(project.estimatedDuration)],
                ].map(([label, val]) => (
                  <tr key={label as string} className="hover:bg-gray-50">
                    <td className="px-5 py-3 text-gray-500 font-medium w-52">{label}</td>
                    <td className="px-5 py-3 text-gray-800 font-medium">{val || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
