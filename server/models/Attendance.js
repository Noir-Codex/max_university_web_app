const { query } = require('../config/database');

/**
 * Модель посещаемости
 */
class Attendance {
  /**
   * Создать запись о посещаемости
   */
  static async create({ lesson_id, student_id, status, notes = null, date }) {
    const result = await query(
      `INSERT INTO attendance (lesson_id, student_id, status, notes, date)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (lesson_id, student_id, date) 
       DO UPDATE SET status = $3, notes = $4, updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [lesson_id, student_id, status, notes, date]
    );

    return result.rows[0];
  }

  /**
   * Найти запись по ID
   */
  static async findById(id) {
    const result = await query(`
      SELECT a.*,
             u.first_name || ' ' || u.last_name as student_name,
             s.subject_id, subj.name as subject_name
      FROM attendance a
      LEFT JOIN users u ON a.student_id = u.id
      LEFT JOIN schedule s ON a.lesson_id = s.id
      LEFT JOIN subjects subj ON s.subject_id = subj.id
      WHERE a.id = $1
    `, [id]);
    
    return result.rows[0];
  }

  /**
   * Получить посещаемость с фильтрами
   */
  static async findAll(filters = {}) {
    let sql = `
      SELECT a.*,
             u.first_name || ' ' || u.last_name as student_name,
             g.name as group_name,
             subj.name as subject_name,
             s.day_of_week, s.time_start
      FROM attendance a
      LEFT JOIN users u ON a.student_id = u.id
      LEFT JOIN schedule s ON a.lesson_id = s.id
      LEFT JOIN subjects subj ON s.subject_id = subj.id
      LEFT JOIN groups g ON s.group_id = g.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (filters.lesson_id) {
      sql += ` AND a.lesson_id = $${paramCount}`;
      params.push(filters.lesson_id);
      paramCount++;
    }

    if (filters.student_id) {
      sql += ` AND a.student_id = $${paramCount}`;
      params.push(filters.student_id);
      paramCount++;
    }

    if (filters.group_id) {
      sql += ` AND s.group_id = $${paramCount}`;
      params.push(filters.group_id);
      paramCount++;
    }

    if (filters.date_from) {
      sql += ` AND a.date >= $${paramCount}`;
      params.push(filters.date_from);
      paramCount++;
    }

    if (filters.date_to) {
      sql += ` AND a.date <= $${paramCount}`;
      params.push(filters.date_to);
      paramCount++;
    }

    if (filters.status) {
      sql += ` AND a.status = $${paramCount}`;
      params.push(filters.status);
      paramCount++;
    }

    sql += ' ORDER BY a.date DESC, s.time_start';

    const result = await query(sql, params);
    return result.rows;
  }

  /**
   * Получить посещаемость для конкретной пары
   */
  static async findByLesson(lessonId, date) {
    const result = await query(`
      SELECT a.*,
             u.id as student_id,
             u.first_name || ' ' || u.last_name as student_name
      FROM attendance a
      RIGHT JOIN (
        SELECT u.id, u.first_name, u.last_name
        FROM users u
        INNER JOIN group_students gs ON u.id = gs.student_id
        INNER JOIN schedule s ON gs.group_id = s.group_id
        WHERE s.id = $1
      ) u ON a.student_id = u.id AND a.lesson_id = $1 AND a.date = $2
      ORDER BY u.last_name, u.first_name
    `, [lessonId, date]);
    
    return result.rows;
  }

  /**
   * Обновить запись о посещаемости
   */
  static async update(id, data) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    const allowedFields = ['status', 'notes'];
    
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

    const sql = `UPDATE attendance SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`;
    const result = await query(sql, values);
    
    return result.rows[0];
  }

  /**
   * Удалить запись
   */
  static async delete(id) {
    const result = await query('DELETE FROM attendance WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  }

  /**
   * Массовое сохранение посещаемости
   */
  static async bulkUpsert(lessonId, date, attendanceData) {
    const client = await require('../config/database').getClient();
    
    try {
      await client.query('BEGIN');

      const results = [];
      for (const record of attendanceData) {
        const result = await client.query(
          `INSERT INTO attendance (lesson_id, student_id, status, notes, date)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (lesson_id, student_id, date) 
           DO UPDATE SET status = $3, notes = $4, updated_at = CURRENT_TIMESTAMP
           RETURNING *`,
          [lessonId, record.student_id, record.status, record.notes || null, date]
        );
        results.push(result.rows[0]);
      }

      await client.query('COMMIT');
      return results;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Получить статистику посещаемости студента
   */
  static async getStudentStats(studentId, filters = {}) {
    let sql = `
      SELECT 
        COUNT(*) as total_lessons,
        COUNT(*) FILTER (WHERE status = 'present') as present_count,
        COUNT(*) FILTER (WHERE status = 'absent') as absent_count,
        COUNT(*) FILTER (WHERE status = 'late') as late_count,
        COUNT(*) FILTER (WHERE status = 'excused') as excused_count,
        ROUND(COUNT(*) FILTER (WHERE status = 'present')::numeric / NULLIF(COUNT(*), 0) * 100, 2) as attendance_rate
      FROM attendance
      WHERE student_id = $1
    `;
    const params = [studentId];
    let paramCount = 2;

    if (filters.date_from) {
      sql += ` AND date >= $${paramCount}`;
      params.push(filters.date_from);
      paramCount++;
    }

    if (filters.date_to) {
      sql += ` AND date <= $${paramCount}`;
      params.push(filters.date_to);
      paramCount++;
    }

    const result = await query(sql, params);
    return result.rows[0];
  }

  /**
   * Получить статистику посещаемости по группе
   */
  static async getGroupStats(groupId, filters = {}) {
    let sql = `
      SELECT 
        g.name as group_name,
        COUNT(DISTINCT a.student_id) as students_count,
        COUNT(*) as total_records,
        COUNT(*) FILTER (WHERE a.status = 'present') as present_count,
        COUNT(*) FILTER (WHERE a.status = 'absent') as absent_count,
        ROUND(COUNT(*) FILTER (WHERE a.status = 'present')::numeric / NULLIF(COUNT(*), 0) * 100, 2) as attendance_rate
      FROM groups g
      LEFT JOIN schedule s ON g.id = s.group_id
      LEFT JOIN attendance a ON s.id = a.lesson_id
      WHERE g.id = $1
    `;
    const params = [groupId];
    let paramCount = 2;

    if (filters.date_from) {
      sql += ` AND a.date >= $${paramCount}`;
      params.push(filters.date_from);
      paramCount++;
    }

    if (filters.date_to) {
      sql += ` AND a.date <= $${paramCount}`;
      params.push(filters.date_to);
      paramCount++;
    }

    sql += ' GROUP BY g.id, g.name';

    const result = await query(sql, params);
    return result.rows[0];
  }

  /**
   * Получить статистику посещаемости по дисциплине
   */
  static async getSubjectStats(subjectId, filters = {}) {
    let sql = `
      SELECT 
        subj.name as subject_name,
        COUNT(*) as total_records,
        COUNT(*) FILTER (WHERE a.status = 'present') as present_count,
        COUNT(*) FILTER (WHERE a.status = 'absent') as absent_count,
        ROUND(COUNT(*) FILTER (WHERE a.status = 'present')::numeric / NULLIF(COUNT(*), 0) * 100, 2) as attendance_rate
      FROM subjects subj
      LEFT JOIN schedule s ON subj.id = s.subject_id
      LEFT JOIN attendance a ON s.id = a.lesson_id
      WHERE subj.id = $1
    `;
    const params = [subjectId];
    let paramCount = 2;

    if (filters.date_from) {
      sql += ` AND a.date >= $${paramCount}`;
      params.push(filters.date_from);
      paramCount++;
    }

    if (filters.date_to) {
      sql += ` AND a.date <= $${paramCount}`;
      params.push(filters.date_to);
      paramCount++;
    }

    sql += ' GROUP BY subj.id, subj.name';

    const result = await query(sql, params);
    return result.rows[0];
  }

  /**
   * Получить общую статистику посещаемости
   */
  static async getOverallStats(filters = {}) {
    let sql = `
      SELECT 
        COUNT(*) as total_records,
        COUNT(DISTINCT student_id) as students_count,
        COUNT(*) FILTER (WHERE status = 'present') as present_count,
        COUNT(*) FILTER (WHERE status = 'absent') as absent_count,
        COUNT(*) FILTER (WHERE status = 'late') as late_count,
        COUNT(*) FILTER (WHERE status = 'excused') as excused_count,
        ROUND(COUNT(*) FILTER (WHERE status = 'present')::numeric / NULLIF(COUNT(*), 0) * 100, 2) as attendance_rate
      FROM attendance
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (filters.date_from) {
      sql += ` AND date >= $${paramCount}`;
      params.push(filters.date_from);
      paramCount++;
    }

    if (filters.date_to) {
      sql += ` AND date <= $${paramCount}`;
      params.push(filters.date_to);
      paramCount++;
    }

    const result = await query(sql, params);
    return result.rows[0];
  }

  /**
   * Получить детальный отчет по посещаемости для экспорта
   */
  static async getDetailedReport(filters = {}) {
    let sql = `
      SELECT 
        u.first_name || ' ' || u.last_name as student_name,
        g.name as group_name,
        subj.name as subject_name,
        a.date,
        a.status,
        a.notes,
        ut.first_name || ' ' || ut.last_name as teacher_name
      FROM attendance a
      INNER JOIN users u ON a.student_id = u.id
      INNER JOIN schedule s ON a.lesson_id = s.id
      INNER JOIN groups g ON s.group_id = g.id
      INNER JOIN subjects subj ON s.subject_id = subj.id
      INNER JOIN users ut ON s.teacher_id = ut.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (filters.group_id) {
      sql += ` AND g.id = $${paramCount}`;
      params.push(filters.group_id);
      paramCount++;
    }

    if (filters.student_id) {
      sql += ` AND a.student_id = $${paramCount}`;
      params.push(filters.student_id);
      paramCount++;
    }

    if (filters.subject_id) {
      sql += ` AND s.subject_id = $${paramCount}`;
      params.push(filters.subject_id);
      paramCount++;
    }

    if (filters.date_from) {
      sql += ` AND a.date >= $${paramCount}`;
      params.push(filters.date_from);
      paramCount++;
    }

    if (filters.date_to) {
      sql += ` AND a.date <= $${paramCount}`;
      params.push(filters.date_to);
      paramCount++;
    }

    sql += ' ORDER BY a.date DESC, u.last_name, u.first_name';

    const result = await query(sql, params);
    return result.rows;
  }
}

module.exports = Attendance;