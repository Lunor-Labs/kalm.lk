import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types/auth';

interface WithRoleOptions {
  allowAnonymous?: boolean;
  redirectTo?: string;
}

export function withRole<P extends object>(
  Component: React.ComponentType<P>,
  requiredRole: UserRole,
  options: WithRoleOptions = {}
) {
  const { allowAnonymous = false, redirectTo = '/unauthorized' } = options;

  return function ProtectedComponent(props: P) {
    const { user, loading } = useAuth();

    if (loading) {
      return (
        <div className="min-h-screen bg-neutral-900 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white">Loading...</p>
          </div>
        </div>
      );
    }

    if (!user) {
      return <Navigate to="/login" replace />;
    }

    if (!allowAnonymous && user.isAnonymous && requiredRole !== 'client') {
      return <Navigate to={redirectTo} replace />;
    }

    if (user.role !== requiredRole) {
      return <Navigate to={redirectTo} replace />;
    }

    return <Component {...props} />;
  };
}