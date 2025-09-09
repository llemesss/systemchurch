-- Script de migração para Neon PostgreSQL
-- Converte o schema SQLite para PostgreSQL

-- Remover tabelas existentes (se houver)
DROP TABLE IF EXISTS dependents CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;
DROP TABLE IF EXISTS prayer_logs CASCADE;
DROP TABLE IF EXISTS user_cells CASCADE;
DROP TABLE IF EXISTS prayer_requests CASCADE;
DROP TABLE IF EXISTS prayer_request_logs CASCADE;
DROP TABLE IF EXISTS cells CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Criar tabela Users
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  role VARCHAR(50) NOT NULL CHECK (role IN ('Admin', 'Pastor', 'Coordenador', 'Supervisor', 'Líder', 'Membro')),
  status VARCHAR(20) NOT NULL DEFAULT 'Ativo' CHECK (status IN ('Ativo', 'Inativo')),
  cell_id INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar tabela Cells
CREATE TABLE cells (
  id SERIAL PRIMARY KEY,
  cell_number VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(255),
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
ALTER TABLE users ADD CONSTRAINT fk_users_cell_id FOREIGN KEY (cell_id) REFERENCES cells(id);

-- Criar tabela de relacionamento user_cells
CREATE TABLE user_cells (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  cell_id INTEGER NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('Líder', 'Membro')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (cell_id) REFERENCES cells(id),
  UNIQUE(user_id, cell_id)
);

-- Criar tabela prayer_logs (Registos de Oração)
CREATE TABLE prayer_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  prayer_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  UNIQUE(user_id, prayer_date)
);

-- Criar tabela user_profiles (Perfis dos Usuários)
CREATE TABLE user_profiles (
  id SERIAL PRIMARY KEY,
  user_id INTEGER UNIQUE NOT NULL,
  whatsapp VARCHAR(50),
  gender CHAR(1) CHECK (gender IS NULL OR gender IN ('M', 'F')),
  date_of_birth DATE,
  birth_city VARCHAR(255),
  birth_state VARCHAR(100),
  address TEXT,
  address_number VARCHAR(20),
  neighborhood VARCHAR(255),
  cep VARCHAR(20),
  reference_point TEXT,
  father_name VARCHAR(255),
  mother_name VARCHAR(255),
  marital_status VARCHAR(50) CHECK (marital_status IS NULL OR marital_status IN ('Solteiro(a)', 'Casado(a)', 'Divorciado(a)', 'Viúvo(a)', 'União Estável', 'Outros')),
  spouse_name VARCHAR(255),
  education VARCHAR(255),
  profession VARCHAR(255),
  conversion_date DATE,
  previous_church VARCHAR(255),
  oikos_name VARCHAR(255),
  oikos_name_2 VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Criar tabela dependents (Dependentes/Filhos)
CREATE TABLE dependents (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  date_of_birth DATE NOT NULL,
  gender CHAR(1) NOT NULL CHECK (gender IN ('M', 'F')),
  observations TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Criar tabela prayer_requests (Pedidos de Oração)
CREATE TABLE prayer_requests (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'Ativo' CHECK (status IN ('Ativo', 'Respondido', 'Cancelado')),
  priority VARCHAR(20) DEFAULT 'Normal' CHECK (priority IN ('Baixa', 'Normal', 'Alta', 'Urgente')),
  is_anonymous BOOLEAN DEFAULT FALSE,
  is_public BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Criar tabela prayer_request_logs (Logs dos Pedidos de Oração)
CREATE TABLE prayer_request_logs (
  id SERIAL PRIMARY KEY,
  prayer_request_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  action VARCHAR(50) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (prayer_request_id) REFERENCES prayer_requests(id)
);

-- Criar índices para melhor performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_cell_id ON users(cell_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);

CREATE INDEX idx_cells_leader_id ON cells(leader_id);
CREATE INDEX idx_cells_supervisor_id ON cells(supervisor_id);
CREATE INDEX idx_cells_coordinator_id ON cells(coordinator_id);
CREATE INDEX idx_cells_cell_number ON cells(cell_number);

CREATE INDEX idx_user_cells_user_id ON user_cells(user_id);
CREATE INDEX idx_user_cells_cell_id ON user_cells(cell_id);
CREATE INDEX idx_user_cells_user_cell ON user_cells(user_id, cell_id);

CREATE INDEX idx_prayer_logs_user_id ON prayer_logs(user_id);
CREATE INDEX idx_prayer_logs_date ON prayer_logs(prayer_date);
CREATE INDEX idx_prayer_logs_user_date ON prayer_logs(user_id, prayer_date);

CREATE INDEX idx_prayer_requests_user_id ON prayer_requests(user_id);
CREATE INDEX idx_prayer_requests_status ON prayer_requests(status);
CREATE INDEX idx_prayer_requests_created_at ON prayer_requests(created_at);

-- Inserir dados iniciais
-- Usuário Pastor padrão
INSERT INTO users (name, email, password, phone, role, status) 
VALUES ('Pastor Principal', 'pastor@igreja.com', '$2a$10$example.hash.here', '(11) 99999-9999', 'Pastor', 'Ativo');

-- Usuário Administrador padrão
INSERT INTO users (name, email, password, phone, role, status) 
VALUES ('Administrador', 'admin@igreja.com', '$2a$10$example.hash.here', '(11) 99999-8888', 'Admin', 'Ativo');

-- Célula padrão
INSERT INTO cells (cell_number, name, description) 
VALUES ('1', 'Célula Principal', 'Primeira célula da igreja');

-- Usuário Membro de teste
INSERT INTO users (name, email, password, phone, role, status, cell_id) 
VALUES ('Membro Teste', 'membro@teste.com', '$2a$10$example.hash.here', '(11) 99999-7777', 'Membro', 'Ativo', 1);

COMMIT;