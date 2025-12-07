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

// Perform auth request; try REST-style endpoints first, then legacy action body
const authRequest = async (
  endpoint: 'login' | 'signup' | 'verify',
  payload: Record<string, unknown>,
  authToken?: string
) => {
  const base = getAuthUrl();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  // First attempt: RESTful endpoint (e.g., /api/auth/login)
  const primary = await fetch(`${base}/${endpoint}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  // If 404, retry legacy single-endpoint with action
  if (primary.status === 404) {
    const fallback = await fetch(base, {
      method: 'POST',
      headers,
      body: JSON.stringify({ action: endpoint, ...payload }),
    });
    return fallback;
  }

  return primary;
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
          const response = await authRequest('verify', {}, token);

          // If verify endpoint doesn't exist (404), trust local storage
          if (response.status === 404) {
            setUser(JSON.parse(storedUser));
          } else if (response.ok) {
            const data = await response.json();
            // Handle both {success, user} and direct {user} responses
            const userData = data?.user || (data?.id ? data : null);
            if (userData) {
              setUser(userData);
            } else {
              localStorage.removeItem(TOKEN_KEY);
              localStorage.removeItem(USER_KEY);
            }
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
      const response = await authRequest('login', {
        username,
        email: username, // some backends expect email instead of username
        password,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return { success: false, message: errorData?.error || `Login failed (${response.status})` };
      }

      const data = await response.json();

      // Handle both {success, token, user} and direct {token, user} responses
      if (data?.error || (data?.success === false)) {
        return { success: false, message: data?.error || 'Login failed' };
      }

      if (!data?.token || !data?.user) {
        return { success: false, message: 'Invalid response from server' };
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
      const response = await authRequest('signup', {
        email: email || username, // fallback to username as email if not provided
        username,
        password,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return { success: false, message: errorData?.error || `Signup failed (${response.status})` };
      }

      const data = await response.json();

      // Handle both {success, token, user} and direct {token, user} responses
      if (data?.error || (data?.success === false)) {
        return { success: false, message: data?.error || 'Signup failed' };
      }

      if (!data?.token || !data?.user) {
        return { success: false, message: 'Invalid response from server' };
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
