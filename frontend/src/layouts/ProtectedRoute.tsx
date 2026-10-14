import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Role } from '../types';

interface ProtectedRouteProps {
  allowedRoles?: Role[];
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles, children }) => {
  const { user, role, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#040711] flex flex-col items-center justify-center gap-4">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-2 border-indigo-500/20" />
          <div className="w-12 h-12 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
        </div>
        <p className="text-xs font-mono text-slate-400 tracking-wider">VERIFYING AI AUTHENTICATION...</p>
      </div>
    );
  }

  // Not authenticated -> redirect to appropriate login portal
  if (!isAuthenticated || !user) {
    if (location.pathname.startsWith('/admin')) {
      return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }
    if (location.pathname.startsWith('/recruiter')) {
      return <Navigate to="/login/recruiter" state={{ from: location }} replace />;
    }
    if (location.pathname.startsWith('/candidate')) {
      return <Navigate to="/login/candidate" state={{ from: location }} replace />;
    }
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Role checking
  if (allowedRoles && !allowedRoles.includes(role)) {
    // Deny non-admin access to admin routes
    if (location.pathname.startsWith('/admin')) {
      if (role === 'candidate') {
        return <Navigate to="/candidate" replace state={{ error: 'Access denied: Administrator privileges required.' }} />;
      }
      if (role === 'recruiter') {
        return <Navigate to="/recruiter" replace state={{ error: 'Access denied: Administrator privileges required.' }} />;
      }
    }
    if (role === 'candidate') return <Navigate to="/candidate" replace />;
    if (role === 'recruiter') return <Navigate to="/recruiter" replace />;
    if (role === 'admin') return <Navigate to="/admin" replace />;
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

