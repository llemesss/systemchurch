// Tipos para o sistema hierárquico de 5 níveis

// Enum para os 5 níveis de roles
export type UserRole = 'Admin' | 'Pastor' | 'Coordenador' | 'Supervisor' | 'Líder' | 'Membro';

// Interface base para usuário com hierarquia
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  memberSince: string;
  isActive: boolean;
  
  // Campos hierárquicos
  supervisor_id?: string;
  coordinator_id?: string;
  
  // Campos específicos para membros
  cell_id?: string;
  celulaNome?: string;
  oikos_name?: string;
}

// Interface para célula com hierarquia
export interface Cell {
  id: string;
  cell_number: string;
  leader_1_id: string;
  leader_1?: CellLeader;
  leader_2_id?: string;
  leader_2?: CellLeader;
  supervisor_id?: string; // Novo campo para supervisor
  members?: CellMember[];
}

// Interface para líder de célula
export interface CellLeader {
  id: string;
  name: string;
  email: string;
  phone?: string;
  password?: string;
}

// Interface para membro de célula
export interface CellMember {
  id: string;
  nome: string;
  email: string;
  phone?: string;
  cell_id: string;
  oikos_name?: string;
  role: 'Membro';
}

// Interface para dados de registro
export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  cell_id?: string;
  oikos_name?: string;
}

// Interface para criação de célula
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
  supervisor_id?: string;
}

// Interface para dados do dashboard baseado em role
export interface DashboardData {
  role: UserRole;
  data: PastorData | CoordinatorData | SupervisorData | LeaderData | MemberData;
}

// Dados específicos para Coordenador
export interface CoordinatorData {
  supervisors: {
    id: string;
    name: string;
    cellCount: number;
    memberCount: number;
  }[];
}

// Dados específicos para Supervisor
export interface SupervisorData {
  cells: {
    id: string;
    cell_number: string;
    leaderName: string;
    memberCount: number;
  }[];
}

// Dados específicos para Líder
export interface LeaderData {
  members: CellMember[];
  cellInfo: {
    id: string;
    cell_number: string;
  };
}

// Dados específicos para Membro
export interface MemberData {
  cellInfo?: {
    id: string;
    cell_number: string;
    leaderName: string;
  };
  oracaoDiaria: boolean;
}

// Dados específicos para Pastor
export interface PastorData {
  totalUsers: number;
  totalCells: number;
  totalCoordinators: number;
  totalSupervisors: number;
  totalLeaders: number;
  totalMembers: number;
}

// Interface para gerenciamento de usuários (Pastor)
export interface UserManagementData {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  phone?: string;
  memberSince: string;
  
  // Dados de associação
  cell_id?: string;
  supervisor_id?: string;
  coordinator_id?: string;
  
  // Dados calculados
  cellName?: string;
  supervisorName?: string;
  coordinatorName?: string;
}

// Interface para edição de usuário
export interface EditUserData {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  role: UserRole;
  isActive: boolean;
  
  // Campos hierárquicos
  cell_id?: string;
  supervisor_cells?: string[]; // Para supervisores
  coordinator_supervisors?: string[]; // Para coordenadores
}

// Interface para configuração de permissões
export interface PermissionConfig {
  allowedRoles?: UserRole[];
  requireAuth?: boolean;
  requireCellMembership?: boolean;
  requireCellLeadership?: boolean;
  requireSupervisorRole?: boolean;
  requireCoordinatorRole?: boolean;
  requirePastorRole?: boolean;
}

// Interface para contexto de autenticação
export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<boolean>;
  logout: () => void;
  register: (userData: RegisterData) => Promise<boolean>;
  updateProfile: (userData: Partial<User>) => Promise<boolean>;
}

// Interface para contexto de gerenciamento de usuários
export interface UserManagementContextType {
  users: UserManagementData[];
  cells: Cell[];
  supervisors: User[];
  coordinators: User[];
  leaders: User[];
  
  // Funções de gerenciamento
  getAllUsers: () => Promise<UserManagementData[]>;
  getUserById: (id: string) => UserManagementData | null;
  createUser: (userData: EditUserData & { password: string }) => Promise<boolean>;
  updateUser: (id: string, userData: EditUserData) => Promise<boolean>;
  deleteUser: (id: string) => Promise<boolean>;
  
  // Funções para células
  getAllCells: () => Promise<Cell[]>;
  getCellById: (id: string) => Cell | null;
  createCell: (cellData: { cell_number: string; leader_id?: string }) => Promise<Cell | null>;
  updateCell: (cellId: string, cellData: any) => Promise<boolean>;
  deleteCell: (cellId: string) => Promise<boolean>;
  
  // Funções de associação
  assignUserToCell: (userId: string, cellId: string) => Promise<boolean>;
  assignCellsToSupervisor: (supervisorId: string, cellIds: string[]) => Promise<boolean>;
  assignSupervisorsToCoordinator: (coordinatorId: string, supervisorIds: string[]) => Promise<boolean>;
  
  // Funções de consulta
  getCellsBySupervisor: (supervisorId: string) => Cell[];
  getSupervisorsByCoordinator: (coordinatorId: string) => User[];
  getAvailableCells: () => Cell[];
  getAvailableSupervisors: () => User[];
}

// Interface para contexto de dashboard
export interface DashboardContextType {
  dashboardData: DashboardData | null;
  isLoading: boolean;
  error: string | null;
  
  loadDashboardData: () => Promise<void>;
  refreshData: () => Promise<void>;
}