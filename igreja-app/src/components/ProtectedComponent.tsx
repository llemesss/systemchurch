import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { AlertCircle } from 'lucide-react';

interface ProtectedComponentProps {
  children: React.ReactNode;
  allowedRoles?: ('Admin' | 'Líder' | 'Membro')[];
  requireAuth?: boolean;
  fallback?: React.ReactNode;
  showAccessDenied?: boolean;
}

const ProtectedComponent: React.FC<ProtectedComponentProps> = ({
  children,
  allowedRoles = ['Admin', 'Líder', 'Membro'],
  requireAuth = true,
  fallback = null,
  showAccessDenied = true
}) => {
  const { user, isAuthenticated } = useAuth();

  // Se requer autenticação mas usuário não está autenticado
  if (requireAuth && !isAuthenticated) {
    if (fallback) {
      return <>{fallback}</>;
    }
    
    if (showAccessDenied) {
      return (
        <div className="access-denied">
          <div className="access-denied-content">
            <AlertCircle size={48} />
            <h3>Acesso Negado</h3>
            <p>Você precisa estar logado para acessar este conteúdo.</p>
          </div>
        </div>
      );
    }
    
    return null;
  }

  // Se usuário está autenticado, verificar role
  if (isAuthenticated && user) {
    const hasPermission = allowedRoles.includes(user.role);
    
    if (!hasPermission) {
      if (fallback) {
        return <>{fallback}</>;
      }
      
      if (showAccessDenied) {
        return (
          <div className="access-denied">
            <div className="access-denied-content">
              <AlertCircle size={48} />
              <h3>Acesso Negado</h3>
              <p>Você não tem permissão para acessar este conteúdo.</p>
              <p className="role-info">Seu nível de acesso: <strong>{user.role}</strong></p>
              <p className="required-roles">Níveis necessários: <strong>{allowedRoles.join(', ')}</strong></p>
            </div>
          </div>
        );
      }
      
      return null;
    }
  }

  // Se não requer autenticação ou usuário tem permissão
  return <>{children}</>;
};

export default ProtectedComponent;