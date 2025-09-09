import { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import serverless from 'serverless-http';
import { initDatabase, checkDatabaseHealth, isUsingPostgreSQL } from '../../backend/src/database';
import authRoutes from '../../backend/src/routes/auth';
import userRoutes from '../../backend/src/routes/users';
import cellRoutes from '../../backend/src/routes/cells';
import userCellRoutes from '../../backend/src/routes/user-cells';
import dependentsRoutes from '../../backend/src/routes/dependents';
import profileRoutes from '../../backend/src/routes/profile';
import prayerRoutes from '../../backend/src/routes/prayers';
import prayerRequestRoutes from '../../backend/src/routes/prayer-requests';

// Carregar variáveis de ambiente
dotenv.config();

const app = express();

// Configuração de CORS dinâmica
const getAllowedOrigins = () => {
  const envOrigins = process.env.ALLOWED_ORIGINS;
  const defaultOrigins = [
    'https://*.netlify.app', // Permite qualquer subdomínio do Netlify
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:3000'
  ];
  
  if (envOrigins) {
    return [...defaultOrigins, ...envOrigins.split(',').map(origin => origin.trim())];
  }
  
  return defaultOrigins;
};

const allowedOrigins = getAllowedOrigins();

app.use(cors({
  origin: (origin, callback) => {
    // Permitir requisições sem origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    // Verificar se a origin está na lista ou é um domínio Netlify
    const isAllowed = allowedOrigins.some(allowedOrigin => {
      if (allowedOrigin.includes('*')) {
        const pattern = allowedOrigin.replace('*', '.*');
        return new RegExp(pattern).test(origin);
      }
      return allowedOrigin === origin;
    });
    
    if (isAllowed || origin.includes('.netlify.app')) {
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

// Rotas da API
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
      message: 'API funcionando no Netlify',
      database: dbHealth,
      environment: process.env.NODE_ENV || 'production',
      databaseType: isUsingPostgreSQL() ? 'PostgreSQL' : 'SQLite',
      timestamp: new Date().toISOString(),
      platform: 'Netlify Functions'
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
    message: 'API Igreja App - Netlify Functions',
    version: '1.0.0',
    platform: 'Netlify',
    endpoints: [
      '/.netlify/functions/api/health',
      '/.netlify/functions/api/auth',
      '/.netlify/functions/api/users',
      '/.netlify/functions/api/cells',
      '/.netlify/functions/api/profile'
    ]
  });
});

// Converter Express app para Netlify Function
const serverlessApp = serverless(app);

// Handler para Netlify Functions
export const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  // Log para debug
  console.log('Netlify Function chamada:', {
    path: event.path,
    httpMethod: event.httpMethod,
    headers: event.headers
  });

  try {
    const result = await serverlessApp(event, context);
    return result;
  } catch (error) {
    console.error('Erro na Netlify Function:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Erro interno do servidor',
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      })
    };
  }
};