const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/scheduleController');
const { authenticateToken } = require('../middleware/auth');
const { requireAdmin, requireTeacher } = require('../middleware/roles');
const { scheduleValidation } = require('../utils/validation');

/**
 * @route   GET /api/schedule/today
 * @desc    Получить расписание на сегодня
 * @access  Private
 */
router.get('/today', authenticateToken, scheduleController.getTodaySchedule);

/**
 * @route   GET /api/schedule/stats
 * @desc    Получить статистику расписания
 * @access  Private (Admin)
 */
router.get('/stats', authenticateToken, requireAdmin, scheduleController.getScheduleStats);

/**
 * @route   GET /api/schedule/month
 * @desc    Получить расписание на месяц
 * @access  Private
 */
router.get('/month', authenticateToken, scheduleController.getScheduleByMonth);

/**
 * @route   GET /api/schedule/:id
 * @desc    Получить пару по ID
 * @access  Private
 */
router.get('/:id', authenticateToken, scheduleController.getScheduleById);

/**
 * @route   GET /api/schedule
 * @desc    Получить расписание с фильтрами
 * @access  Private
 */
router.get('/', authenticateToken, scheduleValidation.query, scheduleController.getSchedule);

/**
 * @route   POST /api/schedule
 * @desc    Создать пару
 * @access  Private (Admin)
 */
router.post('/', authenticateToken, requireAdmin, scheduleValidation.create, scheduleController.createLesson);

/**
 * @route   PUT /api/schedule/:id
 * @desc    Обновить пару
 * @access  Private (Admin)
 */
router.put('/:id', authenticateToken, requireAdmin, scheduleValidation.update, scheduleController.updateLesson);

/**
 * @route   DELETE /api/schedule/:id
 * @desc    Удалить пару
 * @access  Private (Admin)
 */
router.delete('/:id', authenticateToken, requireAdmin, scheduleController.deleteLesson);

module.exports = router;