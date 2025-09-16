# 🔧 Guia de Correção - Netlify Deploy

## 🚨 Problema Identificado

O erro no Netlify estava ocorrendo porque:

1. **Frontend configurado para backend Express**: O código estava tentando usar `http://localhost:3001/api` em produção
2. **Endpoints incorretos**: As funções Netlify têm endpoints diferentes do backend Express
3. **Configuração de API inconsistente**: Mistura entre backend Express e funções serverless

## ✅ Correções Implementadas

### 1. **Configuração Dinâmica da API** (`backendApi.ts`)
```typescript
// Detecta automaticamente se está no Netlify
const IS_NETLIFY = import.meta.env.VITE_API_URL?.includes('netlify.app');
const API_BASE_URL = IS_NETLIFY 
  ? import.meta.env.VITE_API_URL  // Para Netlify: https://site.netlify.app
  : 'http://localhost:3001/api';  // Para desenvolvimento local
```

### 2. **Endpoints Corretos por Ambiente**
- **Desenvolvimento**: `/auth/login` → Backend Express
- **Netlify**: `/login` → Função serverless direta

### 3. **Redirects Configurados** (`_redirects`)
```
/api/health  /.netlify/functions/health  200
/api/login   /.netlify/functions/login   200
/api/cells/public  /.netlify/functions/cells-public  200
```

## 🔧 Configuração no Netlify

### Variáveis de Ambiente Necessárias:
```
VITE_API_URL=https://seu-site.netlify.app
NODE_ENV=production
DATABASE_URL=postgresql://...
JWT_SECRET=sua_chave_secreta
ALLOWED_ORIGINS=https://seu-site.netlify.app
```

### Build Settings:
- **Base directory**: `igreja-app`
- **Build command**: `npm run build`
- **Publish directory**: `igreja-app/dist`
- **Functions directory**: `netlify/functions`

## 🧪 Teste das Funções

### 1. Health Check
```
GET https://seu-site.netlify.app/api/health
```

### 2. Login
```
POST https://seu-site.netlify.app/api/login
Content-Type: application/json

{
  "email": "admin@idpb.com",
  "password": "admin123"
}
```

### 3. Células Públicas
```
GET https://seu-site.netlify.app/api/cells/public
```

## 📝 Próximos Passos

1. **Fazer commit das correções**:
   ```bash
   git add .
   git commit -m "fix: Corrige configuração da API para Netlify"
   git push
   ```

2. **Configurar variáveis no Netlify**:
   - Site Settings > Environment Variables
   - Adicionar todas as variáveis listadas acima

3. **Fazer novo deploy**:
   - O deploy será automático após o push
   - Verificar logs de build no painel do Netlify

4. **Testar funcionalidades**:
   - Login com `admin@idpb.com` / `admin123`
   - Carregamento de células públicas
   - Todas as funcionalidades principais

## 🔍 Debug

### Ver Logs das Functions:
1. Painel Netlify > Functions
2. Clicar na função específica
3. Ver logs em tempo real

### Testar Localmente:
```bash
# Instalar Netlify CLI
npm install -g netlify-cli

# Testar functions localmente
netlify dev
```

## ⚠️ Importante

- As funções Netlify são **stateless** e **serverless**
- Não há conexão persistente com banco de dados
- Cada requisição é independente
- Timeout máximo: 10s (plano gratuito) / 26s (plano Pro)

---

**Com essas correções, o Netlify deve funcionar corretamente! 🎉**