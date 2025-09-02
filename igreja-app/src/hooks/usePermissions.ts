import { useAuth } from '../contexts/AuthContext';
import { UserRole, PermissionConfig } from '../types/hierarchy';

export const usePermissions = () => {
  const { user, isAuthenticated } = useAuth();

  const hasPermission = (config: PermissionConfig): boolean => {
    const {
      allowedRoles = ['Pastor', 'Coordenador', 'Supervisor', 'Líder', 'Membro'],
      requireAuth = true,
      requireCellMembership = false,
      requireCellLeadership = false,
      requireSupervisorRole = false,
      requireCoordinatorRole = false,
      requirePastorRole = false
    } = config;

    // Verificar autenticação
    if (requireAuth && !isAuthenticated) {
      return false;
    }

    // Se não requer autenticação, permitir acesso
    if (!requireAuth) {
      return true;
    }

    // Se usuário não existe mas requer autenticação
    if (!user) {
      return false;
    }

    // Verificar role
    if (!allowedRoles.includes(user.role)) {
      return false;
    }

    // Verificar se requer ser membro de uma célula
    if (requireCellMembership && !user.cell_id) {
      return false;
    }

    // Verificar se requer ser líder de célula
    if (requireCellLeadership && user.role !== 'Líder' && user.role !== 'Supervisor' && user.role !== 'Coordenador' && user.role !== 'Pastor' && user.role !== 'Admin') {
      return false;
    }

    // Verificar se requer ser supervisor
    if (requireSupervisorRole && user.role !== 'Supervisor' && user.role !== 'Coordenador' && user.role !== 'Pastor' && user.role !== 'Admin') {
      return false;
    }

    // Verificar se requer ser coordenador
    if (requireCoordinatorRole && user.role !== 'Coordenador' && user.role !== 'Pastor' && user.role !== 'Admin') {
      return false;
    }

    // Verificar se requer ser pastor
    if (requirePastorRole && user.role !== 'Pastor' && user.role !== 'Admin') {
      return false;
    }

    return true;
  };

  // Funções de verificação de role específicas
  const isPastor = (): boolean => {
    return user?.role === 'Pastor' || user?.role === 'Admin' || false;
  };

  const isCoordinator = (): boolean => {
    return user?.role === 'Coordenador' || false;
  };

  const isSupervisor = (): boolean => {
    return user?.role === 'Supervisor' || false;
  };

  const isLeader = (): boolean => {
    return user?.role === 'Líder' || false;
  };

  const isMember = (): boolean => {
    return user?.role === 'Membro' || false;
  };

  // Funções de verificação hierárquica
  const isLeaderOrAbove = (): boolean => {
    return user?.role === 'Líder' || user?.role === 'Supervisor' || user?.role === 'Coordenador' || user?.role === 'Pastor' || user?.role === 'Admin' || false;
  };

  const isSupervisorOrAbove = (): boolean => {
    return user?.role === 'Supervisor' || user?.role === 'Coordenador' || user?.role === 'Pastor' || user?.role === 'Admin' || false;
  };

  const isCoordinatorOrAbove = (): boolean => {
    return user?.role === 'Coordenador' || user?.role === 'Pastor' || user?.role === 'Admin' || false;
  };

  // Funções de permissões específicas
  const canManageUsers = (): boolean => {
    return hasPermission({ allowedRoles: ['Pastor', 'Admin'] });
  };

  const canManageCells = (): boolean => {
    return hasPermission({ allowedRoles: ['Pastor', 'Admin'] });
  };

  const canManageMembers = (): boolean => {
    return hasPermission({ allowedRoles: ['Pastor', 'Coordenador', 'Supervisor', 'Líder'] });
  };

  const canViewCellData = (): boolean => {
    return hasPermission({ 
      allowedRoles: ['Pastor', 'Coordenador', 'Supervisor', 'Líder', 'Membro'],
      requireCellMembership: true 
    });
  };

  const canAccessPastorPanel = (): boolean => {
    return hasPermission({ allowedRoles: ['Pastor', 'Admin'] });
  };

  const canAccessCoordinatorDashboard = (): boolean => {
    return hasPermission({ allowedRoles: ['Coordenador'] });
  };

  const canAccessSupervisorDashboard = (): boolean => {
    return hasPermission({ allowedRoles: ['Supervisor'] });
  };

  const canAccessLeaderDashboard = (): boolean => {
    return hasPermission({ allowedRoles: ['Líder'] });
  };

  const canAccessAdminPanel = (): boolean => {
    return hasPermission({ allowedRoles: ['Pastor', 'Admin'] });
  };

  const getUserRole = (): UserRole | null => {
    return user?.role || null;
  };

  const getUserCellId = (): string | null => {
    return user?.cell_id || null;
  };

  return {
    hasPermission,
    // Verificações de role
    isPastor,
    isCoordinator,
    isSupervisor,
    isLeader,
    isMember,
    // Verificações hierárquicas
    isLeaderOrAbove,
    isSupervisorOrAbove,
    isCoordinatorOrAbove,
    // Permissões específicas
    canManageUsers,
    canManageCells,
    canManageMembers,
    canViewCellData,
    canAccessPastorPanel,
    canAccessCoordinatorDashboard,
    canAccessSupervisorDashboard,
    canAccessLeaderDashboard,
    canAccessAdminPanel,
    // Utilitários
    getUserRole,
    getUserCellId,
    user,
    isAuthenticated
  };
};

export default usePermissions;