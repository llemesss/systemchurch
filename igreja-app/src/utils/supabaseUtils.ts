import { supabase } from '../supabaseClient';
// Tipos importados conforme necessário

// Tipos para Supabase
export interface SupabaseUser {
  id: number;
  name: string;
  email: string;
  password: string;
  phone?: string;
  role: 'Admin' | 'Pastor' | 'Coordenador' | 'Supervisor' | 'Líder' | 'Membro';
  status: 'Ativo' | 'Inativo';
  cell_id?: number;
  created_at: string;
  updated_at: string;
}

export interface SupabaseCell {
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

export interface SupabasePrayerLog {
  id: number;
  user_id: number;
  prayer_date: string;
  created_at: string;
}

export interface SupabaseUserProfile {
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

// Funções de Autenticação
export const authSupabase = {
  async login(email: string, password: string) {
    // Usar autenticação nativa do Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data.user) {
      throw new Error('Usuário não encontrado');
    }

    // Buscar dados adicionais do usuário na tabela customizada
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .eq('status', 'Ativo')
      .single();

    if (userError || !userData) {
      // Se não encontrar na tabela customizada, usar dados do auth
      return {
        user: {
          id: data.user.id,
          email: data.user.email,
          name: data.user.user_metadata?.name || data.user.email?.split('@')[0],
          role: 'Membro'
        },
        token: data.session?.access_token
      };
    }

    return {
      user: userData,
      token: data.session?.access_token
    };
  },

  async register(userData: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    cell_id?: string;
    oikos_name?: string;
  }) {
    // Usar autenticação nativa do Supabase
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          name: userData.name,
          phone: userData.phone
        }
      }
    });

    if (authError) {
      throw new Error(authError.message);
    }

    if (!authData.user) {
      throw new Error('Erro ao criar usuário');
    }

    // Criar registro na tabela customizada de usuários
    const { data, error } = await supabase
      .from('users')
      .insert({
        id: authData.user.id, // Usar o ID do auth
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        role: 'Membro',
        status: 'Ativo',
        cell_id: userData.cell_id ? parseInt(userData.cell_id) : null
      })
      .select()
      .single();

    if (error) {
      // Se falhar ao criar na tabela customizada, ainda retorna o usuário do auth
      console.warn('Erro ao criar registro customizado:', error.message);
    }

    // Se há oikos_name, criar perfil
    if (userData.oikos_name && authData.user) {
      await supabase
        .from('user_profiles')
        .insert({
          user_id: authData.user.id,
          oikos_name: userData.oikos_name
        });
    }

    return data;
  },

  async getCurrentUser(userId?: string) {
    // Se não foi passado userId, pegar da sessão atual
    if (!userId) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuário não autenticado');
      }
      userId = user.id;
    }

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      // Se não encontrar na tabela customizada, usar dados do auth
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        return {
          id: user.id,
          email: user.email,
          name: user.user_metadata?.name || user.email?.split('@')[0],
          role: 'Membro'
        };
      }
      throw new Error('Usuário não encontrado');
    }

    return data;
  }
};

// Funções de Usuários
export const usersSupabase = {
  async getAll() {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('name');

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  async getById(id: number) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  async create(userData: Partial<SupabaseUser>) {
    const { data, error } = await supabase
      .from('users')
      .insert(userData)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  async update(id: number, userData: Partial<SupabaseUser>) {
    const { data, error } = await supabase
      .from('users')
      .update({ ...userData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  async delete(id: number) {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(error.message);
    }

    return true;
  },

  async getPrayerStats(id: number) {
    const { data, error } = await supabase
      .from('prayer_logs')
      .select('*')
      .eq('user_id', id)
      .order('prayer_date', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }
};

// Funções de Células
export const cellsSupabase = {
  async getAll() {
    const { data, error } = await supabase
      .from('cells')
      .select(`
        *,
        leader:leader_id(id, name, email, phone),
        supervisor:supervisor_id(id, name, email),
        coordinator:coordinator_id(id, name, email)
      `)
      .order('cell_number');

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  async getPublic() {
    const { data, error } = await supabase
      .from('cells')
      .select('id, cell_number, name')
      .order('cell_number');

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  async getById(id: number) {
    const { data, error } = await supabase
      .from('cells')
      .select(`
        *,
        leader:leader_id(id, name, email, phone),
        supervisor:supervisor_id(id, name, email),
        coordinator:coordinator_id(id, name, email)
      `)
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  async getMembers(cellId: number) {
    const { data: cellData, error: cellError } = await supabase
      .from('cells')
      .select('*')
      .eq('id', cellId)
      .single();

    if (cellError) {
      throw new Error(cellError.message);
    }

    const { data: membersData, error: membersError } = await supabase
      .from('users')
      .select(`
        *,
        user_profiles(*)
      `)
      .eq('cell_id', cellId)
      .order('name');

    if (membersError) {
      throw new Error(membersError.message);
    }

    return {
      cell: cellData,
      members: membersData
    };
  },

  async create(cellData: {
    cell_number: string;
    name?: string;
    description?: string;
    leader_id?: number;
    supervisor_id?: number;
    coordinator_id?: number;
  }) {
    const { data, error } = await supabase
      .from('cells')
      .insert(cellData)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  async update(id: number, cellData: Partial<SupabaseCell>) {
    const { data, error } = await supabase
      .from('cells')
      .update({ ...cellData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  async delete(id: number) {
    const { error } = await supabase
      .from('cells')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(error.message);
    }

    return true;
  }
};

// Funções de Orações
export const prayersSupabase = {
  async logPrayer(userId: number, prayerDate: string = new Date().toISOString().split('T')[0]) {
    const { data, error } = await supabase
      .from('prayer_logs')
      .upsert({
        user_id: userId,
        prayer_date: prayerDate
      })
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  async getTodayStatus(userId: number) {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('prayer_logs')
      .select('*')
      .eq('user_id', userId)
      .eq('prayer_date', today)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw new Error(error.message);
    }

    return { hasPrayed: !!data };
  }
};

// Funções de Perfil
export const profileSupabase = {
  async get(userId: number) {
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError) {
      throw new Error(userError.message);
    }

    const { data: profileData, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    // Se não há perfil, retornar apenas dados do usuário
    if (profileError && profileError.code === 'PGRST116') {
      return { user: userData, profile: null };
    }

    if (profileError) {
      throw new Error(profileError.message);
    }

    return { user: userData, profile: profileData };
  },

  async update(userId: number, profileData: Partial<SupabaseUserProfile>) {
    const { data, error } = await supabase
      .from('user_profiles')
      .upsert({
        user_id: userId,
        ...profileData,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  async complete(userId: number, completeData: {
    whatsapp?: string;
    gender?: 'M' | 'F';
    date_of_birth?: string;
    address?: string;
    oikos_name?: string;
  }) {
    return await this.update(userId, completeData);
  }
};

// Função de Health Check
export const healthSupabase = {
  async check() {
    try {
      const { error } = await supabase
        .from('users')
        .select('count')
        .limit(1);

      if (error) {
        throw new Error(error.message);
      }

      return { status: 'ok', timestamp: new Date().toISOString() };
    } catch (error) {
      throw new Error('Supabase connection failed');
    }
  }
};