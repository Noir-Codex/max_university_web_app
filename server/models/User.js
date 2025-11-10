const { query } = require('../config/database');
const bcrypt = require('bcrypt');

/**
 * Модель пользователя
 */
class User {
  /**
   * Создать нового пользователя
   */
  static async create({ telegram_id, username, first_name, last_name, role, email, password }) {
    let hashedPassword = null;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    const result = await query(
      `INSERT INTO users (telegram_id, username, first_name, last_name, role, email, password_hash)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [telegram_id, username, first_name, last_name, role, email, hashedPassword]
    );

    return result.rows[0];
  }

  /**
   * Найти пользователя по ID
   */
  static async findById(id) {
    const result = await query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0];
  }

  /**
   * Найти пользователя по Telegram ID
   */
  static async findByTelegramId(telegram_id) {
    const result = await query('SELECT * FROM users WHERE telegram_id = $1', [telegram_id]);
    return result.rows[0];
  }

  /**
   * Найти пользователя по email
   */
  static async findByEmail(email) {
    const result = await query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0];
  }

  /**
   * Получить всех пользователей с фильтрами
   */
  static async findAll(filters = {}) {
    let sql = 'SELECT * FROM users WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (filters.role) {
      sql += ` AND role = $${paramCount}`;
      params.push(filters.role);
      paramCount++;
    }

    if (filters.search) {
      sql += ` AND (first_name ILIKE $${paramCount} OR last_name ILIKE $${paramCount} OR email ILIKE $${paramCount})`;
      params.push(`%${filters.search}%`);
      paramCount++;
    }

    sql += ' ORDER BY created_at DESC';

    const result = await query(sql, params);
    return result.rows;
  }

  /**
   * Обновить пользователя
   */
  static async update(id, data) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    const allowedFields = ['username', 'first_name', 'last_name', 'role', 'email'];
    
    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        fields.push(`${field} = $${paramCount}`);
        values.push(data[field]);
        paramCount++;
      }
    }

    if (data.password) {
      const hashedPassword = await bcrypt.hash(data.password, 10);
      fields.push(`password_hash = $${paramCount}`);
      values.push(hashedPassword);
      paramCount++;
    }

    if (fields.length === 0) {
      return await this.findById(id);
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const sql = `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`;
    const result = await query(sql, values);
    
    return result.rows[0];
  }

  /**
   * Удалить пользователя
   */
  static async delete(id) {
    const result = await query('DELETE FROM users WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  }

  /**
   * Создать или обновить пользователя из Telegram данных
   */
  static async upsertFromTelegram(telegramUser) {
    const existing = await this.findByTelegramId(telegramUser.id);
    
    if (existing) {
      // Обновляем данные пользователя
      return await this.update(existing.id, {
        username: telegramUser.username,
        first_name: telegramUser.first_name,
        last_name: telegramUser.last_name
      });
    } else {
      // Создаем нового пользователя со статусом student по умолчанию
      return await this.create({
        telegram_id: telegramUser.id,
        username: telegramUser.username,
        first_name: telegramUser.first_name,
        last_name: telegramUser.last_name,
        role: 'student'
      });
    }
  }

  /**
   * Проверить пароль
   */
  static async verifyPassword(userId, password) {
    const user = await this.findById(userId);
    if (!user || !user.password_hash) {
      return false;
    }
    return await bcrypt.compare(password, user.password_hash);
  }

  /**
   * Получить всех преподавателей
   */
  static async findAllTeachers() {
    const result = await query(
      `SELECT id, first_name, last_name, email, username 
       FROM users 
       WHERE role = 'teacher' 
       ORDER BY last_name, first_name`
    );
    return result.rows;
  }

  /**
   * Получить студентов группы
   */
  static async findStudentsByGroup(groupId) {
    const result = await query(
      `SELECT u.* 
       FROM users u
       INNER JOIN group_students gs ON u.id = gs.student_id
       WHERE gs.group_id = $1 AND u.role = 'student'
       ORDER BY u.last_name, u.first_name`,
      [groupId]
    );
    return result.rows;
  }

  /**
   * Получить статистику пользователей
   */
  static async getStatistics() {
    const result = await query(`
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE role = 'student') as students,
        COUNT(*) FILTER (WHERE role = 'teacher') as teachers,
        COUNT(*) FILTER (WHERE role = 'admin') as admins
      FROM users
    `);
    return result.rows[0];
  }
}

module.exports = User;