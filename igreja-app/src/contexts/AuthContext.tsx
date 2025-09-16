import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User, AuthContextType, RegisterData } from '../types/hierarchy';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// API Helper functions - usando apenas backend próprio
const apiCallAuth = async (endpoint: string, options: RequestInit = {}) => {
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
  
  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Adicionar token de autenticação se existir
  const token = localStorage.getItem('igreja_token');
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${baseUrl}${endpoint}`, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  return await response.json();
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Estado inicial correto: usuário null, carregamento true
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Verificação de sessão usando backend próprio
  useEffect(() => {
    const verificarSessaoAtiva = async () => {
      console.log("📋 PASSO 1: Iniciando verificação da sessão...");
      setIsLoading(true);
      try {
        // Verificar se existe token no localStorage
        const token = localStorage.getItem('igreja_token');
        if (!token) {
          console.log("📋 PASSO 2 (INFO): Nenhum token encontrado.");
          setUser(null);
          return;
        }

        // Validar token com o backend
        const response = await apiCallAuth('/auth/validate', {
          method: 'GET',
        });

        if (response.user) {
          console.log("📋 PASSO 2: Token válido. Dados do usuário:", response.user);
          
          const usuarioCompleto: User = {
            id: response.user.id,
            email: response.user.email,
            name: response.user.name,
            role: response.user.role || 'Membro',
            memberSince: response.user.created_at || response.user.member_since,
            isActive: response.user.status === 'Ativo' || response.user.is_active,
            avatar: response.user.avatar,
            phone: response.user.phone,
            supervisor_id: response.user.supervisor_id,
            coordinator_id: response.user.coordinator_id,
            cell_id: response.user.cell_id,
            celulaNome: response.user.cell_name,
            oikos_name: response.user.oikos_name
          };
          
          setUser(usuarioCompleto);
        } else {
          console.log("📋 PASSO 2 (INFO): Token inválido ou expirado.");
          localStorage.removeItem('igreja_token');
          setUser(null);
        }
      } catch (error) {
        console.error("ERRO GERAL no bloco de verificação de sessão:", error);
        localStorage.removeItem('igreja_token');
        setUser(null);
      } finally {
        console.log("📋 PASSO 4: Finalizando verificação. isLoading será 'false'.");
        setIsLoading(false);
      }
    };

    verificarSessaoAtiva();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const response = await apiCallAuth('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email,
          password
        }),
      });
      
      if (response.token && response.user) {
        // Salvar token no localStorage
        localStorage.setItem('igreja_token', response.token);
        
        console.log('✅ AUTH DEBUG - Login realizado com sucesso:', response.user.name);
        
        const usuarioCompleto: User = {
          id: response.user.id,
          email: response.user.email,
          name: response.user.name,
          role: response.user.role || 'Membro',
          memberSince: response.user.created_at || response.user.member_since,
          isActive: response.user.status === 'Ativo' || response.user.is_active,
          avatar: response.user.avatar,
          phone: response.user.phone,
          supervisor_id: response.user.supervisor_id,
          coordinator_id: response.user.coordinator_id,
          cell_id: response.user.cell_id,
          celulaNome: response.user.cell_name,
          oikos_name: response.user.oikos_name
        };
        
        setUser(usuarioCompleto);
        return true;
      }
      
      console.error('❌ AUTH DEBUG - Credenciais inválidas');
      return false;
    } catch (error) {
      console.error('❌ AUTH DEBUG - Erro geral no login:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Chamar endpoint de logout no backend se necessário
      const token = localStorage.getItem('igreja_token');
      if (token) {
        try {
          await apiCallAuth('/auth/logout', {
            method: 'POST',
          });
        } catch (error) {
          console.warn('Erro ao fazer logout no servidor:', error);
        }
      }
      
      setUser(null);
      
      // Limpar dados persistidos no localStorage e sessionStorage
      localStorage.removeItem('igreja_user');
      localStorage.removeItem('igreja_token');
      sessionStorage.removeItem('igreja_user');
      sessionStorage.removeItem('igreja_token');
      
      console.log('✅ AUTH DEBUG - Logout realizado com sucesso');
    } catch (error) {
      console.error('Logout error:', error);
      // Mesmo com erro, limpar o estado local e dados persistidos
      setUser(null);
      localStorage.removeItem('igreja_user');
      localStorage.removeItem('igreja_token');
      sessionStorage.removeItem('igreja_user');
      sessionStorage.removeItem('igreja_token');
    }
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
      
      if (response.token && response.user) {
        // Salvar token no localStorage
        localStorage.setItem('igreja_token', response.token);
        
        console.log('✅ AUTH DEBUG - Registro realizado com sucesso:', response.user.name);
        
        const usuarioCompleto: User = {
          id: response.user.id,
          email: response.user.email,
          name: response.user.name,
          role: response.user.role || 'Membro',
          memberSince: response.user.created_at || response.user.member_since,
          isActive: response.user.status === 'Ativo' || response.user.is_active,
          avatar: response.user.avatar,
          phone: response.user.phone,
          supervisor_id: response.user.supervisor_id,
          coordinator_id: response.user.coordinator_id,
          cell_id: response.user.cell_id,
          celulaNome: response.user.cell_name,
          oikos_name: response.user.oikos_name
        };
        
        setUser(usuarioCompleto);
        return true;
      }
      
      console.error('❌ AUTH DEBUG - Erro no registro');
      return false;
    } catch (error) {
      console.error('❌ AUTH DEBUG - Erro geral no registro:', error);
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