export default async (req, context) => {
  // Verificar se é uma requisição OPTIONS (preflight)
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': req.headers.get('origin') || 'https://idpb.netlify.app',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
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
    const body = await req.json();
    const { email, password } = body;

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

    // Simulação de autenticação (substituir por lógica real)
    if (email === 'admin@idpb.com' && password === 'admin123') {
      return new Response(JSON.stringify({
        success: true,
        user: {
          id: 1,
          email: 'admin@idpb.com',
          name: 'Administrador',
          role: 'admin'
        },
        token: 'mock-jwt-token'
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': req.headers.get('origin') || 'https://idpb.netlify.app',
          'Access-Control-Allow-Credentials': 'true'
        }
      });
    } else {
      return new Response(JSON.stringify({ error: 'Credenciais inválidas' }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': req.headers.get('origin') || 'https://idpb.netlify.app',
          'Access-Control-Allow-Credentials': 'true'
        }
      });
    }

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