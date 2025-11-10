const Subject = require('../models/Subject');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * Получить все дисциплины
 * GET /api/subjects
 */
exports.getAllSubjects = asyncHandler(async (req, res) => {
  const { type, search } = req.query;
  
  const subjects = await Subject.findAll({ type, search });
  
  res.json(subjects);
});

/**
 * Получить дисциплину по ID
 * GET /api/subjects/:id
 */
exports.getSubjectById = asyncHandler(async (req, res) => {
  const subject = await Subject.findById(req.params.id);
  
  if (!subject) {
    return res.status(404).json({
      error: 'SubjectNotFound',
      message: 'Дисциплина не найдена'
    });
  }
  
  res.json(subject);
});

/**
 * Создать дисциплину
 * POST /api/subjects
 */
exports.createSubject = asyncHandler(async (req, res) => {
  const { name, type, hours } = req.body;
  
  // Проверка существующей дисциплины
  const exists = await Subject.existsByName(name);
  if (exists) {
    return res.status(409).json({
      error: 'SubjectExists',
      message: 'Дисциплина с таким названием уже существует'
    });
  }
  
  const subject = await Subject.create({ name, type, hours });
  
  console.log('✅ Created subject:', subject.id, subject.name, 'Type:', subject.type);
  
  res.status(201).json(subject);
});

/**
 * Обновить дисциплину
 * PUT /api/subjects/:id
 */
exports.updateSubject = asyncHandler(async (req, res) => {
  const { name, type, hours } = req.body;
  
  const subject = await Subject.findById(req.params.id);
  if (!subject) {
    return res.status(404).json({
      error: 'SubjectNotFound',
      message: 'Дисциплина не найдена'
    });
  }
  
  // Проверка уникальности названия
  if (name && name !== subject.name) {
    const exists = await Subject.existsByName(name, req.params.id);
    if (exists) {
      return res.status(409).json({
        error: 'SubjectExists',
        message: 'Дисциплина с таким названием уже существует'
      });
    }
  }
  
  const updated = await Subject.update(req.params.id, { name, type, hours });
  
  console.log('✅ Updated subject:', updated.id, updated.name);
  
  res.json(updated);
});

/**
 * Удалить дисциплину
 * DELETE /api/subjects/:id
 */
exports.deleteSubject = asyncHandler(async (req, res) => {
  const subject = await Subject.findById(req.params.id);
  if (!subject) {
    return res.status(404).json({
      error: 'SubjectNotFound',
      message: 'Дисциплина не найдена'
    });
  }
  
  await Subject.delete(req.params.id);
  
  res.json({
    success: true,
    message: 'Дисциплина успешно удалена'
  });
});

/**
 * Получить дисциплины преподавателя
 * GET /api/subjects/teacher/:teacherId
 */
exports.getSubjectsByTeacher = asyncHandler(async (req, res) => {
  const subjects = await Subject.findByTeacher(req.params.teacherId);
  res.json(subjects);
});