const express = require('express');
const router = express.Router();
const groupsController = require('../controllers/groupsController');
const { authenticateToken } = require('../middleware/auth');
const { requireAdmin, requireTeacher } = require('../middleware/roles');
const { groupValidation } = require('../utils/validation');

/**
 * @route   GET /api/groups
 * @desc    Получить все группы
 * @access  Private
 */
router.get('/', authenticateToken, groupsController.getAllGroups);

/**
 * @route   GET /api/groups/:id
 * @desc    Получить группу по ID
 * @access  Private
 */
router.get('/:id', authenticateToken, groupsController.getGroupById);

/**
 * @route   GET /api/groups/curator/:curatorId
 * @desc    Получить группы куратора
 * @access  Private
 */
router.get('/curator/:curatorId', authenticateToken, groupsController.getCuratorGroups);

/**
 * @route   GET /api/groups/:id/students
 * @desc    Получить студентов группы
 * @access  Private
 */
router.get('/:id/students', authenticateToken, groupsController.getGroupStudents);

/**
 * @route   POST /api/groups
 * @desc    Создать группу
 * @access  Private (Admin)
 */
router.post('/', authenticateToken, requireAdmin, groupValidation.create, groupsController.createGroup);

/**
 * @route   POST /api/groups/:id/students
 * @desc    Добавить студента в группу
 * @access  Private (Admin)
 */
router.post('/:id/students', authenticateToken, requireAdmin, groupsController.addStudent);

/**
 * @route   PUT /api/groups/:id
 * @desc    Обновить группу
 * @access  Private (Admin)
 */
router.put('/:id', authenticateToken, requireAdmin, groupValidation.update, groupsController.updateGroup);

/**
 * @route   DELETE /api/groups/:id
 * @desc    Удалить группу
 * @access  Private (Admin)
 */
router.delete('/:id', authenticateToken, requireAdmin, groupsController.deleteGroup);

/**
 * @route   DELETE /api/groups/:id/students/:studentId
 * @desc    Удалить студента из группы
 * @access  Private (Admin)
 */
router.delete('/:id/students/:studentId', authenticateToken, requireAdmin, groupsController.removeStudent);

module.exports = router;