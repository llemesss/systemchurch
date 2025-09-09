const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

// Configuração da conexão com Neon
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function runMigration() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Iniciando migração para Neon PostgreSQL...');
    
    // Ler o arquivo SQL de migração
    const migrationPath = path.join(__dirname, 'neon-migration.sql');
    let migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Gerar hashes de senha reais para os usuários padrão
    const pastorHash = await bcrypt.hash('pastor123', 10);
    const adminHash = await bcrypt.hash('admin123', 10);
    const membroHash = await bcrypt.hash('membro123', 10);
    
    // Substituir os hashes de exemplo pelos reais
    migrationSQL = migrationSQL.replace(/\$2a\$10\$example\.hash\.here/g, pastorHash);
    migrationSQL = migrationSQL.replace(
      "VALUES ('Administrador', 'admin@igreja.com', '$2a$10$example.hash.here'",
      `VALUES ('Administrador', 'admin@igreja.com', '${adminHash}'`
    );
    migrationSQL = migrationSQL.replace(
      "VALUES ('Membro Teste', 'membro@teste.com', '$2a$10$example.hash.here'",
      `VALUES ('Membro Teste', 'membro@teste.com', '${membroHash}'`
    );
    
    // Dividir o SQL em comandos individuais
    const commands = migrationSQL
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));
    
    console.log(`📝 Executando ${commands.length} comandos SQL...`);
    
    // Executar cada comando
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];
      if (command.toLowerCase().includes('commit')) continue;
      
      try {
        await client.query(command);
        console.log(`✅ Comando ${i + 1}/${commands.length} executado com sucesso`);
      } catch (error) {
        console.error(`❌ Erro no comando ${i + 1}:`, error.message);
        console.error('Comando:', command.substring(0, 100) + '...');
        // Continuar com os próximos comandos mesmo se um falhar
      }
    }
    
    // Verificar se as tabelas foram criadas
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log('\n📊 Tabelas criadas:');
    tablesResult.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });
    
    // Verificar dados iniciais
    const usersCount = await client.query('SELECT COUNT(*) FROM users');
    const cellsCount = await client.query('SELECT COUNT(*) FROM cells');
    
    console.log('\n📈 Dados iniciais:');
    console.log(`  - Usuários: ${usersCount.rows[0].count}`);
    console.log(`  - Células: ${cellsCount.rows[0].count}`);
    
    console.log('\n🎉 Migração concluída com sucesso!');
    console.log('\n📋 Próximos passos:');
    console.log('1. Atualize a variável DATABASE_URL no Netlify com a string de conexão do Neon');
    console.log('2. Faça o deploy da aplicação');
    console.log('3. Teste o login com:');
    console.log('   - Pastor: pastor@igreja.com / pastor123');
    console.log('   - Admin: admin@igreja.com / admin123');
    console.log('   - Membro: membro@teste.com / membro123');
    
  } catch (error) {
    console.error('❌ Erro durante a migração:', error);
    throw error;
  } finally {
    client.release();
  }
}

async function checkConnection() {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW() as current_time, version() as version');
    console.log('✅ Conexão com Neon estabelecida com sucesso!');
    console.log(`⏰ Hora atual: ${result.rows[0].current_time}`);
    console.log(`🐘 Versão PostgreSQL: ${result.rows[0].version.split(' ')[0]} ${result.rows[0].version.split(' ')[1]}`);
    client.release();
    return true;
  } catch (error) {
    console.error('❌ Erro ao conectar com Neon:', error.message);
    return false;
  }
}

async function main() {
  console.log('🔧 Script de Migração para Neon PostgreSQL');
  console.log('==========================================\n');
  
  // Verificar variável de ambiente
  if (!process.env.DATABASE_URL) {
    console.error('❌ Variável DATABASE_URL não encontrada!');
    console.log('💡 Defina a variável DATABASE_URL com a string de conexão do Neon.');
    console.log('   Exemplo: DATABASE_URL="postgresql://username:password@ep-example.us-east-2.aws.neon.tech/neondb?sslmode=require"');
    process.exit(1);
  }
  
  console.log('🔍 Testando conexão com Neon...');
  const connected = await checkConnection();
  
  if (!connected) {
    console.log('\n💡 Verifique:');
    console.log('1. Se a string DATABASE_URL está correta');
    console.log('2. Se o banco Neon está ativo e acessível');
    console.log('3. Se as credenciais estão corretas');
    process.exit(1);
  }
  
  console.log('\n🚀 Iniciando migração...');
  await runMigration();
  
  await pool.end();
}

// Executar o script
if (require.main === module) {
  main().catch(error => {
    console.error('💥 Erro fatal:', error);
    process.exit(1);
  });
}

module.exports = { runMigration, checkConnection };