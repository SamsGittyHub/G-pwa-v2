import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { API_BASE_URL, AUTH_API_URL } from '@/lib/env';

interface AuthUser {
  id: number;
  email: string;
  username: string;
}

interface AuthContextType {
  user: AuthUser | null;
  externalUserId: number | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; message: string }>;
  signup: (email: string, username: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'tripleg_auth_token';
const USER_KEY = 'tripleg_auth_user';

// Resolve auth endpoint from env or Vite-defined fallback
const getAuthUrl = () => {
  const url = AUTH_API_URL || (API_BASE_URL ? `${API_BASE_URL}/api/auth` : '');
  if (!url) {
    throw new Error('API base URL is not configured');
  }
  return url;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Verify token and restore session on mount
  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem(TOKEN_KEY);
      const storedUser = localStorage.getItem(USER_KEY);
      
      if (token && storedUser) {
        try {
          // Verify token with backend
          const response = await fetch(getAuthUrl(), {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ action: 'verify' })
          });

          const data = await response.json();

          if (data?.success && data?.user) {
            setUser(data.user);
          } else {
            // Token invalid, clear storage
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(USER_KEY);
          }
        } catch (error) {
          console.error('Session restore error:', error);
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(USER_KEY);
        }
      }
      
      setIsLoading(false);
    };

    restoreSession();
  }, []);

  const login = async (username: string, password: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await fetch(getAuthUrl(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', username, password })
      });

      const data = await response.json();

      if (!data?.success) {
        return { success: false, message: data?.error || 'Login failed' };
      }

      // Store token and user
      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      setUser(data.user);

      return { success: true, message: 'Login successful' };
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : 'An unexpected error occurred' };
    }
  };

  const signup = async (email: string, username: string, password: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await fetch(getAuthUrl(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'signup', email: email || null, username, password })
      });

      if (!response.ok) {
        return { success: false, message: `Server error: ${response.status}. Unable to reach auth service.` };
      }

      const data = await response.json();

      if (!data?.success) {
        return { success: false, message: data?.error || 'Signup failed' };
      }

      // Store token and user
      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      setUser(data.user);

      return { success: true, message: 'Account created successfully' };
    } catch (error) {
      return { success: false, message: error instanceof Error ? error.message : 'Unable to connect to server' };
    }
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      externalUserId: user?.id ?? null,
      isAuthenticated: !!user,
      isLoading,
      login,
      signup,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
