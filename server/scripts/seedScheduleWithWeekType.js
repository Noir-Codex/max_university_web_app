/**
 * Скрипт для заполнения расписания с использованием week_type
 */
const { query } = require('../config/database');

async function seedSchedule() {
  try {
    console.log('🌱 Начинаем заполнение расписания с week_type...');

    // Получаем данные для создания расписания
    const groups = await query('SELECT id FROM groups LIMIT 2');
    const subjects = await query('SELECT id FROM subjects LIMIT 3');
    const teachers = await query('SELECT id FROM users WHERE role = $1 LIMIT 2', ['teacher']);

    if (groups.rows.length === 0 || subjects.rows.length === 0 || teachers.rows.length === 0) {
      console.log('⚠️  Недостаточно данных. Сначала запустите seedData.js');
      process.exit(1);
    }

    // Удаляем старое расписание
    await query('DELETE FROM schedule');
    console.log('🗑️  Удалено старое расписание');

    // Создаем расписание для первой недели (нечетная)
    const schedule1 = [
      { day: 1, time_start: '09:00', time_end: '10:30', week_type: 1, type: 'lecture' },
      { day: 2, time_start: '11:00', time_end: '12:30', week_type: 1, type: 'practice' },
      { day: 3, time_start: '09:00', time_end: '10:30', week_type: 1, type: 'lab' },
    ];

    // Создаем расписание для второй недели (четная)
    const schedule2 = [
      { day: 1, time_start: '11:00', time_end: '12:30', week_type: 2, type: 'practice' },
      { day: 2, time_start: '09:00', time_end: '10:30', week_type: 2, type: 'lecture' },
      { day: 4, time_start: '13:00', time_end: '14:30', week_type: 2, type: 'lab' },
    ];

    // Создаем пары, которые идут каждую неделю
    const scheduleEveryWeek = [
      { day: 5, time_start: '09:00', time_end: '10:30', week_type: 0, type: 'lecture' },
    ];

    let count = 0;

    // Добавляем все пары
    for (const schedule of [...schedule1, ...schedule2, ...scheduleEveryWeek]) {
      for (const group of groups.rows) {
        for (let i = 0; i < Math.min(subjects.rows.length, teachers.rows.length); i++) {
          await query(
            `INSERT INTO schedule (subject_id, group_id, teacher_id, day_of_week, time_start, time_end, room, week_type, lesson_type)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            [
              subjects.rows[i].id,
              group.id,
              teachers.rows[i % teachers.rows.length].id,
              schedule.day,
              schedule.time_start,
              schedule.time_end,
              `${300 + count}`,
              schedule.week_type,
              schedule.type
            ]
          );
          count++;
        }
      }
    }

    console.log(`✅ Создано ${count} пар в расписании`);
    console.log('📅 Типы недель:');
    console.log('   0 = каждую неделю');
    console.log('   1 = первая (нечетная) неделя');
    console.log('   2 = вторая (четная) неделя');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Ошибка:', error);
    process.exit(1);
  }
}

seedSchedule();



