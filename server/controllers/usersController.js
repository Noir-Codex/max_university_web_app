const User = require('../models/User');
const { query } = require('../config/database');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * Получить всех пользователей
 * GET /api/users
 */
exports.getAllUsers = asyncHandler(async (req, res) => {
  const { role, search } = req.query;
  
  const users = await User.findAll({ role, search });
  
  res.json(users);
});

/**
 * Получить пользователя по ID
 * GET /api/users/:id
 */
exports.getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  
  if (!user) {
    return res.status(404).json({
      error: 'UserNotFound',
      message: 'Пользователь не найден'
    });
  }
  
  res.json(user);
});

/**
 * Создать пользователя
 * POST /api/users
 */
exports.createUser = asyncHandler(async (req, res) => {
  let { telegram_id, username, first_name, last_name, role, email, password, group_id, group_ids } = req.body;
  
  // Генерируем telegram_id если не передан (для пользователей созданных через админку)
  if (!telegram_id) {
    telegram_id = Math.floor(Math.random() * 1000000000) + 100000000;
  }
  
  // Проверка существующего пользователя
  if (telegram_id) {
    const existing = await User.findByTelegramId(telegram_id);
    if (existing) {
      return res.status(409).json({
        error: 'UserExists',
        message: 'Пользователь с таким Telegram ID уже существует'
      });
    }
  }
  
  if (email) {
    const existing = await User.findByEmail(email);
    if (existing) {
      return res.status(409).json({
        error: 'EmailExists',
        message: 'Пользователь с таким email уже существует'
      });
    }
  }
  
  // Валидация группы для студента
  if (role === 'student' && !group_id) {
    return res.status(400).json({
      error: 'ValidationError',
      message: 'Для студента необходимо указать группу'
    });
  }
  
  // Парсим имя на составные части если передано полное ФИО
  if (first_name && !last_name) {
    const nameParts = first_name.trim().split(/\s+/);
    if (nameParts.length >= 2) {
      last_name = nameParts[0]; // Фамилия
      first_name = nameParts.slice(1).join(' '); // Имя + отчество
    }
  }
  
  const user = await User.create({
    telegram_id,
    username,
    first_name,
    last_name,
    role,
    email,
    password
  });
  
  // Привязываем студента к группе
  if (role === 'student' && group_id) {
    await query(
      'INSERT INTO group_students (group_id, student_id) VALUES ($1, $2)',
      [group_id, user.id]
    );
    console.log('✅ Added student to group:', user.id, '-> Group:', group_id);
  }
  
  // Для преподавателя сохраняем информацию о группах (будет использоваться при создании расписания)
  // Примечание: связь преподаватель-группа осуществляется через таблицу schedule
  if (role === 'teacher' && group_ids && group_ids.length > 0) {
    console.log('✅ Teacher groups (will be used in schedule):', group_ids);
  }
  
  console.log('✅ Created user:', user.id, user.email, 'Role:', user.role);
  
  res.status(201).json(user);
});

/**
 * Обновить пользователя
 * PUT /api/users/:id
 */
exports.updateUser = asyncHandler(async (req, res) => {
  const { username, first_name, last_name, role, email, password, group_id, group_ids } = req.body;
  
  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({
      error: 'UserNotFound',
      message: 'Пользователь не найден'
    });
  }
  
  const updatedUser = await User.update(req.params.id, {
    username,
    first_name,
    last_name,
    role,
    email,
    password
  });
  
  // Обновляем группу студента при необходимости
  if (role === 'student' && group_id !== undefined) {
    // Удаляем старые связи
    await query('DELETE FROM group_students WHERE student_id = $1', [req.params.id]);
    
    // Добавляем новую связь, если группа указана
    if (group_id) {
      await query(
        'INSERT INTO group_students (group_id, student_id) VALUES ($1, $2)',
        [group_id, req.params.id]
      );
      console.log('✅ Updated student group:', req.params.id, '-> Group:', group_id);
    }
  }
  
  // Для преподавателя обновление групп происходит через расписание
  if (role === 'teacher' && group_ids) {
    console.log('✅ Teacher groups updated (affects schedule):', group_ids);
  }
  
  console.log('✅ Updated user:', updatedUser.id, updatedUser.email);
  
  res.json(updatedUser);
});

/**
 * Удалить пользователя
 * DELETE /api/users/:id
 */
exports.deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({
      error: 'UserNotFound',
      message: 'Пользователь не найден'
    });
  }
  
  await User.delete(req.params.id);
  
  res.json({
    success: true,
    message: 'Пользователь успешно удален'
  });
});

/**
 * Получить всех преподавателей
 * GET /api/users/teachers
 */
exports.getTeachers = asyncHandler(async (req, res) => {
  const teachers = await User.findAllTeachers();
  res.json(teachers);
});

/**
 * Получить студентов группы
 * GET /api/users/students/:groupId
 */
exports.getStudentsByGroup = asyncHandler(async (req, res) => {
  const students = await User.findStudentsByGroup(req.params.groupId);
  res.json(students);
});