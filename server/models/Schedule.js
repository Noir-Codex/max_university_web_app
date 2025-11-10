const { query } = require('../config/database');

/**
 * Модель расписания
 */
class Schedule {
  /**
   * Создать новую пару в расписании
   * @param {Object} params - параметры пары
   * @param {number} params.week_type - тип недели: 0 = каждую неделю, 1 = первая (нечетная), 2 = вторая (четная)
   */
  static async create({ subject_id, group_id, teacher_id, day_of_week, time_start, time_end, room, week_type = 0, lesson_type }) {
    const result = await query(
      `INSERT INTO schedule (subject_id, group_id, teacher_id, day_of_week, time_start, time_end, room, week_type, lesson_type)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [subject_id, group_id, teacher_id, day_of_week, time_start, time_end, room, week_type, lesson_type]
    );

    return result.rows[0];
  }

  /**
   * Найти пару по ID
   */
  static async findById(id) {
    const result = await query(`
      SELECT s.*,
             subj.name as subject_name,
             g.name as group_name,
             u.first_name || ' ' || u.last_name as teacher_name
      FROM schedule s
      LEFT JOIN subjects subj ON s.subject_id = subj.id
      LEFT JOIN groups g ON s.group_id = g.id
      LEFT JOIN users u ON s.teacher_id = u.id
      WHERE s.id = $1
    `, [id]);
    
    return result.rows[0];
  }

  /**
   * Получить расписание с фильтрами
   * @param {Object} filters - фильтры
   * @param {number} filters.week_type - тип недели: 0, 1, 2 (если не указан, возвращает все)
   */
  static async findAll(filters = {}) {
    let sql = `
      SELECT s.*,
             subj.name as subject_name,
             g.name as group_name,
             u.first_name || ' ' || u.last_name as teacher_name
      FROM schedule s
      LEFT JOIN subjects subj ON s.subject_id = subj.id
      LEFT JOIN groups g ON s.group_id = g.id
      LEFT JOIN users u ON s.teacher_id = u.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    // Фильтр по типу недели (0 = каждую неделю, 1 = первая, 2 = вторая)
    if (filters.week_type !== undefined && filters.week_type !== null) {
      // Показываем пары для указанной недели И пары, которые идут каждую неделю
      sql += ` AND (s.week_type = $${paramCount} OR s.week_type = 0)`;
      params.push(filters.week_type);
      paramCount++;
    }

    if (filters.group_id) {
      sql += ` AND s.group_id = $${paramCount}`;
      params.push(filters.group_id);
      paramCount++;
    }

    if (filters.teacher_id) {
      sql += ` AND s.teacher_id = $${paramCount}`;
      params.push(filters.teacher_id);
      paramCount++;
    }

    if (filters.day_of_week) {
      sql += ` AND s.day_of_week = $${paramCount}`;
      params.push(filters.day_of_week);
      paramCount++;
    }

    if (filters.subject_id) {
      sql += ` AND s.subject_id = $${paramCount}`;
      params.push(filters.subject_id);
      paramCount++;
    }

    sql += ' ORDER BY s.day_of_week, s.time_start';

    const result = await query(sql, params);
    return result.rows;
  }

  /**
   * Получить расписание на сегодня
   */
  static async findToday(teacherId = null) {
    const now = new Date();
    const dayOfWeek = now.getDay() || 7; // Воскресенье = 7
    
    // Определяем текущий тип недели (1 или 2)
    const currentWeekType = this.getCurrentWeekType();
    
    let sql = `
      SELECT s.*,
             subj.name as subject_name,
             g.name as group_name,
             u.first_name || ' ' || u.last_name as teacher_name
      FROM schedule s
      LEFT JOIN subjects subj ON s.subject_id = subj.id
      LEFT JOIN groups g ON s.group_id = g.id
      LEFT JOIN users u ON s.teacher_id = u.id
      WHERE s.day_of_week = $1
        AND (s.week_type = 0 OR s.week_type = $2)
    `;
    const params = [dayOfWeek, currentWeekType];

    if (teacherId) {
      sql += ' AND s.teacher_id = $3';
      params.push(teacherId);
    }

    sql += ' ORDER BY s.time_start';

    const result = await query(sql, params);
    return result.rows;
  }

  /**
   * Определить текущий тип недели (1 = первая/нечетная, 2 = вторая/четная)
   * Отсчет ведется от 1 сентября текущего учебного года
   */
  static getCurrentWeekType() {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-11
    
    // Определяем начало учебного года (1 сентября)
    // Если сейчас январь-август, то учебный год начался в прошлом году
    const academicYearStart = new Date(
      currentMonth >= 8 ? currentYear : currentYear - 1,
      8, // сентябрь (месяцы с 0)
      1  // 1 число
    );
    
    // Вычисляем количество недель с начала учебного года
    const diffTime = now.getTime() - academicYearStart.getTime();
    const diffWeeks = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7));
    
    // Нечетная неделя = 1, четная = 2
    return (diffWeeks % 2 === 0) ? 1 : 2;
  }

  /**
   * Обновить пару
   */
  static async update(id, data) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    const allowedFields = ['subject_id', 'group_id', 'teacher_id', 'day_of_week', 'time_start', 'time_end', 'room', 'week_type', 'lesson_type'];
    
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

    const sql = `UPDATE schedule SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`;
    const result = await query(sql, values);
    
    return result.rows[0];
  }

  /**
   * Удалить пару
   */
  static async delete(id) {
    const result = await query('DELETE FROM schedule WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  }

  /**
   * Проверить конфликты расписания
   * Возвращает массив конфликтов
   */
  static async checkConflicts({ teacher_id, group_id, day_of_week, time_start, time_end, room, exclude_id = null }) {
    const conflicts = [];

    // Проверка конфликта преподавателя
    let sql = `
      SELECT 'teacher' as conflict_type, s.*, 
             subj.name as subject_name, g.name as group_name
      FROM schedule s
      LEFT JOIN subjects subj ON s.subject_id = subj.id
      LEFT JOIN groups g ON s.group_id = g.id
      WHERE s.teacher_id = $1 
        AND s.day_of_week = $2
        AND (
          (s.time_start <= $3 AND s.time_end > $3) OR
          (s.time_start < $4 AND s.time_end >= $4) OR
          (s.time_start >= $3 AND s.time_end <= $4)
        )
    `;
    const params = [teacher_id, day_of_week, time_start, time_end];
    
    if (exclude_id) {
      sql += ' AND s.id != $5';
      params.push(exclude_id);
    }

    let result = await query(sql, params);
    conflicts.push(...result.rows);

    // Проверка конфликта группы
    sql = `
      SELECT 'group' as conflict_type, s.*,
             subj.name as subject_name, 
             u.first_name || ' ' || u.last_name as teacher_name
      FROM schedule s
      LEFT JOIN subjects subj ON s.subject_id = subj.id
      LEFT JOIN users u ON s.teacher_id = u.id
      WHERE s.group_id = $1 
        AND s.day_of_week = $2
        AND (
          (s.time_start <= $3 AND s.time_end > $3) OR
          (s.time_start < $4 AND s.time_end >= $4) OR
          (s.time_start >= $3 AND s.time_end <= $4)
        )
    `;
    const groupParams = [group_id, day_of_week, time_start, time_end];
    
    if (exclude_id) {
      sql += ' AND s.id != $5';
      groupParams.push(exclude_id);
    }

    result = await query(sql, groupParams);
    conflicts.push(...result.rows);

    // Проверка конфликта аудитории (если указана)
    if (room) {
      sql = `
        SELECT 'room' as conflict_type, s.*,
               subj.name as subject_name, g.name as group_name,
               u.first_name || ' ' || u.last_name as teacher_name
        FROM schedule s
        LEFT JOIN subjects subj ON s.subject_id = subj.id
        LEFT JOIN groups g ON s.group_id = g.id
        LEFT JOIN users u ON s.teacher_id = u.id
        WHERE s.room = $1 
          AND s.day_of_week = $2
          AND (
            (s.time_start <= $3 AND s.time_end > $3) OR
            (s.time_start < $4 AND s.time_end >= $4) OR
            (s.time_start >= $3 AND s.time_end <= $4)
          )
      `;
      const roomParams = [room, day_of_week, time_start, time_end];
      
      if (exclude_id) {
        sql += ' AND s.id != $5';
        roomParams.push(exclude_id);
      }

      result = await query(sql, roomParams);
      conflicts.push(...result.rows);
    }

    return conflicts;
  }

  /**
   * Получить статистику расписания
   */
  static async getStatistics(filters = {}) {
    let sql = `
      SELECT 
        COUNT(*) as total_lessons,
        COUNT(DISTINCT teacher_id) as teachers_count,
        COUNT(DISTINCT group_id) as groups_count,
        COUNT(DISTINCT subject_id) as subjects_count
      FROM schedule
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (filters.week_type !== undefined && filters.week_type !== null) {
      sql += ` AND (week_type = $${paramCount} OR week_type = 0)`;
      params.push(filters.week_type);
      paramCount++;
    }

    const result = await query(sql, params);
    return result.rows[0];
  }

  /**
   * Массовое создание пар (для импорта)
   */
  static async bulkCreate(lessons) {
    const values = [];
    const placeholders = [];

    lessons.forEach((lesson, index) => {
      const offset = index * 9;
      placeholders.push(
        `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, $${offset + 6}, $${offset + 7}, $${offset + 8}, $${offset + 9})`
      );
      values.push(
        lesson.subject_id,
        lesson.group_id,
        lesson.teacher_id,
        lesson.day_of_week,
        lesson.time_start,
        lesson.time_end,
        lesson.room,
        lesson.week_type || 0,
        lesson.lesson_type
      );
    });

    const sql = `
      INSERT INTO schedule (subject_id, group_id, teacher_id, day_of_week, time_start, time_end, room, week_type, lesson_type)
      VALUES ${placeholders.join(', ')}
      RETURNING *
    `;

    const result = await query(sql, values);
    return result.rows;
  }
}

module.exports = Schedule;