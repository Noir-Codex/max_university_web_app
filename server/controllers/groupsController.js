const Group = require('../models/Group');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * Получить все группы
 * GET /api/groups
 */
exports.getAllGroups = asyncHandler(async (req, res) => {
  const { course, curator_id, search, teacher_id } = req.query;
  
  let groups;
  
  if (teacher_id) {
    // Для преподавателя - только его группы
    groups = await Group.findByTeacher(teacher_id);
  } else {
    groups = await Group.findAll({ course, curator_id, search });
  }
  
  res.json(groups);
});

/**
 * Получить группу по ID
 * GET /api/groups/:id
 */
exports.getGroupById = asyncHandler(async (req, res) => {
  const group = await Group.findById(req.params.id);
  
  if (!group) {
    return res.status(404).json({
      error: 'GroupNotFound',
      message: 'Группа не найдена'
    });
  }
  
  res.json(group);
});

/**
 * Получить группы куратора
 * GET /api/groups/curator/:curatorId
 */
exports.getCuratorGroups = asyncHandler(async (req, res) => {
  const { curatorId } = req.params;
  
  const groups = await Group.findAll({ curator_id: curatorId });
  
  res.json(groups);
});

/**
 * Создать группу
 * POST /api/groups
 */
exports.createGroup = asyncHandler(async (req, res) => {
  const { name, course, specialty, curator_id } = req.body;
  
  // Проверка существующей группы
  const exists = await Group.existsByName(name);
  if (exists) {
    return res.status(409).json({
      error: 'GroupExists',
      message: 'Группа с таким названием уже существует'
    });
  }
  
  const group = await Group.create({
    name,
    course,
    specialty,
    curator_id
  });
  
  console.log('✅ Created group:', group.id, group.name, 'Course:', group.course);
  
  res.status(201).json(group);
});

/**
 * Обновить группу
 * PUT /api/groups/:id
 */
exports.updateGroup = asyncHandler(async (req, res) => {
  const { name, course, specialty, curator_id } = req.body;
  
  const group = await Group.findById(req.params.id);
  if (!group) {
    return res.status(404).json({
      error: 'GroupNotFound',
      message: 'Группа не найдена'
    });
  }
  
  // Проверка уникальности названия
  if (name && name !== group.name) {
    const exists = await Group.existsByName(name, req.params.id);
    if (exists) {
      return res.status(409).json({
        error: 'GroupExists',
        message: 'Группа с таким названием уже существует'
      });
    }
  }
  
  const updatedGroup = await Group.update(req.params.id, {
    name,
    course,
    specialty,
    curator_id
  });
  
  console.log('✅ Updated group:', updatedGroup.id, updatedGroup.name);
  
  res.json(updatedGroup);
});

/**
 * Удалить группу
 * DELETE /api/groups/:id
 */
exports.deleteGroup = asyncHandler(async (req, res) => {
  const group = await Group.findById(req.params.id);
  if (!group) {
    return res.status(404).json({
      error: 'GroupNotFound',
      message: 'Группа не найдена'
    });
  }
  
  // Проверка наличия студентов
  if (parseInt(group.students_count) > 0) {
    return res.status(400).json({
      error: 'GroupHasStudents',
      message: 'Невозможно удалить группу, в которой есть студенты'
    });
  }
  
  await Group.delete(req.params.id);
  
  res.json({
    success: true,
    message: 'Группа успешно удалена'
  });
});

/**
 * Получить студентов группы
 * GET /api/groups/:id/students
 */
exports.getGroupStudents = asyncHandler(async (req, res) => {
  const group = await Group.findById(req.params.id);
  if (!group) {
    return res.status(404).json({
      error: 'GroupNotFound',
      message: 'Группа не найдена'
    });
  }
  
  const students = await Group.getStudents(req.params.id);
  res.json(students);
});

/**
 * Добавить студента в группу
 * POST /api/groups/:id/students
 */
exports.addStudent = asyncHandler(async (req, res) => {
  const { student_id } = req.body;
  
  const group = await Group.findById(req.params.id);
  if (!group) {
    return res.status(404).json({
      error: 'GroupNotFound',
      message: 'Группа не найдена'
    });
  }
  
  await Group.addStudent(req.params.id, student_id);
  
  res.status(201).json({
    success: true,
    message: 'Студент успешно добавлен в группу'
  });
});

/**
 * Удалить студента из группы
 * DELETE /api/groups/:id/students/:studentId
 */
exports.removeStudent = asyncHandler(async (req, res) => {
  const { id, studentId } = req.params;
  
  await Group.removeStudent(id, studentId);
  
  res.json({
    success: true,
    message: 'Студент успешно удален из группы'
  });
});