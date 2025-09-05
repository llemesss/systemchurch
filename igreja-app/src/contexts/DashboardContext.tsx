import React, { createContext, useContext, useState, type ReactNode } from 'react';
import type {
  DashboardData,
  DashboardContextType,
  CoordinatorData,
  SupervisorData,
  LeaderData,
  MemberData
} from '../types/hierarchy';
import { useAuth } from './AuthContext';
import { apiCall } from '../utils/api';

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

// API Base URL

// API Helper function
const apiCallDashboard = async (endpoint: string, options: RequestInit = {}) => {
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

export const DashboardProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Função para carregar dados do dashboard baseado no role do usuário
  const loadDashboardData = async (): Promise<void> => {
    if (!user) {
      setError('Usuário não autenticado');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let dashboardData: DashboardData;

      switch (user.role) {
        case 'Pastor':
          const [users, cells] = await Promise.all([
            apiCallDashboard('/users'),
            apiCallDashboard('/cells')
          ]);
          
          const totalUsers = users.length;
          const totalCells = cells.length;
          const totalCoordinators = users.filter((u: any) => u.role === 'Coordenador').length;
          const totalSupervisors = users.filter((u: any) => u.role === 'Supervisor').length;
          const totalLeaders = users.filter((u: any) => u.role === 'Líder').length;
          const totalMembers = users.filter((u: any) => u.role === 'Membro').length;
          
          dashboardData = {
            role: 'Pastor',
            data: {
              totalUsers,
              totalCells,
              totalCoordinators,
              totalSupervisors,
              totalLeaders,
              totalMembers
            }
          };
          break;

        case 'Coordenador':
          const allUsers = await apiCallDashboard('/users');
          const allCells = await apiCallDashboard('/cells');
          
          const supervisors = allUsers
            .filter((u: any) => u.role === 'Supervisor' && u.coordinator_id === user.id)
            .map((supervisor: any) => {
              const supervisorCells = allCells.filter((c: any) => c.supervisor_id === supervisor.id);
              const memberCount = allUsers.filter((u: any) => 
                supervisorCells.some((c: any) => c.id === u.cell_id)
              ).length;
              
              return {
                id: supervisor.id,
                name: supervisor.name,
                cellCount: supervisorCells.length,
                memberCount
              };
            });
          
          dashboardData = {
            role: 'Coordenador',
            data: { supervisors } as CoordinatorData
          };
          break;

        case 'Supervisor':
          const supervisorUsers = await apiCallDashboard('/users');
          const supervisorCells = await apiCallDashboard('/cells');
          
          const myCells = supervisorCells
            .filter((c: any) => c.supervisor_id === user.id)
            .map((cell: any) => {
              const leader = supervisorUsers.find((u: any) => u.id === cell.leader_id);
              const memberCount = supervisorUsers.filter((u: any) => u.cell_id === cell.id).length;
              
              return {
                id: cell.id,
                cell_number: cell.name,
                leaderName: leader?.name || 'Sem líder designado',
                memberCount
              };
            });
          
          dashboardData = {
            role: 'Supervisor',
            data: { cells: myCells } as SupervisorData
          };
          break;

        case 'Líder':
          const userCells = await apiCallDashboard(`/user-cells/user/${user.id}`);
          
          // Encontrar a célula onde o usuário é líder
          const myCell = userCells.find((uc: any) => uc.user_role === 'Líder');
          
          let cellMembers = [];
          if (myCell) {
            // Obter membros da célula
            const cellMembersData = await apiCallDashboard(`/user-cells/cell/${myCell.id}`);
            cellMembers = cellMembersData.map((member: any) => ({
              id: member.id,
              nome: member.name,
              email: member.email,
              phone: member.phone,
              cell_id: myCell.id,
              oikos_name: member.oikos_name || 'Não definido',
              role: member.role
            }));
          }
          
          dashboardData = {
            role: 'Líder',
            data: {
              members: cellMembers,
              cellInfo: {
                id: myCell?.id || '',
                cell_number: myCell?.name || ''
              }
            } as LeaderData
          };
          break;

        case 'Membro':
          const memberUsers = await apiCall('/users');
          const memberCells = await apiCall('/cells');
          
          const memberCell = memberCells.find((c: any) => c.id === user.cell_id);
          const cellLeader = memberUsers.find((u: any) => u.id === memberCell?.leader_id);
          
          dashboardData = {
            role: 'Membro',
            data: {
              cellInfo: memberCell ? {
                id: memberCell.id,
                cell_number: memberCell.name,
                leaderName: cellLeader?.name || 'Sem líder designado'
              } : undefined,
              oracaoDiaria: true
            } as MemberData
          };
          break;

        default:
          throw new Error(`Role não suportado: ${user.role}`);
      }

      setDashboardData(dashboardData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados do dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  // Função para atualizar dados
  const refreshData = async (): Promise<void> => {
    await loadDashboardData();
  };

  const value: DashboardContextType = {
    dashboardData,
    isLoading,
    error,
    loadDashboardData,
    refreshData
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = (): DashboardContextType => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard deve ser usado dentro de um DashboardProvider');
  }
  return context;
};

export default DashboardContext;