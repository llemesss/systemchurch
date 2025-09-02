import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCelula } from '../contexts/CelulaContext';
import { useRedirectListener } from '../hooks/useRedirectListener';
import {
  Container,
  Typography,
  Button,
  Alert,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
  Paper,
  Chip
} from '@mui/material';
import {
  ArrowBack,
  ExpandMore,
  CheckCircle,
  FavoriteBorder,
  Person,
  Group
} from '@mui/icons-material';

interface Oikos {
  nome: string;
  descricao: string;
}

interface MembroCelula {
  id: string;
  nome: string;
  oikos1: Oikos;
  oikos2: Oikos;
}

const OracaoDiaria: React.FC = () => {
  const { user } = useAuth();
  
  // Estados para gerenciamento da página
  const [membrosCelula, setMembrosCelula] = useState<any[]>([]);
  const [alreadyPrayed, setAlreadyPrayed] = useState(false);
  const [isLoadingPrayer, setIsLoadingPrayer] = useState(false);
  const [isLoadingPage, setIsLoadingPage] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Escutar comandos de redirecionamento via WebSocket
  useRedirectListener();
  
  // Função para buscar membros da célula via API
  const buscarMembrosDaCelula = async (cellId: string) => {
    const token = localStorage.getItem('igreja_token') || sessionStorage.getItem('igreja_token');
    if (!token) throw new Error('Token não encontrado');
    
    const response = await fetch(`http://localhost:3001/api/cells/${cellId}/members`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Erro ao buscar membros: ${response.statusText}`);
    }
    
    return await response.json();
  };
  
  // Função para verificar status da oração
  const buscarStatusOracaoHoje = async () => {
    const token = localStorage.getItem('igreja_token') || sessionStorage.getItem('igreja_token');
    if (!token) throw new Error('Token não encontrado');
    
    const response = await fetch('http://localhost:3001/api/prayers/status/today', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Erro ao verificar status da oração: ${response.statusText}`);
    }
    
    return await response.json();
  };
  
  // Função para registrar a oração
  const handlePrayerLog = async () => {
    try {
      setIsLoadingPrayer(true);
      const token = localStorage.getItem('igreja_token') || sessionStorage.getItem('igreja_token');
      if (!token) return;
      
      const response = await fetch('http://localhost:3001/api/prayers/log', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAlreadyPrayed(true);
        console.log('✅ PRAYER LOG - Oração registrada:', data);
      } else if (response.status === 409) {
        // Usuário já orou hoje
        const data = await response.json();
        setAlreadyPrayed(true);
        console.log('⚠️ PRAYER LOG - Já orou hoje:', data);
      } else {
        console.error('❌ Erro ao registrar oração:', response.statusText);
      }
    } catch (error) {
      console.error('❌ Erro ao registrar oração:', error);
    } finally {
      setIsLoadingPrayer(false);
    }
  };
  
  // Lógica principal de carregamento da página seguindo os passos A-D
  useEffect(() => {
    const buscarDadosDaPagina = async () => {
      // Passo A: Obter o usuário logado e a sua cell_id do contexto
      if (!user || !user.cell_id) {
        setError("Você não está associado a nenhuma célula.");
        setIsLoadingPage(false);
        return; // Interrompe a execução aqui
      }

      setIsLoadingPage(true);
      setError(null);
      
      try {
        // Passos B e C: Buscar os dados em paralelo para mais eficiência
        const [dadosDosMembros, dadosStatusOracao] = await Promise.all([
          buscarMembrosDaCelula(user.cell_id), // Passo B
          buscarStatusOracaoHoje() // Passo C
        ]);

        // Atualiza os estados com os resultados
        // A API retorna { cell: {...}, members: [...] }, então precisamos acessar .members
        setMembrosCelula(dadosDosMembros.members || []);
        setAlreadyPrayed(dadosStatusOracao.alreadyPrayed);
        
        console.log('✅ ORAÇÃO DEBUG - Dados carregados com sucesso');
        console.log('🔍 ORAÇÃO DEBUG - Membros:', dadosDosMembros);
        console.log('🔍 ORAÇÃO DEBUG - Status oração:', dadosStatusOracao.alreadyPrayed);

      } catch (error) {
        console.error("Erro ao buscar dados da página:", error);
        setError("Não foi possível carregar os dados. Tente novamente.");
      } finally {
        // Passo D: Finalizar o carregamento, aconteça o que acontecer
        setIsLoadingPage(false);
      }
    };

    buscarDadosDaPagina();
  }, [user]); // Depende dos dados do usuário logado para re-executar

  // Mapear membros para o formato esperado pelo componente
  const membrosFormatados = membrosCelula.map(membro => ({
    id: membro.id,
    nome: membro.name, // Corrigido: usar 'name' em vez de 'nome'
    oikos1: { nome: membro.oikos_name || 'Não definido', descricao: 'oikos' },
    oikos2: { nome: membro.oikos_name_2 || 'Não definido', descricao: 'oikos' }
  }));

  // Renderização condicional baseada no estado de carregamento e erro
  if (isLoadingPage) {
    return (
      <div className="oracao-diaria-container">
        <div className="oracao-header">
          <Link to="/dashboard" className="back-button">
            <ArrowBack sx={{ fontSize: 24 }} />
            Voltar
          </Link>
          <div className="header-content">
            <FavoriteBorder sx={{ fontSize: 48 }} className="header-icon" />
            <h1 className="page-title">Oração Diária da Célula</h1>
            <p className="page-subtitle">
              Ore pelos Oikós dos seus irmãos em Cristo
            </p>
          </div>
        </div>
        
        <div className="loading-state">
          <CircularProgress size={48} className="spinner" />
          <p>Carregando dados da célula...</p>
        </div>
      </div>
    );
  }
  
  // Se há erro, mostrar tela de erro
  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box sx={{ mb: 3 }}>
          <Button
            component={Link}
            to="/dashboard"
            startIcon={<ArrowBack />}
            variant="outlined"
            sx={{ mb: 2 }}
          >
            Voltar ao Dashboard
          </Button>
        </Box>
        
        <Paper elevation={2} sx={{ p: 4, textAlign: 'center' }}>
          <FavoriteBorder sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
          <Typography variant="h4" component="h1" gutterBottom>
            Oração Diária da Célula
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" paragraph>
            Ore pelos Oikós dos seus irmãos em Cristo
          </Typography>
          
          <Alert severity="error" sx={{ mt: 3, mb: 2 }}>
            <Typography variant="h6">Erro ao carregar dados</Typography>
            <Typography>{error}</Typography>
          </Alert>
          
          <Button
            component={Link}
            to="/dashboard"
            variant="contained"
            startIcon={<ArrowBack />}
            sx={{ mt: 2 }}
          >
            Voltar ao Dashboard
          </Button>
        </Paper>
      </Container>
    );
  }
  
  // Se não há membros após carregamento bem-sucedido, mostrar mensagem
  if (membrosFormatados.length === 0) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box sx={{ mb: 3 }}>
          <Button
            component={Link}
            to="/dashboard"
            startIcon={<ArrowBack />}
            variant="outlined"
            sx={{ mb: 2 }}
          >
            Voltar
          </Button>
        </Box>
        
        <Paper elevation={2} sx={{ p: 4, textAlign: 'center' }}>
          <FavoriteBorder sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
          <Typography variant="h4" component="h1" gutterBottom>
            Oração Diária da Célula
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" paragraph>
            Ore pelos Oikós dos seus irmãos em Cristo
          </Typography>
          
          <Box sx={{ mt: 4 }}>
            <Group sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              Nenhum membro encontrado
            </Typography>
            <Typography color="text.secondary" paragraph>
              Não foram encontrados membros na sua célula.
            </Typography>
            <Button
              component={Link}
              to="/dashboard"
              variant="contained"
              startIcon={<ArrowBack />}
              sx={{ mt: 2 }}
            >
              Voltar ao Dashboard
            </Button>
          </Box>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Header com botão de voltar */}
      <Box sx={{ mb: 3 }}>
        <Button
          component={Link}
          to="/dashboard"
          startIcon={<ArrowBack />}
          variant="outlined"
          sx={{ mb: 2 }}
        >
          Voltar
        </Button>
      </Box>

      {/* Título da página */}
      <Paper elevation={2} sx={{ p: 4, mb: 3, textAlign: 'center' }}>
        <FavoriteBorder sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
        <Typography variant="h4" component="h1" gutterBottom>
          Oração Diária da Célula
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" paragraph>
          Ore pelos Oikós dos seus irmãos em Cristo
        </Typography>
      </Paper>

      {/* Status da Oração */}
      <Box sx={{ my: 3, textAlign: 'center' }}>
        {alreadyPrayed ? (
          <Alert 
            severity="success" 
            icon={<CheckCircle />}
            sx={{ maxWidth: 400, mx: 'auto' }}
          >
            <Typography variant="h6">
              Oração de Hoje Registrada!
            </Typography>
          </Alert>
        ) : (
          <Button
            variant="contained"
            size="large"
            startIcon={isLoadingPrayer ? <CircularProgress size={20} color="inherit" /> : <CheckCircle />}
            onClick={handlePrayerLog}
            disabled={isLoadingPrayer}
            sx={{ px: 4, py: 1.5 }}
          >
            {isLoadingPrayer ? 'Registrando...' : 'Marcar Oração de Hoje'}
          </Button>
        )}
      </Box>

      {/* Lista de Membros com Accordion */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ mb: 3, textAlign: 'center' }}>
          Membros da Célula
        </Typography>
        
        {membrosFormatados.map((membro) => (
          <Accordion key={membro.id} sx={{ mb: 1 }}>
            <AccordionSummary
              expandIcon={<ExpandMore />}
              aria-controls={`panel-${membro.id}-content`}
              id={`panel-${membro.id}-header`}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, width: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                  <Person color="primary" />
                  <Typography variant="h6" sx={{ flexGrow: 1, color: 'text.primary', fontWeight: 600 }}>
                    {membro.nome}
                  </Typography>
                  <Chip 
                     icon={<FavoriteBorder />} 
                     label="Orar" 
                     size="small" 
                     color="primary" 
                     variant="outlined"
                   />
                </Box>
                <Box sx={{ display: 'flex', gap: 1, ml: 5, flexWrap: 'wrap' }}>
                  <Chip 
                    label={`Oikós 1: ${membro.oikos1.nome}`}
                    size="small"
                    variant="outlined"
                    color="secondary"
                  />
                  <Chip 
                    label={`Oikós 2: ${membro.oikos2.nome}`}
                    size="small"
                    variant="outlined"
                    color="secondary"
                  />
                </Box>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ pl: 2 }}>
                <Typography variant="h6" gutterBottom sx={{ color: 'primary.main', mb: 2 }}>
                  Detalhes dos Oikós para Oração
                </Typography>
                
                <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: 'grey.50' }}>
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', color: 'secondary.main' }}>
                    {membro.oikos1.nome}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {membro.oikos1.descricao}
                  </Typography>
                </Paper>
                
                <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', color: 'secondary.main' }}>
                    {membro.oikos2.nome}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {membro.oikos2.descricao}
                  </Typography>
                </Paper>
              </Box>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>

      {/* Footer com versículo */}
      <Paper elevation={1} sx={{ p: 3, mt: 4, textAlign: 'center', bgcolor: 'grey.50' }}>
        <Typography variant="body1" sx={{ fontStyle: 'italic', mb: 1 }}>
          "Orai uns pelos outros, para que sareis. A oração feita por um justo pode muito em seus efeitos."
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 'medium' }}>
          Tiago 5:16
        </Typography>
      </Paper>
    </Container>
  );
};

export default OracaoDiaria;