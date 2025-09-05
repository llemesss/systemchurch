import React, { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { WS_BASE_URL } from '../utils/api';
import toast from 'react-hot-toast';

interface WebSocketContextType {
  isConnected: boolean;
  sendRedirectCommand: (userId: string, page: string) => void;
  lastMessage: any;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};

interface WebSocketProviderProps {
  children: ReactNode;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<any>(null);

  useEffect(() => {
    if (!user) return;

    // Conectar ao WebSocket apenas se o usuário estiver autenticado
    const token = localStorage.getItem('igreja_token') || sessionStorage.getItem('igreja_token');
    if (!token) return;

    const wsUrl = `${WS_BASE_URL}/ws?token=${encodeURIComponent(token)}`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('WebSocket conectado');
      setIsConnected(true);
      setSocket(ws);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setLastMessage(data);
        
        if (data.type === 'redirect') {
          // Redirecionar o usuário para a página especificada
          handleRedirect(data.page);
        }
      } catch (error) {
        console.error('Erro ao processar mensagem WebSocket:', error);
      }
    };

    ws.onclose = () => {
      console.log('WebSocket desconectado');
      setIsConnected(false);
      setSocket(null);
    };

    ws.onerror = (error) => {
      console.error('Erro no WebSocket:', error);
      setIsConnected(false);
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [user]);

  const handleRedirect = (page: string) => {
    toast.success(`Você foi direcionado para: ${page}`);
    
    // Mapear páginas para rotas
    const pageRoutes: { [key: string]: string } = {
      'Dashboard': '/dashboard',
      'Células': '/celulas',
      'Oração Diária': '/oracao-diaria',
      'Configurações': '/configuracoes'
    };

    const route = pageRoutes[page];
    if (route) {
      // Usar setTimeout para garantir que o toast seja exibido antes do redirecionamento
      setTimeout(() => {
        window.location.href = route;
      }, 1000);
    }
  };

  const sendRedirectCommand = (userId: string, page: string) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      const message = {
        type: 'redirect_user',
        userId,
        page
      };
      
      socket.send(JSON.stringify(message));
      toast.success(`Comando de redirecionamento enviado para o usuário`);
    } else {
      toast.error('Conexão WebSocket não disponível');
    }
  };

  const value: WebSocketContextType = {
    isConnected,
    sendRedirectCommand,
    lastMessage
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};