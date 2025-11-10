/**
 * Скрипт для сброса пароля пользователя
 * Использование: node scripts/resetPassword.js email@example.com newpassword
 */

const bcrypt = require('bcrypt');
const { query } = require('../config/database');

async function resetPassword() {
  try {
    const email = process.argv[2];
    const newPassword = process.argv[3];

    if (!email || !newPassword) {
      console.log('❌ Использование: node scripts/resetPassword.js email@example.com newpassword');
      process.exit(1);
    }

    if (newPassword.length < 6) {
      console.log('❌ Пароль должен быть минимум 6 символов');
      process.exit(1);
    }

    console.log(`🔄 Сброс пароля для ${email}...`);

    // Проверяем, существует ли пользователь
    const userResult = await query('SELECT id, first_name, last_name, role FROM users WHERE email = $1', [email]);

    if (userResult.rows.length === 0) {
      console.log(`❌ Пользователь с email ${email} не найден`);
      process.exit(1);
    }

    const user = userResult.rows[0];
    console.log(`👤 Найден: ${user.first_name} ${user.last_name} (${user.role})`);

    // Хешируем новый пароль
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Обновляем пароль
    await query('UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [hashedPassword, user.id]);

    console.log('✅ Пароль успешно изменен!');
    console.log(`\n📋 Новые данные для входа:`);
    console.log(`   Email: ${email}`);
    console.log(`   Пароль: ${newPassword}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
    process.exit(1);
  }
}

resetPassword();



