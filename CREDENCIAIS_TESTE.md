# Credenciais de Teste - Igreja App

## 🔐 Login de Teste

Para testar a aplicação, use as seguintes credenciais:

**E-mail:** `pastor@igreja.com`  
**Senha:** `pastor123`

## 📋 Informações do Usuário Padrão

- **Nome:** Pastor Principal
- **Role:** Pastor
- **Status:** Ativo
- **Telefone:** (11) 99999-9999

## 🚀 Como Usar

1. Acesse a aplicação em: http://localhost:5174
2. Clique em "Login" ou vá para `/login`
3. Digite as credenciais acima
4. Você será redirecionado para o dashboard

## ✅ Status dos Serviços

- **Backend:** http://localhost:3001 ✅
- **Frontend:** http://localhost:5174 ✅
- **Health Check:** http://localhost:3001/api/health ✅

## 🔧 Troubleshooting

Se o login não funcionar:
1. Verifique se ambos os serviços estão rodando
2. Confirme se as credenciais estão corretas
3. Verifique o console do navegador para erros
4. Teste o backend diretamente: `curl -X POST http://localhost:3001/api/auth/login -H "Content-Type: application/json" -d '{"email":"pastor@igreja.com","password":"pastor123"}'`