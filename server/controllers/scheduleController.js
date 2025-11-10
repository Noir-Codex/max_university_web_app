const Schedule = require('../models/Schedule');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * Получить расписание
 * GET /api/schedule
 * @param {number} week_type - тип недели: 0, 1, 2 (если не указан, возвращает текущую неделю)
 */
exports.getSchedule = asyncHandler(async (req, res) => {
  let { week_type, group_id, teacher_id, day_of_week, subject_id, all } = req.query;
  
  // Если параметр all=true или week_type не указан явно, возвращаем все расписание
  // Иначе определяем текущую неделю
  if (all === 'true' || all === true) {
    week_type = undefined; // undefined = все расписание
  } else if (week_type === undefined || week_type === null || week_type === '') {
    // Если week_type не указан, определяем текущую неделю (для преподавателя)
    week_type = Schedule.getCurrentWeekType();
  } else {
    week_type = parseInt(week_type);
  }
  
  const schedule = await Schedule.findAll({
    week_type,
    group_id,
    teacher_id,
    day_of_week,
    subject_id
  });
  
  res.json(schedule);
});

/**
 * Получить пару по ID
 * GET /api/schedule/:id
 */
exports.getScheduleById = asyncHandler(async (req, res) => {
  const lesson = await Schedule.findById(req.params.id);
  
  if (!lesson) {
    return res.status(404).json({
      error: 'LessonNotFound',
      message: 'Пара не найдена'
    });
  }
  
  res.json(lesson);
});

/**
 * Получить расписание на сегодня
 * GET /api/schedule/today
 */
exports.getTodaySchedule = asyncHandler(async (req, res) => {
  const { teacher_id } = req.query;
  
  const schedule = await Schedule.findToday(teacher_id);
  
  res.json(schedule);
});

/**
 * Создать пару
 * POST /api/schedule
 */
exports.createLesson = asyncHandler(async (req, res) => {
  try {
    const {
      subject_id,
      group_id,
      teacher_id,
      day_of_week,
      time_start,
      time_end,
      room,
      week_type = 0,
      lesson_type
    } = req.body;
    
    console.log('📅 Создание пары:', {
      subject_id,
      group_id,
      teacher_id,
      day_of_week,
      time_start,
      time_end,
      room,
      week_type,
      lesson_type
    });
    
    // Валидация обязательных полей
    if (!subject_id || !group_id || !teacher_id || !day_of_week || !time_start || !time_end || !lesson_type) {
      return res.status(400).json({
        error: 'ValidationError',
        message: 'Не все обязательные поля заполнены'
      });
    }
    
    // Проверка конфликтов
    const conflicts = await Schedule.checkConflicts({
      teacher_id,
      group_id,
      day_of_week,
      time_start,
      time_end,
      room
    });
    
    if (conflicts.length > 0) {
      console.log('⚠️ Обнаружены конфликты:', conflicts);
      return res.status(409).json({
        error: 'ScheduleConflict',
        message: 'Обнаружены конфликты расписания',
        conflicts: conflicts.map(c => ({
          type: c.conflict_type,
          lesson: {
            id: c.id,
            subject: c.subject_name,
            group: c.group_name,
            teacher: c.teacher_name,
            time: `${c.time_start} - ${c.time_end}`,
            room: c.room
          }
        }))
      });
    }
    
    const lesson = await Schedule.create({
      subject_id,
      group_id,
      teacher_id,
      day_of_week,
      time_start,
      time_end,
      room: room || null,
      week_type,
      lesson_type
    });
    
    console.log('✅ Пара создана успешно:', {
      id: lesson.id,
      subject_id: lesson.subject_id,
      group_id: lesson.group_id,
      week_type: week_type
    });
    
    res.status(201).json(lesson);
  } catch (error) {
    console.error('❌ Ошибка при создании пары:', error);
    throw error; // asyncHandler обработает ошибку
  }
});

/**
 * Обновить пару
 * PUT /api/schedule/:id
 */
exports.updateLesson = asyncHandler(async (req, res) => {
  const {
    subject_id,
    group_id,
    teacher_id,
    day_of_week,
    time_start,
    time_end,
    room,
    week_type,
    lesson_type
  } = req.body;
  
  const lesson = await Schedule.findById(req.params.id);
  if (!lesson) {
    return res.status(404).json({
      error: 'LessonNotFound',
      message: 'Пара не найдена'
    });
  }
  
  // Проверка конфликтов (исключая текущую пару)
  if (teacher_id || group_id || day_of_week || time_start || time_end || room) {
    const conflicts = await Schedule.checkConflicts({
      teacher_id: teacher_id || lesson.teacher_id,
      group_id: group_id || lesson.group_id,
      day_of_week: day_of_week || lesson.day_of_week,
      time_start: time_start || lesson.time_start,
      time_end: time_end || lesson.time_end,
      room: room || lesson.room,
      exclude_id: req.params.id
    });
    
    if (conflicts.length > 0) {
      return res.status(409).json({
        error: 'ScheduleConflict',
        message: 'Обнаружены конфликты расписания',
        conflicts
      });
    }
  }
  
  const updatedLesson = await Schedule.update(req.params.id, {
    subject_id,
    group_id,
    teacher_id,
    day_of_week,
    time_start,
    time_end,
    room,
    week_type,
    lesson_type
  });
  
  console.log('✅ Updated schedule:', updatedLesson.id);
  
  res.json(updatedLesson);
});

/**
 * Удалить пару
 * DELETE /api/schedule/:id
 */
exports.deleteLesson = asyncHandler(async (req, res) => {
  const lesson = await Schedule.findById(req.params.id);
  if (!lesson) {
    return res.status(404).json({
      error: 'LessonNotFound',
      message: 'Пара не найдена'
    });
  }
  
  await Schedule.delete(req.params.id);
  
  res.json({
    success: true,
    message: 'Пара успешно удалена'
  });
});

/**
 * Получить расписание на месяц
 * GET /api/schedule/month
 */
exports.getScheduleByMonth = asyncHandler(async (req, res) => {
  const { month, year, group_id, teacher_id } = req.query;
  
  // Преобразуем месяц и год в диапазон дат
  const currentYear = year ? parseInt(year) : new Date().getFullYear();
  const monthNum = parseInt(month) || new Date().getMonth() + 1;
  
  // Получаем все недели месяца
  const firstDay = new Date(currentYear, monthNum - 1, 1);
  const lastDay = new Date(currentYear, monthNum, 0);
  
  // Вычисляем номера недель
  const startWeek = getWeekNumber(firstDay);
  const endWeek = getWeekNumber(lastDay);
  
  // Получаем расписание для всех недель месяца
  const allSchedule = [];
  for (let week = startWeek; week <= endWeek; week++) {
    const weekSchedule = await Schedule.findAll({
      week,
      group_id,
      teacher_id
    });
    
    // Добавляем дату к каждому уроку
    weekSchedule.forEach(lesson => {
      const lessonDate = getDateForWeekAndDay(week, lesson.day_of_week, currentYear, monthNum);
      allSchedule.push({
        ...lesson,
        date: lessonDate.toISOString().split('T')[0]
      });
    });
  }
  
  // Фильтруем только уроки, которые попадают в нужный месяц
  const monthSchedule = allSchedule.filter(lesson => {
    const lessonDate = new Date(lesson.date);
    return lessonDate.getMonth() + 1 === monthNum && lessonDate.getFullYear() === currentYear;
  });
  
  res.json(monthSchedule);
});

/**
 * Вспомогательная функция для получения номера недели
 */
function getWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

/**
 * Вспомогательная функция для получения даты по номеру недели и дню недели
 */
function getDateForWeekAndDay(week, dayOfWeek, year, month) {
  const jan1 = new Date(year, 0, 1);
  const daysOffset = (week - 1) * 7 + (dayOfWeek - 1);
  const date = new Date(jan1);
  date.setDate(jan1.getDate() + daysOffset);
  return date;
}

/**
 * Получить статистику расписания
 * GET /api/schedule/stats
 */
exports.getScheduleStats = asyncHandler(async (req, res) => {
  let { week_type } = req.query;
  
  // Если week_type не указан, используем текущую неделю
  if (week_type === undefined || week_type === null || week_type === '') {
    week_type = Schedule.getCurrentWeekType();
  } else {
    week_type = parseInt(week_type);
  }
  
  const stats = await Schedule.getStatistics({ week_type });
  
  res.json(stats);
});