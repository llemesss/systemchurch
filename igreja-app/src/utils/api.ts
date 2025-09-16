import {
  authBackend,
  usersBackend,
  cellsBackend,
  prayersBackend,
  profileBackend,
  healthBackend,
  userCellsBackend
} from './backendApi';

// Base URL para chamadas ao backend
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://igreja-backend.onrender.com'
  : 'http://localhost:3001';

// Função para fazer chamadas HTTP reais ao backend (para endpoints que precisam de autenticação JWT)
export const apiCallAuth = async (endpoint: string, options: RequestInit = {}) => {
  try {
    // Obter token do localStorage
    const token = localStorage.getItem('igreja_token');
    
    if (!token) {
      throw new Error('Token de autenticação não encontrado');
    }

    const response = await fetch(`${API_BASE_URL}/api${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Erro na API ${endpoint}:`, error);
    throw error;
  }
};

// Função utilitária para fazer chamadas à API usando o backend
export const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const method = options.method || 'GET';
  const body = options.body ? JSON.parse(options.body as string) : null;
  
  try {
    // Roteamento baseado no endpoint
    switch (true) {
      // Autenticação
      case endpoint === '/auth/login':
        return await authBackend.login(body.email, body.password);
      
      case endpoint === '/auth/register':
        return await authBackend.register(body);
      
      case endpoint.startsWith('/auth/me'):
        return await authBackend.getCurrentUser();
      
      // Usuários
      case endpoint === '/users' && method === 'GET':
        return await usersBackend.getAll();
      
      case endpoint === '/users' && method === 'POST':
        return await usersBackend.create(body);
      
      case !!endpoint.match(/^\/users\/\d+$/) && method === 'PUT':
        const updateUserId = parseInt(endpoint.split('/')[2]);
        return await usersBackend.update(updateUserId, body);
      
      case !!endpoint.match(/^\/users\/\d+$/) && method === 'DELETE':
        const deleteUserId = parseInt(endpoint.split('/')[2]);
        return await usersBackend.delete(deleteUserId);
      
      case !!endpoint.match(/^\/users\/\d+$/) && method === 'GET':
        const getUserId = parseInt(endpoint.split('/')[2]);
        return await usersBackend.getById(getUserId);
      
      case !!endpoint.match(/^\/users\/\d+\/prayer-stats$/):
        const statsUserId = parseInt(endpoint.split('/')[2]);
        return await usersBackend.getPrayerStats(statsUserId);
      
      case !!endpoint.match(/^\/users\/\d+\/password$/) && method === 'PUT':
        const passwordUserId = parseInt(endpoint.split('/')[2]);
        return await usersBackend.updatePassword(passwordUserId, body.password);
      
      // Células
      case endpoint === '/cells' && method === 'GET':
        return await cellsBackend.getAll();
      
      case endpoint === '/cells/public':
        return await cellsBackend.getPublic();
      
      case endpoint === '/cells' && method === 'POST':
        return await cellsBackend.create(body);
      
      case !!endpoint.match(/^\/cells\/\d+$/) && method === 'PUT':
        const updateCellId = parseInt(endpoint.split('/')[2]);
        return await cellsBackend.update(updateCellId, body);
      
      case !!endpoint.match(/^\/cells\/\d+$/) && method === 'DELETE':
        const deleteCellId = parseInt(endpoint.split('/')[2]);
        return await cellsBackend.delete(deleteCellId);
      
      case !!endpoint.match(/^\/cells\/\d+$/) && method === 'GET':
        const getCellId = parseInt(endpoint.split('/')[2]);
        return await cellsBackend.getById(getCellId);
      
      case !!endpoint.match(/^\/cells\/\d+\/members$/):
        const cellId = parseInt(endpoint.split('/')[2]);
        return await cellsBackend.getMembers(cellId);
      
      // Orações
      case endpoint === '/prayers/log' && method === 'POST':
        return await prayersBackend.logPrayer(body?.user_id, body?.prayer_date);
      
      case !!endpoint.match(/^\/prayers\/today\/\d+$/):
        const statusUserId = parseInt(endpoint.split('/')[3]);
        return await prayersBackend.getTodayStatus(statusUserId);
      
      case !!endpoint.match(/^\/prayers\/history\/\d+$/):
        const historyUserId = parseInt(endpoint.split('/')[3]);
        return await prayersBackend.getPrayerHistory(historyUserId);
      
      // Perfil
      case !!endpoint.match(/^\/profile\/\d+$/) && method === 'GET':
        const profileUserId = parseInt(endpoint.split('/')[2]);
        return await profileBackend.get(profileUserId);
      
      case !!endpoint.match(/^\/profile\/\d+$/) && method === 'PUT':
        const updateProfileUserId = parseInt(endpoint.split('/')[2]);
        return await profileBackend.update(updateProfileUserId, body);
      
      case !!endpoint.match(/^\/profile\/\d+\/complete$/) && method === 'POST':
        const completeUserId = parseInt(endpoint.split('/')[2]);
        return await profileBackend.complete(completeUserId, body);
      
      // User Cells
      case endpoint === '/user-cells' && method === 'GET':
        return await userCellsBackend.getAll();
      
      case endpoint === '/user-cells' && method === 'POST':
        return await userCellsBackend.create(body.user_id, body.cell_id, body.role);
      
      case endpoint === '/user-cells' && method === 'DELETE':
        return await userCellsBackend.delete(body.user_id, body.cell_id);
      
      case !!endpoint.match(/^\/user-cells\/user\/\d+$/):
        const userCellUserId = parseInt(endpoint.split('/')[3]);
        return await userCellsBackend.getByUser(userCellUserId);
      
      case endpoint === '/user-cells/role' && method === 'PUT':
        return await userCellsBackend.updateRole(body.user_id, body.cell_id, body.role);
      
      // Health Check
      case endpoint === '/health':
        return await healthBackend.check();
      
      default:
        throw new Error(`Endpoint não implementado: ${method} ${endpoint}`);
    }
  } catch (error) {
    console.error(`Erro na API ${endpoint}:`, error);
    throw error;
  }
};

// Todas as operações de upload e storage agora devem ser implementadas via backend próprio
// URLs removidas - todas as operações agora usam backend próprio

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