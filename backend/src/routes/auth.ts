import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { initDatabase } from '../database/database';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('🔍 LOGIN DEBUG - Email:', email);
    console.log('🔍 LOGIN DEBUG - Password length:', password?.length);
    
    const db = await initDatabase();
    
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
    const db = await initDatabase();
    
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

// Verificar token
router.get('/verify', authenticateToken, async (req: any, res) => {
  try {
    const db = await initDatabase();
    const user = await db.get('SELECT id, name, email, role, status, cell_id FROM users WHERE id = ?', [req.user.id]);
    
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    
    res.json({ user });
  } catch (error) {
    console.error('Erro na verificação:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;