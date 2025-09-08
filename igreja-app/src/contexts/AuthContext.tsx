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
  // Estado inicial correto: usuário null, carregamento true
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Verificação de sessão robusta no useEffect
  useEffect(() => {
    const verificarSessaoAtiva = async () => {
      console.log("📋 PASSO 1: Iniciando verificação da sessão...");
      setIsLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (session) {
          console.log("📋 PASSO 2: Sessão encontrada no Supabase Auth. ID do usuário:", session.user.id);
          
          const { data: dadosDoUsuario, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          if (error) {
            console.error("📋 PASSO 3a (ERRO): Usuário não encontrado na tabela 'public.users'.", error);
            throw new Error("Usuário da sessão não encontrado.");
          }

          if (dadosDoUsuario) {
            console.log("📋 PASSO 3b (SUCESSO): Dados do usuário encontrados na tabela 'public.users'.", dadosDoUsuario);
            
            const usuarioCompleto: User = {
              id: dadosDoUsuario.id,
              email: dadosDoUsuario.email,
              name: dadosDoUsuario.name,
              role: dadosDoUsuario.role || 'Membro',
              memberSince: dadosDoUsuario.created_at || dadosDoUsuario.member_since,
              isActive: dadosDoUsuario.status === 'Ativo' || dadosDoUsuario.is_active,
              avatar: dadosDoUsuario.avatar,
              phone: dadosDoUsuario.phone,
              supervisor_id: dadosDoUsuario.supervisor_id,
              coordinator_id: dadosDoUsuario.coordinator_id,
              cell_id: dadosDoUsuario.cell_id,
              celulaNome: dadosDoUsuario.cell_name,
              oikos_name: dadosDoUsuario.oikos_name
            };
            
            setUser(usuarioCompleto);
          }
        } else {
          console.log("📋 PASSO 2 (INFO): Nenhuma sessão ativa encontrada.");
          setUser(null);
        }
      } catch (error) {
        console.error("ERRO GERAL no bloco de verificação de sessão:", error);
        setUser(null);
      } finally {
        console.log("📋 PASSO 4: Finalizando verificação. isLoading será 'false'.");
        setIsLoading(false);
      }
    };

    verificarSessaoAtiva();

    // Listener para mudanças de autenticação com lógica segura
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔍 AUTH DEBUG - Mudança de estado:', event, !!session);
      
      if (event === 'SIGNED_IN' && session?.user) {
        try {
          // Aplicar a mesma lógica segura: buscar dados na tabela users
          const { data: dadosDoUsuario, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (error || !dadosDoUsuario) {
            console.error('❌ AUTH DEBUG - Usuário não encontrado na base de dados após login:', error);
            setUser(null);
            return;
          }

          // Só define como autenticado se encontrou os dados completos
          const usuarioCompleto: User = {
            id: dadosDoUsuario.id,
            email: dadosDoUsuario.email,
            name: dadosDoUsuario.name,
            role: dadosDoUsuario.role || 'Membro',
            memberSince: dadosDoUsuario.created_at || dadosDoUsuario.member_since,
            isActive: dadosDoUsuario.status === 'Ativo' || dadosDoUsuario.is_active,
            avatar: dadosDoUsuario.avatar,
            phone: dadosDoUsuario.phone,
            supervisor_id: dadosDoUsuario.supervisor_id,
            coordinator_id: dadosDoUsuario.coordinator_id,
            cell_id: dadosDoUsuario.cell_id,
            celulaNome: dadosDoUsuario.cell_name,
            oikos_name: dadosDoUsuario.oikos_name
          };
          
          setUser(usuarioCompleto);
          console.log('✅ AUTH DEBUG - Login realizado com sucesso:', usuarioCompleto.name);
        } catch (error) {
          console.error('❌ AUTH DEBUG - Erro ao processar login:', error);
          setUser(null);
        }
      } else if (event === 'SIGNED_OUT') {
        console.log('🔍 AUTH DEBUG - Logout realizado');
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
        console.error('❌ AUTH DEBUG - Erro no login:', error.message);
        return false;
      }
      
      if (data.user) {
        // Aplicar lógica segura: buscar dados na tabela users
        try {
          const { data: dadosDoUsuario, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', data.user.id)
            .single();

          if (userError || !dadosDoUsuario) {
            console.error('❌ AUTH DEBUG - Usuário não encontrado na base de dados:', userError);
            // Fazer logout se não encontrar o usuário na tabela
            await supabase.auth.signOut();
            return false;
          }

          // Só define como autenticado se encontrou os dados completos
          const usuarioCompleto: User = {
            id: dadosDoUsuario.id,
            email: dadosDoUsuario.email,
            name: dadosDoUsuario.name,
            role: dadosDoUsuario.role || 'Membro',
            memberSince: dadosDoUsuario.created_at || dadosDoUsuario.member_since,
            isActive: dadosDoUsuario.status === 'Ativo' || dadosDoUsuario.is_active,
            avatar: dadosDoUsuario.avatar,
            phone: dadosDoUsuario.phone,
            supervisor_id: dadosDoUsuario.supervisor_id,
            coordinator_id: dadosDoUsuario.coordinator_id,
            cell_id: dadosDoUsuario.cell_id,
            celulaNome: dadosDoUsuario.cell_name,
            oikos_name: dadosDoUsuario.oikos_name
          };
          
          setUser(usuarioCompleto);
          console.log('✅ AUTH DEBUG - Login bem-sucedido:', usuarioCompleto.name);
          return true;
        } catch (userError) {
          console.error('❌ AUTH DEBUG - Erro ao buscar dados do usuário:', userError);
          // Fazer logout em caso de erro
          await supabase.auth.signOut();
          return false;
        }
      }
      
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
        // Aplicar lógica segura: verificar se o usuário foi criado na tabela
        try {
          const { data: dadosDoUsuario, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', response.user.id)
            .single();

          if (userError || !dadosDoUsuario) {
            console.error('❌ AUTH DEBUG - Usuário registrado não encontrado na base de dados:', userError);
            // Fazer logout se não encontrar o usuário na tabela
            await supabase.auth.signOut();
            return false;
          }

          // Só define como autenticado se encontrou os dados completos
          const usuarioCompleto: User = {
            id: dadosDoUsuario.id,
            email: dadosDoUsuario.email,
            name: dadosDoUsuario.name,
            role: dadosDoUsuario.role || 'Membro',
            memberSince: dadosDoUsuario.created_at || dadosDoUsuario.member_since,
            isActive: dadosDoUsuario.status === 'Ativo' || dadosDoUsuario.is_active,
            avatar: dadosDoUsuario.avatar,
            phone: dadosDoUsuario.phone,
            supervisor_id: dadosDoUsuario.supervisor_id,
            coordinator_id: dadosDoUsuario.coordinator_id,
            cell_id: dadosDoUsuario.cell_id,
            celulaNome: dadosDoUsuario.cell_name,
            oikos_name: dadosDoUsuario.oikos_name
          };
          
          setUser(usuarioCompleto);
          console.log('✅ AUTH DEBUG - Registro bem-sucedido:', usuarioCompleto.name);
          return true;
        } catch (userError) {
          console.error('❌ AUTH DEBUG - Erro ao verificar usuário registrado:', userError);
          // Fazer logout em caso de erro
          await supabase.auth.signOut();
          return false;
        }
      }
      
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