import express from 'express';
import { getDatabase } from '../database/database';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Criar pedido de oração
router.post('/', authenticateToken, async (req: any, res) => {
  try {
    const {
      title,
      description,
      category,
      is_anonymous = false,
      is_public = false,
      urgency = 'normal'
    } = req.body;
    
    const db = getDatabase(); // <-- USA A CONEXÃO JÁ EXISTENTE! NÃO CRIA UMA NOVA.
    
    // Criar tabela se não existir
    await db.exec(`
      CREATE TABLE IF NOT EXISTS prayer_requests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        category TEXT CHECK (category IN ('saude', 'familia', 'trabalho', 'espiritual', 'financeiro', 'outros')) DEFAULT 'espiritual',
        is_anonymous BOOLEAN DEFAULT 0,
        is_public BOOLEAN DEFAULT 0,
        urgency TEXT CHECK (urgency IN ('baixa', 'normal', 'alta', 'urgente')) DEFAULT 'normal',
        status TEXT CHECK (status IN ('ativo', 'respondido', 'cancelado')) DEFAULT 'ativo',
        prayer_count INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);
    
    const result = await db.run(
      `INSERT INTO prayer_requests (user_id, title, description, category, is_anonymous, is_public, urgency)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [req.user.id, title, description, category, is_anonymous, is_public, urgency]
    );
    
    const newRequest = await db.get(
      `SELECT pr.*, u.name as author_name
       FROM prayer_requests pr
       LEFT JOIN users u ON pr.user_id = u.id
       WHERE pr.id = ?`,
      [result.lastID]
    );
    
    res.status(201).json({
      ...newRequest,
      author_name: newRequest.is_anonymous ? 'Anônimo' : newRequest.author_name
    });
  } catch (error) {
    console.error('Erro ao criar pedido de oração:', error);
    res.status(500).json({ error: 'Erro ao criar pedido de oração' });
  }
});

// Listar pedidos de oração públicos
router.get('/public', async (req, res) => {
  try {
    const { category, page = 1, limit = 10 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    
    const db = getDatabase(); // <-- USA A CONEXÃO JÁ EXISTENTE! NÃO CRIA UMA NOVA.
    
    let whereClause = 'WHERE pr.is_public = 1 AND pr.status = "ativo"';
    const params: any[] = [];
    
    if (category && category !== 'todos') {
      whereClause += ' AND pr.category = ?';
      params.push(category);
    }
    
    const requests = await db.all(
      `SELECT pr.*, u.name as author_name,
              COUNT(prl.id) as prayer_count
       FROM prayer_requests pr
       LEFT JOIN users u ON pr.user_id = u.id
       LEFT JOIN prayer_request_logs prl ON pr.id = prl.request_id
       ${whereClause}
       GROUP BY pr.id
       ORDER BY pr.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, Number(limit), offset]
    );
    
    const formattedRequests = requests.map(request => ({
      ...request,
      author_name: request.is_anonymous ? 'Anônimo' : request.author_name
    }));
    
    res.json(formattedRequests);
  } catch (error) {
    console.error('Erro ao listar pedidos públicos:', error);
    res.status(500).json({ error: 'Erro ao listar pedidos públicos' });
  }
});

// Listar pedidos do usuário logado
router.get('/my-requests', authenticateToken, async (req: any, res) => {
  try {
    const db = getDatabase(); // <-- USA A CONEXÃO JÁ EXISTENTE! NÃO CRIA UMA NOVA.
    
    const requests = await db.all(
      `SELECT pr.*, COUNT(prl.id) as prayer_count
       FROM prayer_requests pr
       LEFT JOIN prayer_request_logs prl ON pr.id = prl.request_id
       WHERE pr.user_id = ?
       GROUP BY pr.id
       ORDER BY pr.created_at DESC`,
      [req.user.id]
    );
    
    res.json(requests);
  } catch (error) {
    console.error('Erro ao listar meus pedidos:', error);
    res.status(500).json({ error: 'Erro ao listar meus pedidos' });
  }
});

// Orar por um pedido específico
router.post('/:id/pray', authenticateToken, async (req: any, res) => {
  try {
    const { id } = req.params;
    const db = getDatabase(); // <-- USA A CONEXÃO JÁ EXISTENTE! NÃO CRIA UMA NOVA.
    
    // Criar tabela de logs de oração se não existir
    await db.exec(`
      CREATE TABLE IF NOT EXISTS prayer_request_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        request_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        prayed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (request_id) REFERENCES prayer_requests(id),
        FOREIGN KEY (user_id) REFERENCES users(id),
        UNIQUE(request_id, user_id, DATE(prayed_at))
      )
    `);
    
    // Verificar se já orou hoje por este pedido
    const today = new Date().toISOString().split('T')[0];
    const existingPrayer = await db.get(
      `SELECT id FROM prayer_request_logs 
       WHERE request_id = ? AND user_id = ? AND DATE(prayed_at) = ?`,
      [id, req.user.id, today]
    );
    
    if (existingPrayer) {
      return res.status(400).json({ error: 'Você já orou por este pedido hoje' });
    }
    
    // Registrar a oração
    await db.run(
      `INSERT INTO prayer_request_logs (request_id, user_id) VALUES (?, ?)`,
      [id, req.user.id]
    );
    
    // Atualizar contador de orações
    await db.run(
      `UPDATE prayer_requests 
       SET prayer_count = (SELECT COUNT(*) FROM prayer_request_logs WHERE request_id = ?),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [id, id]
    );
    
    res.json({ message: 'Oração registrada com sucesso' });
  } catch (error) {
    console.error('Erro ao registrar oração:', error);
    res.status(500).json({ error: 'Erro ao registrar oração' });
  }
});

// Atualizar pedido de oração
router.put('/:id', authenticateToken, async (req: any, res) => {
  try {
    const { id } = req.params;
    const { title, description, category, is_public, urgency, status } = req.body;
    
    const db = getDatabase(); // <-- USA A CONEXÃO JÁ EXISTENTE! NÃO CRIA UMA NOVA.
    
    // Verificar se o pedido pertence ao usuário
    const request = await db.get(
      'SELECT user_id FROM prayer_requests WHERE id = ?',
      [id]
    );
    
    if (!request) {
      return res.status(404).json({ error: 'Pedido não encontrado' });
    }
    
    if (request.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Não autorizado' });
    }
    
    await db.run(
      `UPDATE prayer_requests 
       SET title = ?, description = ?, category = ?, is_public = ?, urgency = ?, status = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [title, description, category, is_public, urgency, status, id]
    );
    
    const updatedRequest = await db.get(
      `SELECT pr.*, u.name as author_name
       FROM prayer_requests pr
       LEFT JOIN users u ON pr.user_id = u.id
       WHERE pr.id = ?`,
      [id]
    );
    
    res.json(updatedRequest);
  } catch (error) {
    console.error('Erro ao atualizar pedido:', error);
    res.status(500).json({ error: 'Erro ao atualizar pedido' });
  }
});

// Deletar pedido de oração
router.delete('/:id', authenticateToken, async (req: any, res) => {
  try {
    const { id } = req.params;
    const db = getDatabase(); // <-- USA A CONEXÃO JÁ EXISTENTE! NÃO CRIA UMA NOVA.
    
    // Verificar se o pedido pertence ao usuário
    const request = await db.get(
      'SELECT user_id FROM prayer_requests WHERE id = ?',
      [id]
    );
    
    if (!request) {
      return res.status(404).json({ error: 'Pedido não encontrado' });
    }
    
    if (request.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Não autorizado' });
    }
    
    // Deletar logs relacionados
    await db.run('DELETE FROM prayer_request_logs WHERE request_id = ?', [id]);
    
    // Deletar o pedido
    await db.run('DELETE FROM prayer_requests WHERE id = ?', [id]);
    
    res.json({ message: 'Pedido deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar pedido:', error);
    res.status(500).json({ error: 'Erro ao deletar pedido' });
  }
});

// Obter estatísticas de pedidos de oração
router.get('/stats', authenticateToken, async (req: any, res) => {
  try {
    const db = await initDatabase();
    
    const stats = await db.get(`
      SELECT 
        COUNT(*) as total_requests,
        COUNT(CASE WHEN is_public = 1 THEN 1 END) as public_requests,
        COUNT(CASE WHEN status = 'ativo' THEN 1 END) as active_requests,
        COUNT(CASE WHEN status = 'respondido' THEN 1 END) as answered_requests,
        SUM(prayer_count) as total_prayers
      FROM prayer_requests
    `);
    
    res.json(stats);
  } catch (error) {
    console.error('Erro ao obter estatísticas:', error);
    res.status(500).json({ error: 'Erro ao obter estatísticas' });
  }
});

export default router;