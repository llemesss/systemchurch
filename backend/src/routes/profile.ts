import express from 'express';
import { initDatabase } from '../database/database';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Obter perfil do usuário logado - ULTRA RÁPIDO (apenas dados essenciais)
router.get('/', authenticateToken, async (req: any, res) => {
  try {
    const db = await initDatabase();
    
    // QUERY SIMPLIFICADA: apenas UMA consulta com dados essenciais indexados
    // Remove JOINs desnecessários que causam lentidão
    const user = await db.get(`
      SELECT id, name, email, role, status, cell_id
      FROM users 
      WHERE id = ?
    `, [req.user.id]);
    
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    res.status(500).json({ error: 'Erro ao buscar perfil' });
  }
});

// Atualizar perfil do usuário logado
router.put('/', authenticateToken, async (req: any, res) => {
  try {
    const {
      name,
      phone,
      whatsapp,
      gender,
      date_of_birth,
      birth_city,
      birth_state,
      address,
      address_number,
      neighborhood,
      cep,
      reference_point,
      father_name,
      mother_name,
      marital_status,
      spouse_name,
      education,
      profession,
      conversion_date,
      previous_church,
      oikos_name,
      oikos_name_2
    } = req.body;
    
    const db = await initDatabase();
    
    // Verificar se o usuário existe
    const existingUser = await db.get('SELECT id FROM users WHERE id = ?', [req.user.id]);
    if (!existingUser) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    
    // Primeiro, verificar se a tabela users tem as colunas necessárias
    // Se não tiver, vamos criar uma tabela separada para o perfil estendido
    try {
      // Tentar atualizar campos básicos na tabela users
      await db.run(
        'UPDATE users SET name = ?, phone = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [name, phone, req.user.id]
      );
      
      // Criar tabela de perfil estendido se não existir
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
      
      // Inserir ou atualizar perfil estendido
      await db.run(`
        INSERT OR REPLACE INTO user_profiles (
          user_id, whatsapp, gender, date_of_birth, birth_city, birth_state,
          address, address_number, neighborhood, cep, reference_point,
          father_name, mother_name, marital_status, spouse_name,
          education, profession, conversion_date, previous_church, oikos_name, oikos_name_2,
          updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `, [
        req.user.id, whatsapp, gender, date_of_birth, birth_city, birth_state,
        address, address_number, neighborhood, cep, reference_point,
        father_name, mother_name, marital_status, spouse_name,
        education, profession, conversion_date, previous_church, oikos_name, oikos_name_2
      ]);
      
      // Buscar perfil atualizado
      const updatedProfile = await db.get(`
        SELECT u.id, u.name, u.email, u.phone, u.role, u.status, u.cell_id,
               c.cell_number, c.name as cell_name,
               l.name as leader_name,
               p.whatsapp, p.gender, p.date_of_birth, p.birth_city, p.birth_state,
             p.address, p.address_number, p.neighborhood, p.cep, p.reference_point,
             p.father_name, p.mother_name, p.marital_status, p.spouse_name,
             p.education, p.profession, p.conversion_date, p.previous_church, p.oikos_name, p.oikos_name_2
      FROM users u
      LEFT JOIN cells c ON u.cell_id = c.id
      LEFT JOIN users l ON c.leader_id = l.id
      LEFT JOIN user_profiles p ON u.id = p.user_id
      WHERE u.id = ?
      `, [req.user.id]);
      
      res.json(updatedProfile);
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      res.status(500).json({ error: 'Erro ao atualizar perfil' });
    }
  } catch (error) {
    console.error('Erro ao processar atualização do perfil:', error);
    res.status(500).json({ error: 'Erro ao atualizar perfil' });
  }
});

// Obter perfil completo do usuário logado - OTIMIZADO
router.get('/complete', authenticateToken, async (req: any, res) => {
  try {
    const db = await initDatabase();
    
    // Query otimizada: uma única consulta com JOINs e índices
    // Agora usa os índices criados para melhor performance
    const profile = await db.get(`
      SELECT 
        u.id, u.name, u.email, u.phone, u.role, u.status, u.cell_id,
        c.cell_number, c.name as cell_name,
        l.name as leader_name,
        p.whatsapp, p.gender, p.date_of_birth, p.birth_city, p.birth_state,
        p.address, p.address_number, p.neighborhood, p.cep, p.reference_point,
        p.father_name, p.mother_name, p.marital_status, p.spouse_name,
        p.education, p.profession, p.conversion_date, p.previous_church, 
        p.oikos_name, p.oikos_name_2
      FROM users u
      LEFT JOIN cells c ON u.cell_id = c.id
      LEFT JOIN users l ON c.leader_id = l.id
      LEFT JOIN user_profiles p ON u.id = p.user_id
      WHERE u.id = ?
    `, [req.user.id]);
    
    if (!profile) {
      return res.status(404).json({ error: 'Perfil não encontrado' });
    }
    
    res.json(profile);
  } catch (error) {
    console.error('Erro ao buscar perfil completo:', error);
    res.status(500).json({ error: 'Erro ao buscar perfil completo' });
  }
});

export default router;