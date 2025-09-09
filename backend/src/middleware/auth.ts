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
    // Verificar token JWT do backend
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return res.status(500).json({ error: 'Configuração de autenticação não encontrada' });
    }

    const decoded = jwt.verify(token, jwtSecret) as any;
    
    // Buscar o usuário na base de dados para garantir que ainda existe
    const db = await initDatabase();
    const user = await db.get('SELECT * FROM users WHERE id = ?', [decoded.id]);
    
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado na base de dados' });
    }

    // Criar objeto de usuário
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name
    };
    
    next();
  } catch (error) {
    console.error('Erro na autenticação:', error);
    return res.status(403).json({ error: 'Token inválido' });
  }
};

export default authenticateToken;