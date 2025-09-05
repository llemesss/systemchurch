# Guia Completo de Deploy - Igreja App

## ✅ Status Atual

### Backend (Render)
- ✅ Código preparado para produção
- ✅ Build configurado (`npm run build`)
- ✅ PostgreSQL configurado
- ✅ Variáveis de ambiente documentadas
- ✅ Health check endpoint (`/api/health`)
- ✅ CORS configurado
- ✅ Arquivos de configuração criados

### Frontend (Vercel)
- ✅ Build funcionando (`npm run build`)
- ✅ Variáveis de ambiente configuradas
- ✅ Arquivos de configuração criados
- ✅ Documentação de deploy criada

## 📁 Arquivos Criados

## 📋 Visão Geral

Este guia explica como fazer deploy da aplicação Igreja App usando:
- **Supabase**: Banco de dados PostgreSQL
- **Render**: Backend (API Node.js)
- **Render/Vercel**: Frontend (React)

---

## 🗄️ 1. Configuração do Supabase (Banco de Dados)

### 1.1 Criar Conta e Projeto

1. Acesse [supabase.com](https://supabase.com)
2. Crie uma conta gratuita
3. Clique em "New Project"
4. Preencha:
   - **Name**: `igreja-app`
   - **Database Password**: Crie uma senha forte
   - **Region**: `South America (São Paulo)`
5. Clique em "Create new project"

### 1.2 Obter Credenciais

Após criar o projeto:
1. Vá em **Settings** → **Database**
2. Anote as informações:
   ```
   Host: db.xxx.supabase.co
   Database name: postgres
   Port: 5432
   User: postgres
   Password: [sua senha]
   ```

3. Vá em **Settings** → **API**
4. Anote:
   ```
   Project URL: https://xxx.supabase.co
   anon public key: eyJ...
   service_role key: eyJ...
   ```

### 1.3 Criar Tabelas no Supabase

1. Vá em **SQL Editor**
2. Execute o seguinte script para criar todas as tabelas:

```sql
-- Criar tabela users
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL CHECK (role IN ('Admin', 'Pastor', 'Coordenador', 'Supervisor', 'Líder', 'Membro')),
  status TEXT NOT NULL DEFAULT 'Ativo' CHECK (status IN ('Ativo', 'Inativo')),
  cell_id INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar tabela cells
CREATE TABLE cells (
  id SERIAL PRIMARY KEY,
  cell_number TEXT NOT NULL UNIQUE,
  name TEXT,
  description TEXT,
  leader_id INTEGER,
  supervisor_id INTEGER,
  coordinator_id INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (leader_id) REFERENCES users(id),
  FOREIGN KEY (supervisor_id) REFERENCES users(id),
  FOREIGN KEY (coordinator_id) REFERENCES users(id)
);

-- Adicionar foreign key para cell_id em users
ALTER TABLE users ADD FOREIGN KEY (cell_id) REFERENCES cells(id);

-- Criar tabela user_cells
CREATE TABLE user_cells (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  cell_id INTEGER NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('Líder', 'Membro')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (cell_id) REFERENCES cells(id),
  UNIQUE(user_id, cell_id)
);

-- Criar tabela user_profiles
CREATE TABLE user_profiles (
  id SERIAL PRIMARY KEY,
  user_id INTEGER UNIQUE NOT NULL,
  whatsapp TEXT,
  gender TEXT CHECK (gender IS NULL OR gender = '' OR gender IN ('M', 'F')),
  date_of_birth DATE,
  birth_city TEXT,
  birth_state TEXT,
  address TEXT,
  address_number TEXT,
  neighborhood TEXT,
  cep TEXT,
  reference_point TEXT,
  father_name TEXT,
  mother_name TEXT,
  marital_status TEXT CHECK (marital_status IS NULL OR marital_status = '' OR marital_status IN ('Solteiro(a)', 'Casado(a)', 'Divorciado(a)', 'Viúvo(a)', 'União Estável', 'Outros')),
  spouse_name TEXT,
  education TEXT,
  profession TEXT,
  conversion_date DATE,
  previous_church TEXT,
  oikos_name TEXT,
  oikos_name_2 TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Criar tabela prayer_logs
CREATE TABLE prayer_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  prayer_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  UNIQUE(user_id, prayer_date)
);

-- Criar tabela dependents
CREATE TABLE dependents (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  full_name TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('M', 'F')),
  observations TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### 1.4 Inserir Dados Iniciais

```sql
-- Inserir usuário pastor padrão (senha: pastor123)
INSERT INTO users (name, email, password, phone, role, status)
VALUES ('Pastor Principal', 'pastor@igreja.com', '$2a$10$hIKN1HQyXmA7AL9csctnEetU3diKbIHIXZSYawcF0CEPJn4bi66B.', '(11) 99999-9999', 'Pastor', 'Ativo');

-- Inserir usuário administrador padrão (senha: admin123)
INSERT INTO users (name, email, password, phone, role, status)
VALUES ('Administrador', 'admin@igreja.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '(11) 99999-8888', 'Admin', 'Ativo');

-- Inserir célula de teste
INSERT INTO cells (cell_number, name, description)
VALUES ('1', 'Célula 1', 'Célula de teste para desenvolvimento');

-- Inserir membro de teste (senha: membro123)
INSERT INTO users (name, email, password, phone, role, status, cell_id)
VALUES ('Membro Teste', 'membro@teste.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '(11) 99999-7777', 'Membro', 'Ativo', 1);
```

---

## 🚀 2. Deploy do Backend no Render

### 2.1 Preparar o Backend

1. **Criar arquivo de produção** `backend/src/database/postgres.ts`:

```typescript
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

export async function initPostgresDatabase() {
  return {
    get: async (sql: string, params: any[] = []) => {
      const result = await pool.query(sql, params);
      return result.rows[0];
    },
    all: async (sql: string, params: any[] = []) => {
      const result = await pool.query(sql, params);
      return result.rows;
    },
    run: async (sql: string, params: any[] = []) => {
      const result = await pool.query(sql, params);
      return { lastID: result.rows[0]?.id, changes: result.rowCount };
    },
    exec: async (sql: string) => {
      await pool.query(sql);
    }
  };
}
```

2. **Instalar dependência PostgreSQL**:
```bash
cd backend
npm install pg @types/pg
```

3. **Atualizar package.json** para incluir script de build:
```json
{
  "scripts": {
    "start": "node dist/server.js",
    "dev": "ts-node src/server.ts",
    "build": "tsc",
    "postbuild": "cp -r src/database dist/"
  }
}
```

### 2.2 Configurar Render

1. Acesse [render.com](https://render.com)
2. Conecte sua conta GitHub
3. Clique em "New +" → "Web Service"
4. Conecte o repositório do projeto
5. Configure:
   - **Name**: `igreja-app-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Root Directory**: `backend`

### 2.3 Configurar Variáveis de Ambiente

No painel do Render, vá em **Environment** e adicione:

```
NODE_ENV=production
PORT=10000
JWT_SECRET=seu_jwt_secret_super_seguro_aqui
DATABASE_URL=postgresql://postgres:[senha]@db.xxx.supabase.co:5432/postgres
```

**⚠️ Importante**: Substitua `[senha]` e `xxx` pelos valores do seu Supabase.

---

## 🌐 3. Deploy do Frontend

### 3.1 Opção A: Deploy no Render

1. No Render, clique em "New +" → "Static Site"
2. Conecte o mesmo repositório
3. Configure:
   - **Name**: `igreja-app-frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
   - **Root Directory**: `igreja-app`

### 3.2 Opção B: Deploy no Vercel (Recomendado)

1. Acesse [vercel.com](https://vercel.com)
2. Conecte sua conta GitHub
3. Importe o projeto
4. Configure:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `igreja-app`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### 3.3 Configurar Variáveis de Ambiente do Frontend

Adicione as variáveis:

```
VITE_API_URL=https://igreja-app-backend.onrender.com
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

---

## ⚙️ 4. Configurações Finais

### 4.1 Atualizar Frontend para Produção

No arquivo `igreja-app/src/utils/api.ts`, atualize:

```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE_URL}/api${endpoint}`;
  // ... resto do código
};
```

### 4.2 Configurar CORS no Backend

No arquivo `backend/src/server.ts`, atualize:

```typescript
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://igreja-app-frontend.onrender.com',
    'https://seu-dominio.vercel.app'
  ],
  credentials: true
}));
```

---

## 🔧 5. Comandos Úteis

### Logs do Backend (Render)
```bash
# Ver logs em tempo real
render logs --service igreja-app-backend --tail
```

### Testar Conexão com Banco
```bash
# Conectar ao PostgreSQL do Supabase
psql "postgresql://postgres:[senha]@db.xxx.supabase.co:5432/postgres"
```

### Build Local para Teste
```bash
# Backend
cd backend
npm run build
npm start

# Frontend
cd igreja-app
npm run build
npm run preview
```

---

## 🚨 Troubleshooting

### Problema: Erro de CORS
**Solução**: Verificar se o domínio do frontend está na lista de origins permitidos no backend.

### Problema: Erro de Conexão com Banco
**Solução**: Verificar se a `DATABASE_URL` está correta e se o IP está na whitelist do Supabase.

### Problema: Build Falha no Render
**Solução**: Verificar se todas as dependências estão no `package.json` e se o Node.js está na versão correta.

---

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs no painel do Render
2. Teste a API diretamente: `https://seu-backend.onrender.com/api/health`
3. Verifique as variáveis de ambiente
4. Confirme se o banco de dados está acessível

---

**✅ Após seguir este guia, sua aplicação estará rodando em produção!**