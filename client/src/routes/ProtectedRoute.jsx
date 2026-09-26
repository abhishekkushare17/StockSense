import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Loading, Badge } from '../components/common';
import { ShieldAlert } from 'lucide-react';

export const ProtectedRoute = ({ allowedRoles, children }) => {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Loading type="screen" message="Authenticating session..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && (!user || !allowedRoles.includes(user.role))) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Access Restricted</h2>
        <p className="text-sm text-gray-500 max-w-md mb-4">
          Your role (<span className="font-semibold">{user?.role}</span>) is not permitted to access this module.
        </p>
        <Badge variant="danger">Unauthorized Action</Badge>
      </div>
    );
  }

  return children ? children : <Outlet />;
};

export default ProtectedRoute;
