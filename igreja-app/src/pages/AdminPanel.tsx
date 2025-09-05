import React from 'react';
import { useUserManagement } from '../contexts/UserManagementContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import ProtectedComponent from '../components/ProtectedComponent';
import { ArrowLeft } from 'lucide-react';

const AdminPanel: React.FC = () => {
  const { } = useAuth();
  const navigate = useNavigate();
  const { 
    // Funções do contexto de gerenciamento de usuários podem ser adicionadas aqui conforme necessário
  } = useUserManagement();
  
  // Estados para funcionalidades futuras do painel de administração podem ser adicionados aqui

  // Funções para funcionalidades futuras do painel de administração podem ser adicionadas aqui

  return (
    <ProtectedComponent allowedRoles={['Admin']}>
      <div className="admin-panel-container">
      <div className="admin-header">
        <div className="header-left">
          <button 
            className="btn-back"
            onClick={() => navigate('/dashboard')}
          >
            <ArrowLeft size={20} />
            Voltar
          </button>
          <h1>Painel de Administração</h1>
        </div>
      </div>

      <div className="admin-content">
        <div className="admin-message">
          <h2>Painel de Administração</h2>
          <p>Funcionalidades administrativas serão implementadas aqui conforme necessário.</p>
          <p>O gerenciamento de células foi movido para o Painel do Pastor.</p>
        </div>
      </div>
    </div>
    </ProtectedComponent>
  );
};

export default AdminPanel;