import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './authContext';

const ProtectedRoute = ({ element }) => {
  const { isLoggedIn } = useAuth();
  const location = useLocation();

  // Cek keberadaan token di localStorage
  const token = localStorage.getItem('token');
  const isAuthorized = isLoggedIn && token;

  return isAuthorized ? element : <Navigate to="/login" state={{ from: location }} />;
};

export default ProtectedRoute;
