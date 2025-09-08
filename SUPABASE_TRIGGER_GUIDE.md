# 🔧 Guia de Implementação do Trigger Automático - Supabase

## ⚠️ **SOLUÇÃO PARA DEPENDÊNCIAS E RECRIAÇÃO COMPLETA**

**A alteração da coluna falhou devido a dependências. Solução: Remover dependências e recriar a tabela.**

### 🚨 Problema Identificado
Ao tentar executar `DROP TABLE public.users`, o Supabase retorna erro indicando que existem dependências (chaves estrangeiras) de outras tabelas que impedem a remoção.

### 🔧 Solução Definitiva
**Execute o arquivo:** `drop_dependencies_and_recreate.sql`

Este arquivo resolve o problema das dependências:
1. **REMOÇÃO** de todas as chaves estrangeiras que referenciam `public.users`
2. **REMOÇÃO** do trigger e função existentes
3. **DROP** da tabela antiga `public.users`
4. **CREATE** da nova tabela com `id UUID` e chave estrangeira para `auth.users`
5. **RECRIAÇÃO** da função `handle_new_user()` e trigger `on_auth_user_created`
6. **REINSERÇÃO** dos usuários existentes com UUIDs corretos
7. **VERIFICAÇÕES** completas de estrutura e funcionamento

---

## 🚨 Problema Principal
Novos usuários são autenticados pelo Supabase, mas **não são encontrados na tabela `public.users`**, causando falha no login.

## ✅ Solução: Trigger Automático
Criar um trigger que automaticamente insere novos usuários na tabela `public.users` quando eles se registram.

---

## 📋 Passo a Passo

### 1️⃣ Acesse o Painel do Supabase
- Faça login no [Supabase Dashboard](https://supabase.com/dashboard)
- Selecione seu projeto
- Vá para **SQL Editor** no menu lateral

### 2️⃣ Execute os Comandos SQL

#### **Comando 1: Criar a Função**
```sql
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (id, email, name, phone, role, status, cell_id)
  values (
    new.id, 
    new.email, 
    coalesce(new.raw_user_meta_data->>'name', new.email),
    new.raw_user_meta_data->>'phone',
    'Membro',
    'Ativo',
    case 
      when new.raw_user_meta_data->>'cell_id' is not null 
      then (new.raw_user_meta_data->>'cell_id')::integer 
      else null 
    end
  );
  return new;
end;
$$;
```

#### **Comando 2: Criar o Trigger**
```sql
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

### 3️⃣ Verificar a Implementação

#### **Verificar se o trigger foi criado:**
```sql
SELECT * FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';
```

#### **Verificar se a função foi criada:**
```sql
SELECT * FROM information_schema.routines 
WHERE routine_name = 'handle_new_user';
```

---

## 🔍 Como Funciona

1. **Usuário se registra** → Supabase cria entrada em `auth.users`
2. **Trigger é ativado** → `on_auth_user_created` detecta nova inserção
3. **Função é executada** → `handle_new_user()` roda automaticamente
4. **Perfil é criado** → Nova linha inserida em `public.users`

## 📊 Dados Inseridos Automaticamente

| Campo | Valor | Origem |
|-------|-------|--------|
| `id` | UUID do usuário | `auth.users.id` |
| `email` | Email do usuário | `auth.users.email` |
| `name` | Nome do usuário | `raw_user_meta_data->>'name'` ou email como fallback |
| `phone` | Telefone do usuário | `raw_user_meta_data->>'phone'` |
| `role` | Papel do usuário | `'Membro'` (padrão) |
| `status` | Status do usuário | `'Ativo'` (padrão) |
| `cell_id` | ID da célula | `raw_user_meta_data->>'cell_id'` (convertido para integer) |

---

## ⚠️ Observações Importantes

### ✅ **O que o trigger resolve:**
- ✅ Novos usuários terão perfil criado automaticamente
- ✅ Login funcionará imediatamente após registro
- ✅ Não há mais necessidade de intervenção manual

### 🔄 **Para usuários existentes:**
- ⚠️ O trigger **NÃO afeta usuários já registrados**
- ⚠️ Usuários existentes sem perfil precisam ser migrados manualmente
- 💡 Considere criar um script de migração se necessário

### 🛡️ **Segurança:**
- ✅ Função usa `security definer` (executa com privilégios do criador)
- ✅ `search_path` definido como `public` para segurança
- ✅ Trigger só executa em inserções (não em updates/deletes)

---

## 🧪 Teste da Implementação

### Após executar os comandos SQL:

1. **Acesse sua aplicação**
2. **Tente criar uma nova conta** através da página de registro
3. **Verifique se o login funciona** imediatamente após o registro
4. **Confirme na tabela `public.users`** se o perfil foi criado automaticamente

### Query para verificar novos usuários:
```sql
SELECT u.id, u.email, u.name, u.role, u.created_at
FROM public.users u
ORDER BY u.created_at DESC
LIMIT 10;
```

---

## 🚀 Resultado Esperado

✅ **Antes:** Usuário registra → Login falha (perfil não existe)  
✅ **Depois:** Usuário registra → Perfil criado automaticamente → Login funciona perfeitamente

---

## 🔄 Sincronização de Usuários Existentes

**IMPORTANTE**: Usuários criados ANTES da implementação do trigger precisam ser sincronizados manualmente.

### Passo 1: Obter UUIDs dos Usuários
1. Acesse o painel do Supabase
2. Vá para "Authentication" > "Users"
3. Copie o ID (UUID) de cada usuário existente

### Passo 2: Executar Sincronização
Use o arquivo `sync_existing_users.sql` criado no projeto:

```sql
INSERT INTO public.users (id, email, name, role, status, created_at, updated_at)
VALUES 
  ('COLE_O_UUID_DO_PASTOR_AQUI', 'pastor@igreja.com', 'Pastor Principal', 'Pastor', 'active', NOW(), NOW()),
  ('COLE_O_UUID_DO_ADMIN_AQUI', 'admin@igreja.com', 'Administrador', 'Admin', 'active', NOW(), NOW()),
  ('COLE_O_UUID_DO_IGOR_AQUI', 'igor@idpb.org', 'Igor', 'Líder', 'active', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;
```

### Verificação da Sincronização
```sql
SELECT id, email, name, role, status, created_at
FROM public.users 
WHERE email IN ('pastor@igreja.com', 'admin@igreja.com', 'igor@idpb.org')
ORDER BY created_at;
```

## 🔍 Próximos Passos

1. **Obter UUIDs dos usuários existentes** no painel Authentication do Supabase
2. **Substituir placeholders** no arquivo `drop_dependencies_and_recreate.sql`:
   - `UUID_DO_PASTOR` → UUID real do pastor
   - `UUID_DO_ADMIN` → UUID real do admin
   - `UUID_DO_IGOR` → UUID real do Igor
3. **Executar `drop_dependencies_and_recreate.sql`** completo no SQL Editor do Supabase
4. **Verificar resultados** das consultas de verificação incluídas no arquivo
5. **Testar** login de usuários existentes e registro de novos usuários

## 📞 Suporte

Se encontrar problemas:
1. Verifique se os comandos SQL foram executados sem erros
2. Confirme se a tabela `public.users` tem as colunas corretas
3. Teste com um novo email (não use emails já registrados)
4. Verifique os logs do Supabase para possíveis erros

## ⚠️ Observações Importantes

- **Backup**: Sempre faça backup antes de executar comandos em produção
- **Testes**: Teste primeiro em ambiente de desenvolvimento
- **Sincronização**: Execute a sincronização de usuários existentes APENAS UMA VEZ
- **Monitoramento**: Acompanhe os logs após a implementação
- **Rollback**: Tenha um plano de rollback caso algo dê errado

**Arquivo SQL completo:** `supabase_trigger_setup.sql`