import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** If provided, only users with these roles can access this route. */
  allowedRoles?: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated — redirect to login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Role guard — if allowedRoles is defined and user's role is not in it, redirect to their dashboard
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={getRoleDashboard(user.role)} replace />;
  }

  return <>{children}</>;
};

/**
 * Returns the home dashboard path for a given role.
 * Used by ProtectedRoute to redirect unauthorized role access.
 */
export const getRoleDashboard = (role: string): string => {
  switch (role) {
    case 'Client':
      return '/client/dashboard';
    case 'Contractor':
      return '/contractor/dashboard';
    case 'Supplier':
      return '/dashboard';
    default:
      return '/dashboard';
  }
};