import jwt from 'jsonwebtoken';

export default async (req, context) => {
  // Verificar se é uma requisição OPTIONS (preflight)
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': req.headers.get('origin') || 'https://idpb.netlify.app',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Credentials': 'true'
      }
    });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': req.headers.get('origin') || 'https://idpb.netlify.app',
        'Access-Control-Allow-Credentials': 'true'
      }
    });
  }

  try {
    const body = await req.text();
    const { email, password } = JSON.parse(body);

    // Validação básica
    if (!email || !password) {
      return new Response(JSON.stringify({ error: 'Email e senha são obrigatórios' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': req.headers.get('origin') || 'https://idpb.netlify.app',
          'Access-Control-Allow-Credentials': 'true'
        }
      });
    }

    // Credenciais de teste (em produção, usar banco de dados)
    const validCredentials = {
      'admin@idpb.com': 'admin123',
      'pastor@idpb.com': 'pastor123',
      'secretario@idpb.com': 'secretario123'
    };

    if (validCredentials[email] !== password) {
      return new Response(JSON.stringify({ error: 'Credenciais inválidas' }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': req.headers.get('origin') || 'https://idpb.netlify.app',
          'Access-Control-Allow-Credentials': 'true'
        }
      });
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

    return new Response(JSON.stringify({
      success: true,
      token,
      user: {
        email,
        role: email.includes('admin') ? 'admin' : email.includes('pastor') ? 'pastor' : 'secretario'
      }
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': req.headers.get('origin') || 'https://idpb.netlify.app',
        'Access-Control-Allow-Credentials': 'true'
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    return new Response(JSON.stringify({ error: 'Erro interno do servidor' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': req.headers.get('origin') || 'https://idpb.netlify.app',
        'Access-Control-Allow-Credentials': 'true'
      }
    });
  }
};