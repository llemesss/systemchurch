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

  // Resposta principal
  return new Response(JSON.stringify({ status: 'ok', message: 'API is healthy' }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': req.headers.get('origin') || 'https://idpb.netlify.app',
      'Access-Control-Allow-Credentials': 'true'
    }
  });
};

export const config = {
  path: "/api/health"
};