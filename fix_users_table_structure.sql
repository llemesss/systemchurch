-- =====================================================
-- CORREÇÃO DA ESTRUTURA DA TABELA PUBLIC.USERS
-- =====================================================
-- PROBLEMA IDENTIFICADO:
-- A coluna 'id' na tabela public.users está como INTEGER
-- mas deveria ser UUID para corresponder à tabela auth.users
-- =====================================================

-- ⚠️ IMPORTANTE: EXECUTE ESTES COMANDOS EM ORDEM!
-- ⚠️ FAÇA BACKUP DA TABELA ANTES DE EXECUTAR!

-- PASSO 1: VERIFICAR ESTRUTURA ATUAL
-- =====================================================
-- Execute este comando primeiro para ver a estrutura atual:
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name = 'users'
ORDER BY ordinal_position;

-- PASSO 2: BACKUP DOS DADOS (OPCIONAL MAS RECOMENDADO)
-- =====================================================
-- Criar uma tabela de backup antes das alterações:
CREATE TABLE public.users_backup AS 
SELECT * FROM public.users;

-- PASSO 3: ALTERAR TIPO DA COLUNA ID PARA UUID
-- =====================================================
-- ⚠️ ATENÇÃO: Este comando pode falhar se houver dados incompatíveis
-- Se a tabela estiver vazia ou com dados válidos de UUID, funcionará
ALTER TABLE public.users 
ALTER COLUMN id TYPE uuid USING id::uuid;

-- PASSO 4: CRIAR CHAVE ESTRANGEIRA COM AUTH.USERS
-- =====================================================
-- Estabelece ligação direta e segura com a tabela de autenticação
-- ON DELETE CASCADE: se usuário for deletado do auth, remove da public.users também
ALTER TABLE public.users 
ADD CONSTRAINT fk_auth_users 
FOREIGN KEY (id) REFERENCES auth.users(id) 
ON DELETE CASCADE;

-- PASSO 5: VERIFICAR ALTERAÇÕES
-- =====================================================
-- Verificar se a estrutura foi alterada corretamente:
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name = 'users'
ORDER BY ordinal_position;

-- Verificar se a chave estrangeira foi criada:
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

-- =====================================================
-- COMANDOS DE ROLLBACK (SE NECESSÁRIO)
-- =====================================================
-- ⚠️ USE APENAS SE ALGO DER ERRADO!

-- Remover chave estrangeira:
-- ALTER TABLE public.users DROP CONSTRAINT IF EXISTS fk_auth_users;

-- Voltar tipo da coluna para integer (se necessário):
-- ALTER TABLE public.users ALTER COLUMN id TYPE integer USING id::integer;

-- Restaurar dados do backup:
-- TRUNCATE TABLE public.users;
-- INSERT INTO public.users SELECT * FROM public.users_backup;

-- Remover tabela de backup (após confirmar que tudo está OK):
-- DROP TABLE IF EXISTS public.users_backup;

-- =====================================================
-- OBSERVAÇÕES IMPORTANTES
-- =====================================================
-- 1. A conversão id::uuid só funcionará se:
--    - A tabela estiver vazia, OU
--    - Os valores na coluna id já forem UUIDs válidos em formato string
--
-- 2. Se houver dados incompatíveis, você precisará:
--    - Limpar a tabela primeiro: TRUNCATE TABLE public.users;
--    - Ou converter os dados manualmente
--
-- 3. A chave estrangeira garante:
--    - Integridade referencial entre as tabelas
--    - Exclusão em cascata (se usuário for deletado do auth, remove da public.users)
--    - Prevenção de inserção de IDs inválidos
--
-- 4. Após estas alterações, o trigger handle_new_user() continuará funcionando
--    normalmente, mas agora com a estrutura correta de UUID

-- =====================================================
-- TESTE APÓS ALTERAÇÕES
-- =====================================================
-- Testar se a estrutura está correta:
SELECT 
    u.id,
    u.email,
    u.name,
    u.role,
    au.email as auth_email,
    au.created_at as auth_created_at
FROM public.users u
JOIN auth.users au ON u.id = au.id
LIMIT 5;