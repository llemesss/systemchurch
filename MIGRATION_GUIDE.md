# Guia de Migração: Supabase para Neon PostgreSQL

Este guia contém as instruções para completar a migração do seu projeto da Igreja do Supabase para o Neon PostgreSQL.

## ✅ Tarefas Concluídas

- [x] Análise da configuração atual do backend
- [x] Remoção das configurações do Supabase
- [x] Atualização da conexão do banco de dados
- [x] Criação dos scripts de migração
- [x] Atualização dos arquivos de ambiente
- [x] Atualização das Netlify Functions
- [x] Criação da nova API do backend
- [x] Remoção dos arquivos do Supabase no frontend

## 🔄 Próximos Passos

### 1. Configurar o Neon PostgreSQL

1. **Criar conta no Neon**: Acesse [neon.tech](https://neon.tech) e crie uma conta
2. **Criar novo projeto**: Crie um novo projeto PostgreSQL
3. **Obter string de conexão**: Copie a string de conexão do seu banco

### 2. Atualizar Variáveis de Ambiente

#### Backend (`backend/.env`)
```env
JWT_SECRET=5o/Y6i8ixe6mfNxeYchv2Rr4cBJR8xlSvqpFMtIaOSZHtAMEyr4HWqjofduSk47ROsSo7CPTxsMBAN9n0a3hwQ==
PORT=3001
NODE_ENV=development

# Substitua pela sua string de conexão do Neon
DATABASE_URL=postgresql://username:password@ep-example.us-east-1.aws.neon.tech/neondb?sslmode=require
NEON_DATABASE_URL=postgresql://username:password@ep-example.us-east-1.aws.neon.tech/neondb?sslmode=require
```

#### Frontend (`igreja-app/.env`)
```env
# Configurações do Backend
# URL base da API do backend (Netlify Functions)
VITE_API_BASE_URL=http://localhost:8888/.netlify/functions/api
```

### 3. Executar Migração do Banco de Dados

1. **Instalar dependências do script de migração**:
   ```bash
   cd backend/src/database
   npm install pg
   ```

2. **Executar o script de migração**:
   ```bash
   node run-neon-migration.js
   ```

   Este script irá:
   - Conectar ao seu banco Neon
   - Criar todas as tabelas necessárias
   - Inserir dados iniciais (usuário pastor e admin)
   - Verificar se tudo foi criado corretamente

### 4. Instalar Dependências

#### Backend
```bash
cd backend
npm install
```

#### Frontend
```bash
cd igreja-app
npm install
```

### 5. Testar a Aplicação

1. **Iniciar o backend**:
   ```bash
   cd backend
   npm run dev
   ```

2. **Iniciar o frontend** (em outro terminal):
   ```bash
   cd igreja-app
   npm run dev
   ```

3. **Testar funcionalidades**:
   - Login com usuário pastor: `pastor@igreja.com` / `pastor123`
   - Login com usuário admin: `admin@igreja.com` / `admin123`
   - Criar novos usuários
   - Gerenciar células
   - Registrar orações

### 6. Deploy para Produção

#### Netlify (Frontend + Functions)

1. **Configurar variáveis de ambiente no Netlify**:
   - `DATABASE_URL`: String de conexão do Neon (produção)
   - `NEON_DATABASE_URL`: String de conexão do Neon (produção)
   - `JWT_SECRET`: Mesmo valor do desenvolvimento
   - `NODE_ENV`: `production`

2. **Atualizar `.env` do frontend para produção**:
   ```env
   VITE_API_BASE_URL=https://seu-site.netlify.app/.netlify/functions/api
   ```

3. **Executar migração no banco de produção**:
   - Conecte-se ao banco de produção
   - Execute o script `run-neon-migration.js` com as credenciais de produção

## 📁 Arquivos Criados/Modificados

### Novos Arquivos
- `backend/src/database/neon-migration.sql` - Script SQL de migração
- `backend/src/database/run-neon-migration.js` - Script Node.js para executar migração
- `igreja-app/src/utils/backendApi.ts` - Nova API do backend
- `MIGRATION_GUIDE.md` - Este guia

### Arquivos Removidos
- `igreja-app/src/supabaseClient.ts`
- `igreja-app/src/utils/supabaseUtils.ts`

### Arquivos Modificados
- `igreja-app/src/utils/api.ts` - Atualizado para usar nova API
- `backend/.env` - Removidas configurações Supabase, adicionadas do Neon
- `backend/.env.example` - Atualizado com exemplo das novas variáveis
- `igreja-app/.env` - Removidas configurações Supabase, adicionada URL da API
- `igreja-app/.env.example` - Atualizado com exemplo da nova configuração

## 🔍 Verificações Importantes

- [ ] String de conexão do Neon está correta
- [ ] Migração do banco executada com sucesso
- [ ] Backend conecta ao Neon sem erros
- [ ] Frontend consegue fazer login
- [ ] Todas as funcionalidades estão funcionando
- [ ] Deploy em produção realizado
- [ ] Variáveis de ambiente de produção configuradas

## 🆘 Solução de Problemas

### Erro de Conexão com o Banco
- Verifique se a string de conexão está correta
- Confirme se o banco Neon está ativo
- Verifique se as credenciais estão corretas

### Erro de Autenticação
- Confirme se o JWT_SECRET está configurado
- Verifique se os usuários foram criados na migração
- Teste com as credenciais padrão (pastor/admin)

### Erro nas Netlify Functions
- Verifique se as variáveis de ambiente estão configuradas no Netlify
- Confirme se o build das functions está funcionando
- Verifique os logs do Netlify para erros específicos

## 📞 Suporte

Se encontrar problemas durante a migração, verifique:
1. Os logs do console do navegador
2. Os logs do servidor backend
3. Os logs das Netlify Functions
4. A conectividade com o banco Neon

A migração está quase completa! Siga estes passos e sua aplicação estará funcionando com o Neon PostgreSQL.