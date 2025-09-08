import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Verificar se as variáveis estão configuradas
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ ERRO: Variáveis do Supabase não configuradas!')
  console.error('Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env')
  throw new Error('Configuração do Supabase não encontrada')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)