import React, { createContext, useEffect, useState, useRef } from 'react';
import axios from 'axios';

// Load base API URL from environment variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

// Ensure cookies are sent with each request
axios.defaults.withCredentials = true;

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Retrieve stored user info from localStorage on load
  const storedUser = JSON.parse(localStorage.getItem("user"));
  const [authState, setAuthState] = useState({
    isAuthenticated: storedUser ? true : false,
    user: storedUser || null,
    loading: true,
  });

  const didCheckAuth = useRef(false);

  // Check if the user is already authenticated and merge new attributes
  const checkAuth = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/auth/testauth`);
  
      console.log("Auth check response:", response.data); // Debugging
  
      if (response.data.user) {
        setAuthState((prevState) => ({
          isAuthenticated: true,
          user: { ...prevState.user, ...response.data.user }, // Merge existing user data with updated attributes
          loading: false,
        }));
  
        localStorage.setItem("user", JSON.stringify({ ...storedUser, ...response.data.user }));
      } else {
        setAuthState((prevState) => ({
          isAuthenticated: false,
          user: prevState.user, // Keep previous user data
          loading: false,
        }));
      }
    } catch (err) {
      setAuthState((prevState) => ({
        isAuthenticated: false,
        user: prevState.user, // Keep previous user data in case of error
        loading: false,
      }));
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
  
      console.log("Login response:", response.data); // Debugging
  
      setAuthState({
        isAuthenticated: true,
        user: response.data.user,
        loading: false,
      });
  
      localStorage.setItem("user", JSON.stringify(response.data.user));
  
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  // Register function
  const register = async (data) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/register`, data);
      
      if (response.data.user) {
        setAuthState({
          isAuthenticated: true,
          user: response.data.user,
          loading: false,
        });
  
        // Store user in localStorage
        localStorage.setItem("user", JSON.stringify(response.data.user));
      }
  
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await axios.post(`${API_BASE_URL}/auth/logout`);
      setAuthState({ isAuthenticated: false, user: null, loading: false });
      localStorage.removeItem("user"); // Clear storage on logout
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