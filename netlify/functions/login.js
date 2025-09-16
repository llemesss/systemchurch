const jwt = require('jsonwebtoken');

exports.handler = async (event, context) => {
  // Headers CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { email, password } = JSON.parse(event.body);

    // Validação básica
    if (!email || !password) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Email e senha são obrigatórios' })
      };
    }

    // Credenciais de teste (em produção, usar banco de dados)
    const validCredentials = {
      'admin@idpb.com': 'admin123',
      'pastor@idpb.com': 'pastor123',
      'secretario@idpb.com': 'secretario123'
    };

    if (validCredentials[email] !== password) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Credenciais inválidas' })
      };
    }

    // Gerar JWT
    const token = jwt.sign(
      { 
        email,
        role: email.includes('admin') ? 'admin' : email.includes('pastor') ? 'pastor' : 'secretario'
      },
      process.env.JWT_SECRET || 'fallback-secret-key',
      { expiresIn: '24h' }
    );

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        token,
        user: {
          email,
          role: email.includes('admin') ? 'admin' : email.includes('pastor') ? 'pastor' : 'secretario'
        }
      })
    };

  } catch (error) {
    console.error('Login error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Erro interno do servidor' })
    };
  }
};