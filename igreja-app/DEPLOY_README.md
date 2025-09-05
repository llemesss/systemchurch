# Deploy do Frontend no Vercel

## Pré-requisitos

1. Conta no [Vercel](https://vercel.com)
2. Repositório Git com o código do frontend
3. Backend já deployado no Render

## Passos para Deploy

### 1. Preparar o Projeto

1. Certifique-se de que o build está funcionando:
   ```bash
   npm run build
   ```

2. Verifique se não há erros de TypeScript:
   ```bash
   npm run lint
   ```

### 2. Deploy no Vercel

#### Opção A: Via Dashboard Web

1. Acesse [vercel.com](https://vercel.com) e faça login
2. Clique em "New Project"
3. Conecte seu repositório Git
4. Configure:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `igreja-app` (se necessário)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

#### Opção B: Via CLI

1. Instale a CLI do Vercel:
   ```bash
   npm i -g vercel
   ```

2. No diretório do frontend:
   ```bash
   vercel
   ```

3. Siga as instruções interativas

### 3. Configurar Variáveis de Ambiente

No dashboard do Vercel, vá em "Settings" → "Environment Variables":

#### Variáveis Obrigatórias

- **Name**: `VITE_API_URL`
- **Value**: `https://igreja-app-backend.onrender.com`
- **Environments**: Production, Preview, Development

#### Variáveis Opcionais

- **Name**: `VITE_APP_NAME`
- **Value**: `Igreja App`
- **Environments**: Production, Preview, Development

- **Name**: `VITE_APP_VERSION`
- **Value**: `1.0.0`
- **Environments**: Production, Preview, Development

- **Name**: `VITE_DEBUG`
- **Value**: `false`
- **Environments**: Production

### 4. Configurar Domínio Personalizado (Opcional)

1. No dashboard do Vercel, vá em "Settings" → "Domains"
2. Adicione seu domínio personalizado
3. Configure os DNS conforme instruções

### 5. Verificar Deploy

1. Aguarde a conclusão do build
2. Acesse a URL fornecida pelo Vercel
3. Teste as funcionalidades principais:
   - Login/Logout
   - Navegação entre páginas
   - Conexão com a API

## URLs Importantes

- **Frontend URL**: `https://igreja-app-frontend.vercel.app`
- **API URL**: `https://igreja-app-backend.onrender.com`

## Configuração de CORS

Após o deploy, atualize as configurações de CORS no backend:

1. No Render, vá para o Web Service do backend
2. Em "Environment Variables", atualize `ALLOWED_ORIGINS`:
   ```
   ALLOWED_ORIGINS=https://igreja-app-frontend.vercel.app,https://localhost:5173
   ```

## Troubleshooting

### Build Failures
- Verifique erros de TypeScript: `npm run lint`
- Confirme se todas as dependências estão instaladas
- Verifique se o `vite.config.ts` está correto

### API Connection Issues
- Verifique se `VITE_API_URL` está correto
- Confirme se o backend está rodando
- Verifique configurações de CORS no backend

### Environment Variables
- Variáveis devem começar com `VITE_`
- Redeploy após alterar variáveis
- Verifique se estão configuradas para todos os ambientes

## Monitoramento

- Analytics disponíveis no dashboard do Vercel
- Logs de build e runtime
- Métricas de performance (Core Web Vitals)
- Alertas automáticos em caso de falhas

## Deploy Automático

O Vercel fará deploy automático a cada push para:
- **main/master**: Deploy de produção
- **outras branches**: Deploy de preview

## Comandos Úteis

```bash
# Build local
npm run build

# Preview local do build
npm run preview

# Deploy via CLI
vercel

# Deploy de produção via CLI
vercel --prod
```