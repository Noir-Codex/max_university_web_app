const { body, param, query, validationResult } = require('express-validator');

/**
 * Middleware для проверки результатов валидации
 */
function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorDetails = errors.array().map(err => ({
      field: err.path || err.param,
      message: err.msg,
      value: err.value
    }));
    
    // Логируем ошибки валидации для отладки
    console.log('❌ Validation Error:', JSON.stringify(errorDetails, null, 2));
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    
    return res.status(400).json({
      error: 'ValidationError',
      message: 'Ошибка валидации данных',
      errors: errorDetails
    });
  }
  next();
}

/**
 * Правила валидации для пользователя
 */
const userValidation = {
  create: [
    body('telegram_id').optional().isInt().withMessage('Telegram ID должен быть числом'),
    body('username').optional().isString().trim().isLength({ max: 50 }),
    body('first_name').notEmpty().trim().isLength({ min: 1, max: 100 }).withMessage('Имя обязательно'),
    body('last_name').optional().trim().isLength({ max: 100 }),
    body('role').isIn(['teacher', 'admin', 'student']).withMessage('Неверная роль пользователя'),
    body('email').notEmpty().isEmail().normalizeEmail().withMessage('Email обязателен'),
    body('password').notEmpty().isLength({ min: 6 }).withMessage('Пароль обязателен (минимум 6 символов)'),
    body('group_id').optional().isInt().withMessage('ID группы должен быть числом'),
    body('group_ids').optional().isArray().withMessage('group_ids должен быть массивом'),
    body('group_ids.*').optional().isInt().withMessage('Каждый ID группы должен быть числом'),
    validate
  ],
  update: [
    param('id').isInt().withMessage('ID должен быть числом'),
    body('username').optional().isString().trim().isLength({ max: 50 }),
    body('first_name').optional().trim().isLength({ min: 1, max: 100 }),
    body('last_name').optional().trim().isLength({ max: 100 }),
    body('role').optional().isIn(['teacher', 'admin', 'student']),
    body('email').optional().isEmail().normalizeEmail(),
    body('group_id').optional().isInt().withMessage('ID группы должен быть числом'),
    body('group_ids').optional().isArray().withMessage('group_ids должен быть массивом'),
    body('group_ids.*').optional().isInt().withMessage('Каждый ID группы должен быть числом'),
    validate
  ]
};

/**
 * Правила валидации для группы
 */
const groupValidation = {
  create: [
    body('name').notEmpty().trim().isLength({ min: 2, max: 50 }).withMessage('Название группы обязательно (2-50 символов)'),
    body('course').isInt({ min: 1, max: 6 }).withMessage('Курс должен быть числом от 1 до 6'),
    body('specialty').notEmpty().trim().isLength({ min: 2, max: 200 }).withMessage('Специальность обязательна'),
    body('curator_id').optional().isInt().withMessage('ID куратора должен быть числом'),
    validate
  ],
  update: [
    param('id').isInt().withMessage('ID должен быть числом'),
    body('name').optional().trim().isLength({ min: 2, max: 50 }),
    body('course').optional().isInt({ min: 1, max: 6 }),
    body('specialty').optional().trim().isLength({ min: 2, max: 200 }),
    body('curator_id').optional().isInt(),
    validate
  ]
};

/**
 * Правила валидации для дисциплины
 */
const subjectValidation = {
  create: [
    body('name').notEmpty().trim().isLength({ min: 2, max: 200 }).withMessage('Название дисциплины обязательно'),
    body('type').isIn(['Лекция', 'Практика', 'Лабораторная']).withMessage('Неверный тип занятий'),
    body('hours').isInt({ min: 1, max: 500 }).withMessage('Количество часов должно быть от 1 до 500'),
    validate
  ],
  update: [
    param('id').isInt().withMessage('ID должен быть числом'),
    body('name').optional().trim().isLength({ min: 2, max: 200 }),
    body('type').optional().isIn(['Лекция', 'Практика', 'Лабораторная']),
    body('hours').optional().isInt({ min: 1, max: 500 }),
    validate
  ]
};

/**
 * Правила валидации для расписания
 */
const scheduleValidation = {
  create: [
    body('subject_id').isInt().withMessage('ID дисциплины обязателен'),
    body('group_id').isInt().withMessage('ID группы обязателен'),
    body('teacher_id').isInt().withMessage('ID преподавателя обязателен'),
    body('day_of_week').isInt({ min: 1, max: 7 }).withMessage('День недели должен быть от 1 до 7'),
    body('time_start').matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('Неверный формат времени начала (HH:MM)'),
    body('time_end').matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('Неверный формат времени окончания (HH:MM)'),
    body('room').optional().trim().isLength({ max: 20 }),
    body('week_number').optional().isInt({ min: 1, max: 52 }),
    body('lesson_type').isIn(['lecture', 'practice', 'lab']).withMessage('Неверный тип занятия'),
    validate
  ],
  update: [
    param('id').isInt().withMessage('ID должен быть числом'),
    body('subject_id').optional().isInt(),
    body('group_id').optional().isInt(),
    body('teacher_id').optional().isInt(),
    body('day_of_week').optional().isInt({ min: 1, max: 7 }),
    body('time_start').optional().matches(/^([01]\d|2[0-3]):([0-5]\d)$/),
    body('time_end').optional().matches(/^([01]\d|2[0-3]):([0-5]\d)$/),
    body('room').optional().trim().isLength({ max: 20 }),
    body('week_number').optional().isInt({ min: 1, max: 52 }),
    body('lesson_type').optional().isIn(['lecture', 'practice', 'lab']),
    validate
  ],
  query: [
    query('week').optional().isInt({ min: 1, max: 52 }).withMessage('Неверный номер недели'),
    query('group_id').optional().isInt().withMessage('ID группы должен быть числом'),
    query('teacher_id').optional().isInt().withMessage('ID преподавателя должен быть числом'),
    validate
  ]
};

/**
 * Правила валидации для посещаемости
 */
const attendanceValidation = {
  create: [
    body('lesson_id').isInt().withMessage('ID пары обязателен'),
    body('student_id').isInt().withMessage('ID студента обязателен'),
    body('status').isIn(['present', 'absent', 'late', 'excused']).withMessage('Неверный статус посещаемости'),
    body('notes').optional().trim().isLength({ max: 500 }),
    validate
  ],
  bulkCreate: [
    body('lesson_id').isInt().withMessage('ID пары обязателен'),
    body('attendance').isArray({ min: 1 }).withMessage('Массив посещаемости обязателен'),
    body('attendance.*.student_id').isInt().withMessage('ID студента должен быть числом'),
    body('attendance.*.status').isIn(['present', 'absent', 'late', 'excused']).withMessage('Неверный статус'),
    validate
  ],
  query: [
    query('lesson_id').optional().isInt(),
    query('group_id').optional().isInt(),
    query('student_id').optional().isInt(),
    query('date_from').optional().isISO8601().withMessage('Неверный формат даты начала'),
    query('date_to').optional().isISO8601().withMessage('Неверный формат даты окончания'),
    validate
  ]
};

/**
 * Правила валидации для аутентификации
 */
const authValidation = {
  login: [
    body('initData').notEmpty().withMessage('initData обязателен'),
    validate
  ]
};

module.exports = {
  validate,
  userValidation,
  groupValidation,
  subjectValidation,
  scheduleValidation,
  attendanceValidation,
  authValidation
};