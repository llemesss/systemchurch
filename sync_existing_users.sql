-- =====================================================
-- SINCRONIZAÇÃO DE USUÁRIOS EXISTENTES
-- =====================================================
-- Este arquivo contém comandos para sincronizar usuários
-- que foram criados ANTES da implementação do trigger automático.
--
-- IMPORTANTE: Execute estes comandos APENAS UMA VEZ!
-- =====================================================

-- PASSO 1: OBTER OS UUIDs DOS USUÁRIOS EXISTENTES
-- =====================================================
-- 1. Acesse o painel do Supabase (https://supabase.com/dashboard)
-- 2. Vá para a seção "Authentication" > "Users"
-- 3. Copie o ID (UUID) de cada usuário existente:
--    - Pastor Principal (pastor@igreja.com)
--    - Administrador (admin@igreja.com) 
--    - Igor (igor@idpb.org)

-- PASSO 2: EXECUTAR O COMANDO DE SINCRONIZAÇÃO
-- =====================================================
-- No editor SQL do Supabase, execute o comando abaixo
-- SUBSTITUINDO os placeholders pelos UUIDs corretos:

-- COMANDO DE SINCRONIZAÇÃO:
INSERT INTO public.users (id, email, name, role, status, created_at, updated_at)
VALUES 
  (
    'COLE_O_UUID_DO_PASTOR_AQUI',
    'pastor@igreja.com',
    'Pastor Principal',
    'Pastor',
    'active',
    NOW(),
    NOW()
  ),
  (
    'COLE_O_UUID_DO_ADMIN_AQUI',
    'admin@igreja.com', 
    'Administrador',
    'Admin',
    'active',
    NOW(),
    NOW()
  ),
  (
    'COLE_O_UUID_DO_IGOR_AQUI',
    'igor@idpb.org',
    'Igor',
    'Líder',
    'active',
    NOW(),
    NOW()
  )
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- VERIFICAÇÃO APÓS EXECUÇÃO
-- =====================================================
-- Execute este comando para verificar se os usuários
-- foram sincronizados corretamente:

SELECT 
  u.id,
  u.email,
  u.name,
  u.role,
  u.status,
  u.created_at
FROM public.users u
WHERE u.email IN (
  'pastor@igreja.com',
  'admin@igreja.com', 
  'igor@idpb.org'
)
ORDER BY u.created_at;

-- =====================================================
-- OBSERVAÇÕES IMPORTANTES
-- =====================================================
-- 1. Use ON CONFLICT (id) DO NOTHING para evitar duplicatas
-- 2. Os campos created_at e updated_at são preenchidos automaticamente
-- 3. O status padrão é 'active' para usuários existentes
-- 4. Após esta sincronização, novos usuários serão criados automaticamente pelo trigger
-- 5. NÃO execute este comando mais de uma vez para evitar conflitos

-- =====================================================
-- EXEMPLO DE EXECUÇÃO COMPLETA
-- =====================================================
-- Substitua os UUIDs pelos valores reais:
--
-- INSERT INTO public.users (id, email, name, role, status, created_at, updated_at)
-- VALUES 
--   (
--     '12345678-1234-1234-1234-123456789abc',
--     'pastor@igreja.com',
--     'Pastor Principal',
--     'Pastor',
--     'active',
--     NOW(),
--     NOW()
--   ),
--   (
--     '87654321-4321-4321-4321-cba987654321',
--     'admin@igreja.com', 
--     'Administrador',
--     'Admin',
--     'active',
--     NOW(),
--     NOW()
--   ),
--   (
--     'abcdef12-3456-7890-abcd-ef1234567890',
--     'igor@idpb.org',
--     'Igor',
--     'Líder',
--     'active',
--     NOW(),
--     NOW()
--   )
-- ON CONFLICT (id) DO NOTHING;