import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import bcrypt from 'bcryptjs';

export async function initDatabase() {
  const db = await open({
    filename: path.join(__dirname, '../../database.sqlite'),
    driver: sqlite3.Database
  });

  // Criar tabela Users
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      phone TEXT,
      role TEXT NOT NULL CHECK (role IN ('Admin', 'Pastor', 'Coordenador', 'Supervisor', 'Líder', 'Membro')),
      status TEXT NOT NULL DEFAULT 'Ativo' CHECK (status IN ('Ativo', 'Inativo')),
      cell_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (cell_id) REFERENCES cells(id)
    )
  `);
  
  // Adicionar coluna cell_id se não existir (para bancos existentes)
  try {
    await db.exec('ALTER TABLE users ADD COLUMN cell_id INTEGER REFERENCES cells(id)');
  } catch (error) {
    // Coluna já existe, ignorar erro
  }

  // Criar tabela Cells
  await db.exec(`
    CREATE TABLE IF NOT EXISTS cells (
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
    )
  `);
  
  // Adicionar coluna cell_number se não existir (para bancos existentes)
  try {
    await db.exec('ALTER TABLE cells ADD COLUMN cell_number TEXT UNIQUE');
  } catch (error) {
    // Coluna já existe, ignorar erro
  }

  // Criar tabela de relacionamento user_cells
  await db.exec(`
    CREATE TABLE IF NOT EXISTS user_cells (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      cell_id INTEGER NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('Líder', 'Membro')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (cell_id) REFERENCES cells(id),
      UNIQUE(user_id, cell_id)
    )
  `);

  // Criar tabela prayer_logs (Registos de Oração)
  await db.exec(`
    CREATE TABLE IF NOT EXISTS prayer_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      prayer_date DATE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      UNIQUE(user_id, prayer_date)
    )
  `);

  // Criar tabela user_profiles (Perfis dos Usuários)
  await db.exec(`
    CREATE TABLE IF NOT EXISTS user_profiles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
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
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Criar tabela dependents (Dependentes/Filhos)
  await db.exec(`
    CREATE TABLE IF NOT EXISTS dependents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      full_name TEXT NOT NULL,
      date_of_birth DATE NOT NULL,
      gender TEXT NOT NULL CHECK (gender IN ('M', 'F')),
      observations TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Inserir usuário pastor padrão se não existir
  const existingPastor = await db.get('SELECT id FROM users WHERE role = "Pastor" LIMIT 1');
  if (!existingPastor) {
    const hashedPassword = await bcrypt.hash('pastor123', 10);
    await db.run(`
      INSERT INTO users (name, email, password, phone, role, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `, ['Pastor Principal', 'pastor@igreja.com', hashedPassword, '(11) 99999-9999', 'Pastor', 'Ativo']);
  }

  // Inserir usuário administrador padrão se não existir
  const existingAdmin = await db.get('SELECT id FROM users WHERE role = "Admin" LIMIT 1');
  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await db.run(`
      INSERT INTO users (name, email, password, phone, role, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `, ['Administrador', 'admin@igreja.com', hashedPassword, '(11) 99999-8888', 'Admin', 'Ativo']);
  }

  // Inserir célula de teste se não existir
  const existingCell = await db.get('SELECT id FROM cells WHERE cell_number = "1" LIMIT 1');
  if (!existingCell) {
    const cellResult = await db.run(`
      INSERT INTO cells (cell_number, name, description)
      VALUES (?, ?, ?)
    `, ['1', 'Célula 1', 'Célula de teste para desenvolvimento']);
    
    // Inserir usuário membro de teste associado à célula
    const existingMember = await db.get('SELECT id FROM users WHERE email = "membro@teste.com" LIMIT 1');
    if (!existingMember) {
      const hashedPassword = await bcrypt.hash('membro123', 10);
      await db.run(`
        INSERT INTO users (name, email, password, phone, role, status, cell_id)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, ['Membro Teste', 'membro@teste.com', hashedPassword, '(11) 99999-7777', 'Membro', 'Ativo', cellResult.lastID]);
    }
  }

  return db;
}