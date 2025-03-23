import React, { createContext, useEffect, useState, useRef } from 'react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

axios.defaults.withCredentials = true;
//console.log("Login response:", response.data); // Debugging
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

  // Function to check authentication and fetch user info
  const checkAuth = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/auth/testauth`);
      if (response.data.user) {
        setAuthState({
          isAuthenticated: true,
          user: response.data.user,
          loading: false,
        });

        // Store user data in localStorage
        localStorage.setItem("user", JSON.stringify(response.data.user));
      } else {
        setAuthState({ isAuthenticated: false, user: null, loading: false });
        localStorage.removeItem("user"); // Clear storage if not authenticated
      }
    } catch (err) {
      setAuthState({ isAuthenticated: false, user: null, loading: false });
      localStorage.removeItem("user");
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
      setAuthState ({
        isAuthenticated: true,
        user: response.data.user,
        loading: false,
      });

      // Store user data in localStorage
      localStorage.setItem("user", JSON.stringify(response.data.user));

      return response.data;
    } catch (error) {
      throw error;
    }
  };
   const register = async (data) => {
      try {
        const response = await axios.post('http://localhost:3000/auth/register', data);
        return response.user;
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
    <AuthContext.Provider value={{ authState, login,register, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};
