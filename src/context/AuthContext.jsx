import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { authApi, authEndpoints } from '../utils/authApi';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(true);

  const refreshSession = async () => {
    try {
      const response = await authApi.get(authEndpoints.me);
      setUser(response.data.user);
      return response.data.user;
    } catch (error) {
      setUser(null);
      return null;
    } finally {
      setLoading(false);
      setInitializing(false);
    }
  };

  useEffect(() => {
    refreshSession();
  }, []);

  const login = async (payload) => {
    const response = await authApi.post(authEndpoints.login, payload);
    setUser(response.data.user);
    return response.data;
  };

  const register = async (payload) => {
    const response = await authApi.post(authEndpoints.register, payload);
    setUser(response.data.user);
    return response.data;
  };

  const logout = async () => {
    await authApi.post(authEndpoints.logout);
    setUser(null);
  };

  const forgotPassword = async (payload) => {
    const response = await authApi.post(authEndpoints.forgotPassword, payload);
    return response.data;
  };

  const resetPassword = async (token, payload) => {
    const response = await authApi.post(authEndpoints.resetPassword(token), payload);
    setUser(response.data.user);
    return response.data;
  };

  const value = useMemo(() => ({
    user,
    isAuthenticated: Boolean(user),
    loading: initializing,
    login,
    register,
    logout,
    refreshSession,
    forgotPassword,
    resetPassword,
  }), [user, initializing]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
