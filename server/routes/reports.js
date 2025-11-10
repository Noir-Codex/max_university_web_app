const express = require('express');
const router = express.Router();
const reportsController = require('../controllers/reportsController');
const { authenticateToken } = require('../middleware/auth');
const { requireAdmin, requireTeacher } = require('../middleware/roles');

/**
 * @route   GET /api/reports/attendance
 * @desc    Получить отчет о посещаемости
 * @access  Private
 */
router.get('/attendance', authenticateToken, reportsController.getAttendanceReport);

/**
 * @route   GET /api/reports/export
 * @desc    Экспортировать отчет о посещаемости
 * @access  Private
 */
router.get('/export', authenticateToken, reportsController.exportReport);

/**
 * @route   GET /api/reports/stats/groups
 * @desc    Получить статистику по группам
 * @access  Private (Admin)
 */
router.get('/stats/groups', authenticateToken, requireAdmin, reportsController.getGroupsStats);

/**
 * @route   GET /api/reports/stats/subjects
 * @desc    Получить статистику по дисциплинам
 * @access  Private (Admin)
 */
router.get('/stats/subjects', authenticateToken, requireAdmin, reportsController.getSubjectsStats);

/**
 * @route   GET /api/reports/stats/overall
 * @desc    Получить общую статистику системы
 * @access  Private (Admin)
 */
router.get('/stats/overall', authenticateToken, requireAdmin, reportsController.getOverallStats);

/**
 * @route   GET /api/reports/export/groups
 * @desc    Экспортировать статистику групп
 * @access  Private (Admin)
 */
router.get('/export/groups', authenticateToken, requireAdmin, reportsController.exportGroupsStats);

/**
 * @route   GET /api/reports/dashboard-stats
 * @desc    Получить статистику для dashboard
 * @access  Private
 */
router.get('/dashboard-stats', authenticateToken, reportsController.getDashboardStats);

module.exports = router;