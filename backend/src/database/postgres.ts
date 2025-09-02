import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

export async function initPostgresDatabase() {
  try {
    // Testar conexão
    await pool.query('SELECT NOW()');
    console.log('✅ Conectado ao PostgreSQL com sucesso');
    
    return {
      get: async (sql: string, params: any[] = []) => {
        try {
          const result = await pool.query(sql, params);
          return result.rows[0];
        } catch (error) {
          console.error('Erro na query GET:', error);
          throw error;
        }
      },
      
      all: async (sql: string, params: any[] = []) => {
        try {
          const result = await pool.query(sql, params);
          return result.rows;
        } catch (error) {
          console.error('Erro na query ALL:', error);
          throw error;
        }
      },
      
      run: async (sql: string, params: any[] = []) => {
        try {
          const result = await pool.query(sql, params);
          return { 
            lastID: result.rows[0]?.id, 
            changes: result.rowCount || 0 
          };
        } catch (error) {
          console.error('Erro na query RUN:', error);
          throw error;
        }
      },
      
      exec: async (sql: string) => {
        try {
          await pool.query(sql);
        } catch (error) {
          console.error('Erro na query EXEC:', error);
          throw error;
        }
      }
    };
  } catch (error) {
    console.error('❌ Erro ao conectar com PostgreSQL:', error);
    throw error;
  }
}

// Função para fechar conexões (útil para testes)
export async function closeDatabase() {
  await pool.end();
}

// Função para verificar saúde do banco
export async function checkDatabaseHealth() {
  try {
    const result = await pool.query('SELECT NOW() as current_time, version() as version');
    return {
      status: 'healthy',
      timestamp: result.rows[0].current_time,
      version: result.rows[0].version
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}