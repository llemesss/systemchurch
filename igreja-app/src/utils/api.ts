import { 
  authSupabase, 
  usersSupabase, 
  cellsSupabase, 
  prayersSupabase, 
  profileSupabase, 
  healthSupabase 
} from './supabaseUtils';

// Todas as chamadas agora usam Supabase - sem necessidade de API_BASE_URL

// Função utilitária para fazer chamadas à API usando Supabase
export const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const method = options.method || 'GET';
  const body = options.body ? JSON.parse(options.body as string) : null;
  
  try {
    // Roteamento baseado no endpoint
    switch (true) {
      // Autenticação
      case endpoint === '/auth/login':
        return await authSupabase.login(body.email, body.password);
      
      case endpoint === '/auth/register':
        return await authSupabase.register(body);
      
      case endpoint.startsWith('/auth/me'):
        const currentUserId = await getCurrentUserId();
        return await authSupabase.getCurrentUser(currentUserId);
      
      // Usuários
      case endpoint === '/users' && method === 'GET':
        return await usersSupabase.getAll();
      
      case endpoint === '/users' && method === 'POST':
        return await usersSupabase.create(body);
      
      case !!endpoint.match(/^\/users\/\d+$/) && method === 'PUT':
        const updateUserId = parseInt(endpoint.split('/')[2]);
        return await usersSupabase.update(updateUserId, body);
      
      case !!endpoint.match(/^\/users\/\d+$/) && method === 'DELETE':
        const deleteUserId = parseInt(endpoint.split('/')[2]);
        return await usersSupabase.delete(deleteUserId);
      
      case !!endpoint.match(/^\/users\/\d+\/prayer-stats$/):
        const statsUserId = parseInt(endpoint.split('/')[2]);
        return await usersSupabase.getPrayerStats(statsUserId);
      
      // Células
      case endpoint === '/cells' && method === 'GET':
        return await cellsSupabase.getAll();
      
      case endpoint === '/cells/public':
        return await cellsSupabase.getPublic();
      
      case endpoint === '/cells' && method === 'POST':
        return await cellsSupabase.create(body);
      
      case !!endpoint.match(/^\/cells\/\d+$/) && method === 'PUT':
        const updateCellId = parseInt(endpoint.split('/')[2]);
        return await cellsSupabase.update(updateCellId, body);
      
      case !!endpoint.match(/^\/cells\/\d+$/) && method === 'DELETE':
        const deleteCellId = parseInt(endpoint.split('/')[2]);
        return await cellsSupabase.delete(deleteCellId);
      
      case !!endpoint.match(/^\/cells\/\d+\/members$/):
        const cellId = parseInt(endpoint.split('/')[2]);
        return await cellsSupabase.getMembers(cellId);
      
      // Orações
      case endpoint === '/prayers/log' && method === 'POST':
        const prayerUserId = await getCurrentUserId();
        return await prayersSupabase.logPrayer(parseInt(prayerUserId), body?.prayer_date);
      
      case endpoint === '/prayers/status/today':
        const statusUserId = await getCurrentUserId();
        return await prayersSupabase.getTodayStatus(parseInt(statusUserId));
      
      // Perfil
      case endpoint === '/profile' && method === 'GET':
        const profileUserId = await getCurrentUserId();
        return await profileSupabase.get(parseInt(profileUserId));
      
      case endpoint === '/profile' && method === 'PUT':
        const updateProfileUserId = await getCurrentUserId();
        return await profileSupabase.update(parseInt(updateProfileUserId), body);
      
      case endpoint === '/profile/complete' && method === 'POST':
        const completeUserId = await getCurrentUserId();
        return await profileSupabase.complete(parseInt(completeUserId), body);
      
      // Health Check
      case endpoint === '/health':
        return await healthSupabase.check();
      
      default:
        throw new Error(`Endpoint não implementado: ${method} ${endpoint}`);
    }
  } catch (error) {
    console.error(`Erro na API ${endpoint}:`, error);
    throw error;
  }
};

// Função auxiliar para obter ID do usuário atual
async function getCurrentUserId(): Promise<string> {
  const { supabase } = await import('../supabaseClient');
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('Usuário não autenticado');
  }
  
  return user.id;
}

// Upload de arquivos agora deve ser implementado via Supabase Storage
// Função removida - usar supabase.storage.from('bucket').upload() diretamente

// URLs removidas - todas as operações agora usam Supabase diretamente

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