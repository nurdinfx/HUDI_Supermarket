"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://hudi-supermarket.onrender.com/api';

// Shared axios instance with credentials (sends cookies)
const authApi = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await authApi.get('/users/profile');
        setUser(data);
      } catch {
        // Not logged in — expected when no session exists
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const login = async (email, password) => {
    const { data } = await authApi.post('/users/login', { email, password }, { withCredentials: true });
    setUser(data);
    return data;
  };

  const register = async (name, email, password) => {
    const { data } = await authApi.post('/users/', { name, email, password });
    setUser(data);
    return data;
  };

  const logout = async () => {
    try {
      await authApi.post('/users/logout');
    } catch {
      // Ignore logout errors
    }
    setUser(null);
  };

  const updateProfile = async (formData) => {
    const { data } = await authApi.put('/users/profile', formData);
    setUser(data);
    return data;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
