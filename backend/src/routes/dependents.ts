import express from 'express';
import { initDatabase } from '../database/database';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Listar dependentes do usuário logado
router.get('/', authenticateToken, async (req: any, res) => {
  try {
    const db = await initDatabase();
    const dependents = await db.all(`
      SELECT id, full_name, date_of_birth, gender, observations, created_at
      FROM dependents
      WHERE user_id = ?
      ORDER BY created_at DESC
    `, [req.user.id]);
    
    res.json(dependents);
  } catch (error) {
    console.error('Erro ao buscar dependentes:', error);
    res.status(500).json({ error: 'Erro ao buscar dependentes' });
  }
});

// Criar novo dependente
router.post('/', authenticateToken, async (req: any, res) => {
  try {
    const { full_name, date_of_birth, gender, observations } = req.body;
    const db = await initDatabase();
    
    // Validar campos obrigatórios
    if (!full_name || !date_of_birth || !gender) {
      return res.status(400).json({ error: 'Nome completo, data de nascimento e sexo são obrigatórios' });
    }
    
    // Validar sexo
    if (!['M', 'F'].includes(gender)) {
      return res.status(400).json({ error: 'Sexo deve ser M ou F' });
    }
    
    const result = await db.run(
      'INSERT INTO dependents (user_id, full_name, date_of_birth, gender, observations) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, full_name, date_of_birth, gender, observations || null]
    );
    
    const newDependent = await db.get(`
      SELECT id, full_name, date_of_birth, gender, observations, created_at
      FROM dependents
      WHERE id = ?
    `, [result.lastID]);
    
    res.status(201).json(newDependent);
  } catch (error) {
    console.error('Erro ao criar dependente:', error);
    res.status(500).json({ error: 'Erro ao criar dependente' });
  }
});

// Atualizar dependente
router.put('/:id', authenticateToken, async (req: any, res) => {
  try {
    const { id } = req.params;
    const { full_name, date_of_birth, gender, observations } = req.body;
    const db = await initDatabase();
    
    // Verificar se o dependente pertence ao usuário logado
    const existingDependent = await db.get(
      'SELECT id FROM dependents WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );
    
    if (!existingDependent) {
      return res.status(404).json({ error: 'Dependente não encontrado' });
    }
    
    // Validar campos obrigatórios
    if (!full_name || !date_of_birth || !gender) {
      return res.status(400).json({ error: 'Nome completo, data de nascimento e sexo são obrigatórios' });
    }
    
    // Validar sexo
    if (!['M', 'F'].includes(gender)) {
      return res.status(400).json({ error: 'Sexo deve ser M ou F' });
    }
    
    await db.run(
      'UPDATE dependents SET full_name = ?, date_of_birth = ?, gender = ?, observations = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?',
      [full_name, date_of_birth, gender, observations || null, id, req.user.id]
    );
    
    const updatedDependent = await db.get(`
      SELECT id, full_name, date_of_birth, gender, observations, created_at, updated_at
      FROM dependents
      WHERE id = ? AND user_id = ?
    `, [id, req.user.id]);
    
    res.json(updatedDependent);
  } catch (error) {
    console.error('Erro ao atualizar dependente:', error);
    res.status(500).json({ error: 'Erro ao atualizar dependente' });
  }
});

// Deletar dependente
router.delete('/:id', authenticateToken, async (req: any, res) => {
  try {
    const { id } = req.params;
    const db = await initDatabase();
    
    // Verificar se o dependente pertence ao usuário logado
    const existingDependent = await db.get(
      'SELECT id FROM dependents WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );
    
    if (!existingDependent) {
      return res.status(404).json({ error: 'Dependente não encontrado' });
    }
    
    await db.run(
      'DELETE FROM dependents WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );
    
    res.json({ message: 'Dependente removido com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar dependente:', error);
    res.status(500).json({ error: 'Erro ao deletar dependente' });
  }
});

export default router;