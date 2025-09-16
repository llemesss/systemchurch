-- Script para criar schema SQLite local
-- Baseado no schema PostgreSQL mas adaptado para SQLite

-- Criar tabela Users
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL CHECK (role IN ('Admin', 'Pastor', 'Coordenador', 'Supervisor', 'Líder', 'Membro')),
  status TEXT NOT NULL DEFAULT 'Ativo' CHECK (status IN ('Ativo', 'Inativo')),
  cell_id INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Criar tabela Cells
CREATE TABLE cells (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cell_number TEXT NOT NULL UNIQUE,
  name TEXT,
  description TEXT,
  leader_id INTEGER,
  supervisor_id INTEGER,
  coordinator_id INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (leader_id) REFERENCES users(id),
  FOREIGN KEY (supervisor_id) REFERENCES users(id),
  FOREIGN KEY (coordinator_id) REFERENCES users(id)
);

-- Criar tabela de relacionamento user_cells
CREATE TABLE user_cells (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  cell_id INTEGER NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('Líder', 'Membro')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (cell_id) REFERENCES cells(id),
  UNIQUE(user_id, cell_id)
);

-- Criar tabela prayer_logs (Registos de Oração)
CREATE TABLE prayer_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  prayer_date DATE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  UNIQUE(user_id, prayer_date)
);

-- Criar tabela user_profiles (Perfis dos Usuários)
CREATE TABLE user_profiles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER UNIQUE NOT NULL,
  whatsapp TEXT,
  gender TEXT CHECK (gender IS NULL OR gender IN ('M', 'F')),
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
  marital_status TEXT CHECK (marital_status IS NULL OR marital_status IN ('Solteiro(a)', 'Casado(a)', 'Divorciado(a)', 'Viúvo(a)', 'União Estável', 'Outros')),
  spouse_name TEXT,
  education TEXT,
  profession TEXT,
  conversion_date DATE,
  previous_church TEXT,
  oikos_name TEXT,
  oikos_name_2 TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Criar tabela dependents (Dependentes/Filhos)
CREATE TABLE dependents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  full_name TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('M', 'F')),
  observations TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Criar tabela prayer_requests (Pedidos de Oração)
CREATE TABLE prayer_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Ativo' CHECK (status IN ('Ativo', 'Respondido', 'Cancelado')),
  priority TEXT DEFAULT 'Normal' CHECK (priority IN ('Baixa', 'Normal', 'Alta', 'Urgente')),
  is_anonymous BOOLEAN DEFAULT FALSE,
  is_public BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Criar tabela prayer_request_logs (Logs dos Pedidos de Oração)
CREATE TABLE prayer_request_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  prayer_request_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('Criado', 'Atualizado', 'Respondido', 'Cancelado')),
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (prayer_request_id) REFERENCES prayer_requests(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Inserir usuário de teste
INSERT INTO users (name, email, password, role, status) 
VALUES ('Usuário Teste', 'test@test.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Membro', 'Ativo');