import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Home } from 'lucide-react';

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="flex flex-col items-center">
          <div className="bg-blue-100 p-4 rounded-full mb-6">
            <AlertTriangle className="h-16 w-16 text-blue-600" />
          </div>
          <h2 className="mt-2 text-4xl font-extrabold text-slate-900 tracking-tight">
            404
          </h2>
          <h3 className="mt-2 text-2xl font-bold text-slate-800">
            Page Not Found
          </h3>
          <p className="mt-4 text-base text-slate-500 max-w-sm mx-auto">
            Sorry, we couldn't find the page you're looking for. It might have been moved or doesn't exist.
          </p>
        </div>
        
        <div className="mt-8 flex justify-center">
          <Link
            to="/dashboard"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <Home className="w-5 h-5 mr-2" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};
