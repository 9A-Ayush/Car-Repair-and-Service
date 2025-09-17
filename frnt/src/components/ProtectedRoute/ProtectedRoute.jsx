import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // If still loading auth state, show nothing temporarily
  if (loading) {
    return <div className="loading-auth">Checking authentication...</div>;
  }

  if (!isAuthenticated) {
    // Store the current path in sessionStorage instead of using location state
    // This prevents state from being lost during redirects
    sessionStorage.setItem('redirectPath', location.pathname);
    
    // Redirect to home without using state to avoid potential loops
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
