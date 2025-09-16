// Versão JavaScript simples para teste
const express = require('express');
const cors = require('cors');
const serverless = require('serverless-http');

const app = express();

// Configurações de CORS
const allowedOrigins = [
  'https://idpb.netlify.app',
  'http://localhost:5173',
  'http://localhost:5174'
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

app.use(express.json());

// Rota de health check simples
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Netlify Functions funcionando (JS)',
    timestamp: new Date().toISOString()
  });
});

// Rota de teste para auth
app.post('/auth/login', (req, res) => {
  res.json({ 
    message: 'Endpoint de login funcionando',
    received: req.body
  });
});

// Handler para Netlify Functions
exports.handler = serverless(app);