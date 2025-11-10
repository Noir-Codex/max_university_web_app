const fs = require('fs');
const path = require('path');
const { pool } = require('../config/database');

/**
 * Скрипт для инициализации базы данных
 */
async function initDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Начало инициализации базы данных...');
    
    // Читаем SQL файл
    const sqlPath = path.join(__dirname, 'init-database.sql');
    const sql = fs.readFileSync(sqlPath, 'utf-8');
    
    // Выполняем SQL скрипт
    await client.query(sql);
    
    console.log('✅ База данных успешно инициализирована!');
    console.log('📊 Созданные таблицы:');
    console.log('  - users (пользователи)');
    console.log('  - groups (группы)');
    console.log('  - group_students (связь студентов и групп)');
    console.log('  - subjects (дисциплины)');
    console.log('  - schedule (расписание)');
    console.log('  - attendance (посещаемость)');
    
  } catch (error) {
    console.error('❌ Ошибка инициализации базы данных:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Запуск скрипта
initDatabase()
  .then(() => {
    console.log('\n✨ Инициализация завершена успешно!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Ошибка при инициализации:', error);
    process.exit(1);
  });