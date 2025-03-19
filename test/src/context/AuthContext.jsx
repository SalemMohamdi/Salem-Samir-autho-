import React, { createContext, useEffect, useState, useRef } from 'react';
import axios from 'axios';

// Load base API URL from environment variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

// Ensure cookies are sent with each request
axios.defaults.withCredentials = true;

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    loading: true,
  });

  const didCheckAuth = useRef(false);

  // Check if the user is already authenticated
  const checkAuth = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/auth/testauth`);
      if (response.data.message === 'Access granted') {
        setAuthState({ isAuthenticated: true, loading: false });
      } else {
        setAuthState({ isAuthenticated: false, loading: false });
      }
    } catch (err) {
      setAuthState({ isAuthenticated: false, loading: false });
    }
  };

  useEffect(() => {
    if (!didCheckAuth.current) {
      didCheckAuth.current = true;
      checkAuth();
    }
  }, []);

  // Login function
  const login = async (credentials) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, credentials);
      setAuthState({ isAuthenticated: true, loading: false });
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  // Register function
  const register = async (data) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/register`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await axios.post(`${API_BASE_URL}/auth/logout`);
      setAuthState({ isAuthenticated: false, loading: false });
    } catch (error) {
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ authState, login, register, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};
