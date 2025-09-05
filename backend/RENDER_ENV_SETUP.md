# Configuração de Variáveis de Ambiente no Render

## Instruções Passo a Passo

### 1. Acesse o Dashboard do Render
1. Faça login em [render.com](https://render.com)
2. Navegue até seu Web Service `igreja-app-backend`
3. Clique na aba "Environment"

### 2. Configurar Variáveis Obrigatórias

Adicione as seguintes variáveis uma por uma:

#### NODE_ENV
- **Key**: `NODE_ENV`
- **Value**: `production`
- **Descrição**: Define o ambiente como produção

#### PORT
- **Key**: `PORT`
- **Value**: `10000`
- **Descrição**: Porta padrão do Render para aplicações web

#### JWT_SECRET
- **Key**: `JWT_SECRET`
- **Value**: `igreja_jwt_secret_2024_super_secure_key_render_production`
- **Descrição**: Chave secreta para assinatura de tokens JWT
- **⚠️ IMPORTANTE**: Use uma chave única e segura em produção

#### DATABASE_URL
- **Key**: `DATABASE_URL`
- **Value**: `[Será fornecido pelo PostgreSQL do Render]`
- **Descrição**: String de conexão com o banco PostgreSQL
- **Formato**: `postgresql://username:password@hostname:port/database`

### 3. Configurar Variáveis Opcionais

#### ALLOWED_ORIGINS
- **Key**: `ALLOWED_ORIGINS`
- **Value**: `https://igreja-app-frontend.vercel.app,https://igreja-app-frontend.onrender.com`
- **Descrição**: Domínios permitidos para CORS
- **⚠️ ATUALIZAR**: Substitua pelos domínios reais do frontend

#### DATABASE_SSL
- **Key**: `DATABASE_SSL`
- **Value**: `true`
- **Descrição**: Habilita SSL para conexão com PostgreSQL

#### DATABASE_MAX_CONNECTIONS
- **Key**: `DATABASE_MAX_CONNECTIONS`
- **Value**: `10`
- **Descrição**: Número máximo de conexões simultâneas com o banco

### 4. Obter DATABASE_URL do PostgreSQL

1. No dashboard do Render, vá para seu PostgreSQL database
2. Na aba "Info", copie a "External Database URL"
3. Cole este valor na variável `DATABASE_URL` do Web Service

### 5. Verificar Configuração

Após configurar todas as variáveis:

1. Clique em "Save Changes"
2. O serviço será redeploy automaticamente
3. Aguarde a conclusão do deploy
4. Teste o endpoint: `https://seu-app.onrender.com/api/health`

### 6. Exemplo de Resposta do Health Check

```json
{
  "status": "OK",
  "message": "Servidor funcionando",
  "database": {
    "status": "connected",
    "type": "PostgreSQL"
  },
  "environment": "production",
  "databaseType": "PostgreSQL",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Troubleshooting

### Erro de Conexão com Banco
- Verifique se `DATABASE_URL` está correta
- Confirme se `DATABASE_SSL=true`
- Verifique se o PostgreSQL está ativo

### Erro de CORS
- Adicione o domínio do frontend em `ALLOWED_ORIGINS`
- Use HTTPS nos domínios de produção

### Erro de JWT
- Verifique se `JWT_SECRET` tem pelo menos 32 caracteres
- Use uma chave única e segura

## Segurança

- ✅ Nunca commite variáveis de ambiente no código
- ✅ Use chaves JWT longas e complexas
- ✅ Mantenha `DATABASE_URL` privada
- ✅ Configure CORS adequadamente
- ✅ Use HTTPS em produção