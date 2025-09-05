import { createClient } from '@supabase/supabase-js'

// Validação das variáveis de ambiente
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Verificar se as variáveis estão configuradas
const isConfigured = supabaseUrl && 
                   supabaseAnonKey && 
                   supabaseUrl !== 'URL_DO_PROJETO_SUPABASE' && 
                   supabaseAnonKey !== 'CHAVE_ANON_PUBLICA_DO_SUPABASE'

let finalUrl: string
let finalKey: string

if (!isConfigured) {
  console.error('❌ ERRO: Variáveis do Supabase não configuradas!')
  console.error('Configure VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no arquivo .env')
  console.error('Veja o arquivo .env.example para referência')
  
  // Usar valores temporários válidos para evitar crash
  finalUrl = 'https://temp.supabase.co'
  finalKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlbXAiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY0NjA2ODQwMCwiZXhwIjoxOTYxNjQ0NDAwfQ.temp'
} else {
  finalUrl = supabaseUrl
  finalKey = supabaseAnonKey
}

export const supabase = createClient(finalUrl, finalKey)