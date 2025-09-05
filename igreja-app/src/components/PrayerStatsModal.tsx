import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  Modal,
  Paper,
  Typography,
  Box,
  Avatar,
  IconButton,
  Button,
  Divider,
  CircularProgress
} from '@mui/material';
import {
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  CalendarToday as CalendarIcon,
  TrendingUp as TrendingUpIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';

interface Member {
  id: string;
  name: string;
  email: string;
}

interface PrayerStats {
  user: {
    id: string;
    name: string;
  };
  prayedToday: boolean;
  weeklyCount: number;
  monthlyCount: number;
  yearlyCount: number;
}

interface PrayerStatsModalProps {
  member: Member;
  isOpen: boolean;
  onClose: () => void;
}

const PrayerStatsModal: React.FC<PrayerStatsModalProps> = ({ member, isOpen, onClose }) => {
  const [prayerStats, setPrayerStats] = useState<PrayerStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen && member) {
      loadPrayerStats();
    }
  }, [isOpen, member]);

  const loadPrayerStats = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('igreja_token') || sessionStorage.getItem('igreja_token');
      
      if (!token) {
        toast.error('Token de autenticação não encontrado');
        return;
      }

      // Usar Supabase através do utilitário de API
    const { usersSupabase } = await import('../utils/supabaseUtils');
    const data = await usersSupabase.getPrayerStats(parseInt(member.id));

      // Dados já obtidos do Supabase
      setPrayerStats(data);
    } catch (error) {
      console.error('Erro ao carregar estatísticas de oração:', error);
      toast.error('Erro ao carregar estatísticas de oração');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2
      }}
    >
      <Paper
        elevation={8}
        sx={{
          width: '100%',
          maxWidth: 800,
          maxHeight: '90vh',
          overflow: 'auto',
          borderRadius: 3
        }}
      >
        {/* Header */}
        <Box sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar
              sx={{
                bgcolor: 'primary.main',
                width: 48,
                height: 48,
                fontSize: '1.2rem',
                fontWeight: 'bold'
              }}
            >
              {member.name.charAt(0).toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                Painel de Oração: {member.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {member.email}
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={onClose} size="large">
            <CloseIcon />
          </IconButton>
        </Box>
        <Divider />

        {/* Content */}
        <Box sx={{ p: 3 }}>
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
              <CircularProgress size={40} />
            </Box>
          ) : prayerStats ? (
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
              {/* Card 1: Orou Hoje? */}
              <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                  Orou Hoje?
                </Typography>
                <Box sx={{ mb: 2 }}>
                  {prayerStats.prayedToday ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <Avatar
                        sx={{
                          width: 80,
                          height: 80,
                          bgcolor: 'success.main',
                          mb: 2
                        }}
                      >
                        <CheckCircleIcon sx={{ fontSize: 40 }} />
                      </Avatar>
                      <Typography variant="h6" color="success.main" sx={{ fontWeight: 'bold' }}>
                        Sim, orou hoje!
                      </Typography>
                    </Box>
                  ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <Avatar
                        sx={{
                          width: 80,
                          height: 80,
                          bgcolor: 'error.main',
                          mb: 2
                        }}
                      >
                        <CancelIcon sx={{ fontSize: 40 }} />
                      </Avatar>
                      <Typography variant="h6" color="error.main" sx={{ fontWeight: 'bold' }}>
                        Ainda não orou hoje
                      </Typography>
                    </Box>
                  )}
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Status da oração diária
                </Typography>
              </Paper>

              {/* Card 2: Estatísticas de Oração */}
              <Paper elevation={3} sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3, textAlign: 'center' }}>
                  Estatísticas de Oração
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {/* Orações na Semana */}
                  <Paper elevation={1} sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: 'info.main', width: 32, height: 32 }}>
                        <CalendarIcon sx={{ fontSize: 16 }} />
                      </Avatar>
                      <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                        Esta Semana
                      </Typography>
                    </Box>
                    <Typography variant="h6" color="info.main" sx={{ fontWeight: 'bold' }}>
                      {prayerStats.weeklyCount}
                    </Typography>
                  </Paper>

                  {/* Orações no Mês */}
                  <Paper elevation={1} sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: 'secondary.main', width: 32, height: 32 }}>
                        <TrendingUpIcon sx={{ fontSize: 16 }} />
                      </Avatar>
                      <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                        Este Mês
                      </Typography>
                    </Box>
                    <Typography variant="h6" color="secondary.main" sx={{ fontWeight: 'bold' }}>
                      {prayerStats.monthlyCount}
                    </Typography>
                  </Paper>

                  {/* Orações no Ano */}
                  <Paper elevation={1} sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: 'warning.main', width: 32, height: 32 }}>
                        <ScheduleIcon sx={{ fontSize: 16 }} />
                      </Avatar>
                      <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                        Este Ano
                      </Typography>
                    </Box>
                    <Typography variant="h6" color="warning.main" sx={{ fontWeight: 'bold' }}>
                      {prayerStats.yearlyCount}
                    </Typography>
                  </Paper>
                </Box>

                <Divider sx={{ my: 2 }} />
                <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center', display: 'block' }}>
                  Estatísticas baseadas nos registros de oração
                </Typography>
              </Paper>
            </Box>
          ) : (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <Avatar
                sx={{
                  width: 64,
                  height: 64,
                  bgcolor: 'error.main',
                  mx: 'auto',
                  mb: 2
                }}
              >
                <CancelIcon sx={{ fontSize: 32 }} />
              </Avatar>
              <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
                Erro ao carregar dados
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Não foi possível carregar as estatísticas de oração
              </Typography>
              <Button
                variant="contained"
                onClick={loadPrayerStats}
                sx={{ px: 4, py: 1.5 }}
              >
                Tentar Novamente
              </Button>
            </Box>
          )}
        </Box>

        {/* Footer */}
        <Divider />
        <Box sx={{ p: 3 }}>
          <Button
            variant="outlined"
            onClick={onClose}
            fullWidth
            size="large"
            sx={{ py: 1.5 }}
          >
            Fechar
          </Button>
        </Box>
      </Paper>
    </Modal>
  );
};

export default PrayerStatsModal;