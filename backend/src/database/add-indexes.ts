import { getDatabase } from './database';

/**
 * Script para adicionar índices críticos para melhorar a performance das consultas
 * Especialmente importante para as consultas de perfil que estão causando timeout
 */
export async function addPerformanceIndexes() {
  try {
    const db = getDatabase();
    
    console.log('🔧 Adicionando índices para otimização de performance...');
    
    // Índices para a tabela users
    console.log('📊 Criando índices na tabela users...');
    
    // Índice no ID (já existe como PRIMARY KEY, mas garantindo)
    await db.exec(`
      CREATE INDEX IF NOT EXISTS idx_users_id ON users(id);
    `);
    
    // Índice no email (crítico para login e busca de usuários)
    await db.exec(`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    `);
    
    // Índice no cell_id (usado nos JOINs com células)
    await db.exec(`
      CREATE INDEX IF NOT EXISTS idx_users_cell_id ON users(cell_id);
    `);
    
    // Índice no role (usado para filtrar por tipo de usuário)
    await db.exec(`
      CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
    `);
    
    // Índice no status (usado para filtrar usuários ativos)
    await db.exec(`
      CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
    `);
    
    // Índices para a tabela cells
    console.log('📊 Criando índices na tabela cells...');
    
    // Índice no leader_id (usado nos JOINs para buscar líder)
    await db.exec(`
      CREATE INDEX IF NOT EXISTS idx_cells_leader_id ON cells(leader_id);
    `);
    
    // Índice no supervisor_id (usado para buscar células por supervisor)
    await db.exec(`
      CREATE INDEX IF NOT EXISTS idx_cells_supervisor_id ON cells(supervisor_id);
    `);
    
    // Índice no coordinator_id (usado para buscar células por coordenador)
    await db.exec(`
      CREATE INDEX IF NOT EXISTS idx_cells_coordinator_id ON cells(coordinator_id);
    `);
    
    // Índice no cell_number (usado para busca rápida por número da célula)
    await db.exec(`
      CREATE INDEX IF NOT EXISTS idx_cells_cell_number ON cells(cell_number);
    `);
    
    // Índices para a tabela user_profiles
    console.log('📊 Criando índices na tabela user_profiles...');
    
    // Índice no user_id (crítico para JOINs com users)
    await db.exec(`
      CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
    `);
    
    // Índices para a tabela user_cells
    console.log('📊 Criando índices na tabela user_cells...');
    
    // Índice no user_id
    await db.exec(`
      CREATE INDEX IF NOT EXISTS idx_user_cells_user_id ON user_cells(user_id);
    `);
    
    // Índice no cell_id
    await db.exec(`
      CREATE INDEX IF NOT EXISTS idx_user_cells_cell_id ON user_cells(cell_id);
    `);
    
    // Índice composto para busca por usuário e célula
    await db.exec(`
      CREATE INDEX IF NOT EXISTS idx_user_cells_user_cell ON user_cells(user_id, cell_id);
    `);
    
    // Índices para a tabela prayer_logs
    console.log('📊 Criando índices na tabela prayer_logs...');
    
    // Índice no user_id
    await db.exec(`
      CREATE INDEX IF NOT EXISTS idx_prayer_logs_user_id ON prayer_logs(user_id);
    `);
    
    // Índice na prayer_date
    await db.exec(`
      CREATE INDEX IF NOT EXISTS idx_prayer_logs_date ON prayer_logs(prayer_date);
    `);
    
    // Índice composto para busca por usuário e data
    await db.exec(`
      CREATE INDEX IF NOT EXISTS idx_prayer_logs_user_date ON prayer_logs(user_id, prayer_date);
    `);
    
    // Índices para a tabela dependents
    console.log('📊 Criando índices na tabela dependents...');
    
    // Índice no user_id
    await db.exec(`
      CREATE INDEX IF NOT EXISTS idx_dependents_user_id ON dependents(user_id);
    `);
    
    console.log('✅ Todos os índices foram criados com sucesso!');
    console.log('🚀 Performance das consultas deve estar significativamente melhorada.');
    
    // Verificar se os índices foram criados (para SQLite)
    if (process.env.NODE_ENV !== 'production') {
      console.log('\n📋 Verificando índices criados...');
      const indexes = await db.all(`
        SELECT name, tbl_name, sql 
        FROM sqlite_master 
        WHERE type = 'index' 
        AND name LIKE 'idx_%'
        ORDER BY tbl_name, name;
      `);
      
      console.log(`\n📊 Total de índices personalizados: ${indexes.length}`);
      indexes.forEach(index => {
        console.log(`  - ${index.name} (tabela: ${index.tbl_name})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Erro ao criar índices:', error);
    throw error;
  }
}

/**
 * Função para analisar a performance das consultas (apenas para desenvolvimento)
 */
export async function analyzeQueryPerformance() {
  if (process.env.NODE_ENV === 'production') {
    console.log('⚠️ Análise de performance não disponível em produção.');
    return;
  }
  
  try {
    const db = getDatabase();
    
    console.log('\n🔍 Analisando performance das consultas principais...');
    
    // Analisar query do perfil completo
    console.log('\n📊 Query do perfil completo:');
    const profileQuery = `
      EXPLAIN QUERY PLAN
      SELECT 
        u.id, u.name, u.email, u.phone, u.role, u.status, u.cell_id,
        c.cell_number, c.name as cell_name,
        l.name as leader_name,
        p.whatsapp, p.gender, p.date_of_birth, p.birth_city, p.birth_state,
        p.address, p.address_number, p.neighborhood, p.cep, p.reference_point,
        p.father_name, p.mother_name, p.marital_status, p.spouse_name,
        p.education, p.profession, p.conversion_date, p.previous_church, 
        p.oikos_name, p.oikos_name_2
      FROM users u
      LEFT JOIN cells c ON u.cell_id = c.id
      LEFT JOIN users l ON c.leader_id = l.id
      LEFT JOIN user_profiles p ON u.id = p.user_id
      WHERE u.id = 1;
    `;
    
    const profilePlan = await db.all(profileQuery);
    profilePlan.forEach(step => {
      console.log(`  ${step.detail}`);
    });
    
    // Analisar query de login
    console.log('\n📊 Query de login:');
    const loginQuery = `
      EXPLAIN QUERY PLAN
      SELECT * FROM users WHERE email = 'test@example.com' AND status = 'Ativo';
    `;
    
    const loginPlan = await db.all(loginQuery);
    loginPlan.forEach(step => {
      console.log(`  ${step.detail}`);
    });
    
    console.log('\n✅ Análise de performance concluída.');
    
  } catch (error) {
    console.error('❌ Erro na análise de performance:', error);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  addPerformanceIndexes()
    .then(() => analyzeQueryPerformance())
    .then(() => {
      console.log('\n🎉 Otimização de performance concluída!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erro na otimização:', error);
      process.exit(1);
    });
}