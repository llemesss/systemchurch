import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { initDatabase } from '../database/database';

interface AuthRequest extends Request {
  user?: any;
}

export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token de acesso requerido' });
  }

  try {
    // Primeiro, tentar verificar como token JWT do backend
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'igreja-secret-key') as any;
      req.user = decoded;
      return next();
    } catch (backendTokenError) {
      // Se falhar, tentar como token do Supabase
      console.log('Token não é do backend, tentando Supabase...');
    }

    // Verificar token do Supabase
    const supabaseJwtSecret = process.env.SUPABASE_JWT_SECRET;
    if (!supabaseJwtSecret) {
      return res.status(500).json({ error: 'Configuração de autenticação não encontrada' });
    }

    const decoded = jwt.verify(token, supabaseJwtSecret) as any;
    
    // Para tokens do Supabase, precisamos buscar o usuário na nossa base de dados
    const db = await initDatabase();
    const user = await db.get('SELECT * FROM users WHERE auth_id = ?', [decoded.sub]);
    
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado na base de dados' });
    }

    // Criar objeto de usuário compatível
    req.user = {
      id: user.id,
      auth_id: user.auth_id,
      email: user.email,
      role: user.role
    };
    
    next();
  } catch (error) {
    console.error('Erro na autenticação:', error);
    return res.status(403).json({ error: 'Token inválido' });
  }
};

export default authenticateToken;