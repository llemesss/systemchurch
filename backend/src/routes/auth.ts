import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDatabase } from '../database/database';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('🔍 LOGIN DEBUG - Email:', email);
    console.log('🔍 LOGIN DEBUG - Password length:', password?.length);
    
    const db = getDatabase(); // <--- LINHA CORRIGIDA
    
    const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
    console.log('🔍 LOGIN DEBUG - User found:', !!user);
    
    if (!user) {
      console.log('❌ LOGIN DEBUG - User not found');
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }
    
    console.log('🔍 LOGIN DEBUG - Stored password hash:', user.password);
    const validPassword = await bcrypt.compare(password, user.password);
    console.log('🔍 LOGIN DEBUG - Password valid:', validPassword);
    
    if (!validPassword) {
      console.log('❌ LOGIN DEBUG - Invalid password');
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }
    
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'igreja-secret-key',
      { expiresIn: '24h' }
    );
    
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        cell_id: user.cell_id
      }
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Registro público
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone, cell_id } = req.body;
    const db = getDatabase(); // <-- USA A CONEXÃO JÁ EXISTENTE! NÃO CRIA UMA NOVA.
    
    // Verificar se email já existe
    const existingUser = await db.get('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUser) {
      return res.status(400).json({ error: 'Email já está em uso' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const result = await db.run(
      'INSERT INTO users (name, email, password, phone, role, cell_id) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, hashedPassword, phone, 'Membro', cell_id]
    );
    
    const newUser = await db.get(
      'SELECT id, name, email, phone, role, status, cell_id FROM users WHERE id = ?',
      [result.lastID]
    );
    
    res.status(201).json({ user: newUser });
  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({ error: 'Erro ao criar conta' });
  }
});

// Verificar se o usuário está autenticado - ENDPOINT ULTRA RÁPIDO
router.get('/me', authenticateToken, async (req: any, res) => {
  try {
    const db = getDatabase(); // <-- USA A CONEXÃO JÁ EXISTENTE! NÃO CRIA UMA NOVA.
    
    // QUERY ULTRA SIMPLIFICADA: apenas dados essenciais com coluna indexada (id)
    // Esta é a única consulta permitida neste endpoint crítico
    const user = await db.get('SELECT id, name, email, role, cell_id FROM users WHERE id = ?', [req.user.id]);
    
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    
    res.json({ user });
  } catch (error) {
    console.error('Erro na verificação:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Endpoint ULTRA RÁPIDO para verificação de sessão pós-login
// REGRA: Apenas UMA consulta simples com dados essenciais
router.get('/session-check', authenticateToken, async (req: any, res) => {
  try {
    const db = getDatabase(); // <-- USA A CONEXÃO JÁ EXISTENTE! NÃO CRIA UMA NOVA.
    
    // ÚNICA CONSULTA PERMITIDA: buscar dados essenciais usando ID indexado
    const user = await db.get(
      'SELECT id, name, email, role, cell_id FROM users WHERE id = ?', 
      [req.user.id]
    );
    
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    
    // Retornar apenas dados essenciais - sem JOINs, sem cálculos complexos
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      cell_id: user.cell_id
    });
  } catch (error) {
    console.error('Erro na verificação de sessão:', error);
    res.status(500).json({ error: 'Erro na verificação de sessão' });
  }
});

export default router;