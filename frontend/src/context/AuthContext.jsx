// context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Create the context
const AuthContext = createContext();

// Create the provider component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [jobViewMode, setJobViewMode] = useState('recommended');

  useEffect(() => {
    // Check if user is logged in from localStorage
    const checkAuth = () => {
      const isLoggedIn = localStorage.getItem('isLoggedIn');
      const userData = localStorage.getItem('user');
      
      if (isLoggedIn && userData) {
        setCurrentUser(JSON.parse(userData));
        setIsAuthenticated(true);
      }
      
      setIsLoading(false);
    };
    
    checkAuth();
  }, []);

  const toggleJobViewMode = async (mode) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/api/jobs/toggle-mode`,
        { mode },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setJobViewMode(mode);
    } catch (error) {
      console.error('Error toggling job view mode:', error);
    }
  };

  // Value to be provided by the context
  const value = {
    currentUser,
    isAuthenticated,
    isLoading,
    setCurrentUser,
    setIsAuthenticated,
    jobViewMode,
    setJobViewMode,
    toggleJobViewMode
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuthContext = () => {
  return useContext(AuthContext);
};

export default AuthContext;