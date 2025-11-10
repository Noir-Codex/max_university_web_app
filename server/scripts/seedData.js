const bcrypt = require('bcrypt');
const { query, getClient } = require('../config/database');

/**
 * Seed данные для тестирования
 */

// Генераторы случайных данных
const getRandomDate = (daysAgo) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split('T')[0];
};

const getRandomStatus = () => {
  const statuses = ['present', 'present', 'present', 'absent', 'late']; // 60% present, 20% absent, 20% late
  return statuses[Math.floor(Math.random() * statuses.length)];
};

async function seedData() {
  const client = await getClient();
  
  try {
    await client.query('BEGIN');

    console.log('🌱 Начинаем заполнение базы данных тестовыми данными...\n');

    // Очистка существующих данных (в обратном порядке зависимостей)
    console.log('🗑️  Очистка существующих данных...');
    await client.query('DELETE FROM attendance');
    await client.query('DELETE FROM schedule');
    await client.query('DELETE FROM group_students');
    await client.query('DELETE FROM subjects');
    await client.query('DELETE FROM groups');
    await client.query('DELETE FROM users');
    
    // Сброс последовательностей
    await client.query('ALTER SEQUENCE users_id_seq RESTART WITH 1');
    await client.query('ALTER SEQUENCE groups_id_seq RESTART WITH 1');
    await client.query('ALTER SEQUENCE subjects_id_seq RESTART WITH 1');
    await client.query('ALTER SEQUENCE schedule_id_seq RESTART WITH 1');
    await client.query('ALTER SEQUENCE attendance_id_seq RESTART WITH 1');
    
    console.log('✅ Данные очищены\n');

    // 1. Создание пользователей
    console.log('👥 Создание пользователей...');
    const password = await bcrypt.hash('admin123', 10);
    
    // Админ
    const adminResult = await client.query(`
      INSERT INTO users (telegram_id, username, first_name, last_name, role, email, password_hash)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id
    `, [123456789, 'admin', 'Администратор', 'Системы', 'admin', 'admin@university.ru', password]);
    const adminId = adminResult.rows[0].id;
    console.log(`  ✓ Админ создан (ID: ${adminId})`);

    // Преподаватели
    const teachers = [
      { telegram_id: 123456790, username: 'ivanov_teacher', first_name: 'Иван', last_name: 'Иванов', email: 'ivanov@university.ru' },
      { telegram_id: 123456791, username: 'petrov_teacher', first_name: 'Пётр', last_name: 'Петров', email: 'petrov@university.ru' },
      { telegram_id: 123456792, username: 'sidorova_teacher', first_name: 'Анна', last_name: 'Сидорова', email: 'sidorova@university.ru' }
    ];
    
    const teacherIds = [];
    for (const teacher of teachers) {
      const result = await client.query(`
        INSERT INTO users (telegram_id, username, first_name, last_name, role, email, password_hash)
        VALUES ($1, $2, $3, $4, 'teacher', $5, $6)
        RETURNING id
      `, [teacher.telegram_id, teacher.username, teacher.first_name, teacher.last_name, teacher.email, password]);
      teacherIds.push(result.rows[0].id);
    }
    console.log(`  ✓ Преподаватели созданы (${teacherIds.length})`);

    // Студенты
    const studentNames = [
      { first: 'Александр', last: 'Смирнов' },
      { first: 'Мария', last: 'Кузнецова' },
      { first: 'Дмитрий', last: 'Попов' },
      { first: 'Екатерина', last: 'Соколова' },
      { first: 'Андрей', last: 'Морозов' },
      { first: 'Ольга', last: 'Новикова' },
      { first: 'Сергей', last: 'Волков' },
      { first: 'Татьяна', last: 'Лебедева' },
      { first: 'Николай', last: 'Козлов' },
      { first: 'Елена', last: 'Васильева' },
      { first: 'Михаил', last: 'Фёдоров' },
      { first: 'Наталья', last: 'Михайлова' },
      { first: 'Владимир', last: 'Алексеев' },
      { first: 'Ирина', last: 'Романова' },
      { first: 'Алексей', last: 'Егоров' },
      { first: 'Светлана', last: 'Григорьева' },
      { first: 'Павел', last: 'Денисов' },
      { first: 'Юлия', last: 'Николаева' },
      { first: 'Виктор', last: 'Орлов' },
      { first: 'Анастасия', last: 'Макарова' },
      { first: 'Игорь', last: 'Захаров' },
      { first: 'Вера', last: 'Павлова' },
      { first: 'Максим', last: 'Степанов' },
      { first: 'Дарья', last: 'Белова' },
      { first: 'Роман', last: 'Тихонов' },
      { first: 'Валерия', last: 'Комарова' },
      { first: 'Артём', last: 'Борисов' },
      { first: 'Марина', last: 'Яковлева' }
    ];
    
    const studentIds = [];
    for (let i = 0; i < studentNames.length; i++) {
      const student = studentNames[i];
      const result = await client.query(`
        INSERT INTO users (telegram_id, username, first_name, last_name, role, email, password_hash)
        VALUES ($1, $2, $3, $4, 'student', $5, $6)
        RETURNING id
      `, [
        200000 + i,
        `${student.last.toLowerCase()}_${student.first.toLowerCase()}`,
        student.first,
        student.last,
        `${student.last.toLowerCase()}.${student.first.toLowerCase()}@student.university.ru`,
        password
      ]);
      studentIds.push(result.rows[0].id);
    }
    console.log(`  ✓ Студенты созданы (${studentIds.length})\n`);

    // 2. Создание групп
    console.log('👨‍🎓 Создание групп...');
    const groups = [
      { name: 'ИС-301', course: 3, specialty: 'Информационные системы', curator_id: teacherIds[0] },
      { name: 'ИС-302', course: 3, specialty: 'Информационные системы', curator_id: teacherIds[1] },
      { name: 'ПИ-401', course: 4, specialty: 'Прикладная информатика', curator_id: teacherIds[0] },
      { name: 'ПИ-402', course: 4, specialty: 'Прикладная информатика', curator_id: teacherIds[2] }
    ];
    
    const groupIds = [];
    for (const group of groups) {
      const result = await client.query(`
        INSERT INTO groups (name, course, specialty, curator_id)
        VALUES ($1, $2, $3, $4)
        RETURNING id
      `, [group.name, group.course, group.specialty, group.curator_id]);
      groupIds.push(result.rows[0].id);
    }
    console.log(`  ✓ Группы созданы (${groupIds.length})\n`);

    // 3. Привязка студентов к группам
    console.log('🔗 Привязка студентов к группам...');
    const studentsPerGroup = Math.floor(studentIds.length / groupIds.length);
    for (let i = 0; i < groupIds.length; i++) {
      const groupId = groupIds[i];
      const startIdx = i * studentsPerGroup;
      const endIdx = i === groupIds.length - 1 ? studentIds.length : (i + 1) * studentsPerGroup;
      
      for (let j = startIdx; j < endIdx; j++) {
        await client.query(`
          INSERT INTO group_students (group_id, student_id)
          VALUES ($1, $2)
        `, [groupId, studentIds[j]]);
      }
      console.log(`  ✓ Группа ${groups[i].name}: ${endIdx - startIdx} студентов`);
    }
    console.log('');

    // 4. Создание дисциплин
    console.log('📚 Создание дисциплин...');
    const subjects = [
      { name: 'Программирование', type: 'Лекция', hours: 120 },
      { name: 'Базы данных', type: 'Практика', hours: 90 },
      { name: 'Веб-разработка', type: 'Лабораторная', hours: 80 },
      { name: 'Алгоритмы и структуры данных', type: 'Лекция', hours: 100 },
      { name: 'Математика', type: 'Лекция', hours: 110 }
    ];
    
    const subjectIds = [];
    for (const subject of subjects) {
      const result = await client.query(`
        INSERT INTO subjects (name, type, hours)
        VALUES ($1, $2, $3)
        RETURNING id
      `, [subject.name, subject.type, subject.hours]);
      subjectIds.push(result.rows[0].id);
    }
    console.log(`  ✓ Дисциплины созданы (${subjectIds.length})\n`);

    // 5. Создание расписания
    console.log('📅 Создание расписания...');
    const timeSlots = [
      { start: '09:00', end: '10:30' },
      { start: '10:45', end: '12:15' },
      { start: '12:30', end: '14:00' },
      { start: '14:15', end: '15:45' }
    ];
    
    const rooms = ['101', '205', '308', '412', '501'];
    const lessonTypes = ['lecture', 'practice', 'lab'];
    let scheduleCount = 0;

    // Создаём расписание для каждой группы на 2 недели
    for (let week = 1; week <= 2; week++) {
      for (const groupId of groupIds) {
        for (let day = 1; day <= 5; day++) { // Понедельник - Пятница
          // 3-4 пары в день
          const lessonsPerDay = 3 + Math.floor(Math.random() * 2);
          
          for (let lessonIdx = 0; lessonIdx < lessonsPerDay; lessonIdx++) {
            const subjectId = subjectIds[Math.floor(Math.random() * subjectIds.length)];
            const teacherId = teacherIds[Math.floor(Math.random() * teacherIds.length)];
            const timeSlot = timeSlots[lessonIdx];
            const room = rooms[Math.floor(Math.random() * rooms.length)];
            const lessonType = lessonTypes[Math.floor(Math.random() * lessonTypes.length)];
            
            await client.query(`
              INSERT INTO schedule (subject_id, group_id, teacher_id, day_of_week, time_start, time_end, room, week_number, lesson_type)
              VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            `, [subjectId, groupId, teacherId, day, timeSlot.start, timeSlot.end, room, week, lessonType]);
            
            scheduleCount++;
          }
        }
      }
    }
    console.log(`  ✓ Расписание создано (${scheduleCount} пар)\n`);

    // 6. Создание данных посещаемости за последние 2 недели
    console.log('✅ Создание данных посещаемости...');
    
    // Получаем все пары из расписания
    const scheduleResult = await client.query(`
      SELECT s.id as lesson_id, s.group_id, s.day_of_week
      FROM schedule s
      WHERE s.week_number <= 2
    `);
    
    let attendanceCount = 0;
    
    for (const lesson of scheduleResult.rows) {
      // Получаем студентов группы
      const studentsResult = await client.query(`
        SELECT student_id
        FROM group_students
        WHERE group_id = $1
      `, [lesson.group_id]);
      
      // Создаём записи посещаемости для каждого студента за последние 2 недели
      for (let weekAgo = 0; weekAgo < 14; weekAgo++) {
        const date = getRandomDate(weekAgo);
        const dayOfWeek = new Date(date).getDay() || 7;
        
        // Создаём посещаемость только для соответствующего дня недели
        if (dayOfWeek === lesson.day_of_week) {
          for (const student of studentsResult.rows) {
            const status = getRandomStatus();
            
            await client.query(`
              INSERT INTO attendance (lesson_id, student_id, status, date)
              VALUES ($1, $2, $3, $4)
              ON CONFLICT (lesson_id, student_id, date) DO NOTHING
            `, [lesson.lesson_id, student.student_id, status, date]);
            
            attendanceCount++;
          }
        }
      }
    }
    
    console.log(`  ✓ Посещаемость создана (${attendanceCount} записей)\n`);

    await client.query('COMMIT');
    
    console.log('✨ База данных успешно заполнена тестовыми данными!\n');
    console.log('📊 Статистика:');
    console.log(`   • Пользователей: ${1 + teacherIds.length + studentIds.length} (1 админ, ${teacherIds.length} преподавателей, ${studentIds.length} студентов)`);
    console.log(`   • Групп: ${groupIds.length}`);
    console.log(`   • Дисциплин: ${subjectIds.length}`);
    console.log(`   • Пар в расписании: ${scheduleCount}`);
    console.log(`   • Записей посещаемости: ${attendanceCount}`);
    console.log('\n🔑 Данные для входа:');
    console.log('   Email: admin@university.ru');
    console.log('   Password: admin123');
    console.log('\n   (Такой же пароль для всех пользователей)\n');

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Ошибка при заполнении базы данных:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Запуск seed скрипта
if (require.main === module) {
  seedData()
    .then(() => {
      console.log('✅ Seed завершён успешно');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Ошибка seed:', error);
      process.exit(1);
    });
}

module.exports = { seedData };