import express from 'express';
import { initDatabase } from '../database';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Obter perfil do usuário logado - OTIMIZADO
router.get('/', authenticateToken, async (req: any, res) => {
  try {
    const db = await initDatabase();
    
    // Query otimizada com índices nas colunas de busca
    const user = await db.get(`
      SELECT u.id, u.name, u.email, u.phone, u.role, u.status, u.cell_id,
             c.cell_number, c.name as cell_name,
             l.name as leader_name
      FROM users u
      LEFT JOIN cells c ON u.cell_id = c.id
      LEFT JOIN users l ON c.leader_id = l.id
      WHERE u.id = ?
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

// Obter perfil completo do usuário logado - OTIMIZADO
router.get('/complete', authenticateToken, async (req: any, res) => {
  try {
    const db = await initDatabase();
    
    // Query otimizada: uma única consulta com JOINs em vez de múltiplas queries
    // Isso reduz significativamente o tempo de resposta
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

// Atualizar perfil do usuário logado - OTIMIZADO
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
    
    // Usar transação para garantir consistência
    await db.exec('BEGIN TRANSACTION');
    
    try {
      // Atualizar dados básicos do usuário
      if (name || phone) {
        await db.run(`
          UPDATE users 
          SET name = COALESCE(?, name), 
              phone = COALESCE(?, phone),
              updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `, [name, phone, req.user.id]);
      }
      
      // Atualizar ou inserir perfil completo
      const profileFields = {
        whatsapp, gender, date_of_birth, birth_city, birth_state,
        address, address_number, neighborhood, cep, reference_point,
        father_name, mother_name, marital_status, spouse_name,
        education, profession, conversion_date, previous_church,
        oikos_name, oikos_name_2
      };
      
      // Filtrar apenas campos não nulos/undefined
      const validFields = Object.entries(profileFields)
        .filter(([_, value]) => value !== undefined && value !== null)
        .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
      
      if (Object.keys(validFields).length > 0) {
        // Verificar se já existe perfil
        const existingProfile = await db.get(
          'SELECT id FROM user_profiles WHERE user_id = ?',
          [req.user.id]
        );
        
        if (existingProfile) {
          // Atualizar perfil existente
          const setClause = Object.keys(validFields)
            .map(key => `${key} = ?`)
            .join(', ');
          
          await db.run(
            `UPDATE user_profiles SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?`,
            [...Object.values(validFields), req.user.id]
          );
        } else {
          // Criar novo perfil
          const columns = ['user_id', ...Object.keys(validFields)];
          const placeholders = columns.map(() => '?').join(', ');
          
          await db.run(
            `INSERT INTO user_profiles (${columns.join(', ')}) VALUES (${placeholders})`,
            [req.user.id, ...Object.values(validFields)]
          );
        }
      }
      
      await db.exec('COMMIT');
      
      // Buscar dados atualizados
      const updatedProfile = await db.get(`
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
      
      res.json(updatedProfile);
      
    } catch (error) {
      await db.exec('ROLLBACK');
      throw error;
    }
    
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    res.status(500).json({ error: 'Erro ao atualizar perfil' });
  }
});

export default router;