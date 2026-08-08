import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FolderOpen, Banknote } from 'lucide-react';

export const ClientDashboard: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      {/* Header — same as admin */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 tracking-tight">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Welcome back!</p>
        </div>
      </div>

      {/* Navigation Cards — exact same style as admin dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
        <button
          onClick={() => navigate('/client/project')}
          className="bg-white rounded-lg border border-gray-200 p-4 hover:border-gray-400 hover:shadow-sm transition-all group text-left w-full focus:outline-none focus:ring-2 focus:ring-gray-200"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-50 rounded-lg border border-gray-100 flex items-center justify-center group-hover:bg-gray-100 transition-colors">
              <FolderOpen className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <h3 className="text-base font-medium text-gray-900">My Project</h3>
              <p className="text-xs text-gray-500">View project details</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => navigate('/client/payments')}
          className="bg-white rounded-lg border border-gray-200 p-4 hover:border-gray-400 hover:shadow-sm transition-all group text-left w-full focus:outline-none focus:ring-2 focus:ring-gray-200"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-50 rounded-lg border border-gray-100 flex items-center justify-center group-hover:bg-gray-100 transition-colors">
              <Banknote className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <h3 className="text-base font-medium text-gray-900">Payments</h3>
              <p className="text-xs text-gray-500">View payment history</p>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
};
