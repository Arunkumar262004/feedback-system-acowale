import { createContext, useContext, useState, useCallback } from 'react';
import { api } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('acowale_token'));
  const [user, setUser] = useState(null);

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const login = useCallback(async (email, password) => {
    const res = await api.login(email, password);
    const { token: t, user: u } = res.data.data;
    localStorage.setItem('acowale_token', t);
    setToken(t);
    setUser(u);
    return u;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('acowale_token');
    setToken(null);
    setUser(null);
  }, []);

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed((prev) => !prev);
  }, []);

  return (
    <AuthContext.Provider value={{ token, user, login, logout, isAuthenticated: !!token, sidebarCollapsed, toggleSidebar }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
