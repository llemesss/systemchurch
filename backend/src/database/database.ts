// backend/src/database.ts

import { Pool } from 'pg';
import Database from 'better-sqlite3';
import dotenv from 'dotenv';

dotenv.config();

// Variável para guardar a conexão (singleton)
let dbInstance: Pool | Database.Database | null = null;
let isPostgreSQL = false;

// Interface para padronizar os métodos do banco
export interface DatabaseAdapter {
  get: (sql: string, params?: any[]) => Promise<any>;
  all: (sql: string, params?: any[]) => Promise<any[]>;
  run: (sql: string, params?: any[]) => Promise<{ lastID?: number; changes: number }>;
  exec: (sql: string) => Promise<void>;
  query: (sql: string, params?: any[]) => Promise<any>;
}

// A NOVA FUNÇÃO DE CONEXÃO (só roda uma vez)
export const connectDatabase = async () => {
    if (dbInstance) {
        return; // Se já conectado, não faz nada
    }

    const databaseUrl = process.env.DATABASE_URL;
    
    if (!databaseUrl) {
        throw new Error('DATABASE_URL não está definida no arquivo .env');
    }

    try {
        if (databaseUrl.startsWith('sqlite:')) {
            // Usar SQLite
            console.log('🗃️ Conectando à base de dados SQLite...');
            const dbPath = databaseUrl.replace('sqlite:', '');
            dbInstance = new Database(dbPath);
            isPostgreSQL = false;
            console.log('✅ Conexão com SQLite estabelecida com sucesso!');
        } else {
            // Usar PostgreSQL
            console.log('🐘 Conectando à base de dados PostgreSQL (Neon)...');
            dbInstance = new Pool({
                connectionString: databaseUrl,
            });
            isPostgreSQL = true;
            
            // Testa a conexão para garantir que está tudo certo
            await (dbInstance as Pool).query('SELECT NOW()');
            console.log('✅ Conexão com PostgreSQL estabelecida com sucesso!');
        }
    } catch (error) {
        console.error('❌ Erro fatal ao conectar com a base de dados:', error);
        // Em caso de erro na conexão, o processo do servidor deve parar.
        process.exit(1); 
    }
};

// A NOVA FUNÇÃO PARA OBTER A CONEXÃO (usada em todas as rotas)
export const getDatabase = (): DatabaseAdapter => {
    if (!dbInstance) {
        throw new Error('A base de dados não foi inicializada. A conexão falhou no início.');
    }
    
    if (isPostgreSQL) {
        // Adapter para PostgreSQL
        const pgInstance = dbInstance as Pool;
        return {
            async get(sql: string, params?: any[]) {
                const result = await pgInstance.query(sql, params);
                return result.rows[0] || null;
            },
            async all(sql: string, params?: any[]) {
                const result = await pgInstance.query(sql, params);
                return result.rows;
            },
            async run(sql: string, params?: any[]) {
                const result = await pgInstance.query(sql, params);
                return { 
                    lastID: result.rows[0]?.id || null, 
                    changes: result.rowCount || 0 
                };
            },
            async exec(sql: string) {
                await pgInstance.query(sql);
            },
            async query(sql: string, params?: any[]) {
                return await pgInstance.query(sql, params);
            }
        };
    } else {
        // Adapter para SQLite
        const sqliteInstance = dbInstance as Database.Database;
        return {
            async get(sql: string, params?: any[]) {
                return sqliteInstance.prepare(sql).get(params);
            },
            async all(sql: string, params?: any[]) {
                return sqliteInstance.prepare(sql).all(params);
            },
            async run(sql: string, params?: any[]) {
                const result = sqliteInstance.prepare(sql).run(params);
                return { 
                    lastID: result.lastInsertRowid as number, 
                    changes: result.changes 
                };
            },
            async exec(sql: string) {
                sqliteInstance.exec(sql);
            },
            async query(sql: string, params?: any[]) {
                // Para compatibilidade, retorna no formato PostgreSQL
                const result = sqliteInstance.prepare(sql).all(params);
                return { rows: result };
            }
        };
    }
};