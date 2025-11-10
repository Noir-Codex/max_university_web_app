const { query } = require('../config/database');

/**
 * Модель группы
 */
class Group {
  /**
   * Создать новую группу
   */
  static async create({ name, course, specialty, curator_id }) {
    const result = await query(
      `INSERT INTO groups (name, course, specialty, curator_id)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [name, course, specialty, curator_id]
    );

    return result.rows[0];
  }

  /**
   * Найти группу по ID
   */
  static async findById(id) {
    const result = await query(`
      SELECT g.*, 
             u.first_name || ' ' || u.last_name as curator_name,
             COUNT(gs.student_id) as students_count
      FROM groups g
      LEFT JOIN users u ON g.curator_id = u.id
      LEFT JOIN group_students gs ON g.id = gs.group_id
      WHERE g.id = $1
      GROUP BY g.id, u.first_name, u.last_name
    `, [id]);
    
    return result.rows[0];
  }

  /**
   * Получить все группы
   */
  static async findAll(filters = {}) {
    let sql = `
      SELECT g.*, 
             u.first_name || ' ' || u.last_name as curator_name,
             COUNT(gs.student_id) as students_count
      FROM groups g
      LEFT JOIN users u ON g.curator_id = u.id
      LEFT JOIN group_students gs ON g.id = gs.group_id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (filters.course) {
      sql += ` AND g.course = $${paramCount}`;
      params.push(filters.course);
      paramCount++;
    }

    if (filters.curator_id) {
      sql += ` AND g.curator_id = $${paramCount}`;
      params.push(filters.curator_id);
      paramCount++;
    }

    if (filters.search) {
      sql += ` AND (g.name ILIKE $${paramCount} OR g.specialty ILIKE $${paramCount})`;
      params.push(`%${filters.search}%`);
      paramCount++;
    }

    sql += ` GROUP BY g.id, u.first_name, u.last_name ORDER BY g.course, g.name`;

    const result = await query(sql, params);
    return result.rows;
  }

  /**
   * Получить группы преподавателя
   */
  static async findByTeacher(teacherId) {
    const result = await query(`
      SELECT DISTINCT g.*, 
             COUNT(gs.student_id) as students_count
      FROM groups g
      INNER JOIN schedule s ON g.id = s.group_id
      LEFT JOIN group_students gs ON g.id = gs.group_id
      WHERE s.teacher_id = $1
      GROUP BY g.id
      ORDER BY g.course, g.name
    `, [teacherId]);
    
    return result.rows;
  }

  /**
   * Обновить группу
   */
  static async update(id, data) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    const allowedFields = ['name', 'course', 'specialty', 'curator_id'];
    
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

    const sql = `UPDATE groups SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`;
    const result = await query(sql, values);
    
    return result.rows[0];
  }

  /**
   * Удалить группу
   */
  static async delete(id) {
    const result = await query('DELETE FROM groups WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  }

  /**
   * Добавить студента в группу
   */
  static async addStudent(groupId, studentId) {
    const result = await query(
      `INSERT INTO group_students (group_id, student_id)
       VALUES ($1, $2)
       ON CONFLICT (group_id, student_id) DO NOTHING
       RETURNING *`,
      [groupId, studentId]
    );
    return result.rows[0];
  }

  /**
   * Удалить студента из группы
   */
  static async removeStudent(groupId, studentId) {
    const result = await query(
      `DELETE FROM group_students 
       WHERE group_id = $1 AND student_id = $2 
       RETURNING *`,
      [groupId, studentId]
    );
    return result.rows[0];
  }

  /**
   * Получить студентов группы
   */
  static async getStudents(groupId) {
    const result = await query(`
      SELECT u.id, u.telegram_id, u.username, u.first_name, u.last_name, u.email
      FROM users u
      INNER JOIN group_students gs ON u.id = gs.student_id
      WHERE gs.group_id = $1
      ORDER BY u.last_name, u.first_name
    `, [groupId]);
    
    return result.rows;
  }

  /**
   * Получить статистику групп
   */
  static async getStatistics() {
    const result = await query(`
      SELECT 
        COUNT(DISTINCT g.id) as total_groups,
        COUNT(DISTINCT gs.student_id) as total_students,
        AVG(student_count) as avg_students_per_group
      FROM groups g
      LEFT JOIN group_students gs ON g.id = gs.group_id
      LEFT JOIN (
        SELECT group_id, COUNT(*) as student_count
        FROM group_students
        GROUP BY group_id
      ) sc ON g.id = sc.group_id
    `);
    return result.rows[0];
  }

  /**
   * Проверить, существует ли группа с таким названием
   */
  static async existsByName(name, excludeId = null) {
    let sql = 'SELECT COUNT(*) as count FROM groups WHERE name = $1';
    const params = [name];
    
    if (excludeId) {
      sql += ' AND id != $2';
      params.push(excludeId);
    }
    
    const result = await query(sql, params);
    return parseInt(result.rows[0].count) > 0;
  }
}

module.exports = Group;