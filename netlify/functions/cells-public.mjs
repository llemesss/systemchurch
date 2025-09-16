import { Config } from "@netlify/functions";

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

  if (req.method !== 'GET') {
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
    // Dados de exemplo das células públicas
    const publicCells = [
      {
        id: 1,
        name: 'Célula Esperança',
        leader: 'João Silva',
        day: 'Terça-feira',
        time: '19:30',
        address: 'Rua das Flores, 123 - Centro',
        description: 'Uma célula focada em estudos bíblicos e oração.',
        contact: '(11) 99999-1234'
      },
      {
        id: 2,
        name: 'Célula Vida Nova',
        leader: 'Maria Santos',
        day: 'Quinta-feira',
        time: '20:00',
        address: 'Av. Principal, 456 - Jardim das Rosas',
        description: 'Célula para jovens e adultos, com foco em comunhão.',
        contact: '(11) 99999-5678'
      },
      {
        id: 3,
        name: 'Célula Família Abençoada',
        leader: 'Pedro Oliveira',
        day: 'Sábado',
        time: '15:00',
        address: 'Rua da Paz, 789 - Vila Esperança',
        description: 'Célula familiar com atividades para todas as idades.',
        contact: '(11) 99999-9012'
      }
    ];

    return new Response(JSON.stringify({
      success: true,
      data: publicCells,
      total: publicCells.length
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': req.headers.get('origin') || 'https://idpb.netlify.app',
        'Access-Control-Allow-Credentials': 'true'
      }
    });

  } catch (error) {
    console.error('Cells public error:', error);
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

export const config = {
  path: "/api/cells/public"
};