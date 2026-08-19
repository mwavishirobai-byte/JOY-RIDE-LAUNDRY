import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '../types';
import { api, ApiError } from '../lib/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<User>;
  adminLogin: (email: string, password: string) => Promise<User>;
  register: (data: { fullName: string; email: string; phone: string; password: string; address?: string; area?: string }) => Promise<User>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<User>;
  refreshMe: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('jrl_auth_token'));
  const [loading, setLoading] = useState<boolean>(true);

  const refreshMe = useCallback(async () => {
    const savedToken = localStorage.getItem('jrl_auth_token');
    if (!savedToken) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await api.getMe();
      setUser(res.user);
    } catch (err) {
      localStorage.removeItem('jrl_auth_token');
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshMe();
  }, [refreshMe]);

  const login = async (email: string, password: string) => {
    try {
      const res = await api.login({ email, password });
      localStorage.setItem('jrl_auth_token', res.token);
      setToken(res.token);
      setUser(res.user);
      return res.user;
    } catch (err: any) {
      throw err;
    }
  };

  const adminLogin = async (email: string, password: string) => {
    try {
      const res = await api.adminLogin({ email, password });
      localStorage.setItem('jrl_auth_token', res.token);
      setToken(res.token);
      setUser(res.user);
      return res.user;
    } catch (err: any) {
      throw err;
    }
  };

  const register = async (data: { fullName: string; email: string; phone: string; password: string; address?: string; area?: string }) => {
    try {
      const res = await api.register(data);
      localStorage.setItem('jrl_auth_token', res.token);
      setToken(res.token);
      setUser(res.user);
      return res.user;
    } catch (err: any) {
      throw err;
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    const res = await api.updateProfile(data);
    setUser(res.user);
    return res.user;
  };

  const logout = () => {
    localStorage.removeItem('jrl_auth_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAdmin: user?.role === 'admin',
        login,
        adminLogin,
        register,
        logout,
        updateProfile,
        refreshMe,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
