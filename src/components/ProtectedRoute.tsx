import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import type { RootState } from '../toolkit/store';
import { LoadingSpinner } from './LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermissions?: string[];
}

export function ProtectedRoute({ children, requiredPermissions = [] }: ProtectedRouteProps) {
  const { isAuthenticated, loading, user } = useSelector((state: RootState) => state.authentication);
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading) {
    return <LoadingSpinner />;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check permissions if required
  if (requiredPermissions.length > 0 && user) {
    const hasPermission = requiredPermissions.some(permission => {
      // Check if user has the specific permission
      if (user.role?.permissions?.includes(permission)) return true;
      
      // Check for wildcard permissions (e.g., "orders:*" matches "orders:create")
      const [resource] = permission.split(':');
      const wildcardPermission = `${resource}:*`;
      return user.role?.permissions?.includes(wildcardPermission);
    });

    if (!hasPermission) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <>{children}</>;
}
