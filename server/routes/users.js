const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');
const { authenticateToken } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/roles');
const { userValidation } = require('../utils/validation');

/**
 * @route   GET /api/users
 * @desc    Получить всех пользователей
 * @access  Private (Admin)
 */
router.get('/', authenticateToken, requireAdmin, usersController.getAllUsers);

/**
 * @route   GET /api/users/teachers
 * @desc    Получить всех преподавателей
 * @access  Private
 */
router.get('/teachers', authenticateToken, usersController.getTeachers);

/**
 * @route   GET /api/users/students/:groupId
 * @desc    Получить студентов группы
 * @access  Private
 */
router.get('/students/:groupId', authenticateToken, usersController.getStudentsByGroup);

/**
 * @route   GET /api/users/:id
 * @desc    Получить пользователя по ID
 * @access  Private
 */
router.get('/:id', authenticateToken, usersController.getUserById);

/**
 * @route   POST /api/users
 * @desc    Создать пользователя
 * @access  Private (Admin)
 */
router.post('/', authenticateToken, requireAdmin, userValidation.create, usersController.createUser);

/**
 * @route   PUT /api/users/:id
 * @desc    Обновить пользователя
 * @access  Private (Admin)
 */
router.put('/:id', authenticateToken, requireAdmin, userValidation.update, usersController.updateUser);

/**
 * @route   DELETE /api/users/:id
 * @desc    Удалить пользователя
 * @access  Private (Admin)
 */
router.delete('/:id', authenticateToken, requireAdmin, usersController.deleteUser);

module.exports = router;