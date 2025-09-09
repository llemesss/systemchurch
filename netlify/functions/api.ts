// Caminho: netlify/functions/api.ts

import { Handler } from '@netlify/functions';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import serverless from 'serverless-http';
import { connectDatabase } from '../../backend/src/database/database'; // Caminho corrigido

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
app.use(cors());
app.use(express.json());

// CONECTA À BASE DE DADOS APENAS UMA VEZ!
connectDatabase(); 

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/cells', cellRoutes);
app.use('/api/user-cells', userCellRoutes);
app.use('/api/dependents', dependentsRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/prayers', prayerRoutes);
app.use('/api/prayer-requests', prayerRequestRoutes);

// Handler para Netlify Functions
export const handler: Handler = serverless(app);