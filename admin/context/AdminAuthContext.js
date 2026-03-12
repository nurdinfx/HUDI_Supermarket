"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import adminApi from '@/utils/api';
import { useRouter, usePathname } from 'next/navigation';

const AdminAuthContext = createContext();

export function AdminAuthProvider({ children }) {
  const [adminUser, setAdminUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const fetchAdminUser = async () => {
      try {
        const { data } = await adminApi.get('/users/profile');
        if (data.role === 'admin') {
          setAdminUser(data);
        } else {
          setAdminUser(null);
          if (pathname !== '/login') router.push('/login');
        }
      } catch (error) {
        setAdminUser(null);
        if (pathname !== '/login') router.push('/login');
      } finally {
        setLoading(false);
      }
    };
    fetchAdminUser();
  }, [pathname, router]);

  const login = async (email, password) => {
    try {
      const { data } = await adminApi.post('/users/login', { email, password });
      if (data.role === 'admin') {
        setAdminUser(data);
        return data;
      } else {
        throw new Error('Not authorized as admin');
      }
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await adminApi.post('/users/logout');
      setAdminUser(null);
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      setAdminUser(null);
      router.push('/login');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 font-medium animate-pulse">Verifying access...</p>
        </div>
      </div>
    );
  }

  return (
    <AdminAuthContext.Provider value={{ adminUser, loading, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export const useAdminAuth = () => useContext(AdminAuthContext);
