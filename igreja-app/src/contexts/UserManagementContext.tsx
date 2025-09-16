import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { 
  User, 
  UserManagementData, 
  UserManagementContextType, 
  EditUserData, 
  Cell
} from '../types/hierarchy';

const UserManagementContext = createContext<UserManagementContextType | undefined>(undefined);



// API Helper functions
const apiCallUserMgmt = async (endpoint: string, options: RequestInit = {}) => {
  // Usar backend próprio através do utilitário de API
  const { apiCall: backendApiCall } = await import('../utils/api');
  return await backendApiCall(endpoint, options);
};

export const UserManagementProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<UserManagementData[]>([]);
  const [cells, setCells] = useState<Cell[]>([]);

  // Carregar dados iniciais
  useEffect(() => {
    const loadInitialData = async () => {
      const token = localStorage.getItem('igreja_token') || sessionStorage.getItem('igreja_token');
      
      // Só carrega dados se houver token de autenticação
      if (!token) {
        return;
      }
      
      try {
        const [usersData, cellsData] = await Promise.all([
          apiCallUserMgmt('/users'),
          apiCallUserMgmt('/cells')
        ]);
        
        // Mapear os dados das células da API para o formato esperado pelo frontend
        const mappedCells = cellsData.map((cell: any) => ({
          ...cell,
          cell_number: cell.name, // Mapear 'name' da API para 'cell_number' do frontend
          leader_1_id: cell.leader_id,
          leader_1: cell.leader_id ? {
            id: cell.leader_id,
            name: cell.leader_name || 'Sem líder designado',
            email: '', // Será preenchido quando necessário
            phone: ''
          } : undefined
        }));
        
        setUsers(usersData);
        setCells(mappedCells);
      } catch (error) {
        console.error('Erro ao carregar dados iniciais:', error);
      }
    };

    loadInitialData();
  }, []);

  // Função para obter todos os usuários
  const getAllUsers = async (): Promise<UserManagementData[]> => {
    try {
      const usersData = await apiCallUserMgmt('/users');
      
      // DEBUG: Verificar dados recebidos do backend
      console.log('🔍 Dados recebidos do backend:', usersData);
      
      // Converter status do backend para isActive no frontend
      const convertedUsers = usersData.map((user: any) => ({
        ...user,
        isActive: user.status === 'Ativo'
      }));
      
      // DEBUG: Verificar dados convertidos
      console.log('🔄 Dados convertidos:', convertedUsers);
      
      setUsers(convertedUsers);
      return convertedUsers;
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      return users;
    }
  };

  // Função para obter usuário por ID
  const getUserById = (id: string): UserManagementData | null => {
    return users.find(user => user.id === id) || null;
  };

  // Função para criar novo usuário
  const createUser = async (userData: EditUserData & { password: string }): Promise<boolean> => {
    try {
      // Converter isActive para status para compatibilidade com o backend
      const backendData = {
        ...userData,
        status: userData.isActive ? 'Ativo' : 'Inativo'
      };
      
      // Remover isActive do objeto enviado ao backend
      delete (backendData as any).isActive;
      
      const response = await apiCallUserMgmt('/users', {
        method: 'POST',
        body: JSON.stringify(backendData),
      });
      
      // O backend retorna o usuário diretamente, não em response.user
      if (response && response.id) {
        // Converter status do backend para isActive no frontend
        const convertedUser = {
          ...response,
          isActive: response.status === 'Ativo'
        };
        setUsers(prev => [...prev, convertedUser]);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      return false;
    }
  };

  // Função para atualizar usuário
  const updateUser = async (id: string, userData: EditUserData): Promise<boolean> => {
    try {
      // Converter isActive para status para compatibilidade com o backend
      const backendData = {
        ...userData,
        status: userData.isActive ? 'Ativo' : 'Inativo'
      };
      
      // Remover isActive do objeto enviado ao backend
      delete (backendData as any).isActive;
      
      // DEBUG: Verificar dados enviados para a API
      console.log('📤 FRONTEND - Dados enviados para API PUT /users/' + id + ':', backendData);
      console.log('📤 FRONTEND - cell_id sendo enviado:', backendData.cell_id);
      
      const response = await apiCallUserMgmt(`/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify(backendData),
      });
      
      // O backend retorna o usuário diretamente, não em response.user
      if (response && response.id) {
        // Converter status do backend para isActive no frontend
        const convertedUser = {
          ...response,
          isActive: response.status === 'Ativo'
        };
        setUsers(prev => prev.map(user => 
          user.id === id ? convertedUser : user
        ));
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      return false;
    }
  };

  // Função para deletar usuário
  const deleteUser = async (id: string): Promise<boolean> => {
    try {
      await apiCallUserMgmt(`/users/${id}`, {
        method: 'DELETE',
      });
      
      setUsers(prev => prev.filter(user => user.id !== id));
      return true;
    } catch (error) {
      console.error('Erro ao deletar usuário:', error);
      return false;
    }
  };

  // Função para atribuir usuário a uma célula
  const assignUserToCell = async (userId: string, cellId: string | null): Promise<boolean> => {
    try {
      const response = await apiCallUserMgmt(`/users/${userId}`, {
        method: 'PUT',
        body: JSON.stringify({ cell_id: cellId }),
      });
      
      if (response.user) {
        setUsers(prev => prev.map(user => 
          user.id === userId ? response.user : user
        ));
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Erro ao atribuir usuário à célula:', error);
      return false;
    }
  };

  // Função para associar células a supervisor
  const assignCellsToSupervisor = async (supervisorId: string, cellIds: string[]): Promise<boolean> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setCells(prev => prev.map(cell => {
        if (cellIds.includes(cell.id)) {
          return { ...cell, supervisor_id: supervisorId };
        }
        return cell;
      }));
      
      return true;
    } catch (error) {
      console.error('Erro ao associar células ao supervisor:', error);
      return false;
    }
  };

  // Função para associar supervisores a coordenador
  const assignSupervisorsToCoordinator = async (coordinatorId: string, supervisorIds: string[]): Promise<boolean> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setUsers(prev => prev.map(user => {
        if (supervisorIds.includes(user.id) && user.role === 'Supervisor') {
          return {
            ...user,
            coordinator_id: coordinatorId,
            coordinatorName: users.find(u => u.id === coordinatorId)?.name
          };
        }
        return user;
      }));
      
      return true;
    } catch (error) {
      console.error('Erro ao associar supervisores ao coordenador:', error);
      return false;
    }
  };

  // Função para obter células por supervisor
  const getCellsBySupervisor = (supervisorId: string): Cell[] => {
    return cells.filter(cell => cell.supervisor_id === supervisorId);
  };

  // Função para obter supervisores por coordenador
  const getSupervisorsByCoordinator = (coordinatorId: string): User[] => {
    return users.filter(user => user.role === 'Supervisor' && user.coordinator_id === coordinatorId) as User[];
  };

  // Função para obter células disponíveis (sem supervisor)
  const getAvailableCells = (): Cell[] => {
    return cells.filter(cell => !cell.supervisor_id);
  };

  // Função para obter supervisores disponíveis (sem coordenador)
  const getAvailableSupervisors = (): User[] => {
    return users.filter(user => user.role === 'Supervisor' && !user.coordinator_id) as User[];
  };

  // Função para obter todas as células
  const getAllCells = async (): Promise<Cell[]> => {
    try {
      const cellsData = await apiCallUserMgmt('/cells');
      
      // Mapear os dados da API para o formato esperado pelo frontend
      const mappedCells = cellsData.map((cell: any) => ({
        ...cell,
        cell_number: cell.name, // Mapear 'name' da API para 'cell_number' do frontend
        leader_1_id: cell.leader_id,
        leader_1: cell.leader_id ? {
          id: cell.leader_id,
          name: cell.leader_name || 'Sem líder designado',
          email: '', // Será preenchido quando necessário
          phone: ''
        } : undefined
      }));
      
      setCells(mappedCells);
      return mappedCells;
    } catch (error) {
      console.error('Erro ao buscar células:', error);
      return cells;
    }
  };

  // Função para obter célula por ID
  const getCellById = (id: string): Cell | null => {
    return cells.find(cell => cell.id === id) || null;
  };

  // Função para criar nova célula
  const createCell = async (cellData: { cell_number: string; leader_id?: string }): Promise<Cell | null> => {
    try {
      const response = await apiCallUserMgmt('/cells', {
        method: 'POST',
        body: JSON.stringify(cellData),
      });
      
      if (response) {
        setCells(prev => [...prev, response]);
        return response;
      }
      
      return null;
    } catch (error) {
      console.error('Erro ao criar célula:', error);
      return null;
    }
  };

  // Função para atualizar célula
  const updateCell = async (cellId: string, cellData: any): Promise<boolean> => {
    try {
      const response = await apiCallUserMgmt(`/cells/${cellId}`, {
        method: 'PUT',
        body: JSON.stringify(cellData),
      });
      
      if (response) {
        setCells(prev => prev.map(cell => 
          cell.id === cellId ? response : cell
        ));
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Erro ao atualizar célula:', error);
      return false;
    }
  };

  // Função para deletar célula
  const deleteCell = async (cellId: string): Promise<boolean> => {
    try {
      await apiCallUserMgmt(`/cells/${cellId}`, {
        method: 'DELETE',
      });
      
      setCells(prev => prev.filter(cell => cell.id !== cellId));
      return true;
    } catch (error) {
      console.error('Erro ao deletar célula:', error);
      return false;
    }
  };

  // Obter supervisores, coordenadores e líderes
  const supervisors = users.filter(user => user.role === 'Supervisor') as User[];
  const coordinators = users.filter(user => user.role === 'Coordenador') as User[];
  const leaders = users.filter(user => user.role === 'Líder') as User[];

  const value: UserManagementContextType = {
    users,
    cells,
    supervisors,
    coordinators,
    leaders,
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    assignUserToCell,
    getAllCells,
    getCellById,
    createCell,
    updateCell,
    deleteCell,
    assignCellsToSupervisor,
    assignSupervisorsToCoordinator,
    getCellsBySupervisor,
    getSupervisorsByCoordinator,
    getAvailableCells,
    getAvailableSupervisors
  };

  return (
    <UserManagementContext.Provider value={value}>
      {children}
    </UserManagementContext.Provider>
  );
};

export const useUserManagement = (): UserManagementContextType => {
  const context = useContext(UserManagementContext);
  if (!context) {
    throw new Error('useUserManagement deve ser usado dentro de um UserManagementProvider');
  }
  return context;
};

export default UserManagementContext;