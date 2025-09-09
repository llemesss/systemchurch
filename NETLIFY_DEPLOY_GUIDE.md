# 🚀 Guia de Deploy no Netlify

## 📋 Pré-requisitos

1. Conta no [Netlify](https://netlify.com)
2. Repositório no GitHub com o código
3. Supabase configurado e funcionando
4. Node.js 18+ instalado localmente

## 🎯 Estrutura do Projeto

```
IDPB/
├── igreja-app/              # Frontend (React + Vite)
│   ├── public/
│   │   └── _redirects       # Configuração de rotas
│   └── package.json
├── netlify/                 # Netlify Functions
│   └── functions/
│       ├── api.ts          # API principal
│       └── package.json    # Dependências das functions
├── backend/                 # Código fonte do backend
│   └── src/                # Reutilizado pelas functions
├── netlify.toml            # Configuração principal
└── .env.netlify            # Template de variáveis
```

## 🔧 Configuração do Deploy

### 1. Preparar o Repositório

1. **Commit e Push das alterações:**
   ```bash
   git add .
   git commit -m "feat: configurar deploy para Netlify"
   git push origin main
   ```

### 2. Deploy no Netlify

1. **Conectar repositório:**
   - Acesse [netlify.com](https://netlify.com)
   - Clique em "New site from Git"
   - Conecte seu repositório GitHub
   - Selecione o repositório do projeto

2. **Configurações de Build:**
   - **Base directory:** `igreja-app`
   - **Build command:** `npm run build`
   - **Publish directory:** `igreja-app/dist`
   - **Functions directory:** `netlify/functions`

3. **Variáveis de Ambiente:**
   
   No painel do Netlify, vá em **Site settings > Environment variables** e adicione:
   
   **Para o Frontend:**
   ```
   VITE_SUPABASE_URL=sua_url_do_supabase
   VITE_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
   VITE_API_URL=https://seu-site.netlify.app
   ```
   
   **Para o Backend (Functions):**
   ```
   NODE_ENV=production
   SUPABASE_URL=sua_url_do_supabase
   SUPABASE_ANON_KEY=sua_chave_anonima
   SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role
   DATABASE_URL=sua_url_do_banco_supabase
   JWT_SECRET=seu_jwt_secret
   ALLOWED_ORIGINS=https://seu-site.netlify.app
   ```

### 3. Configuração Avançada

#### **netlify.toml** (já configurado)
- ✅ Build settings otimizados
- ✅ Redirects para SPA
- ✅ Headers de segurança
- ✅ Cache otimizado para assets
- ✅ Configuração das Functions

#### **_redirects** (já configurado)
- ✅ `/api/*` → `/.netlify/functions/api/:splat`
- ✅ `/*` → `/index.html` (SPA routing)

## 🌐 Endpoints da API

Após o deploy, sua API estará disponível em:

```
https://seu-site.netlify.app/.netlify/functions/api/health
https://seu-site.netlify.app/.netlify/functions/api/auth/login
https://seu-site.netlify.app/.netlify/functions/api/profile
```

Mas graças aos redirects, você pode usar:

```
https://seu-site.netlify.app/api/health
https://seu-site.netlify.app/api/auth/login
https://seu-site.netlify.app/api/profile
```

## 📝 Checklist de Deploy

### ✅ Preparação
- [ ] Código commitado e pushado para GitHub
- [ ] Supabase configurado e funcionando
- [ ] Variáveis de ambiente preparadas
- [ ] Testes locais passando

### ✅ Configuração no Netlify
- [ ] Site conectado ao repositório GitHub
- [ ] Base directory configurado como `igreja-app`
- [ ] Build command: `npm run build`
- [ ] Publish directory: `igreja-app/dist`
- [ ] Functions directory: `netlify/functions`

### ✅ Variáveis de Ambiente
- [ ] `VITE_SUPABASE_URL` configurada
- [ ] `VITE_SUPABASE_ANON_KEY` configurada
- [ ] `VITE_API_URL` configurada
- [ ] `SUPABASE_URL` configurada (backend)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` configurada
- [ ] `JWT_SECRET` configurada
- [ ] `ALLOWED_ORIGINS` configurada

### ✅ Testes Pós-Deploy
- [ ] Site carrega corretamente
- [ ] Endpoint `/api/health` responde
- [ ] Login funciona
- [ ] Todas as funcionalidades testadas
- [ ] CORS funcionando corretamente

## 🔍 Troubleshooting

### Erro de Build
```
Build failed: Command failed with exit code 1
```
**Soluções:**
1. Verificar se `base directory` está como `igreja-app`
2. Verificar se todas as dependências estão no `package.json`
3. Verificar logs de build no painel do Netlify

### Erro de CORS
```
Access to fetch at 'https://site.netlify.app/api/...' has been blocked by CORS policy
```
**Solução:** Adicionar o domínio do site nas `ALLOWED_ORIGINS`.

### Function Timeout
```
Task timed out after 10.00 seconds
```
**Soluções:**
1. Otimizar consultas SQL
2. Verificar conexão com Supabase
3. Considerar upgrade do plano Netlify (Pro = 26s timeout)

### Erro 404 nas Functions
```
Not Found
```
**Soluções:**
1. Verificar se `functions directory` está configurado
2. Verificar se `_redirects` está correto
3. Verificar se a function foi deployada corretamente

### Erro de Conexão com Banco
```
connection to server failed
```
**Solução:** Verificar `DATABASE_URL` e configurações do Supabase.

## 🎛️ Comandos Úteis

```bash
# Instalar Netlify CLI
npm install -g netlify-cli

# Login no Netlify
netlify login

# Deploy local para teste
netlify dev

# Deploy manual
netlify deploy

# Deploy para produção
netlify deploy --prod

# Ver logs das functions
netlify functions:log

# Listar sites
netlify sites:list
```

## 🚀 Desenvolvimento Local

Para testar as Netlify Functions localmente:

```bash
# Na raiz do projeto
netlify dev

# Ou especificamente para as functions
cd netlify/functions
npm install
netlify functions:serve
```

## 📊 Monitoramento

### Logs das Functions
- Acesse o painel do Netlify
- Vá em **Functions** > **api**
- Clique em **View logs**

### Analytics
- **Site settings** > **Analytics**
- Monitore tráfego, performance e erros

### Alertas
- Configure notificações para:
  - Falhas de build
  - Erros nas functions
  - Downtime do site

## 🔒 Segurança

### Headers de Segurança (já configurados)
- ✅ `X-Frame-Options: DENY`
- ✅ `X-Content-Type-Options: nosniff`
- ✅ `Referrer-Policy: strict-origin-when-cross-origin`
- ✅ `Permissions-Policy` restritiva

### HTTPS
- ✅ HTTPS automático via Let's Encrypt
- ✅ Redirecionamento HTTP → HTTPS

## 💡 Dicas de Performance

1. **Cache de Assets:** Configurado para 1 ano
2. **Compressão:** Automática (Gzip/Brotli)
3. **CDN Global:** Netlify Edge Network
4. **Function Cold Start:** Minimizado com `serverless-http`

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs no painel do Netlify
2. Teste as functions individualmente
3. Confirme as variáveis de ambiente
4. Verifique a configuração do Supabase
5. Consulte a [documentação oficial](https://docs.netlify.com)

---

**Boa sorte com o deploy! 🎉**

### 🔗 Links Úteis
- [Netlify Docs](https://docs.netlify.com)
- [Netlify Functions](https://docs.netlify.com/functions/overview/)
- [Supabase Docs](https://supabase.com/docs)
- [Vite Docs](https://vitejs.dev)