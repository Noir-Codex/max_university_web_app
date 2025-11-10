const { query } = require('../config/database');

/**
 * Модель дисциплины
 */
class Subject {
  /**
   * Создать новую дисциплину
   */
  static async create({ name, type, hours }) {
    const result = await query(
      `INSERT INTO subjects (name, type, hours)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [name, type, hours]
    );

    return result.rows[0];
  }

  /**
   * Найти дисциплину по ID
   */
  static async findById(id) {
    const result = await query('SELECT * FROM subjects WHERE id = $1', [id]);
    return result.rows[0];
  }

  /**
   * Получить все дисциплины
   */
  static async findAll(filters = {}) {
    let sql = 'SELECT * FROM subjects WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (filters.type) {
      sql += ` AND type = $${paramCount}`;
      params.push(filters.type);
      paramCount++;
    }

    if (filters.search) {
      sql += ` AND name ILIKE $${paramCount}`;
      params.push(`%${filters.search}%`);
      paramCount++;
    }

    sql += ' ORDER BY name';

    const result = await query(sql, params);
    return result.rows;
  }

  /**
   * Обновить дисциплину
   */
  static async update(id, data) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    const allowedFields = ['name', 'type', 'hours'];
    
    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        fields.push(`${field} = $${paramCount}`);
        values.push(data[field]);
        paramCount++;
      }
    }

    if (fields.length === 0) {
      return await this.findById(id);
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const sql = `UPDATE subjects SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`;
    const result = await query(sql, values);
    
    return result.rows[0];
  }

  /**
   * Удалить дисциплину
   */
  static async delete(id) {
    const result = await query('DELETE FROM subjects WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  }

  /**
   * Получить дисциплины преподавателя
   */
  static async findByTeacher(teacherId) {
    const result = await query(`
      SELECT DISTINCT s.*
      FROM subjects s
      INNER JOIN schedule sch ON s.id = sch.subject_id
      WHERE sch.teacher_id = $1
      ORDER BY s.name
    `, [teacherId]);
    
    return result.rows;
  }

  /**
   * Проверить, существует ли дисциплина с таким названием
   */
  static async existsByName(name, excludeId = null) {
    let sql = 'SELECT COUNT(*) as count FROM subjects WHERE name = $1';
    const params = [name];
    
    if (excludeId) {
      sql += ' AND id != $2';
      params.push(excludeId);
    }
    
    const result = await query(sql, params);
    return parseInt(result.rows[0].count) > 0;
  }

  /**
   * Получить статистику дисциплин
   */
  static async getStatistics() {
    const result = await query(`
      SELECT 
        COUNT(*) as total_subjects,
        COUNT(*) FILTER (WHERE type = 'Лекция') as lectures,
        COUNT(*) FILTER (WHERE type = 'Практика') as practices,
        COUNT(*) FILTER (WHERE type = 'Лабораторная') as labs,
        SUM(hours) as total_hours
      FROM subjects
    `);
    return result.rows[0];
  }
}

module.exports = Subject;