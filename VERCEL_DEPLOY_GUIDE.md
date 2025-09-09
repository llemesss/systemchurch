# 🚀 Guia de Deploy no Vercel

## 📋 Pré-requisitos

1. Conta no [Vercel](https://vercel.com)
2. Repositório no GitHub com o código
3. Supabase configurado e funcionando

## 🎯 Estrutura do Projeto

```
IDPB/
├── igreja-app/          # Frontend (React + Vite)
│   ├── vercel.json      # Configuração do frontend
│   └── package.json
├── backend/             # Backend (Express + TypeScript)
│   ├── api/
│   │   └── index.ts     # Serverless Function
│   ├── vercel.json      # Configuração do backend
│   └── .env.vercel      # Variáveis de ambiente
└── vercel.json          # Configuração raiz (opcional)
```

## 🔧 Configuração do Deploy

### 1. Deploy do Frontend (igreja-app)

1. **Conectar repositório no Vercel:**
   - Acesse [vercel.com](https://vercel.com)
   - Clique em "New Project"
   - Conecte seu repositório GitHub
   - Selecione a pasta `igreja-app` como Root Directory

2. **Configurações do Build:**
   - **Framework Preset:** Vite
   - **Root Directory:** `igreja-app`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

3. **Variáveis de Ambiente:**
   ```
   VITE_SUPABASE_URL=sua_url_do_supabase
   VITE_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
   VITE_API_URL=https://seu-backend.vercel.app
   ```

### 2. Deploy do Backend

1. **Criar novo projeto no Vercel:**
   - Novo projeto separado para o backend
   - Root Directory: `backend`
   - Framework: Other

2. **Variáveis de Ambiente (copie do .env.vercel):**
   ```
   NODE_ENV=production
   SUPABASE_URL=sua_url_do_supabase
   SUPABASE_ANON_KEY=sua_chave_anonima
   SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role
   DATABASE_URL=sua_url_do_banco_supabase
   JWT_SECRET=seu_jwt_secret
   ALLOWED_ORIGINS=https://seu-frontend.vercel.app
   ```

## 🌐 Configuração de CORS

Após o deploy, atualize as origens permitidas:

1. **No backend** (`api/index.ts`):
   ```typescript
   const allowedOrigins = [
     'https://seu-frontend.vercel.app',
     'http://localhost:5173' // para desenvolvimento
   ];
   ```

2. **No frontend** (variáveis de ambiente):
   ```
   VITE_API_URL=https://seu-backend.vercel.app
   ```

## 📝 Checklist de Deploy

### ✅ Antes do Deploy
- [ ] Código commitado e pushado para GitHub
- [ ] Supabase configurado e funcionando
- [ ] Variáveis de ambiente preparadas
- [ ] Testes locais passando

### ✅ Deploy do Frontend
- [ ] Projeto criado no Vercel
- [ ] Root directory configurado como `igreja-app`
- [ ] Variáveis de ambiente adicionadas
- [ ] Build bem-sucedido
- [ ] Site acessível

### ✅ Deploy do Backend
- [ ] Projeto separado criado no Vercel
- [ ] Root directory configurado como `backend`
- [ ] Variáveis de ambiente adicionadas
- [ ] Serverless function funcionando
- [ ] Endpoint `/api/health` respondendo

### ✅ Integração
- [ ] CORS configurado corretamente
- [ ] Frontend consegue se comunicar com backend
- [ ] Login funcionando
- [ ] Todas as funcionalidades testadas

## 🔍 Troubleshooting

### Erro de CORS
```
Access to fetch at 'https://backend.vercel.app/api/...' from origin 'https://frontend.vercel.app' has been blocked by CORS policy
```
**Solução:** Adicionar o domínio do frontend nas `ALLOWED_ORIGINS` do backend.

### Erro de Build no Frontend
```
Module not found: Can't resolve 'vite'
```
**Solução:** Verificar se o `vite` está nas `devDependencies` do `package.json`.

### Timeout na Serverless Function
```
Function execution timed out
```
**Solução:** Otimizar consultas SQL e aumentar `maxDuration` no `vercel.json`.

### Erro de Conexão com Banco
```
connection to server failed
```
**Solução:** Verificar `DATABASE_URL` e configurações do Supabase.

## 🎉 Comandos Úteis

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy local
vercel

# Deploy para produção
vercel --prod

# Ver logs
vercel logs

# Listar projetos
vercel ls
```

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs no dashboard do Vercel
2. Teste os endpoints individualmente
3. Confirme as variáveis de ambiente
4. Verifique a configuração do Supabase

---

**Boa sorte com o deploy! 🚀**