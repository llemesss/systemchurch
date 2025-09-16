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

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
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

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        data: publicCells,
        total: publicCells.length
      })
    };

  } catch (error) {
    console.error('Cells public error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Erro interno do servidor' })
    };
  }
};