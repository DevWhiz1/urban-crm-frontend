import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '../services/authService';

interface User {
  id: string;
  userName: string;
  email: string;
  role: string;
  status?: string;
}

interface AuthContextType {
  user: User | null;
  login: (credentials: { email: string; password: string }) => Promise<User>;
  register: (userData: { userName: string; email: string; password: string }) => Promise<any>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  /**
   * On every app mount, call /api/auth/me.
   * The httpOnly cookie is sent automatically by the browser.
   * If valid, the server returns the user profile — no localStorage needed.
   * If 401, the user is not logged in; we stay on the login page.
   */
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const response = await authService.getMe();
        if (response?.user) {
          setUser(response.user);
        }
      } catch {
        // Not authenticated — user stays null, app shows login page
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials: { email: string; password: string }): Promise<User> => {
    try {
      const response = await authService.login(credentials);
      if (response.user) {
        // Token is in the httpOnly cookie — we only store the non-sensitive profile
        setUser(response.user);
        return response.user;
      }
      throw new Error('No user returned from login.');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  };

  const register = async (userData: { userName: string; email: string; password: string }) => {
    try {
      const response = await authService.register(userData);
      if (response.user) {
        setUser(response.user);
      }
      return response;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  };

  const logout = async () => {
    try {
      // Ask the server to clear the httpOnly cookie
      await authService.logout();
    } catch {
      // Even if the request fails, clear client-side state
    } finally {
      setUser(null);
    }
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};