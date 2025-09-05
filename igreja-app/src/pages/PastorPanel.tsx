import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { 
  Users, 
  UserPlus, 
  Plus,
  Grid3X3
} from 'lucide-react';
import { useUserManagement } from '../contexts/UserManagementContext';
import { usePermissions } from '../hooks/usePermissions';
import { useWebSocket } from '../contexts/WebSocketContext';
import ProtectedComponent from '../components/ProtectedComponent';
import LoadingSpinner from '../components/LoadingSpinner';
import type { UserManagementData, EditUserData, UserRole, Cell } from '../types/hierarchy';

// Material-UI imports
import {
  Container,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,

  Box,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Modal,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  FormControl,
  InputLabel,
  FormControlLabel,
  Checkbox,
  Avatar,
  AppBar,
  Toolbar
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,

  Dashboard as DashboardIcon,
  Group as GroupIcon,
  Settings as SettingsIcon,
  Book as BookIcon,
  Close as CloseIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';

const PastorPanel: React.FC = () => {
  const navigate = useNavigate();
  const { canAccessPastorPanel } = usePermissions();
  const { isConnected, sendRedirectCommand } = useWebSocket();
  const {
    users,
    cells,
    supervisors,
    leaders,
    getAllUsers,
    createUser,
    updateUser,
    deleteUser,
    getAllCells,
    createCell,
    updateCell,
    deleteCell
  } = useUserManagement();


  const [isLoading, setIsLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingUser, setEditingUser] = useState<UserManagementData | null>(null);
  const [currentView, setCurrentView] = useState<'dashboard' | 'users' | 'cells'>('dashboard');
  const [showCreateCellForm, setShowCreateCellForm] = useState(false);
  const [editingCell, setEditingCell] = useState<Cell | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedUserForRedirect, setSelectedUserForRedirect] = useState<UserManagementData | null>(null);
  const [redirectMenuAnchor, setRedirectMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedLeader, setSelectedLeader] = useState<UserManagementData | null>(null);

  const [selectedCellForUser, setSelectedCellForUser] = useState<Cell | null>(null);

  const modalStyle = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '90%',
    maxWidth: 600,
    maxHeight: '90vh',
    overflow: 'auto',
    bgcolor: 'background.paper',
    borderRadius: 2,
    boxShadow: 24,
    p: 4,
  };

  const [cellFormData, setCellFormData] = useState<{ cell_number: string; leader_id?: string }>({
    cell_number: '',
    leader_id: undefined
  });



  // Estado para o formulário de usuário
  const [formData, setFormData] = useState<EditUserData & { password?: string; address?: string }>({
    name: '',
    email: '',
    phone: '',
    address: '',
    role: 'Membro',
    isActive: true,
    cell_id: undefined,
    supervisor_cells: [],
    coordinator_supervisors: [],
    password: ''
  });



  const handleRedirectMenuOpen = (event: React.MouseEvent<HTMLElement>, user: UserManagementData) => {
    setRedirectMenuAnchor(event.currentTarget);
    setSelectedUserForRedirect(user);
  };

  const handleRedirectMenuClose = () => {
    setRedirectMenuAnchor(null);
    setSelectedUserForRedirect(null);
  };

  const handleRedirectUser = (page: string) => {
    if (!selectedUserForRedirect) return;
    
    if (isConnected) {
      sendRedirectCommand(selectedUserForRedirect.id, page);
      handleRedirectMenuClose();
      toast.success(`Usuário ${selectedUserForRedirect.name} será direcionado para ${page}`);
    } else {
      toast.error('WebSocket não conectado');
    }
  };

  // Carregar dados iniciais
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      await getAllUsers();
      await getAllCells();
    } catch (error) {
      toast.error('Erro ao carregar dados');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const role = e.target.value as UserRole;
    setFormData(prev => ({
      ...prev,
      role,
      cell_id: role === 'Líder' ? prev.cell_id : undefined,
      supervisor_cells: role === 'Supervisor' ? prev.supervisor_cells : [],
      coordinator_supervisors: role === 'Coordenador' ? prev.coordinator_supervisors : []
    }));
  };

  const handleCellAssociation = (cellId: string) => {
    setFormData(prev => ({
      ...prev,
      cell_id: cellId
    }));
  };

  const handleSupervisorCells = (cellIds: string[]) => {
    setFormData(prev => ({
      ...prev,
      supervisor_cells: cellIds
    }));
  };

  const handleCoordinatorSupervisors = (supervisorIds: string[]) => {
    setFormData(prev => ({
      ...prev,
      coordinator_supervisors: supervisorIds
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (!editingUser) {
        // Criar novo usuário
        const userData = {
          ...formData,
          password: formData.password || '123456'
        };
        const success = await createUser(userData);
        
        if (success) {
          toast.success('Usuário criado com sucesso!');
          resetForm();
          setShowCreateForm(false);
          await loadUsers();
        } else {
          toast.error('Erro ao criar usuário');
        }
      } else {
        // Editar usuário existente
        const success = await updateUser(editingUser.id, formData);
        
        if (success) {
          toast.success('Usuário atualizado com sucesso!');
          resetForm();
          setShowCreateForm(false);
          setEditingUser(null);
          await loadUsers();
        } else {
          toast.error('Erro ao atualizar usuário');
        }
      }
    } catch (error) {
      toast.error('Erro ao processar solicitação');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (user: UserManagementData) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      address: '',
      role: user.role,
      isActive: user.isActive,
      cell_id: user.cell_id,
      supervisor_cells: [],
      coordinator_supervisors: []
    });
    setShowCreateForm(true);
  };

  const handleDelete = async (userId: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este usuário?')) {
      return;
    }
    
    try {
      const success = await deleteUser(userId);
      if (success) {
        toast.success('Usuário excluído com sucesso!');
        await loadUsers();
      } else {
        toast.error('Erro ao excluir usuário');
      }
    } catch (error) {
      toast.error('Erro ao excluir usuário');
    } finally {
      setIsLoading(false);
    }
  };

  // Função removida - usando handleDelete diretamente

  const handleDeleteCell = async (cellId: string) => {
    setIsLoading(true);
    try {
      const success = await deleteCell(cellId);
      if (success) {
        toast.success('Célula excluída com sucesso!');
        await getAllCells();
        await loadUsers();
      } else {
        toast.error('Erro ao excluir célula');
      }
    } catch (error) {
      toast.error('Erro ao excluir célula');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      role: 'Membro',
      isActive: true,
      cell_id: undefined,
      supervisor_cells: [],
      coordinator_supervisors: [],
      password: ''
    });
    setEditingUser(null);
    setSelectedCellForUser(null);

  };

  const closeModal = () => {
    setShowCreateForm(false);
  };

  const cancelAndCloseModal = () => {
    resetForm();
    closeModal();
  };

  const resetUserForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      role: 'Membro',
      isActive: true,
      cell_id: undefined,
      supervisor_cells: [],
      coordinator_supervisors: [],
      password: ''
    });
    setEditingUser(null);
    setSelectedCellForUser(null);

  };

  const handleCellSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      let success = false;
      
      if (editingCell) {
        // Editar célula existente
        const updateData: any = {
          cell_number: cellFormData.cell_number
        };
        
        if (cellFormData.leader_id) {
          updateData.leader_id = cellFormData.leader_id;
        }
        
        if (selectedLeader) {
          // Atualizar o usuário para ser líder desta célula
          await updateUser(selectedLeader.id, {
            ...selectedLeader,
            role: 'Líder',
            cell_id: editingCell.id
          });
        }
        
        success = await updateCell(editingCell.id, updateData);
        
        if (success) {
          toast.success('Célula atualizada com sucesso!');
        } else {
          toast.error('Erro ao atualizar célula');
        }
      } else {
        // Criar nova célula
        const createdCell = await createCell(cellFormData);
        
        if (createdCell) {
          // Se um líder foi selecionado, atualizar o usuário
          if (cellFormData.leader_id) {
            const selectedLeader = leaders.find(l => l.id === cellFormData.leader_id);
            if (selectedLeader) {
              // Atualizar o usuário para ser líder desta célula
              await updateUser(selectedLeader.id, {
                ...selectedLeader,
                role: 'Líder',
                cell_id: createdCell.id
              });
            }
          }
          
          success = true;
        } else {
          success = false;
        }
      }
      
      if (success) {
        resetCellForm();
        setShowCreateCellForm(false);
        setEditingCell(null);
        await getAllCells();
        await loadUsers();
      }
    } catch (error) {
      console.error('Erro ao processar célula:', error);
      toast.error('Erro ao processar célula');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetCellForm = () => {
    setCellFormData({
      cell_number: '',
      leader_id: undefined
    });
    setSelectedLeader(null);
  };

  const getRoleColor = (role: UserRole): string => {
    const colors: Record<UserRole, string> = {
      'Admin': '#DC2626',
      'Pastor': '#8B5CF6',
      'Coordenador': '#3B82F6', 
      'Supervisor': '#10B981',
      'Líder': '#F59E0B',
      'Membro': '#6B7280'
    };
    return colors[role] || colors['Membro'];
  };

  // Verificar permissões
  if (!canAccessPastorPanel()) {
    return (
      <ProtectedComponent allowedRoles={["Pastor"]}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Acesso Negado</h2>
            <p className="text-gray-600">Você não tem permissão para acessar o Painel do Pastor.</p>
          </div>
        </div>
      </ProtectedComponent>
    );
  }



  return (
    <ProtectedComponent allowedRoles={["Pastor"]}>
      <div className="min-h-screen" style={{ background: 'linear-gradient(to bottom right, #f8fafc, #e7eaf0)' }}>
        {/* Header */}
        <AppBar 
          position="static" 
          sx={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
          }}
        >
          <Toolbar>
            {currentView !== 'dashboard' && (
              <IconButton
                edge="start"
                color="inherit"
                onClick={() => setCurrentView('dashboard')}
                sx={{ mr: 2 }}
              >
                <ArrowBackIcon />
              </IconButton>
            )}
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              {currentView === 'dashboard' && 'Painel do Pastor'}
              {currentView === 'users' && 'Gerenciar Usuários'}
              {currentView === 'cells' && 'Gerenciar Células'}
            </Typography>
              
            {currentView === 'cells' && (
              <Button
                onClick={() => {
                  resetCellForm();
                  setShowCreateCellForm(true);
                }}
                variant="contained"
                startIcon={<AddIcon />}
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.3)'
                  }
                }}
              >
                Nova Célula
              </Button>
            )}
          </Toolbar>
        </AppBar>

        {/* Loading */}
        {isLoading && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <LoadingSpinner />
          </div>
        )}

        {/* Modal de Criação/Edição de Usuário */}
        {showCreateForm && (
          <Modal open={showCreateForm} onClose={closeModal}>
            <Paper
              elevation={3}
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: { xs: '90%', sm: '500px' },
                maxHeight: '90vh',
                overflow: 'auto',
                borderRadius: 2,
                outline: 'none'
              }}
            >
              <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {editingUser ? 'Editar Usuário' : 'Criar Novo Usuário'}
                <IconButton onClick={closeModal}>
                  <CloseIcon />
                </IconButton>
              </DialogTitle>
              
              <form onSubmit={handleSubmit}>
                <DialogContent sx={{ pt: 2 }}>
                  <TextField
                    fullWidth
                    label="Nome"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    variant="outlined"
                    margin="normal"
                  />
                  
                  <TextField
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    variant="outlined"
                    margin="normal"
                  />
                  
                  <TextField
                    fullWidth
                    label="Telefone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    variant="outlined"
                    margin="normal"
                  />
                  
                  <TextField
                    fullWidth
                    label="Endereço"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    variant="outlined"
                    margin="normal"
                  />
                
                  {!editingUser && (
                    <TextField
                      fullWidth
                      label="Senha"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Deixe em branco para usar senha padrão (123456)"
                      variant="outlined"
                      margin="normal"
                    />
                  )}
                
                  <FormControl fullWidth variant="outlined" margin="normal">
                    <InputLabel>Função</InputLabel>
                    <Select
                      name="role"
                      value={formData.role}
                      onChange={(e) => handleRoleChange(e as any)}
                      label="Função"
                    >
                      <MenuItem value="Admin">Admin</MenuItem>
                      <MenuItem value="Pastor">Pastor</MenuItem>
                      <MenuItem value="Coordenador">Coordenador</MenuItem>
                      <MenuItem value="Supervisor">Supervisor</MenuItem>
                      <MenuItem value="Líder">Líder</MenuItem>
                      <MenuItem value="Membro">Membro</MenuItem>
                    </Select>
                  </FormControl>
                
                  {formData.role === 'Líder' && !selectedCellForUser && (
                    <FormControl fullWidth variant="outlined" margin="normal">
                      <InputLabel>Célula</InputLabel>
                      <Select
                        value={formData.cell_id || ''}
                        onChange={(e) => handleCellAssociation(e.target.value)}
                        label="Célula"
                      >
                        {cells.map(cell => (
                          <MenuItem key={cell.id} value={cell.id}>
                            Célula {cell.cell_number} - {cell.leader_1?.name || 'Sem líder'}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                
                {selectedCellForUser && (
                  <Box sx={{
                    p: 2,
                    border: '1px solid #e0e0e0',
                    borderRadius: 1,
                    bgcolor: '#f5f5f5'
                  }}>
                    <Typography variant="body2" color="text.secondary">
                      Célula Selecionada: {selectedCellForUser.cell_number}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Líder: {selectedCellForUser.leader_1?.name || 'Sem líder'}
                    </Typography>
                  </Box>
                )}
                
                {formData.role === 'Supervisor' && (
                  <div>
                    <Typography variant="subtitle2" gutterBottom>
                      Células Supervisionadas
                    </Typography>
                    <Box sx={{
                      maxHeight: 200,
                      overflow: 'auto',
                      border: '1px solid #e0e0e0',
                      borderRadius: 1,
                      p: 1
                    }}>
                      {cells.map(cell => (
                        <FormControlLabel
                          key={cell.id}
                          control={
                            <Checkbox
                              checked={formData.supervisor_cells?.includes(cell.id) || false}
                              onChange={(e) => {
                                const cellIds = formData.supervisor_cells || [];
                                if (e.target.checked) {
                                  handleSupervisorCells([...cellIds, cell.id]);
                                } else {
                                  handleSupervisorCells(cellIds.filter(id => id !== cell.id));
                                }
                              }}
                            />
                          }
                          label={`Célula ${cell.cell_number} - ${cell.leader_1?.name}`}
                          sx={{
                            display: 'block',
                            '& .MuiFormControlLabel-label': {
                              fontSize: '0.875rem'
                            }
                          }}
                        />
                      ))}
                    </Box>
                  </div>
                )}
                
                {formData.role === 'Coordenador' && (
                  <div>
                    <Typography variant="subtitle2" gutterBottom>
                      Supervisores Coordenados
                    </Typography>
                    <Box sx={{
                      maxHeight: 200,
                      overflow: 'auto',
                      border: '1px solid #e0e0e0',
                      borderRadius: 1,
                      p: 1
                    }}>
                      {supervisors.map(supervisor => (
                        <FormControlLabel
                          key={supervisor.id}
                          control={
                            <Checkbox
                              checked={formData.coordinator_supervisors?.includes(supervisor.id) || false}
                              onChange={(e) => {
                                const supervisorIds = formData.coordinator_supervisors || [];
                                if (e.target.checked) {
                                  handleCoordinatorSupervisors([...supervisorIds, supervisor.id]);
                                } else {
                                  handleCoordinatorSupervisors(supervisorIds.filter(id => id !== supervisor.id));
                                }
                              }}
                            />
                          }
                          label={supervisor.name}
                          sx={{
                            display: 'block',
                            '& .MuiFormControlLabel-label': {
                              fontSize: '0.875rem'
                            }
                          }}
                        />
                      ))}
                    </Box>
                  </div>
                )}
                
                </DialogContent>
                
                <DialogActions>
                  <Button onClick={cancelAndCloseModal} variant="outlined">
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    variant="contained" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Salvando...' : (editingUser ? 'Atualizar' : 'Criar')}
                  </Button>
                </DialogActions>
              </form>
            </Paper>
          </Modal>
        )}

        {/* Modal de Criação/Edição de Célula */}
        {showCreateCellForm && (
          <Modal 
            open={showCreateCellForm} 
            onClose={() => {
              setShowCreateCellForm(false);
              setEditingCell(null);
              resetCellForm();
            }}
          >
            <Box sx={modalStyle}>
              <div className="flex justify-between items-center mb-6">
                <Typography variant="h5" component="h2">
                  {editingCell ? 'Editar Célula' : 'Nova Célula'}
                </Typography>
                <IconButton 
                  onClick={() => {
                    setShowCreateCellForm(false);
                    setEditingCell(null);
                    resetCellForm();
                  }}
                >
                  <CloseIcon />
                </IconButton>
              </div>
              
              <form onSubmit={handleCellSubmit} className="space-y-6">
                <TextField
                  fullWidth
                  label="Número da Célula"
                  value={cellFormData.cell_number}
                  onChange={(e) => setCellFormData(prev => ({
                    ...prev,
                    cell_number: e.target.value
                  }))}
                  required
                  variant="outlined"
                />
                
                <FormControl fullWidth variant="outlined">
                  <InputLabel>Líder (Opcional)</InputLabel>
                  <Select
                    value={cellFormData.leader_id || ''}
                    onChange={(e) => {
                      const leaderId = e.target.value;
                      setCellFormData(prev => ({
                        ...prev,
                        leader_id: leaderId || undefined
                      }));
                      setSelectedLeader(leaders.find(l => l.id === leaderId) || null);
                    }}
                    label="Líder (Opcional)"
                  >
                    <MenuItem value="">Selecione um líder</MenuItem>
                    {leaders.map(leader => (
                      <MenuItem key={leader.id} value={leader.id}>
                        {leader.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    onClick={() => {
                      setShowCreateCellForm(false);
                      setEditingCell(null);
                      resetCellForm();
                    }}
                    variant="outlined"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Salvando...' : (editingCell ? 'Atualizar' : 'Criar')}
                  </Button>
                </div>
              </form>
            </Box>
          </Modal>
        )}



        {/* Conteúdo Principal */}
        <div className="container mx-auto px-4 py-8">

          
          {currentView === 'dashboard' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Card Gerenciar Usuários */}
              <div 
                onClick={() => setCurrentView('users')}
                className="group glass-card p-8 cursor-pointer hover:scale-105"
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-white/30 transition-colors">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Gerenciar Usuários</h3>
                  <p className="text-white/80">Criar, editar e gerenciar usuários do sistema</p>
                  <div className="mt-4 text-white/60">
                    <span className="text-2xl font-bold">{users.length}</span>
                    <span className="text-sm ml-1">usuários cadastrados</span>
                  </div>
                </div>
              </div>
              
              {/* Card Gerenciar Células */}
              <div 
                onClick={() => setCurrentView('cells')}
                className="group glass-card p-8 cursor-pointer hover:scale-105"
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-white/30 transition-colors">
                    <Grid3X3 className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Gerenciar Células</h3>
                  <p className="text-white/80">Criar, editar e acompanhar células</p>
                  <div className="mt-4 text-white/60">
                    <span className="text-2xl font-bold">{cells.length}</span>
                    <span className="text-sm ml-1">células ativas</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {currentView === 'users' && (
            <Container maxWidth="xl" sx={{ mt: 4 }}>
              <Paper elevation={3} sx={{ p: 3, backgroundColor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
                    Usuários Cadastrados
                  </Typography>
                  <Button
                    onClick={() => {
                      resetUserForm();
                      setShowCreateForm(true);
                    }}
                    variant="contained"
                    startIcon={<UserPlus />}
                    sx={{
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      color: 'white',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.3)'
                      }
                    }}
                  >
                    Novo Usuário
                  </Button>
                </Box>
                
                <TableContainer component={Paper} elevation={3}>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: 'rgba(0, 0, 0, 0.05)' }}>
                        <TableCell sx={{ fontWeight: 'bold' }}>UTILIZADOR</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>NÍVEL</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>CÉLULA</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>STATUS</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>AÇÕES</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {users.map(user => (
                        <TableRow 
                          key={user.id} 
                          sx={{ 
                            '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.02)' },
                            borderBottom: '1px solid rgba(0, 0, 0, 0.08)'
                          }}
                        >
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Avatar 
                                sx={{ 
                                  backgroundColor: getRoleColor(user.role),
                                  width: 40,
                                  height: 40,
                                  fontSize: '1rem',
                                  fontWeight: 'bold'
                                }}
                              >
                                {user.name.charAt(0).toUpperCase()}
                              </Avatar>
                              <Box>
                                <Typography variant="body1" sx={{ fontWeight: 'medium', color: '#1f2937' }}>
                                  {user.name}
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#6b7280' }}>
                                  {user.email}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={user.role}
                              color={
                                user.role === 'Pastor' ? 'secondary' : 
                                user.role === 'Líder' ? 'warning' : 
                                user.role === 'Coordenador' ? 'info' :
                                user.role === 'Supervisor' ? 'success' :
                                'primary'
                              }
                              size="small"
                            />
                          </TableCell>
                          <TableCell sx={{ color: '#374151' }}>
                            {user.cell_id ? `Célula ${cells.find(c => c.id === user.cell_id)?.cell_number || user.cell_id}` : '-'}
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={user.isActive ? 'Ativo' : 'Inativo'}
                              color={user.isActive ? 'success' : 'error'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                              <IconButton
                                onClick={() => handleEdit(user)}
                                size="small"
                                color="primary"
                                title="Editar"
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                              <IconButton
                                onClick={() => handleDelete(user.id)}
                                size="small"
                                color="error"
                                title="Excluir"
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                              <IconButton
                                onClick={(e) => handleRedirectMenuOpen(e, user)}
                                size="small"
                                color="success"
                                title="Redirecionar"
                              >
                                <SettingsIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Container>
          )}
          
          {currentView === 'cells' && (
            <div>
              {cells.length > 0 ? (
                <Container maxWidth="xl" sx={{ mt: 4 }}>
                  <Paper elevation={3} sx={{ p: 3, backgroundColor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                      <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
                        Células Cadastradas
                      </Typography>
                      <Button
                        onClick={() => {
                          resetCellForm();
                          setShowCreateCellForm(true);
                        }}
                        variant="contained"
                        startIcon={<AddIcon />}
                        sx={{
                          backgroundColor: 'rgba(255, 255, 255, 0.2)',
                          color: 'white',
                          '&:hover': {
                            backgroundColor: 'rgba(255, 255, 255, 0.3)'
                          }
                        }}
                      >
                        Nova Célula
                      </Button>
                    </Box>
                    
                    <TableContainer component={Paper} elevation={3}>
                      <Table>
                        <TableHead>
                          <TableRow sx={{ backgroundColor: 'rgba(0, 0, 0, 0.05)' }}>
                            <TableCell sx={{ fontWeight: 'bold' }}>NÚMERO DA CÉLULA</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>LÍDER DESIGNADO</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>SUPERVISOR</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>QTD. MEMBROS</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>AÇÕES</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {cells.map(cell => {
                            const memberCount = users.filter(user => user.cell_id === cell.id).length;
                            const supervisor = users.find(user => 
                              user.role === 'Supervisor' && 
                              user.supervisor_cells?.includes(cell.id)
                            );
                            
                            return (
                              <TableRow 
                                key={cell.id} 
                                hover 
                                sx={{ 
                                  '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)', cursor: 'pointer' },
                                  cursor: 'pointer'
                                }}
                                onClick={() => navigate(`/pastor/celulas/${cell.id}`)}
                              >
                                <TableCell>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Avatar 
                                      sx={{ 
                                        bgcolor: 'primary.main',
                                        width: 40,
                                        height: 40
                                      }}
                                    >
                                      {cell.cell_number}
                                    </Avatar>
                                    <Box>
                                      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                        Célula {cell.cell_number}
                                      </Typography>
                                    </Box>
                                  </Box>
                                </TableCell>
                                <TableCell>
                                  <Typography variant="body2">
                                    {cell.leader_1?.name || 'Não definido'}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Typography variant="body2">
                                    {supervisor?.name || 'Não definido'}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Chip 
                                    label={`${memberCount} ${memberCount === 1 ? 'membro' : 'membros'}`}
                                    color="primary"
                                    variant="outlined"
                                    size="small"
                                  />
                                </TableCell>
                                <TableCell>
                                  <Box sx={{ display: 'flex', gap: 1 }}>
                                    <IconButton
                                      onClick={() => {
                                        setCellFormData({
                                          cell_number: cell.cell_number,
                                          leader_id: cell.leader_1_id || ''
                                        });
                                        setEditingCell(cell);
                                        setShowCreateCellForm(true);
                                      }}
                                      color="primary"
                                      size="small"
                                    >
                                      <EditIcon fontSize="small" />
                                    </IconButton>
                                    <IconButton
                                      onClick={() => {
                                        if (window.confirm('Tem certeza que deseja excluir esta célula?')) {
                                          handleDeleteCell(cell.id);
                                        }
                                      }}
                                      color="error"
                                      size="small"
                                    >
                                      <DeleteIcon fontSize="small" />
                                    </IconButton>
                                  </Box>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Paper>
                </Container>
              ) : (
                <div className="text-center py-12">
                  <div 
                    className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6"
                    style={{
                      background: 'rgba(255, 255, 255, 0.1)',
                      backdropFilter: 'blur(10px)'
                    }}
                  >
                    <Grid3X3 className="w-12 h-12 text-white/60" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Nenhuma célula cadastrada</h3>
                  <p className="text-white/80 mb-6">Comece criando sua primeira célula</p>
                  <button
                    onClick={() => {
                      resetCellForm();
                      setShowCreateCellForm(true);
                    }}
                    className="px-6 py-3 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors font-medium flex items-center space-x-2 mx-auto"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Criar Primeira Célula</span>
                  </button>
                </div>
              )}
            </div>
          )}

        </div>
        
        {/* Menu de Redirecionamento */}
        <Menu
          anchorEl={redirectMenuAnchor}
          open={Boolean(redirectMenuAnchor)}
          onClose={handleRedirectMenuClose}
        >
          <MenuItem onClick={() => handleRedirectUser('dashboard')}>
            <ListItemIcon>
              <DashboardIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Dashboard</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => handleRedirectUser('cells')}>
            <ListItemIcon>
              <GroupIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Células</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => handleRedirectUser('prayer')}>
            <ListItemIcon>
              <BookIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Oração</ListItemText>
          </MenuItem>
        </Menu>
      </div>
    </ProtectedComponent>
  );
};

export default PastorPanel;