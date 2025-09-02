import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Building, 
  UserCheck, 
  Eye, 
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  Calendar,
  TrendingUp,
  Activity
} from 'lucide-react';
import { useDashboard } from '../contexts/DashboardContext';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { DashboardData, UserRole } from '../types/hierarchy';

interface SupervisorCard {
  id: string;
  name: string;
  cellCount: number;
  memberCount: number;
}

interface CellCard {
  id: string;
  cellNumber: string;
  leaderName: string;
  memberCount: number;
}

interface MemberDetail {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  oikos: string;
  joinDate: string;
}

const ConditionalDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { dashboardData, loadDashboardData, refreshDashboardData } = useDashboard();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedView, setSelectedView] = useState<'main' | 'detail'>('main');
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [detailData, setDetailData] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      await loadDashboardData();
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCardClick = (itemId: string, itemData: any) => {
    setSelectedItem(itemId);
    setDetailData(itemData);
    setSelectedView('detail');
  };

  const handleBackToMain = () => {
    setSelectedView('main');
    setSelectedItem(null);
    setDetailData(null);
  };

  const renderCoordinatorView = () => {
    const supervisors = dashboardData?.supervisors || [];
    
    return (
      <div className="coordinator-dashboard">
        <div className="dashboard-header">
          <h1>
            <Users size={28} />
            Supervisores sob sua Coordenação
          </h1>
          <div className="stats-summary">
            <div className="stat-card">
              <TrendingUp size={20} />
              <span>Total de Supervisores: {supervisors.length}</span>
            </div>
            <div className="stat-card">
              <Building size={20} />
              <span>Total de Células: {supervisors.reduce((acc, s) => acc + s.cellCount, 0)}</span>
            </div>
            <div className="stat-card">
              <UserCheck size={20} />
              <span>Total de Membros: {supervisors.reduce((acc, s) => acc + s.memberCount, 0)}</span>
            </div>
          </div>
        </div>

        <div className="cards-grid">
          {supervisors.map((supervisor: SupervisorCard) => (
            <div 
              key={supervisor.id} 
              className="supervisor-card clickable-card"
              onClick={() => handleCardClick(supervisor.id, supervisor)}
            >
              <div className="card-header">
                <UserCheck size={24} />
                <h3>{supervisor.name}</h3>
              </div>
              <div className="card-stats">
                <div className="stat">
                  <Building size={16} />
                  <span>{supervisor.cellCount} Células</span>
                </div>
                <div className="stat">
                  <Users size={16} />
                  <span>{supervisor.memberCount} Membros</span>
                </div>
              </div>
              <div className="card-action">
                <Eye size={16} />
                <span>Ver Células</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderSupervisorView = () => {
    const cells = dashboardData?.cells || [];
    
    return (
      <div className="supervisor-dashboard">
        <div className="dashboard-header">
          <h1>
            <Building size={28} />
            Células sob sua Supervisão
          </h1>
          <div className="stats-summary">
            <div className="stat-card">
              <Building size={20} />
              <span>Total de Células: {cells.length}</span>
            </div>
            <div className="stat-card">
              <Users size={20} />
              <span>Total de Membros: {cells.reduce((acc, c) => acc + c.memberCount, 0)}</span>
            </div>
          </div>
        </div>

        <div className="cards-grid">
          {cells.map((cell: CellCard) => (
            <div 
              key={cell.id} 
              className="cell-card clickable-card"
              onClick={() => handleCardClick(cell.id, cell)}
            >
              <div className="card-header">
                <Building size={24} />
                <h3>Célula {cell.cellNumber}</h3>
              </div>
              <div className="card-info">
                <div className="leader-info">
                  <UserCheck size={16} />
                  <span>Líder: {cell.leaderName}</span>
                </div>
                <div className="member-count">
                  <Users size={16} />
                  <span>{cell.memberCount} Membros</span>
                </div>
              </div>
              <div className="card-action">
                <Eye size={16} />
                <span>Ver Membros</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderLeaderView = () => {
    const members = dashboardData?.members || [];
    
    return (
      <div className="leader-dashboard">
        <div className="dashboard-header">
          <h1>
            <Users size={28} />
            Membros da sua Célula
          </h1>
          <div className="stats-summary">
            <div className="stat-card">
              <Users size={20} />
              <span>Total de Membros: {members.length}</span>
            </div>
            <div className="stat-card">
              <Activity size={20} />
              <span>Membros Ativos: {members.filter((m: any) => m.isActive).length}</span>
            </div>
          </div>
        </div>

        <div className="members-table-container">
          <table className="members-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Contato</th>
                <th>Oikós</th>
                <th>Membro desde</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member: MemberDetail) => (
                <tr key={member.id}>
                  <td>
                    <div className="member-name">
                      <UserCheck size={16} />
                      {member.name}
                    </div>
                  </td>
                  <td>
                    <div className="contact-info">
                      {member.phone && (
                        <div className="contact-item">
                          <Phone size={14} />
                          <span>{member.phone}</span>
                        </div>
                      )}
                      {member.email && (
                        <div className="contact-item">
                          <Mail size={14} />
                          <span>{member.email}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="oikos-info">
                      <MapPin size={14} />
                      <span>{member.oikos}</span>
                    </div>
                  </td>
                  <td>
                    <div className="join-date">
                      <Calendar size={14} />
                      <span>{new Date(member.joinDate).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </td>
                  <td>
                    <span className="status-badge active">
                      Ativo
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderMemberView = () => {
    return (
      <div className="member-dashboard">
        <div className="dashboard-header">
          <h1>
            <Activity size={28} />
            Meu Painel
          </h1>
        </div>

        <div className="member-info-grid">
          <div className="info-card">
            <div className="card-header">
              <Activity size={24} />
              <h3>Oração Diária</h3>
            </div>
            <div className="card-content">
              <p>Conecte-se com Deus através da oração diária. Acesse reflexões, versículos e momentos de comunhão espiritual.</p>
              <button 
                onClick={() => navigate('/oracao-diaria')} 
                className="tool-button"
                style={{
                  width: '100%',
                  marginTop: '16px',
                  padding: '12px 16px',
                  background: 'linear-gradient(135deg, #00d4aa, #00a693)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.3s ease'
                }}
              >
                <Activity size={16} />
                Acessar Oração Diária
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderDetailView = () => {
    if (!detailData) return null;

    return (
      <div className="detail-view">
        <div className="detail-header">
          <button onClick={handleBackToMain} className="btn-back">
            <ArrowLeft size={20} />
            Voltar
          </button>
          <h2>Detalhes - {detailData.name || `Célula ${detailData.cellNumber}`}</h2>
        </div>

        <div className="detail-content">
          {/* Aqui você pode implementar a visualização detalhada */}
          <p>Visualização detalhada em desenvolvimento...</p>
        </div>
      </div>
    );
  };

  const renderMainView = () => {
    if (!user) return null;

    switch (user.role) {
      case 'Coordenador':
        return renderCoordinatorView();
      case 'Supervisor':
        return renderSupervisorView();
      case 'Líder':
        return renderLeaderView();
      case 'Membro':
        return renderMemberView();
      default:
        return (
          <div className="default-dashboard">
            <h1>Dashboard</h1>
            <p>Bem-vindo ao sistema!</p>
          </div>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <LoadingSpinner />
        <p>Carregando dashboard...</p>
      </div>
    );
  }

  return (
    <div className="conditional-dashboard">
      <div className="dashboard-container">
        {selectedView === 'main' ? renderMainView() : renderDetailView()}
      </div>
    </div>
  );
};

export default ConditionalDashboard;