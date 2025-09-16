// Utilitários para comunicação com o backend via Netlify Functions
// Substitui completamente o Supabase

// Configuração da API
const API_BASE_URL = import.meta.env.VITE_API_URL || '/.netlify/functions';

// Função para obter o token JWT do localStorage
function getAuthToken(): string | null {
  return localStorage.getItem('authToken');
}

// Função para fazer chamadas autenticadas à API
async function apiCall(endpoint: string, options: RequestInit = {}): Promise<any> {
  const token = getAuthToken();
  
  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
    throw new Error(errorData.error || `Erro HTTP: ${response.status}`);
  }

  return response.json();
}

// Tipos para o backend
export interface BackendUser {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: 'Admin' | 'Pastor' | 'Coordenador' | 'Supervisor' | 'Líder' | 'Membro';
  status: 'Ativo' | 'Inativo';
  cell_id?: number;
  created_at: string;
  updated_at: string;
}

export interface BackendCell {
  id: number;
  cell_number: string;
  name?: string;
  description?: string;
  leader_id?: number;
  supervisor_id?: number;
  coordinator_id?: number;
  created_at: string;
  updated_at: string;
}

export interface BackendPrayerLog {
  id: number;
  user_id: number;
  prayer_date: string;
  created_at: string;
}

export interface BackendUserProfile {
  id: number;
  user_id: number;
  whatsapp?: string;
  gender?: 'M' | 'F';
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
  marital_status?: 'Solteiro(a)' | 'Casado(a)' | 'Divorciado(a)' | 'Viúvo(a)' | 'União Estável' | 'Outros';
  spouse_name?: string;
  education?: string;
  profession?: string;
  conversion_date?: string;
  previous_church?: string;
  oikos_name?: string;
  oikos_name_2?: string;
  created_at: string;
  updated_at: string;
}

// Autenticação
export const authBackend = {
  async login(email: string, password: string) {
    const response = await apiCall('/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (response.token) {
      localStorage.setItem('authToken', response.token);
    }
    
    return response;
  },

  async register(userData: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    role?: string;
    cell_id?: number;
  }) {
    const response = await apiCall('/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    if (response.token) {
      localStorage.setItem('authToken', response.token);
    }
    
    return response;
  },

  async getCurrentUser() {
    return await apiCall('/me');
  },

  async logout() {
    localStorage.removeItem('authToken');
    return { success: true };
  },

  async refreshToken() {
    return await apiCall('/api/auth/refresh');
  }
};

// Usuários
export const usersBackend = {
  async getAll(): Promise<BackendUser[]> {
    return await apiCall('/api/users');
  },

  async getById(id: number): Promise<BackendUser> {
    return await apiCall(`/api/users/${id}`);
  },

  async create(userData: Partial<BackendUser>) {
    return await apiCall('/api/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  async update(id: number, userData: Partial<BackendUser>) {
    return await apiCall(`/api/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  },

  async delete(id: number) {
    return await apiCall(`/api/users/${id}`, {
      method: 'DELETE',
    });
  },

  async getPrayerStats(id: number) {
    return await apiCall(`/api/users/${id}/prayer-stats`);
  },

  async updatePassword(id: number, newPassword: string) {
    return await apiCall(`/api/users/${id}/password`, {
      method: 'PUT',
      body: JSON.stringify({ password: newPassword }),
    });
  }
};

// Células
export const cellsBackend = {
  async getAll(): Promise<BackendCell[]> {
    return await apiCall('/cells');
  },

  async getPublic(): Promise<BackendCell[]> {
    return await apiCall('/cells-public');
  },

  async getById(id: number): Promise<BackendCell> {
    return await apiCall(`/cells/${id}`);
  },

  async create(cellData: Partial<BackendCell>) {
    return await apiCall('/cells', {
      method: 'POST',
      body: JSON.stringify(cellData),
    });
  },

  async update(id: number, cellData: Partial<BackendCell>) {
    return await apiCall(`/cells/${id}`, {
      method: 'PUT',
      body: JSON.stringify(cellData),
    });
  },

  async delete(id: number) {
    return await apiCall(`/cells/${id}`, {
      method: 'DELETE',
    });
  },

  async getMembers(id: number) {
    return await apiCall(`/cells/${id}/members`);
  }
};

// Orações
export const prayersBackend = {
  async logPrayer(userId: number, prayerDate?: string) {
    return await apiCall('/api/prayers/log', {
      method: 'POST',
      body: JSON.stringify({ 
        user_id: userId, 
        prayer_date: prayerDate || new Date().toISOString().split('T')[0] 
      }),
    });
  },

  async getTodayStatus(userId: number) {
    return await apiCall(`/api/prayers/today/${userId}`);
  },

  async getPrayerHistory(userId: number) {
    return await apiCall(`/api/prayers/history/${userId}`);
  }
};

// Perfil
export const profileBackend = {
  async get(userId: number) {
    return await apiCall(`/api/profile/${userId}`);
  },

  async update(userId: number, profileData: Partial<BackendUserProfile>) {
    return await apiCall(`/api/profile/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },

  async complete(userId: number, profileData: Partial<BackendUserProfile>) {
    return await apiCall(`/api/profile/${userId}/complete`, {
      method: 'POST',
      body: JSON.stringify(profileData),
    });
  }
};

// Relacionamentos usuário-célula
export const userCellsBackend = {
  async getAll() {
    return await apiCall('/api/user-cells');
  },

  async getByUser(userId: number) {
    return await apiCall(`/api/user-cells/user/${userId}`);
  },

  async create(userId: number, cellId: number, role: string) {
    return await apiCall('/api/user-cells', {
      method: 'POST',
      body: JSON.stringify({ user_id: userId, cell_id: cellId, role }),
    });
  },

  async delete(userId: number, cellId: number) {
    return await apiCall('/api/user-cells', {
      method: 'DELETE',
      body: JSON.stringify({ user_id: userId, cell_id: cellId }),
    });
  },

  async updateRole(userId: number, cellId: number, role: string) {
    return await apiCall('/api/user-cells/role', {
      method: 'PUT',
      body: JSON.stringify({ user_id: userId, cell_id: cellId, role }),
    });
  }
};

// Health check
export const healthBackend = {
  async check() {
    return await apiCall('/health');
  }
};

// Função principal para fazer chamadas à API (compatibilidade)
export { apiCall };

// Função para verificar se o usuário está autenticado
export function isAuthenticated(): boolean {
  return !!getAuthToken();
}

// Função para obter dados do usuário do token (se necessário)
export function getUserFromToken(): any {
  const token = getAuthToken();
  if (!token) return null;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload;
  } catch {
    return null;
  }
}