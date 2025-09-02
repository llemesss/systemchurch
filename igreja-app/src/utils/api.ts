// Configuração centralizada da API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const WS_BASE_URL = API_BASE_URL.replace('http', 'ws').replace('https', 'wss');

// Função utilitária para fazer chamadas à API
export const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE_URL}/api${endpoint}`;
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include',
    ...options,
  };

  // Adicionar token de autorização se disponível
  const token = localStorage.getItem('token');
  if (token) {
    (defaultOptions.headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, defaultOptions);
    
    // Se a resposta não for ok, lançar erro
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Erro desconhecido' }));
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    // Se não há conteúdo, retornar null
    if (response.status === 204) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error(`Erro na API ${endpoint}:`, error);
    throw error;
  }
};

// Função para fazer upload de arquivos
export const apiUpload = async (endpoint: string, formData: FormData) => {
  const url = `${API_BASE_URL}/api${endpoint}`;
  
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {};
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Erro no upload' }));
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Erro no upload ${endpoint}:`, error);
    throw error;
  }
};

// URLs para diferentes serviços
export const API_URLS = {
  base: API_BASE_URL,
  api: `${API_BASE_URL}/api`,
  ws: `${WS_BASE_URL}/ws`,
} as const;

// Endpoints específicos
export const ENDPOINTS = {
  // Autenticação
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
    me: '/auth/me',
  },
  
  // Usuários
  users: {
    list: '/users',
    create: '/users',
    update: (id: number) => `/users/${id}`,
    delete: (id: number) => `/users/${id}`,
    prayerStats: (id: number) => `/users/${id}/prayer-stats`,
  },
  
  // Células
  cells: {
    list: '/cells',
    public: '/cells/public',
    create: '/cells',
    update: (id: number) => `/cells/${id}`,
    delete: (id: number) => `/cells/${id}`,
    members: (id: number) => `/cells/${id}/members`,
  },
  
  // Perfil
  PROFILE: {
    GET: '/profile',
    UPDATE: '/profile',
    COMPLETE: '/profile/complete',
  },
  
  // Dependentes
  DEPENDENTS: {
    LIST: '/dependents',
    CREATE: '/dependents',
    UPDATE: (id: number) => `/dependents/${id}`,
    DELETE: (id: number) => `/dependents/${id}`,
  },
  
  // Orações
  prayers: {
    log: '/prayers/log',
    status: '/prayers/status/today',
  },
  
  // Pedidos de Oração
  prayerRequests: {
    list: '/prayer-requests',
    public: '/prayer-requests/public',
    myRequests: '/prayer-requests/my-requests',
    create: '/prayer-requests',
    update: (id: number) => `/prayer-requests/${id}`,
    delete: (id: number) => `/prayer-requests/${id}`,
    pray: (id: number) => `/prayer-requests/${id}/pray`,
  },
  
  // Health Check
  health: '/health',
} as const;

export default apiCall;