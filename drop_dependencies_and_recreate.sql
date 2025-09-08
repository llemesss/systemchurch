-- =====================================================
-- REMOÇÃO DE DEPENDÊNCIAS E RECRIAÇÃO DA TABELA USERS
-- =====================================================
-- Este arquivo resolve o erro de dependências ao tentar
-- remover a tabela public.users

-- PASSO 1: REMOVER TODAS AS DEPENDÊNCIAS (CHAVES ESTRANGEIRAS)
-- ============================================================

-- Remover chave estrangeira da tabela cells
ALTER TABLE IF EXISTS public.cells 
DROP CONSTRAINT IF EXISTS cells_leader_id_fkey;

ALTER TABLE IF EXISTS public.cells 
DROP CONSTRAINT IF EXISTS cells_supervisor_id_fkey;

ALTER TABLE IF EXISTS public.cells 
DROP CONSTRAINT IF EXISTS cells_coordinator_id_fkey;

-- Remover chave estrangeira da tabela user_cells
ALTER TABLE IF EXISTS public.user_cells 
DROP CONSTRAINT IF EXISTS user_cells_user_id_fkey;

-- Remover chave estrangeira da tabela user_profiles
ALTER TABLE IF EXISTS public.user_profiles 
DROP CONSTRAINT IF EXISTS user_profiles_user_id_fkey;

-- Remover chave estrangeira da tabela prayer_logs
ALTER TABLE IF EXISTS public.prayer_logs 
DROP CONSTRAINT IF EXISTS prayer_logs_user_id_fkey;

-- Remover chave estrangeira da tabela dependents
ALTER TABLE IF EXISTS public.dependents 
DROP CONSTRAINT IF EXISTS dependents_user_id_fkey;

-- PASSO 2: REMOVER TRIGGER E FUNÇÃO
-- =================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- PASSO 3: REMOVER A TABELA USERS
-- ===============================

DROP TABLE IF EXISTS public.users;

-- PASSO 4: CRIAR NOVA TABELA COM ESTRUTURA CORRETA
-- ================================================

CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'member',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- PASSO 5: RECRIAR FUNÇÃO PARA NOVOS USUÁRIOS
-- ===========================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- PASSO 6: RECRIAR TRIGGER
-- =======================

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- PASSO 7: REINSERIR USUÁRIOS EXISTENTES
-- ======================================
-- IMPORTANTE: Substitua os UUIDs pelos valores reais do painel Authentication

-- Pastor (substitua 'UUID_DO_PASTOR' pelo UUID real)
INSERT INTO public.users (id, email, full_name, role) 
VALUES (
    'UUID_DO_PASTOR',  -- Substitua pelo UUID real
    'pastor@igreja.com', 
    'Pastor da Igreja', 
    'pastor'
) ON CONFLICT (id) DO NOTHING;

-- Admin (substitua 'UUID_DO_ADMIN' pelo UUID real)
INSERT INTO public.users (id, email, full_name, role) 
VALUES (
    'UUID_DO_ADMIN',   -- Substitua pelo UUID real
    'admin@igreja.com', 
    'Administrador', 
    'admin'
) ON CONFLICT (id) DO NOTHING;

-- Igor (substitua 'UUID_DO_IGOR' pelo UUID real)
INSERT INTO public.users (id, email, full_name, role) 
VALUES (
    'UUID_DO_IGOR',    -- Substitua pelo UUID real
    'igor@igreja.com', 
    'Igor', 
    'member'
) ON CONFLICT (id) DO NOTHING;

-- PASSO 8: VERIFICAÇÕES FINAIS
-- ============================

-- Verificar estrutura da tabela
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar chave estrangeira
SELECT 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name = 'users'
    AND tc.table_schema = 'public';

-- Verificar usuários inseridos
SELECT id, email, full_name, role, created_at 
FROM public.users 
ORDER BY created_at;

-- Verificar trigger
SELECT 
    trigger_name, 
    event_manipulation, 
    event_object_table, 
    action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- =====================================================
-- INSTRUÇÕES DE EXECUÇÃO:
-- =====================================================
-- 1. Primeiro, obtenha os UUIDs reais dos usuários no painel Authentication
-- 2. Substitua 'UUID_DO_PASTOR', 'UUID_DO_ADMIN', 'UUID_DO_IGOR' pelos valores reais
-- 3. Execute este arquivo completo no SQL Editor do Supabase
-- 4. Verifique os resultados das consultas de verificação
-- 5. Teste o login com usuários existentes
-- 6. Teste o registro de novos usuários

-- =====================================================
-- OBSERVAÇÕES IMPORTANTES:
-- =====================================================
-- • Este script remove TODAS as dependências primeiro
-- • Depois recria a estrutura completa
-- • Os UUIDs devem ser obtidos do painel Authentication
-- • Execute tudo de uma vez para evitar inconsistências
-- • Faça backup antes de executar se necessário