import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { apiCall, API_URLS } from '../utils/api';

export interface Oikos {
  nome: string;
  descricao: string;
}

export interface MembroCelula {
  id: string;
  nome: string;
  email: string;
  phone?: string;
  cell_id: string;
  oikos_name?: string;
  oikos_name_2?: string;
  role: 'Membro';
}

export interface CellLeader {
  id: string;
  name: string;
  email: string;
  phone?: string;
  password?: string;
}

export interface Cell {
  id: string;
  cell_number: string;
  leader_1_id: string;
  leader_1?: CellLeader;
  leader_2_id?: string;
  leader_2?: CellLeader;
  members?: MembroCelula[];
}

export interface CreateCellData {
  cell_number: string;
  leader_1: {
    name: string;
    email: string;
    phone?: string;
    password: string;
  };
  leader_2?: {
    name: string;
    email: string;
    phone?: string;
    password: string;
  };
}

// Manter interface antiga para compatibilidade
export interface Celula {
  id: string;
  nome: string;
  lider: string;
  membros: MembroCelula[];
}

interface CelulaContextType {
  // Funcionalidades antigas (compatibilidade)
  celulas: Celula[];
  getMembrosFromCelula: (celulaId: string) => MembroCelula[];
  getCelulaByMembro: (membroEmail: string) => Celula | null;
  adicionarCelula: (celula: Celula) => void;
  atualizarMembro: (membro: MembroCelula) => void;
  removerMembro: (membroId: string) => void;
  
  // Novas funcionalidades para gerenciamento de células
  cells: Cell[];
  getAllCells: () => Cell[];
  getCellById: (cellId: string) => Cell | null;
  createCell: (cellData: CreateCellData) => Promise<boolean>;
  updateCell: (cellId: string, cellData: Partial<CreateCellData>) => Promise<boolean>;
  deleteCell: (cellId: string) => Promise<boolean>;
  getCellMembers: (cellId: string) => MembroCelula[];
  getMyCellMembers: (leaderId: string) => MembroCelula[];
  getPublicCells: () => { id: string; cell_number: string }[];
}

const CelulaContext = createContext<CelulaContextType | undefined>(undefined);

// API Helper function for CelulaContext
const apiCallCelula = async (endpoint: string, options: RequestInit = {}) => {
  return apiCall(endpoint, options);
};

export const CelulaProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [celulas, setCelulas] = useState<Celula[]>([]);
  const [cells, setCells] = useState<Cell[]>([]);
  const [members, setMembers] = useState<MembroCelula[]>([]);

  // Carregar células públicas (sem autenticação)
  React.useEffect(() => {
    const loadPublicCells = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/cells/public`);
        if (response.ok) {
          const cellsData = await response.json();
          const publicCells: Cell[] = cellsData.map((cell: any) => ({
            id: cell.id,
            cell_number: cell.cell_number || cell.name,
            leader_1_id: cell.leader_id || '',
          }));
          setCells(publicCells);
        }
      } catch (error) {
        console.error('Erro ao carregar células públicas:', error);
      }
    };

    loadPublicCells();
  }, []);

  // Carregar dados completos da API (com autenticação)
  React.useEffect(() => {
    const loadAuthenticatedData = async () => {
      const token = localStorage.getItem('igreja_token') || sessionStorage.getItem('igreja_token');
      console.log('🔍 CELULA DEBUG - Token found:', !!token);
      
      if (!token) {
        console.log('❌ CELULA DEBUG - No token, skipping authenticated data load');
        return;
      }
      
      try {
        console.log('🔍 CELULA DEBUG - Loading cells and users data...');
        const [cellsData, usersData] = await Promise.all([
          apiCallCelula('/cells'),
          apiCallCelula('/users')
        ]);
        console.log('🔍 CELULA DEBUG - Cells data:', cellsData);
        console.log('🔍 CELULA DEBUG - Users data:', usersData);
        
        // Mapear células da API para o formato esperado
        const mappedCells: Cell[] = cellsData.map((cell: any) => {
          const leader1 = usersData.find((u: any) => u.id === cell.leader_id);
          const leader2 = cell.leader_2_id ? usersData.find((u: any) => u.id === cell.leader_2_id) : undefined;
          
          return {
            id: cell.id,
            cell_number: cell.name,
            leader_1_id: cell.leader_id,
            leader_1: leader1 ? {
              id: leader1.id,
              name: leader1.name,
              email: leader1.email,
              phone: leader1.phone
            } : undefined,
            leader_2_id: cell.leader_2_id,
            leader_2: leader2 ? {
              id: leader2.id,
              name: leader2.name,
              email: leader2.email,
              phone: leader2.phone
            } : undefined
          };
        });
        
        // Buscar membros de cada célula usando o endpoint correto que inclui os Oikós
        console.log('🔍 CELULA DEBUG - Loading members with Oikós data for each cell...');
        const allMembers: MembroCelula[] = [];
        
        for (const cell of cellsData) {
          try {
            const cellMembersResponse = await apiCallCelula(`/cells/${cell.id}/members`);
            console.log(`🔍 CELULA DEBUG - Members for cell ${cell.id}:`, cellMembersResponse);
            
            if (cellMembersResponse.members && cellMembersResponse.members.length > 0) {
              const cellMembers = cellMembersResponse.members.map((member: any) => ({
                id: member.id,
                nome: member.name,
                email: member.email,
                phone: member.phone,
                cell_id: cell.id,
                oikos_name: member.oikos_name || 'Não definido',
                oikos_name_2: member.oikos_name_2 || 'Não definido',
                role: 'Membro' as const
              }));
              allMembers.push(...cellMembers);
            }
          } catch (error) {
            console.error(`❌ CELULA DEBUG - Error loading members for cell ${cell.id}:`, error);
          }
        }
        
        console.log('🔍 CELULA DEBUG - All members with Oikós:', allMembers);
        
        // Mapear células para compatibilidade (formato antigo)
        const mappedCelulas: Celula[] = cellsData.map((cell: any) => {
          const leader = usersData.find((u: any) => u.id === cell.leader_id);
          const cellMembers = allMembers.filter(m => m.cell_id === cell.id);
          
          return {
            id: cell.id,
            nome: `Célula ${cell.name}`,
            lider: leader?.name || 'Sem líder designado',
            membros: cellMembers.map(m => ({
              ...m,
              celulaId: m.cell_id,
              oikos1: { nome: m.oikos_name || 'Não definido', descricao: 'oikos' },
              oikos2: { nome: m.oikos_name_2 || 'Não definido', descricao: 'oikos' }
            }))
          };
        });
        
        setCells(mappedCells);
        setMembers(allMembers);
        setCelulas(mappedCelulas);
        console.log('✅ CELULA DEBUG - Data loaded successfully');
        console.log('🔍 CELULA DEBUG - Final cells:', mappedCells);
        console.log('🔍 CELULA DEBUG - Final celulas (old format):', mappedCelulas);
      } catch (error) {
        console.error('❌ CELULA DEBUG - Error loading cell data:', error);
      }
    };

    loadAuthenticatedData();
  }, []);

  const getMembrosFromCelula = (celulaId: string): MembroCelula[] => {
    const celula = celulas.find(c => c.id === celulaId);
    return celula ? celula.membros : [];
  };

  const getCelulaByMembro = (membroEmail: string): Celula | null => {
    for (const celula of celulas) {
      const membro = celula.membros.find(m => m.email === membroEmail);
      if (membro) {
        return celula;
      }
    }
    return null;
  };

  const adicionarCelula = (novaCelula: Celula) => {
    setCelulas(prev => [...prev, novaCelula]);
  };

  const atualizarMembro = (membroAtualizado: MembroCelula) => {
    setCelulas(prev => 
      prev.map(celula => ({
        ...celula,
        membros: celula.membros.map(membro => 
          membro.id === membroAtualizado.id ? membroAtualizado : membro
        )
      }))
    );
  };

  const removerMembro = (membroId: string) => {
    setCelulas(prev => 
      prev.map(celula => ({
        ...celula,
        membros: celula.membros.filter(membro => membro.id !== membroId)
      }))
    );
  };

  // Novas funções para gerenciamento de células
  const getAllCells = (): Cell[] => {
    return cells;
  };

  const getCellById = (cellId: string): Cell | null => {
    return cells.find(cell => cell.id === cellId) || null;
  };

  const createCell = async (cellData: CreateCellData): Promise<boolean> => {
    try {
      const response = await apiCallCelula('/cells', {
        method: 'POST',
        body: JSON.stringify({
          name: cellData.cell_number,
          leader_1: cellData.leader_1,
          leader_2: cellData.leader_2
        })
      });
      
      if (response.cell) {
        const newCell: Cell = {
          id: response.cell.id,
          cell_number: response.cell.name,
          leader_1_id: response.cell.leader_id,
          leader_1: {
            id: response.cell.leader_id,
            name: cellData.leader_1.name,
            email: cellData.leader_1.email,
            phone: cellData.leader_1.phone
          }
        };

        if (cellData.leader_2 && response.cell.leader_2_id) {
          newCell.leader_2_id = response.cell.leader_2_id;
          newCell.leader_2 = {
            id: response.cell.leader_2_id,
            name: cellData.leader_2.name,
            email: cellData.leader_2.email,
            phone: cellData.leader_2.phone
          };
        }

        setCells(prev => [...prev, newCell]);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Erro ao criar célula:', error);
      return false;
    }
  };

  const updateCell = async (cellId: string, cellData: Partial<CreateCellData & { leader_id?: string }>): Promise<boolean> => {
    try {
      const response = await apiCallCelula(`/cells/${cellId}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: cellData.cell_number,
          leader_1: cellData.leader_1,
          leader_2: cellData.leader_2
        })
      });
      
      if (response.cell) {
        setCells(prev => prev.map(cell => {
          if (cell.id === cellId) {
            const updatedCell = { ...cell };
            
            if (cellData.cell_number) {
              updatedCell.cell_number = response.cell.name;
            }
            
            if (cellData.leader_1) {
              updatedCell.leader_1_id = response.cell.leader_id;
              updatedCell.leader_1 = {
                id: response.cell.leader_id,
                name: cellData.leader_1.name,
                email: cellData.leader_1.email,
                phone: cellData.leader_1.phone
              };
            }
            
            if (cellData.leader_2 && response.cell.leader_2_id) {
              updatedCell.leader_2_id = response.cell.leader_2_id;
              updatedCell.leader_2 = {
                id: response.cell.leader_2_id,
                name: cellData.leader_2.name,
                email: cellData.leader_2.email,
                phone: cellData.leader_2.phone
              };
            } else if (!cellData.leader_2) {
              updatedCell.leader_2_id = undefined;
              updatedCell.leader_2 = undefined;
            }
            
            return updatedCell;
          }
          return cell;
        }));
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Erro ao atualizar célula:', error);
      return false;
    }
  };

  const deleteCell = async (cellId: string): Promise<boolean> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setCells(prev => prev.filter(cell => cell.id !== cellId));
      setMembers(prev => prev.filter(member => member.cell_id !== cellId));
      return true;
    } catch (error) {
      console.error('Erro ao deletar célula:', error);
      return false;
    }
  };

  const getCellMembers = (cellId: string): MembroCelula[] => {
    return members.filter(member => member.cell_id === cellId);
  };

  const getMyCellMembers = (leaderId: string): MembroCelula[] => {
    const leaderCell = cells.find(cell => 
      cell.leader_1_id === leaderId || cell.leader_2_id === leaderId
    );
    
    if (!leaderCell) return [];
    
    return members.filter(member => member.cell_id === leaderCell.id);
  };

  const getPublicCells = (): { id: string; cell_number: string }[] => {
    return cells.map(cell => ({
      id: cell.id,
      cell_number: cell.cell_number
    }));
  };

  const value: CelulaContextType = {
    // Funcionalidades antigas (compatibilidade)
    celulas,
    getMembrosFromCelula,
    getCelulaByMembro,
    adicionarCelula,
    atualizarMembro,
    removerMembro,
    
    // Novas funcionalidades
    cells,
    getAllCells,
    getCellById,
    createCell,
    updateCell,
    deleteCell,
    getCellMembers,
    getMyCellMembers,
    getPublicCells
  };

  return (
    <CelulaContext.Provider value={value}>
      {children}
    </CelulaContext.Provider>
  );
};

export const useCelula = (): CelulaContextType => {
  const context = useContext(CelulaContext);
  if (!context) {
    throw new Error('useCelula deve ser usado dentro de um CelulaProvider');
  }
  return context;
};

export default CelulaContext;