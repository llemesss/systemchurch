-- =====================================================
-- CONFIGURAÇÃO DO TRIGGER PARA NOVOS USUÁRIOS
-- =====================================================
-- Este arquivo contém os comandos SQL necessários para
-- automatizar a criação de perfis de usuário na tabela
-- public.users quando novos usuários se registram no Supabase.
--
-- ⚠️ IMPORTANTE: Execute primeiro o arquivo fix_users_table_structure.sql
-- para corrigir o tipo da coluna id (integer → uuid) antes de usar este trigger!
-- =====================================================

-- PASSO 1: Criar a Função SQL
-- Esta função será executada automaticamente para cada novo usuário
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  -- Insere o novo usuário na tabela public.users com todos os campos disponíveis
  insert into public.users (id, email, name, phone, role, status, cell_id)
  values (
    new.id, 
    new.email, 
    coalesce(new.raw_user_meta_data->>'name', new.email), -- Usa email como fallback se name não existir
    new.raw_user_meta_data->>'phone', -- Telefone dos metadados
    'Membro', -- Role padrão
    'Ativo', -- Status padrão
    case 
      when new.raw_user_meta_data->>'cell_id' is not null 
      then (new.raw_user_meta_data->>'cell_id')::integer 
      else null 
    end -- Cell ID dos metadados, convertido para integer
  );
  return new;
end;
$$;

-- PASSO 2: Criar o Trigger (Gatilho)
-- Este trigger chama a função acima sempre que um novo usuário é criado
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- =====================================================
-- VERIFICAÇÃO (OPCIONAL)
-- =====================================================
-- Para verificar se o trigger foi criado corretamente:
-- SELECT * FROM information_schema.triggers WHERE trigger_name = 'on_auth_user_created';
--
-- Para verificar se a função foi criada:
-- SELECT * FROM information_schema.routines WHERE routine_name = 'handle_new_user';
-- =====================================================

-- OBSERVAÇÕES IMPORTANTES:
-- 1. O campo 'name' será extraído de raw_user_meta_data->>'name'
-- 2. Se 'name' não existir, será usado o email como fallback
-- 3. Todos os novos usuários terão role 'Membro' por padrão
-- 4. O trigger só funciona para NOVOS usuários (após a criação)
-- 5. Usuários existentes precisarão ser migrados manualmente se necessário