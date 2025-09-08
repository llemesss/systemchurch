import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User, AuthContextType, RegisterData } from '../types/hierarchy';
import { supabase } from '../supabaseClient';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// API Helper functions
const apiCallAuth = async (endpoint: string, options: RequestInit = {}) => {
  // Usar Supabase através do utilitário de API
  const { apiCall: supabaseApiCall } = await import('../utils/api');
  return await supabaseApiCall(endpoint, options);
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for Supabase authentication on component mount
  useEffect(() => {
    const checkSupabaseAuth = async () => {
      try {
        // Timeout para evitar carregamento infinito
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout na verificação de autenticação')), 10000)
        );
        
        const authPromise = supabase.auth.getSession();
        
        const { data: { session } } = await Promise.race([authPromise, timeoutPromise]) as any;
        console.log('🔍 AUTH DEBUG - Sessão encontrada:', !!session);
        
        if (session?.user) {
          // Buscar dados adicionais do usuário
          try {
            const userDataPromise = apiCallAuth('/auth/me');
            const userTimeoutPromise = new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Timeout ao buscar dados do usuário')), 5000)
            );
            
            const response = await Promise.race([userDataPromise, userTimeoutPromise]);
            console.log('🔍 AUTH DEBUG - Usuário carregado:', response);
            setUser(response);
          } catch (error) {
            console.warn('⚠️ AUTH DEBUG - Erro ao buscar dados do usuário, usando dados básicos:', error);
            // Usar dados básicos do auth se não conseguir buscar da tabela customizada
            setUser({
              id: session.user.id,
              email: session.user.email || '',
              name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'Usuário',
              role: 'Membro',
              memberSince: session.user.created_at || new Date().toISOString(),
              isActive: true
            });
          }
        } else {
          console.log('❌ AUTH DEBUG - Nenhuma sessão encontrada');
          setUser(null);
        }
      } catch (error) {
        console.error('❌ AUTH DEBUG - Erro na verificação da sessão:', error);
        // Em caso de timeout ou erro, definir como não autenticado
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkSupabaseAuth();

    // Listener para mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔍 AUTH DEBUG - Mudança de estado:', event, !!session);
      
      if (event === 'SIGNED_IN' && session?.user) {
        try {
          const response = await apiCallAuth('/auth/me');
          setUser(response);
        } catch (error) {
          console.warn('⚠️ AUTH DEBUG - Erro ao buscar dados do usuário:', error);
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'Usuário',
            role: 'Membro',
            memberSince: session.user.created_at || new Date().toISOString(),
            isActive: true
          });
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.error('Login error:', error.message);
        return false;
      }
      
      if (data.user) {
        // Buscar dados adicionais do usuário
        try {
          const userData = await apiCallAuth('/profile');
          // Garantir que o objeto de usuário tenha todas as propriedades necessárias
          const completeUser = {
            id: userData.id || data.user.id,
            email: userData.email || data.user.email || '',
            name: userData.name || data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'Usuário',
            role: userData.role || 'Membro',
            memberSince: userData.memberSince || userData.created_at || data.user.created_at || new Date().toISOString(),
            isActive: userData.isActive !== undefined ? userData.isActive : (userData.status === 'Ativo' || true),
            avatar: userData.avatar,
            phone: userData.phone,
            supervisor_id: userData.supervisor_id,
            coordinator_id: userData.coordinator_id,
            cell_id: userData.cell_id,
            celulaNome: userData.cell_name,
            oikos_name: userData.oikos_name
          };
          setUser(completeUser);
        } catch (userError) {
          console.warn('Erro ao buscar dados do usuário, usando dados básicos:', userError);
          setUser({
            id: data.user.id,
            email: data.user.email || '',
            name: data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'Usuário',
            role: 'Membro',
            memberSince: data.user.created_at || new Date().toISOString(),
            isActive: true
          });
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

  const logout = async () => {
    try {
      await supabase.auth.signOut();
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
      
      if (response.user) {
        // O Supabase já faz login automático após registro bem-sucedido
        // Garantir que o objeto de usuário tenha todas as propriedades necessárias
        const completeUser = {
          id: response.user.id,
          email: response.user.email || userData.email,
          name: response.user.name || userData.name,
          role: response.user.role || 'Membro',
          memberSince: response.user.memberSince || response.user.created_at || new Date().toISOString(),
          isActive: response.user.isActive !== undefined ? response.user.isActive : (response.user.status === 'Ativo' || true),
          avatar: response.user.avatar,
          phone: response.user.phone || userData.phone,
          supervisor_id: response.user.supervisor_id,
          coordinator_id: response.user.coordinator_id,
          cell_id: response.user.cell_id || userData.cell_id,
          celulaNome: response.user.celulaNome,
          oikos_name: response.user.oikos_name || userData.oikos_name
        };
        setUser(completeUser);
        return true;
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