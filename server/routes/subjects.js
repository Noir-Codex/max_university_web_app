const express = require('express');
const router = express.Router();
const subjectsController = require('../controllers/subjectsController');
const { authenticateToken } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/roles');
const { subjectValidation } = require('../utils/validation');

/**
 * @route   GET /api/subjects/teacher/:teacherId
 * @desc    Получить дисциплины преподавателя
 * @access  Private
 */
router.get('/teacher/:teacherId', authenticateToken, subjectsController.getSubjectsByTeacher);

/**
 * @route   GET /api/subjects/:id
 * @desc    Получить дисциплину по ID
 * @access  Private
 */
router.get('/:id', authenticateToken, subjectsController.getSubjectById);

/**
 * @route   GET /api/subjects
 * @desc    Получить все дисциплины
 * @access  Private
 */
router.get('/', authenticateToken, subjectsController.getAllSubjects);

/**
 * @route   POST /api/subjects
 * @desc    Создать дисциплину
 * @access  Private (Admin)
 */
router.post('/', authenticateToken, requireAdmin, subjectValidation.create, subjectsController.createSubject);

/**
 * @route   PUT /api/subjects/:id
 * @desc    Обновить дисциплину
 * @access  Private (Admin)
 */
router.put('/:id', authenticateToken, requireAdmin, subjectValidation.update, subjectsController.updateSubject);

/**
 * @route   DELETE /api/subjects/:id
 * @desc    Удалить дисциплину
 * @access  Private (Admin)
 */
router.delete('/:id', authenticateToken, requireAdmin, subjectsController.deleteSubject);

module.exports = router;