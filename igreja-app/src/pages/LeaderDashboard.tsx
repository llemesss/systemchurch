import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCelula } from '../contexts/CelulaContext';
import ProtectedComponent from '../components/ProtectedComponent';
import { 
  Users, 
  UserPlus, 
  Edit, 
  Trash2, 
  Phone, 
  Mail, 
  MapPin,
  Calendar,
  Heart,
  ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AddMemberForm {
  name: string;
  email: string;
  phone: string;
  oikos_name: string;
}

const LeaderDashboard: React.FC = () => {
  const { user } = useAuth();
  const { getMyCellMembers, cells, getCellById } = useCelula();
  const navigate = useNavigate();
  const [showAddMember, setShowAddMember] = useState(false);
  const [editingMember, setEditingMember] = useState<any>(null);
  const [formData, setFormData] = useState<AddMemberForm>({
    name: '',
    email: '',
    phone: '',
    oikos_name: ''
  });

  const myCell = user?.cell_id ? getCellById(user.cell_id) : null;
  const myMembers = getMyCellMembers();

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    // Aqui seria implementada a lógica para adicionar membro
    console.log('Adicionando membro:', formData);
    setShowAddMember(false);
    setFormData({ name: '', email: '', phone: '', oikos_name: '' });
  };

  const handleEditMember = (member: any) => {
    setEditingMember(member);
    setFormData({
      name: member.name,
      email: member.email,
      phone: member.phone,
      oikos_name: member.oikos_name
    });
    setShowAddMember(true);
  };

  const handleDeleteMember = (memberId: string) => {
    if (window.confirm('Tem certeza que deseja remover este membro?')) {
      // Aqui seria implementada a lógica para remover membro
      console.log('Removendo membro:', memberId);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', email: '', phone: '', oikos_name: '' });
    setEditingMember(null);
    setShowAddMember(false);
  };

  return (
    <ProtectedComponent allowedRoles={['Líder', 'Admin']}>
      <div className="leader-dashboard-container">
      {/* Header */}
      <div className="leader-header">
        <div className="header-content">
          <button 
            onClick={() => navigate('/dashboard')}
            className="btn-back"
          >
            <ArrowLeft size={20} />
            Voltar
          </button>
          <div className="header-info">
            <h1>Dashboard do Líder</h1>
            {myCell && (
              <p className="cell-info">
                Célula {myCell.number} - {myCell.name}
              </p>
            )}
          </div>
          <button 
            onClick={() => setShowAddMember(true)}
            className="btn-primary"
          >
            <UserPlus size={20} />
            Adicionar Membro
          </button>
        </div>
      </div>

      {/* Cell Statistics */}
      <div className="cell-stats">
        <div className="stat-card">
          <div className="stat-icon">
            <Users size={24} />
          </div>
          <div className="stat-info">
            <h3>{myMembers.length}</h3>
            <p>Membros Ativos</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <Heart size={24} />
          </div>
          <div className="stat-info">
            <h3>{myCell?.meeting_day || 'N/A'}</h3>
            <p>Dia de Reunião</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <MapPin size={24} />
          </div>
          <div className="stat-info">
            <h3>{myCell?.location || 'N/A'}</h3>
            <p>Local</p>
          </div>
        </div>
      </div>

      {/* Members List */}
      <div className="members-section">
        <h2>Membros da Célula</h2>
        {myMembers.length === 0 ? (
          <div className="empty-state">
            <Users size={48} />
            <h3>Nenhum membro cadastrado</h3>
            <p>Adicione o primeiro membro da sua célula</p>
            <button 
              onClick={() => setShowAddMember(true)}
              className="btn-primary"
            >
              <UserPlus size={20} />
              Adicionar Primeiro Membro
            </button>
          </div>
        ) : (
          <div className="members-grid">
            {myMembers.map((member) => (
              <div key={member.id} className="member-card">
                <div className="member-header">
                  <div className="member-avatar">
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="member-info">
                    <h3>{member.name}</h3>
                    <p className="member-oikos">{member.oikos_name}</p>
                  </div>
                  <div className="member-actions">
                    <button 
                      onClick={() => handleEditMember(member)}
                      className="btn-edit"
                      title="Editar"
                    >
                      <Edit size={16} />
                    </button>
                    <button 
                      onClick={() => handleDeleteMember(member.id)}
                      className="btn-delete"
                      title="Remover"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <div className="member-contact">
                  <div className="contact-item">
                    <Mail size={16} />
                    <span>{member.email}</span>
                  </div>
                  <div className="contact-item">
                    <Phone size={16} />
                    <span>{member.phone}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Member Modal */}
      {showAddMember && (
        <div className="form-modal" onClick={resetForm}>
          <div className="form-container" onClick={(e) => e.stopPropagation()}>
            <div className="form-header">
              <h2>{editingMember ? 'Editar Membro' : 'Adicionar Novo Membro'}</h2>
              <button 
                onClick={resetForm}
                className="btn-close"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleAddMember}>
              <div className="form-group">
                <label>Nome Completo</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                  placeholder="Digite o nome completo"
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                  placeholder="Digite o email"
                />
              </div>
              <div className="form-group">
                <label>Telefone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  required
                  placeholder="Digite o telefone"
                />
              </div>
              <div className="form-group">
                <label>Nome do Oikos</label>
                <input
                  type="text"
                  value={formData.oikos_name}
                  onChange={(e) => setFormData({...formData, oikos_name: e.target.value})}
                  required
                  placeholder="Digite o nome do oikos"
                />
              </div>
              <div className="form-actions">
                <button 
                  type="button" 
                  onClick={resetForm}
                  className="btn-secondary"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="btn-primary"
                >
                  {editingMember ? 'Atualizar' : 'Adicionar'} Membro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </ProtectedComponent>
  );
};

export default LeaderDashboard;