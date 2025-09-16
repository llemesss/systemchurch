import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDatabase, getDatabase } from './database/database';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import cellRoutes from './routes/cells';
import userCellRoutes from './routes/user-cells';
import dependentsRoutes from './routes/dependents';
import profileRoutes from './routes/profile';
import prayerRoutes from './routes/prayers';
import prayerRequestRoutes from './routes/prayer-requests';

// Carregar variáveis de ambiente
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Configurar CORS baseado no ambiente
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:5173', 'http://localhost:5174', 'https://idpb.netlify.app'];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json());

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
    const db = getDatabase();
    // Usar all() sem parâmetros para SQLite
    await db.all("SELECT datetime('now') as current_time", []);
    res.json({ 
      status: 'OK', 
      message: 'Servidor funcionando',
      database: 'Connected',
      environment: process.env.NODE_ENV || 'development',
      databaseType: 'SQLite',
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

// Inicializar banco de dados e servidor
async function startServer() {
  try {
    await connectDatabase();
    console.log('✅ Banco de dados inicializado');
    
    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('❌ Erro ao inicializar servidor:', error);
    process.exit(1);
  }
}

startServer();