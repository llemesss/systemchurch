import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWebSocket } from '../contexts/WebSocketContext';
import toast from 'react-hot-toast';

// Mapeamento de páginas para rotas
const PAGE_ROUTES: Record<string, string> = {
  'Dashboard': '/dashboard',
  'Células': '/dashboard', // Assumindo que células é uma seção do dashboard
  'Oração Diária': '/oracao-diaria',
  'Configurações': '/dashboard', // Assumindo que configurações é uma seção do dashboard
};

export const useRedirectListener = () => {
  const navigate = useNavigate();
  const { lastMessage } = useWebSocket();

  useEffect(() => {
    if (lastMessage?.type === 'redirect') {
      const { page } = lastMessage.data;
      const route = PAGE_ROUTES[page];
      
      if (route) {
        toast.success(`Você foi direcionado para ${page}`);
        navigate(route);
      } else {
        toast.error(`Página "${page}" não encontrada`);
      }
    }
  }, [lastMessage, navigate]);
};