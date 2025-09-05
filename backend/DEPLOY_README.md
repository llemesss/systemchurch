# Deploy do Backend no Render

## Pré-requisitos

1. Conta no [Render](https://render.com)
2. Repositório Git com o código do backend
3. PostgreSQL database configurado no Render

## Passos para Deploy

### 1. Criar PostgreSQL Database

1. No dashboard do Render, clique em "New +" → "PostgreSQL"
2. Configure:
   - **Name**: `igreja-db`
   - **Database**: `igreja_app`
   - **User**: `igreja_user`
   - **Plan**: Free
3. Anote a **Database URL** gerada

### 2. Criar Web Service

1. No dashboard do Render, clique em "New +" → "Web Service"
2. Conecte seu repositório Git
3. Configure:
   - **Name**: `igreja-app-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Free

### 3. Configurar Variáveis de Ambiente

No painel do Web Service, vá em "Environment" e adicione:

```
NODE_ENV=production
PORT=10000
JWT_SECRET=seu-jwt-secret-super-seguro-aqui
DATABASE_URL=postgresql://username:password@hostname:port/database
ALLOWED_ORIGINS=https://seu-frontend.vercel.app
DATABASE_SSL=true
```

### 4. Health Check

O Render verificará automaticamente a saúde do serviço em:
- **Health Check Path**: `/api/health`

### 5. Deploy

1. Clique em "Create Web Service"
2. O Render fará o build e deploy automaticamente
3. Aguarde a conclusão (pode levar alguns minutos)

## URLs Importantes

- **API Base URL**: `https://igreja-app-backend.onrender.com`
- **Health Check**: `https://igreja-app-backend.onrender.com/api/health`

## Troubleshooting

### Build Failures
- Verifique se todas as dependências estão no `package.json`
- Confirme se o `build.js` está funcionando corretamente

### Database Connection Issues
- Verifique se a `DATABASE_URL` está correta
- Confirme se `DATABASE_SSL=true` está configurado

### CORS Issues
- Adicione o domínio do frontend em `ALLOWED_ORIGINS`
- Formato: `https://domain1.com,https://domain2.com`

## Monitoramento

- Logs disponíveis no dashboard do Render
- Métricas de performance e uptime
- Alertas automáticos em caso de falhas