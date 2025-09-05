import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User, AuthContextType, RegisterData, UserRole } from '../types/hierarchy';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

import { apiCall, ENDPOINTS } from '../utils/api';

// API Helper functions
const apiCallAuth = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('igreja_token') || sessionStorage.getItem('igreja_token');
  
  const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  });
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }
  
  return response.json();
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for stored authentication on component mount
  useEffect(() => {
    const checkStoredAuth = async () => {
      try {
        const storedToken = localStorage.getItem('igreja_token') || sessionStorage.getItem('igreja_token');
        console.log('🔍 AUTH DEBUG - Token encontrado:', !!storedToken);
        
        if (storedToken) {
          // Verify token with backend
          const response = await apiCallAuth('/auth/verify');
          console.log('🔍 AUTH DEBUG - Resposta da verificação:', response);
          if (response.user) {
            console.log('🔍 AUTH DEBUG - Usuário carregado:', response.user);
            console.log('🔍 AUTH DEBUG - cell_id do usuário:', response.user.cell_id);
            setUser(response.user);
          } else {
            console.log('❌ AUTH DEBUG - Token inválido, limpando storage');
            // Token is invalid, clear storage
            localStorage.removeItem('igreja_user');
            localStorage.removeItem('igreja_token');
            sessionStorage.removeItem('igreja_user');
            sessionStorage.removeItem('igreja_token');
          }
        } else {
          console.log('❌ AUTH DEBUG - Nenhum token encontrado');
        }
      } catch (error) {
        console.error('❌ AUTH DEBUG - Erro na verificação:', error);
        // Clear invalid stored data
        localStorage.removeItem('igreja_user');
        localStorage.removeItem('igreja_token');
        sessionStorage.removeItem('igreja_user');
        sessionStorage.removeItem('igreja_token');
      } finally {
        setIsLoading(false);
      }
    };

    checkStoredAuth();
  }, []);

  const login = async (email: string, password: string, rememberMe: boolean = false): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const response = await apiCallAuth('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      
      if (response.token && response.user) {
        setUser(response.user);
        
        // Store authentication data
        if (rememberMe) {
          localStorage.setItem('igreja_user', JSON.stringify(response.user));
          localStorage.setItem('igreja_token', response.token);
        } else {
          sessionStorage.setItem('igreja_user', JSON.stringify(response.user));
          sessionStorage.setItem('igreja_token', response.token);
        }
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    
    // Clear stored authentication data
    localStorage.removeItem('igreja_user');
    localStorage.removeItem('igreja_token');
    sessionStorage.removeItem('igreja_user');
    sessionStorage.removeItem('igreja_token');
  };

  const register = async (userData: RegisterData): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const response = await apiCallAuth('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: userData.name,
          email: userData.email,
          password: userData.password,
          phone: userData.phone,
          cell_id: userData.cell_id,
          oikos_name: userData.oikos_name
        }),
      });
      
      if (response.user) {
        // Auto-login after successful registration
        const loginSuccess = await login(userData.email, userData.password, true);
        return loginSuccess;
      }
      
      return false;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (userData: Partial<User>): Promise<boolean> => {
    if (!user) return false;
    
    setIsLoading(true);
    
    try {
      const response = await apiCallAuth(`/users/${user.id}`, {
        method: 'PUT',
        body: JSON.stringify(userData),
      });
      
      if (response.user) {
        setUser(response.user);
        
        // Update stored data
        if (localStorage.getItem('igreja_user')) {
          localStorage.setItem('igreja_user', JSON.stringify(response.user));
        } else if (sessionStorage.getItem('igreja_user')) {
          sessionStorage.setItem('igreja_user', JSON.stringify(response.user));
        }
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Profile update error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    register,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;