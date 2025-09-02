import { initDatabase as initSQLite } from './database';
import { initPostgresDatabase } from './postgres';

// Tipo unificado para o banco de dados
export interface DatabaseAdapter {
  get: (sql: string, params?: any[]) => Promise<any>;
  all: (sql: string, params?: any[]) => Promise<any[]>;
  run: (sql: string, params?: any[]) => Promise<{ lastID?: number; changes: number }>;
  exec: (sql: string) => Promise<void>;
}

// Função principal que retorna o adaptador correto
export async function initDatabase(): Promise<DatabaseAdapter> {
  const isProduction = process.env.NODE_ENV === 'production';
  const databaseUrl = process.env.DATABASE_URL;
  
  if (isProduction && databaseUrl) {
    console.log('🐘 Inicializando PostgreSQL para produção...');
    return await initPostgresDatabase();
  } else {
    console.log('🗄️ Inicializando SQLite para desenvolvimento...');
    return await initSQLite();
  }
}

// Re-exportar funções úteis
export { checkDatabaseHealth, closeDatabase } from './postgres';

// Função para verificar se está usando PostgreSQL
export function isUsingPostgreSQL(): boolean {
  return process.env.NODE_ENV === 'production' && !!process.env.DATABASE_URL;
}