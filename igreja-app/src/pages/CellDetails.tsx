import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Container,
  Paper,
  Typography,
  Button,
  Grid,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  IconButton,
  Chip
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  People as PeopleIcon,
  ChildCare as ChildCareIcon,
  Person as PersonIcon,
  SupervisorAccount as SupervisorAccountIcon,
  Visibility as VisibilityIcon,
  Print as PrintIcon
} from '@mui/icons-material';
import LoadingSpinner from '../components/LoadingSpinner';
import PrayerStatsModal from '../components/PrayerStatsModal';

interface CellMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  created_at: string;
  whatsapp?: string;
  gender?: string;
  date_of_birth?: string;
  birth_city?: string;
  birth_state?: string;
  address?: string;
  address_number?: string;
  neighborhood?: string;
  cep?: string;
  reference_point?: string;
  father_name?: string;
  mother_name?: string;
  marital_status?: string;
  spouse_name?: string;
  education?: string;
  profession?: string;
  conversion_date?: string;
  previous_church?: string;
  oikos_name?: string;
  oikos_name_2?: string;
}

interface CellInfo {
  id: string;
  name: string;
  description?: string;
  leader_name?: string;
}

interface CellDetailsData {
  cell: CellInfo;
  members: CellMember[];
}

const CellDetails: React.FC = () => {
  const { cellId } = useParams<{ cellId: string }>();
  const navigate = useNavigate();
  const [cellData, setCellData] = useState<CellDetailsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState<CellMember | null>(null);
  const [showPrayerModal, setShowPrayerModal] = useState(false);

  const loadCellDetails = useCallback(async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('igreja_token') || sessionStorage.getItem('igreja_token');
      
      if (!token) {
        toast.error('Token de autenticação não encontrado');
        navigate('/login');
        return;
      }

      // Usar Supabase através do utilitário de API
      const { cellsSupabase } = await import('../utils/supabaseUtils');
      const data = await cellsSupabase.getMembers(parseInt(cellId!));
      setCellData(data);
    } catch (error) {
      console.error('Erro ao carregar detalhes da célula:', error);
      toast.error('Erro ao carregar detalhes da célula');
    } finally {
      setIsLoading(false);
    }
  }, [cellId, navigate]);

  useEffect(() => {
    if (cellId) {
      loadCellDetails();
    }
  }, [cellId, loadCellDetails]);

  const handleMemberClick = (member: CellMember) => {
    setSelectedMember(member);
    setShowPrayerModal(true);
  };

  const handlePrintMemberForm = (member: CellMember) => {
    // Criar uma nova janela para impressão
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    
    if (printWindow) {
      // Função para formatar data
      const formatDateForPrint = (dateString?: string) => {
        if (!dateString) return '_____/_____/_________';
        try {
          return new Date(dateString).toLocaleDateString('pt-BR');
        } catch {
          return '_____/_____/_________';
        }
      };

      // Função para formatar gênero
      const formatGender = (gender?: string) => {
        if (gender === 'M') return 'Masculino';
        if (gender === 'F') return 'Feminino';
        return '_________________________';
      };

      const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Ficha Cadastral - ${member.name}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
              line-height: 1.6;
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #333;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .logo {
              font-size: 24px;
              font-weight: bold;
              color: #8B5CF6;
              margin-bottom: 10px;
            }
            .form-section {
              margin-bottom: 25px;
            }
            .section-title {
              background-color: #f0f0f0;
              padding: 8px 12px;
              font-weight: bold;
              border-left: 4px solid #8B5CF6;
              margin-bottom: 15px;
            }
            .field-row {
              display: flex;
              margin-bottom: 12px;
              align-items: center;
            }
            .field-label {
              font-weight: bold;
              min-width: 150px;
              margin-right: 10px;
            }
            .field-value {
              border-bottom: 1px solid #ccc;
              flex: 1;
              padding: 2px 5px;
              min-height: 20px;
            }
            .signature-section {
              margin-top: 50px;
              display: flex;
              justify-content: space-between;
            }
            .signature-box {
              width: 200px;
              text-align: center;
            }
            .signature-line {
              border-top: 1px solid #333;
              margin-top: 40px;
              padding-top: 5px;
            }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">Igreja do Poder de Deus em Brasília</div>
            <h2>FICHA CADASTRAL DE MEMBRO</h2>
          </div>
          
          <div class="form-section">
            <div class="section-title">DADOS PESSOAIS</div>
            <div class="field-row">
              <span class="field-label">Nome Completo:</span>
              <span class="field-value">${member.name}</span>
            </div>
            <div class="field-row">
              <span class="field-label">Email:</span>
              <span class="field-value">${member.email || ''}</span>
            </div>
            <div class="field-row">
              <span class="field-label">Telefone:</span>
              <span class="field-value">${member.phone || ''}</span>
            </div>
            <div class="field-row">
              <span class="field-label">WhatsApp:</span>
              <span class="field-value">${member.whatsapp || '_________________________'}</span>
            </div>
            <div class="field-row">
              <span class="field-label">Data de Nascimento:</span>
              <span class="field-value">${formatDateForPrint(member.date_of_birth)}</span>
            </div>
            <div class="field-row">
              <span class="field-label">Gênero:</span>
              <span class="field-value">${formatGender(member.gender)}</span>
            </div>
            <div class="field-row">
              <span class="field-label">Estado Civil:</span>
              <span class="field-value">${member.marital_status || '_________________________'}</span>
            </div>
            <div class="field-row">
              <span class="field-label">Cônjuge:</span>
              <span class="field-value">${member.spouse_name || '_________________________'}</span>
            </div>
            <div class="field-row">
              <span class="field-label">Profissão:</span>
              <span class="field-value">${member.profession || '_________________________'}</span>
            </div>
            <div class="field-row">
              <span class="field-label">Escolaridade:</span>
              <span class="field-value">${member.education || '_________________________'}</span>
            </div>
          </div>
          
          <div class="form-section">
            <div class="section-title">ENDEREÇO</div>
            <div class="field-row">
              <span class="field-label">Logradouro:</span>
              <span class="field-value">${member.address || '_________________________________________________'}</span>
            </div>
            <div class="field-row">
              <span class="field-label">Número:</span>
              <span class="field-value">${member.address_number || '_________'}</span>
            </div>
            <div class="field-row">
              <span class="field-label">Bairro:</span>
              <span class="field-value">${member.neighborhood || '_________________________'}</span>
            </div>
            <div class="field-row">
              <span class="field-label">CEP:</span>
              <span class="field-value">${member.cep || '_________________'}</span>
            </div>
            <div class="field-row">
              <span class="field-label">Ponto de Referência:</span>
              <span class="field-value">${member.reference_point || '_________________________'}</span>
            </div>
            <div class="field-row">
              <span class="field-label">Cidade de Nascimento:</span>
              <span class="field-value">${member.birth_city || '_________________________'}</span>
            </div>
            <div class="field-row">
              <span class="field-label">Estado de Nascimento:</span>
              <span class="field-value">${member.birth_state || '_________________________'}</span>
            </div>
          </div>
          
          <div class="form-section">
            <div class="section-title">INFORMAÇÕES FAMILIARES</div>
            <div class="field-row">
              <span class="field-label">Nome do Pai:</span>
              <span class="field-value">${member.father_name || '_________________________'}</span>
            </div>
            <div class="field-row">
              <span class="field-label">Nome da Mãe:</span>
              <span class="field-value">${member.mother_name || '_________________________'}</span>
            </div>
          </div>
          
          <div class="form-section">
            <div class="section-title">INFORMAÇÕES ECLESIÁSTICAS</div>
            <div class="field-row">
              <span class="field-label">Função:</span>
              <span class="field-value">${member.role}</span>
            </div>
            <div class="field-row">
              <span class="field-label">Status:</span>
              <span class="field-value">${member.status}</span>
            </div>
            <div class="field-row">
              <span class="field-label">Data de Cadastro:</span>
              <span class="field-value">${formatDate(member.created_at)}</span>
            </div>
            <div class="field-row">
              <span class="field-label">Célula:</span>
              <span class="field-value">${cellData?.cell.name || ''}</span>
            </div>
            <div class="field-row">
              <span class="field-label">Oikós Principal:</span>
              <span class="field-value">${member.oikos_name || '_________________________'}</span>
            </div>
            <div class="field-row">
              <span class="field-label">Oikós Secundário:</span>
              <span class="field-value">${member.oikos_name_2 || '_________________________'}</span>
            </div>
            <div class="field-row">
              <span class="field-label">Data de Conversão:</span>
              <span class="field-value">${formatDateForPrint(member.conversion_date)}</span>
            </div>
            <div class="field-row">
              <span class="field-label">Igreja Anterior:</span>
              <span class="field-value">${member.previous_church || '_________________________'}</span>
            </div>
          </div>
          
          <div class="form-section">
            <div class="section-title">INFORMAÇÕES ADICIONAIS</div>
            <div class="field-row">
              <span class="field-label">Batizado:</span>
              <span class="field-value">( ) Sim ( ) Não</span>
              <span class="field-label" style="margin-left: 20px;">Data:</span>
              <span class="field-value">_____/_____/_________</span>
            </div>
            <div class="field-row">
              <span class="field-label">Participa de Célula:</span>
              <span class="field-value">( ) Sim ( ) Não</span>
            </div>
            <div class="field-row">
              <span class="field-label">Observações:</span>
              <span class="field-value">_________________________________________________</span>
            </div>
          </div>
          
          <div class="signature-section">
            <div class="signature-box">
              <div class="signature-line">Assinatura do Membro</div>
            </div>
            <div class="signature-box">
              <div class="signature-line">Líder Responsável</div>
            </div>
          </div>
          
          <div style="margin-top: 30px; text-align: center; font-size: 12px; color: #666;">
            Documento gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}
          </div>
          
          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
        </html>
      `;
      
      printWindow.document.write(printContent);
      printWindow.document.close();
    } else {
      toast.error('Não foi possível abrir a janela de impressão');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Pastor':
        return '#8B5CF6';
      case 'Coordenador':
        return '#10B981';
      case 'Supervisor':
        return '#F59E0B';
      case 'Líder':
        return '#EF4444';
      case 'Membro':
        return '#6B7280';
      default:
        return '#6B7280';
    }
  };

  const getStatusChipColor = (status: string) => {
    return status === 'Ativo' ? 'success' : 'error';
  };

  const getRoleChipColor = (role: string) => {
    switch (role) {
      case 'Pastor':
        return 'secondary';
      case 'Coordenador':
        return 'success';
      case 'Supervisor':
        return 'warning';
      case 'Líder':
        return 'error';
      case 'Membro':
        return 'default';
      default:
        return 'default';
    }
  };

  // Calcular estatísticas
  const totalMembers = cellData?.members.length || 0;
  const totalChildren = cellData?.members.filter(member => member.role === 'Criança').length || 0;
  const leader = cellData?.members.find(member => member.role === 'Líder');
  const supervisor = cellData?.members.find(member => member.role === 'Supervisor');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!cellData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Célula não encontrada</h2>
          <button
            onClick={() => navigate('/pastor-panel')}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300"
          >
            Voltar ao Painel
          </button>
        </div>
      </div>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/pastor-panel')}
          variant="outlined"
        >
          Voltar
        </Button>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
          Detalhes da Célula {cellData.cell.name}
        </Typography>
      </Box>

      {/* Cards de Estatísticas */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <PeopleIcon sx={{ fontSize: 40, color: 'primary.main' }} />
              <Box>
                <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                  {totalMembers}
                </Typography>
                <Typography color="text.secondary">
                  Membros
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
        
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <ChildCareIcon sx={{ fontSize: 40, color: 'warning.main' }} />
              <Box>
                <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                  {totalChildren}
                </Typography>
                <Typography color="text.secondary">
                  Crianças
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
        
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <PersonIcon sx={{ fontSize: 40, color: 'success.main' }} />
              <Box>
                <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                  {leader?.name || 'N/A'}
                </Typography>
                <Typography color="text.secondary">
                  Líder
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
        
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <SupervisorAccountIcon sx={{ fontSize: 40, color: 'secondary.main' }} />
              <Box>
                <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                  {supervisor?.name || 'N/A'}
                </Typography>
                <Typography color="text.secondary">
                  Supervisor
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Tabela de Membros */}
      <Paper elevation={3}>
        <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="h6" component="h2" sx={{ fontWeight: 'bold' }}>
            Membros da Célula
          </Typography>
        </Box>
        
        {cellData.members.length > 0 ? (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>MEMBRO</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>TELEFONE</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>FUNÇÃO</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>STATUS</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>AÇÕES</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {cellData.members.map((member) => (
                  <TableRow key={member.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar 
                          sx={{ 
                            bgcolor: getRoleColor(member.role),
                            width: 40, 
                            height: 40 
                          }}
                        >
                          {member.name.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                            {member.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {member.email}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {member.phone || 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={member.role} 
                        color={getRoleChipColor(member.role)} 
                        size="small" 
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={member.status} 
                        color={getStatusChipColor(member.status)} 
                        size="small" 
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton 
                          onClick={() => handleMemberClick(member)}
                          color="primary"
                          size="small"
                          title="Visualizar detalhes"
                        >
                          <VisibilityIcon />
                        </IconButton>
                        <IconButton 
                          onClick={() => handlePrintMemberForm(member)}
                          color="secondary"
                          size="small"
                          title="Imprimir ficha cadastral"
                        >
                          <PrintIcon />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Box sx={{ p: 6, textAlign: 'center' }}>
            <PeopleIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" sx={{ mb: 1 }}>
              Nenhum membro cadastrado
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Esta célula ainda não possui membros
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Prayer Stats Modal */}
      {showPrayerModal && selectedMember && (
        <PrayerStatsModal
          member={selectedMember}
          isOpen={showPrayerModal}
          onClose={() => {
            setShowPrayerModal(false);
            setSelectedMember(null);
          }}
        />
      )}
    </Container>
  );
};

export default CellDetails;