import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDatabase, checkDatabaseHealth, isUsingPostgreSQL } from '../src/database';
import authRoutes from '../src/routes/auth';
import userRoutes from '../src/routes/users';
import cellRoutes from '../src/routes/cells';
import userCellRoutes from '../src/routes/user-cells';
import dependentsRoutes from '../src/routes/dependents';
import profileRoutes from '../src/routes/profile';
import prayerRoutes from '../src/routes/prayers';
import prayerRequestRoutes from '../src/routes/prayer-requests';

// Carregar variáveis de ambiente
dotenv.config();

const app = express();

// Configurar CORS para Vercel
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',')
  : [
      'https://*.vercel.app', // Permite qualquer subdomínio do Vercel
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:3000'
    ];

app.use(cors({
  origin: (origin, callback) => {
    // Permitir requisições sem origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    // Verificar se a origin está na lista ou é um domínio Vercel
    const isAllowed = allowedOrigins.some(allowedOrigin => {
      if (allowedOrigin.includes('*')) {
        const pattern = allowedOrigin.replace('*', '.*');
        return new RegExp(pattern).test(origin);
      }
      return allowedOrigin === origin;
    });
    
    if (isAllowed || origin.includes('.vercel.app')) {
      callback(null, true);
    } else {
      callback(new Error('Não permitido pelo CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());

// Inicializar banco de dados
let dbInitialized = false;

async function ensureDbInitialized() {
  if (!dbInitialized) {
    await initDatabase();
    dbInitialized = true;
  }
}

// Middleware para garantir que o DB está inicializado
app.use(async (req, res, next) => {
  await ensureDbInitialized();
  next();
});

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/cells', cellRoutes);
app.use('/api/user-cells', userCellRoutes);
app.use('/api/dependents', dependentsRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/prayers', prayerRoutes);
app.use('/api/prayer-requests', prayerRequestRoutes);

// Rota de health check
app.get('/api/health', async (req, res) => {
  try {
    const dbHealth = await checkDatabaseHealth();
    res.json({ 
      status: 'OK', 
      message: 'Servidor funcionando no Vercel',
      database: dbHealth,
      environment: process.env.NODE_ENV || 'production',
      databaseType: isUsingPostgreSQL() ? 'PostgreSQL' : 'SQLite',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erro no health check:', error);
    res.status(500).json({ 
      status: 'ERROR', 
      message: 'Erro no servidor',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
});

// Rota raiz
app.get('/', (req, res) => {
  res.json({ 
    message: 'API Igreja App - Vercel Deployment',
    version: '1.0.0',
    endpoints: [
      '/api/health',
      '/api/auth',
      '/api/users',
      '/api/cells',
      '/api/profile'
    ]
  });
});

// Export para Vercel
export default app;