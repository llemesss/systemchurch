import express from 'express';
import bcrypt from 'bcryptjs';
import { getDatabase } from '../database/database';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Listar todos os usuários
router.get('/', authenticateToken, async (req, res) => {
  try {
    const db = getDatabase(); // <-- USA A CONEXÃO JÁ EXISTENTE! NÃO CRIA UMA NOVA.
    const users = await db.all(`
      SELECT u.id, u.name, u.email, u.phone, u.role, u.status, u.created_at,
             u.cell_id
      FROM users u
      ORDER BY u.created_at DESC
    `);
    res.json(users);
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    res.status(500).json({ error: 'Erro ao buscar usuários' });
  }
});

// Criar novo usuário
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;
    const db = getDatabase(); // <-- USA A CONEXÃO JÁ EXISTENTE! NÃO CRIA UMA NOVA.
    
    // Verificar se email já existe
    const existingUser = await db.get('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUser) {
      return res.status(400).json({ error: 'Email já está em uso' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const result = await db.run(
      'INSERT INTO users (name, email, password, phone, role) VALUES (?, ?, ?, ?, ?)',
      [name, email, hashedPassword, phone, role]
    );
    
    const newUser = await db.get(`
      SELECT u.id, u.name, u.email, u.phone, u.role, u.status, u.created_at,
             uc.cell_id
      FROM users u
      LEFT JOIN user_cells uc ON u.id = uc.user_id
      WHERE u.id = ?
    `, [result.lastID]);
    
    res.status(201).json(newUser);
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    res.status(500).json({ error: 'Erro ao criar usuário' });
  }
});

// Atualizar usuário
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, role, status, cell_id } = req.body;
    
    // DEBUG: Verificar dados recebidos no backend
    console.log('📥 BACKEND - Parâmetros recebidos:', { id });
    console.log('📥 BACKEND - Body recebido:', req.body);
    console.log('📥 BACKEND - cell_id recebido:', cell_id);
    
    const db = getDatabase(); // <-- USA A CONEXÃO JÁ EXISTENTE! NÃO CRIA UMA NOVA.
    
    // Atualizar dados básicos do usuário (incluindo cell_id)
    console.log('🔧 BACKEND - Executando UPDATE na tabela users com cell_id:', cell_id);
    console.log('🔧 BACKEND - Parâmetros do UPDATE:', [name, email, phone, role, status, cell_id, id]);
    
    const updateResult = await db.run(
      'UPDATE users SET name = ?, email = ?, phone = ?, role = ?, status = ?, cell_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [name, email, phone, role, status, cell_id, id]
    );
    
    console.log('✅ BACKEND - UPDATE executado. Linhas afetadas:', updateResult.changes);
    
    // Verificar se o cell_id foi realmente salvo
    const verifyUser = await db.get('SELECT id, name, cell_id FROM users WHERE id = ?', [id]);
    console.log('🔍 BACKEND - Verificação pós-UPDATE:', verifyUser);
    
    // Gerenciar associação com célula se cell_id foi fornecido
    if (cell_id !== undefined) {
      // Remover leader_id das células onde este utilizador era líder
      await db.run('UPDATE cells SET leader_id = NULL WHERE leader_id = ?', [id]);
      
      // Remover associações existentes do usuário
      await db.run('DELETE FROM user_cells WHERE user_id = ?', [id]);
      
      // Se cell_id não é null, criar nova associação
      if (cell_id) {
        const cellRole = role === 'Líder' ? 'Líder' : 'Membro';
        await db.run(
          'INSERT INTO user_cells (user_id, cell_id, role) VALUES (?, ?, ?)',
          [id, cell_id, cellRole]
        );
        
        // Se o utilizador é líder, atualizar o leader_id na tabela cells
        if (role === 'Líder') {
          await db.run(
            'UPDATE cells SET leader_id = ? WHERE id = ?',
            [id, cell_id]
          );
        }
        
        // cell_id já foi atualizado na query principal acima
      }
    }
    
    const updatedUser = await db.get(`
      SELECT u.id, u.name, u.email, u.phone, u.role, u.status, u.created_at,
             u.cell_id
      FROM users u
      WHERE u.id = ?
    `, [id]);
    
    res.json(updatedUser);
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({ error: 'Erro ao atualizar usuário' });
  }
});

// Resetar senha do usuário
router.put('/:id/password', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { password } = req.body;
    const db = getDatabase(); // <-- USA A CONEXÃO JÁ EXISTENTE! NÃO CRIA UMA NOVA.
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    await db.run(
      'UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [hashedPassword, id]
    );
    
    res.json({ message: 'Senha atualizada com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar senha:', error);
    res.status(500).json({ error: 'Erro ao atualizar senha' });
  }
});

// Obter estatísticas de oração de um usuário
router.get('/:id/prayer-stats', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDatabase(); // <-- USA A CONEXÃO JÁ EXISTENTE! NÃO CRIA UMA NOVA.
    
    // Verificar se o usuário existe
    const user = await db.get('SELECT id, name FROM users WHERE id = ?', [id]);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    
    // Verificar se orou hoje
    const prayedTodayResult = await db.get(
      'SELECT COUNT(*) as count FROM prayer_logs WHERE user_id = ? AND prayer_date = ?',
      [id, today]
    );
    const prayedToday = prayedTodayResult.count > 0;
    
    // Calcular data de início da semana (segunda-feira)
    const now = new Date();
    const dayOfWeek = now.getDay();
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Domingo = 0, então 6 dias atrás
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - daysToMonday);
    const weekStart = startOfWeek.toISOString().split('T')[0];
    
    // Calcular início do mês
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    
    // Calcular início do ano
    const startOfYear = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0];
    
    // Contar orações da semana
    const weeklyResult = await db.get(
      'SELECT COUNT(*) as count FROM prayer_logs WHERE user_id = ? AND prayer_date >= ?',
      [id, weekStart]
    );
    
    // Contar orações do mês
    const monthlyResult = await db.get(
      'SELECT COUNT(*) as count FROM prayer_logs WHERE user_id = ? AND prayer_date >= ?',
      [id, startOfMonth]
    );
    
    // Contar orações do ano
    const yearlyResult = await db.get(
      'SELECT COUNT(*) as count FROM prayer_logs WHERE user_id = ? AND prayer_date >= ?',
      [id, startOfYear]
    );
    
    res.json({
      user: {
        id: user.id,
        name: user.name
      },
      prayedToday,
      weeklyCount: weeklyResult.count,
      monthlyCount: monthlyResult.count,
      yearlyCount: yearlyResult.count
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas de oração:', error);
    res.status(500).json({ error: 'Erro ao buscar estatísticas de oração' });
  }
});

// Deletar usuário
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const db = getDatabase();
    
    await db.run('DELETE FROM users WHERE id = ?', [id]);
    
    res.json({ message: 'Usuário deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar usuário:', error);
    res.status(500).json({ error: 'Erro ao deletar usuário' });
  }
});

export default router;