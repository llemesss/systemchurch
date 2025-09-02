import express from 'express';
import { initDatabase } from '../database/database';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Listar células públicas (para registro)
router.get('/public', async (req, res) => {
  try {
    const db = await initDatabase();
    const cells = await db.all(`
      SELECT id, cell_number, name
      FROM cells
      ORDER BY CAST(cell_number AS INTEGER) ASC
    `);
    
    res.json(cells);
  } catch (error) {
    console.error('Erro ao buscar células públicas:', error);
    res.status(500).json({ error: 'Erro ao buscar células' });
  }
});

// Listar todas as células
router.get('/', authenticateToken, async (req, res) => {
  try {
    const db = await initDatabase();
    const cells = await db.all(`
      SELECT c.*, 
             l1.name as leader_1_name,
             l1.id as leader_1_id,
             s.name as supervisor_name,
             coord.name as coordinator_name
      FROM cells c
      LEFT JOIN users l1 ON c.leader_id = l1.id
      LEFT JOIN users s ON c.supervisor_id = s.id
      LEFT JOIN users coord ON c.coordinator_id = coord.id
      ORDER BY CAST(c.cell_number AS INTEGER) ASC
    `);
    
    // Transformar para o formato esperado pelo frontend
    const formattedCells = cells.map(cell => ({
      id: cell.id,
      cell_number: cell.cell_number,
      name: cell.name,
      description: cell.description,
      leader_1: cell.leader_1_name ? { id: cell.leader_1_id, name: cell.leader_1_name } : null,
      leader_1_id: cell.leader_1_id,
      supervisor: cell.supervisor_name ? { name: cell.supervisor_name } : null,
      coordinator: cell.coordinator_name ? { name: cell.coordinator_name } : null,
      created_at: cell.created_at,
      updated_at: cell.updated_at
    }));
    
    res.json(formattedCells);
  } catch (error) {
    console.error('Erro ao buscar células:', error);
    res.status(500).json({ error: 'Erro ao buscar células' });
  }
});

// Criar nova célula
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { cell_number, leader_id } = req.body;
    const db = await initDatabase();
    
    // Validar se cell_number foi fornecido
    if (!cell_number) {
      return res.status(400).json({ error: 'Número da célula é obrigatório' });
    }
    
    // Normalizar o número da célula (remover zeros à esquerda)
    const normalizedCellNumber = parseInt(cell_number).toString();
    
    // Verificar se já existe uma célula com este número (considerando zeros à esquerda)
    const existingCell = await db.get(
      'SELECT id FROM cells WHERE CAST(cell_number AS INTEGER) = CAST(? AS INTEGER)',
      [normalizedCellNumber]
    );
    
    if (existingCell) {
      return res.status(400).json({ 
        error: `Já existe uma célula com o número ${normalizedCellNumber}` 
      });
    }
    
    const result = await db.run(
      'INSERT INTO cells (cell_number, leader_id, name) VALUES (?, ?, ?)',
      [normalizedCellNumber, leader_id || null, `Célula ${normalizedCellNumber}`]
    );
    
    const newCell = await db.get(`
      SELECT c.*, 
             l1.name as leader_1_name,
             l1.id as leader_1_id
      FROM cells c
      LEFT JOIN users l1 ON c.leader_id = l1.id
      WHERE c.id = ?
    `, [result.lastID]);
    
    // Formatar resposta para o frontend
    const formattedCell = {
      id: newCell.id,
      cell_number: newCell.cell_number,
      leader_1: newCell.leader_1_name ? { id: newCell.leader_1_id, name: newCell.leader_1_name } : null,
      leader_1_id: newCell.leader_1_id,
      created_at: newCell.created_at,
      updated_at: newCell.updated_at
    };
    
    res.status(201).json(formattedCell);
  } catch (error) {
    console.error('Erro ao criar célula:', error);
    res.status(500).json({ error: 'Erro ao criar célula' });
  }
});

// Atualizar célula
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { cell_number, leader_id } = req.body;
    const db = await initDatabase();
    
    // Validar se cell_number foi fornecido
    if (!cell_number) {
      return res.status(400).json({ error: 'Número da célula é obrigatório' });
    }
    
    // Normalizar o número da célula (remover zeros à esquerda)
    const normalizedCellNumber = parseInt(cell_number).toString();
    
    // Verificar se já existe outra célula com este número (excluindo a atual)
    const existingCell = await db.get(
      'SELECT id FROM cells WHERE CAST(cell_number AS INTEGER) = CAST(? AS INTEGER) AND id != ?',
      [normalizedCellNumber, id]
    );
    
    if (existingCell) {
      return res.status(400).json({ 
        error: `Já existe uma célula com o número ${normalizedCellNumber}` 
      });
    }
    
    await db.run(
      'UPDATE cells SET cell_number = ?, leader_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [normalizedCellNumber, leader_id || null, id]
    );
    
    const updatedCell = await db.get(`
      SELECT c.*, 
             l1.name as leader_1_name,
             l1.id as leader_1_id
      FROM cells c
      LEFT JOIN users l1 ON c.leader_id = l1.id
      WHERE c.id = ?
    `, [id]);
    
    // Formatar resposta para o frontend
    const formattedCell = {
      id: updatedCell.id,
      cell_number: updatedCell.cell_number,
      leader_1: updatedCell.leader_1_name ? { id: updatedCell.leader_1_id, name: updatedCell.leader_1_name } : null,
      leader_1_id: updatedCell.leader_1_id,
      created_at: updatedCell.created_at,
      updated_at: updatedCell.updated_at
    };
    
    res.json(formattedCell);
  } catch (error) {
    console.error('Erro ao atualizar célula:', error);
    res.status(500).json({ error: 'Erro ao atualizar célula' });
  }
});

// Listar membros de uma célula específica
router.get('/:id/members', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const db = await initDatabase();
    
    // Buscar informações da célula
    const cell = await db.get(`
      SELECT c.*, l.name as leader_name
      FROM cells c
      LEFT JOIN users l ON c.leader_id = l.id
      WHERE c.id = ?
    `, [id]);
    
    if (!cell) {
      return res.status(404).json({ error: 'Célula não encontrada' });
    }
    
    // Buscar todos os membros da célula
    const members = await db.all(`
      SELECT u.id, u.name, u.email, u.phone, u.role, u.status, u.created_at,
             p.whatsapp, p.gender, p.date_of_birth, p.birth_city, p.birth_state,
             p.address, p.address_number, p.neighborhood, p.cep, p.reference_point,
             p.father_name, p.mother_name, p.marital_status, p.spouse_name,
             p.education, p.profession, p.conversion_date, p.previous_church, 
             p.oikos_name, p.oikos_name_2
      FROM users u
      LEFT JOIN user_profiles p ON u.id = p.user_id
      WHERE u.cell_id = ? AND u.role IN ('Líder', 'Membro')
      ORDER BY u.role DESC, u.name ASC
    `, [id]);
    
    res.json({
      cell: {
        id: cell.id,
        name: cell.name,
        description: cell.description,
        leader_name: cell.leader_name
      },
      members
    });
  } catch (error) {
    console.error('Erro ao buscar membros da célula:', error);
    res.status(500).json({ error: 'Erro ao buscar membros da célula' });
  }
});

// Deletar célula
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const db = await initDatabase();
    
    await db.run('DELETE FROM cells WHERE id = ?', [id]);
    
    res.json({ message: 'Célula deletada com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar célula:', error);
    res.status(500).json({ error: 'Erro ao deletar célula' });
  }
});

export default router;