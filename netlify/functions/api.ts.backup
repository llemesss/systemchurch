// Caminho: netlify/functions/api.ts

import { Handler } from '@netlify/functions';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import serverless from 'serverless-http';
import { connectDatabase, getDatabase } from '../../backend/src/database/database'; // Caminho corrigido

// Importação das suas rotas
import authRoutes from '../../backend/src/routes/auth';
import userRoutes from '../../backend/src/routes/users';
import cellRoutes from '../../backend/src/routes/cells';
import userCellRoutes from '../../backend/src/routes/user-cells';
import dependentsRoutes from '../../backend/src/routes/dependents';
import profileRoutes from '../../backend/src/routes/profile';
import prayerRoutes from '../../backend/src/routes/prayers';
import prayerRequestRoutes from '../../backend/src/routes/prayer-requests';

dotenv.config();
const app = express();

// Configurações de CORS e Middlewares
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['https://idpb.netlify.app', 'http://localhost:5173', 'http://localhost:5174'];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json());

// CONECTA À BASE DE DADOS APENAS UMA VEZ!
connectDatabase(); 

// Rota de health check
app.get('/health', async (req, res) => {
  try {
    const db = getDatabase();
    res.json({ 
      status: 'OK', 
      message: 'Netlify Functions funcionando',
      environment: process.env.NODE_ENV || 'production',
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

// Rotas da API (sem o prefixo /api pois já está na URL da function)
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/cells', cellRoutes);
app.use('/user-cells', userCellRoutes);
app.use('/dependents', dependentsRoutes);
app.use('/profile', profileRoutes);
app.use('/prayers', prayerRoutes);
app.use('/prayer-requests', prayerRequestRoutes);

// Handler para Netlify Functions
export const handler: Handler = serverless(app);