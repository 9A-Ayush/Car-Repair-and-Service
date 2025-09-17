import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');

        if (!token || !userStr) {
          console.log('No token or user found');
          handleLogout();
          return;
        }

        try {
          // Validate token with backend
          const response = await authService.validateToken();
          if (response.success) {
            const userData = JSON.parse(userStr);
            setUser(userData);
            setIsAuthenticated(true);
            console.log('Session initialized successfully');
          } else {
            console.log('Token validation failed');
            handleLogout();
          }
        } catch (e) {
          console.error('Error validating session:', e);
          handleLogout();
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        handleLogout();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const handleLogout = () => {
    console.log('Logging out...');
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setError(null);
  };

  const login = async (email, password) => {
    try {
      const result = await authService.login(email, password);
      
      if (result.success) {
        console.log('Login successful:', result);
        setUser(result.user);
        setIsAuthenticated(true);
        setShowAuthModal(false);
        setError(null);
        return { success: true };
      } else {
        console.error('Login failed:', result.error);
        setUser(null);
        setIsAuthenticated(false);
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Login error:', error);
      setUser(null);
      setIsAuthenticated(false);
      const errorMessage = error.response?.data?.message || error.message || 'Login failed. Please try again.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const register = async (name, email, password) => {
    try {
      const result = await authService.register(name, email, password);
      
      if (result.success) {
        console.log('Registration successful:', result);
        setUser(result.user);
        setIsAuthenticated(true);
        setShowAuthModal(false);
        setError(null);
        return { success: true };
      } else {
        console.error('Registration failed:', result.error);
        setUser(null);
        setIsAuthenticated(false);
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Registration error:', error);
      setUser(null);
      setIsAuthenticated(false);
      const errorMessage = error.response?.data?.message || error.message || 'Registration failed. Please try again.';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    error,
    showAuthModal,
    setShowAuthModal,
    login,
    register,
    logout: handleLogout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export { useAuth, AuthProvider };