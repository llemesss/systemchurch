// backend/src/database.ts

import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Variável para guardar a conexão (singleton)
let dbInstance: Pool | null = null;

// A NOVA FUNÇÃO DE CONEXÃO (só roda uma vez)
export const connectDatabase = async () => {
    if (dbInstance) {
        return; // Se já conectado, não faz nada
    }

    try {
        console.log('🐘 Conectando à base de dados PostgreSQL (Neon)...');
        dbInstance = new Pool({
            connectionString: process.env.DATABASE_URL,
        });
        
        // Testa a conexão para garantir que está tudo certo
        await dbInstance.query('SELECT NOW()');

        console.log('✅ Conexão com a base de dados estabelecida com sucesso!');
    } catch (error) {
        console.error('❌ Erro fatal ao conectar com a base de dados:', error);
        // Em caso de erro na conexão, o processo do servidor deve parar.
        process.exit(1); 
    }
};

// A NOVA FUNÇÃO PARA OBTER A CONEXÃO (usada em todas as rotas)
export const getDatabase = () => {
    if (!dbInstance) {
        throw new Error('A base de dados não foi inicializada. A conexão falhou no início.');
    }
    return dbInstance;
};