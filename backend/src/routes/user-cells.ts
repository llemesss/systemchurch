import express from 'express';
import { initDatabase } from '../database/database';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Obter células de um usuário
router.get('/user/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const db = await initDatabase();
    
    const userCells = await db.all(`
      SELECT c.*, uc.role as user_role
      FROM user_cells uc
      JOIN cells c ON uc.cell_id = c.id
      WHERE uc.user_id = ?
    `, [userId]);
    
    res.json(userCells);
  } catch (error) {
    console.error('Erro ao buscar células do usuário:', error);
    res.status(500).json({ error: 'Erro ao buscar células do usuário' });
  }
});

// Obter membros de uma célula
router.get('/cell/:cellId', authenticateToken, async (req, res) => {
  try {
    const { cellId } = req.params;
    const db = await initDatabase();
    
    const cellMembers = await db.all(`
      SELECT u.*, uc.role as cell_role
      FROM user_cells uc
      JOIN users u ON uc.user_id = u.id
      WHERE uc.cell_id = ?
    `, [cellId]);
    
    res.json(cellMembers);
  } catch (error) {
    console.error('Erro ao buscar membros da célula:', error);
    res.status(500).json({ error: 'Erro ao buscar membros da célula' });
  }
});

// Associar usuário a uma célula
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { user_id, cell_id, role } = req.body;
    const db = await initDatabase();
    
    // Verificar se a associação já existe
    const existingAssociation = await db.get(
      'SELECT id FROM user_cells WHERE user_id = ? AND cell_id = ?',
      [user_id, cell_id]
    );
    
    if (existingAssociation) {
      return res.status(400).json({ error: 'Usuário já está associado a esta célula' });
    }
    
    const result = await db.run(
      'INSERT INTO user_cells (user_id, cell_id, role) VALUES (?, ?, ?)',
      [user_id, cell_id, role]
    );
    
    const newAssociation = await db.get(
      'SELECT * FROM user_cells WHERE id = ?',
      [result.lastID]
    );
    
    res.status(201).json(newAssociation);
  } catch (error) {
    console.error('Erro ao associar usuário à célula:', error);
    res.status(500).json({ error: 'Erro ao associar usuário à célula' });
  }
});

// Remover associação usuário-célula
router.delete('/', authenticateToken, async (req, res) => {
  try {
    const { user_id, cell_id } = req.body;
    const db = await initDatabase();
    
    await db.run(
      'DELETE FROM user_cells WHERE user_id = ? AND cell_id = ?',
      [user_id, cell_id]
    );
    
    res.json({ message: 'Associação removida com sucesso' });
  } catch (error) {
    console.error('Erro ao remover associação:', error);
    res.status(500).json({ error: 'Erro ao remover associação' });
  }
});

// Atualizar role do usuário em uma célula
router.put('/', authenticateToken, async (req, res) => {
  try {
    const { user_id, cell_id, role } = req.body;
    const db = await initDatabase();
    
    await db.run(
      'UPDATE user_cells SET role = ? WHERE user_id = ? AND cell_id = ?',
      [role, user_id, cell_id]
    );
    
    const updatedAssociation = await db.get(
      'SELECT * FROM user_cells WHERE user_id = ? AND cell_id = ?',
      [user_id, cell_id]
    );
    
    res.json(updatedAssociation);
  } catch (error) {
    console.error('Erro ao atualizar associação:', error);
    res.status(500).json({ error: 'Erro ao atualizar associação' });
  }
});

export default router;