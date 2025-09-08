-- =====================================================
-- RECRIAÇÃO COMPLETA DA TABELA PUBLIC.USERS
-- =====================================================
-- SOLUÇÃO DEFINITIVA: Recriar a tabela com estrutura correta
-- após falha na alteração do tipo da coluna id
-- =====================================================

-- ⚠️ IMPORTANTE: EXECUTE OS COMANDOS UM DE CADA VEZ!
-- ⚠️ CERTIFIQUE-SE DE TER OS UUIDs DOS USUÁRIOS EXISTENTES!

-- =====================================================
-- PASSO 1: APAGAR A TABELA ANTIGA
-- =====================================================
-- Este comando remove a tabela users com estrutura incorreta
-- ⚠️ ATENÇÃO: Isso apagará todos os dados da tabela!

DROP TABLE IF EXISTS public.users;

-- =====================================================
-- PASSO 2: CRIAR NOVA TABELA COM ESTRUTURA CORRETA
-- =====================================================
-- Tabela com id UUID e chave estrangeira para auth.users

CREATE TABLE public.users (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255),
  name VARCHAR(255),
  phone VARCHAR(255),
  role VARCHAR(50) DEFAULT 'Membro' NOT NULL,
  status VARCHAR(50) DEFAULT 'Ativo' NOT NULL,
  cell_id INTEGER REFERENCES public.cells(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- PASSO 3: RECRIAR O TRIGGER PARA NOVOS USUÁRIOS
-- =====================================================
-- O trigger foi apagado junto com a tabela, precisamos recriá-lo

-- 3.1. Recriar a função handle_new_user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (
    id, 
    email, 
    name, 
    phone,
    role, 
    status,
    cell_id
  )
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'phone',
    COALESCE(NEW.raw_user_meta_data->>'role', 'Membro'),
    COALESCE(NEW.raw_user_meta_data->>'status', 'Ativo'),
    (NEW.raw_user_meta_data->>'cell_id')::INTEGER
  );
  RETURN NEW;
END;
$$;

-- 3.2. Recriar o trigger
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- PASSO 4: REINSERIR USUÁRIOS EXISTENTES
-- =====================================================
-- ⚠️ IMPORTANTE: Substitua os placeholders pelos UUIDs corretos!
-- Vá para Authentication > Users no painel Supabase para copiar os IDs

INSERT INTO public.users (id, email, name, role, status, created_at, updated_at)
VALUES 
  (
    'UUID_DO_PASTOR_AQUI',
    'pastor@igreja.com',
    'Pastor Principal',
    'Pastor',
    'Ativo',
    NOW(),
    NOW()
  ),
  (
    'UUID_DO_ADMIN_AQUI',
    'admin@igreja.com',
    'Administrador',
    'Admin',
    'Ativo',
    NOW(),
    NOW()
  ),
  (
    'UUID_DO_IGOR_AQUI',
    'igor@idpb.org',
    'Igor',
    'Líder',
    'Ativo',
    NOW(),
    NOW()
  );

-- =====================================================
-- VERIFICAÇÕES APÓS EXECUÇÃO
-- =====================================================

-- Verificar estrutura da nova tabela
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name = 'users'
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

-- Verificar se o trigger foi criado
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- Verificar usuários inseridos
SELECT 
    u.id,
    u.email,
    u.name,
    u.role,
    u.status,
    u.created_at,
    au.email as auth_email
FROM public.users u
JOIN auth.users au ON u.id = au.id
ORDER BY u.created_at;

-- =====================================================
-- TESTE DO TRIGGER
-- =====================================================
-- Para testar se o trigger está funcionando:
-- 1. Registre um novo usuário no frontend
-- 2. Execute esta query para verificar se foi criado automaticamente:

-- SELECT * FROM public.users WHERE email = 'email_do_novo_usuario@exemplo.com';

-- =====================================================
-- OBSERVAÇÕES IMPORTANTES
-- =====================================================
-- 1. A tabela agora tem estrutura correta com UUID
-- 2. Chave estrangeira garante integridade com auth.users
-- 3. ON DELETE CASCADE remove usuário se deletado do auth
-- 4. Trigger recriado com todos os campos de metadados
-- 5. Valores padrão definidos para role e status
-- 6. Timestamps automáticos para created_at e updated_at
-- 7. Referência opcional para cells (cell_id)

-- =====================================================
-- ESTRUTURA FINAL DA TABELA
-- =====================================================
-- id: UUID (PK, FK para auth.users)
-- email: VARCHAR(255)
-- name: VARCHAR(255)
-- phone: VARCHAR(255)
-- role: VARCHAR(50) DEFAULT 'Membro'
-- status: VARCHAR(50) DEFAULT 'Ativo'
-- cell_id: INTEGER (FK para public.cells)
-- created_at: TIMESTAMPTZ DEFAULT NOW()
-- updated_at: TIMESTAMPTZ DEFAULT NOW()