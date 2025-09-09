import express from 'express';
import { getDatabase } from '../database/database';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Registrar oração do dia
router.post('/log', authenticateToken, async (req: any, res) => {
  try {
    const db = getDatabase(); // <-- USA A CONEXÃO JÁ EXISTENTE! NÃO CRIA UMA NOVA.
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    
    console.log('🙏 PRAYER LOG - User ID:', req.user.id);
    console.log('🙏 PRAYER LOG - Date:', today);
    
    // Tentar inserir o registro de oração
    try {
      const result = await db.run(
        'INSERT INTO prayer_logs (user_id, prayer_date) VALUES (?, ?)',
        [req.user.id, today]
      );
      
      console.log('✅ PRAYER LOG - Oração registrada com sucesso:', result.lastID);
      
      res.json({ 
        success: true, 
        message: 'Oração registrada com sucesso!',
        id: result.lastID,
        date: today
      });
    } catch (error: any) {
      // Se o erro for de constraint UNIQUE, significa que já orou hoje
      if (error.code === 'SQLITE_CONSTRAINT_UNIQUE' || error.message.includes('UNIQUE constraint failed')) {
        console.log('⚠️ PRAYER LOG - Usuário já orou hoje');
        return res.status(409).json({ 
          error: 'Você já registrou sua oração hoje!',
          alreadyPrayed: true
        });
      }
      throw error;
    }
  } catch (error) {
    console.error('❌ PRAYER LOG - Erro ao registrar oração:', error);
    res.status(500).json({ error: 'Erro ao registrar oração' });
  }
});

// Verificar se o usuário já orou hoje
router.get('/status/today', authenticateToken, async (req: any, res) => {
  try {
    const db = getDatabase(); // <-- USA A CONEXÃO JÁ EXISTENTE! NÃO CRIA UMA NOVA.
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    
    console.log('🔍 PRAYER STATUS - Checking for user:', req.user.id, 'date:', today);
    
    const prayerLog = await db.get(
      'SELECT id, prayer_date, created_at FROM prayer_logs WHERE user_id = ? AND prayer_date = ?',
      [req.user.id, today]
    );
    
    const alreadyPrayed = !!prayerLog;
    console.log('🔍 PRAYER STATUS - Already prayed today:', alreadyPrayed);
    
    res.json({ 
      alreadyPrayed,
      prayerLog: prayerLog || null,
      date: today
    });
  } catch (error) {
    console.error('❌ PRAYER STATUS - Erro ao verificar status:', error);
    res.status(500).json({ error: 'Erro ao verificar status da oração' });
  }
});

// Obter estatísticas de oração do usuário
router.get('/stats', authenticateToken, async (req: any, res) => {
  try {
    const db = getDatabase(); // <-- USA A CONEXÃO JÁ EXISTENTE! NÃO CRIA UMA NOVA.
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    // Verificar se orou hoje
    const prayedTodayResult = await db.get(
      'SELECT COUNT(*) as count FROM prayer_logs WHERE user_id = ? AND prayer_date = ?',
      [req.user.id, today]
    );
    const prayedToday = prayedTodayResult.count > 0;
    
    // Calcular data de início da semana (segunda-feira)
    const dayOfWeek = now.getDay();
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Domingo = 0, então 6 dias atrás
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - daysToMonday);
    const weekStart = startOfWeek.toISOString().split('T')[0];
    
    // Calcular início do mês
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    
    // Calcular início do ano
    const startOfYear = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0];
    
    // Contar orações da semana
    const weeklyResult = await db.get(
      'SELECT COUNT(*) as count FROM prayer_logs WHERE user_id = ? AND prayer_date >= ?',
      [req.user.id, weekStart]
    );
    
    // Contar orações do mês
    const monthlyResult = await db.get(
      'SELECT COUNT(*) as count FROM prayer_logs WHERE user_id = ? AND prayer_date >= ?',
      [req.user.id, startOfMonth]
    );
    
    // Contar orações do ano
    const yearlyResult = await db.get(
      'SELECT COUNT(*) as count FROM prayer_logs WHERE user_id = ? AND prayer_date >= ?',
      [req.user.id, startOfYear]
    );
    
    // Contar total de orações
    const totalResult = await db.get(
      'SELECT COUNT(*) as count FROM prayer_logs WHERE user_id = ?',
      [req.user.id]
    );
    
    res.json({
      prayedToday,
      weeklyCount: weeklyResult.count,
      monthlyCount: monthlyResult.count,
      yearlyCount: yearlyResult.count,
      totalCount: totalResult.count,
      date: today
    });
  } catch (error) {
    console.error('❌ PRAYER STATS - Erro ao buscar estatísticas:', error);
    res.status(500).json({ error: 'Erro ao buscar estatísticas de oração' });
  }
});

export default router;