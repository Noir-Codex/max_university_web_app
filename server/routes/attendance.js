const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const { authenticateToken } = require('../middleware/auth');
const { requireAdmin, requireTeacher } = require('../middleware/roles');
const { attendanceValidation } = require('../utils/validation');

/**
 * @route   GET /api/attendance/stats/overall
 * @desc    Получить общую статистику посещаемости
 * @access  Private (Admin)
 */
router.get('/stats/overall', authenticateToken, requireAdmin, attendanceController.getOverallStats);

/**
 * @route   GET /api/attendance/stats/student/:studentId
 * @desc    Получить статистику посещаемости студента
 * @access  Private
 */
router.get('/stats/student/:studentId', authenticateToken, attendanceController.getStudentStats);

/**
 * @route   GET /api/attendance/stats/group/:groupId
 * @desc    Получить статистику посещаемости по группе
 * @access  Private
 */
router.get('/stats/group/:groupId', authenticateToken, attendanceController.getGroupStats);

/**
 * @route   GET /api/attendance/stats/subject/:subjectId
 * @desc    Получить статистику посещаемости по дисциплине
 * @access  Private
 */
router.get('/stats/subject/:subjectId', authenticateToken, attendanceController.getSubjectStats);

/**
 * @route   GET /api/attendance/lesson/:lessonId
 * @desc    Получить посещаемость для конкретной пары
 * @access  Private (Teacher или Admin)
 */
router.get('/lesson/:lessonId', authenticateToken, requireTeacher, attendanceController.getAttendanceByLesson);

/**
 * @route   GET /api/attendance
 * @desc    Получить посещаемость с фильтрами
 * @access  Private
 */
router.get('/', authenticateToken, attendanceValidation.query, attendanceController.getAttendance);

/**
 * @route   POST /api/attendance/bulk
 * @desc    Массовое сохранение посещаемости
 * @access  Private (Teacher или Admin)
 */
router.post('/bulk', authenticateToken, requireTeacher, attendanceValidation.bulkCreate, attendanceController.saveBulkAttendance);

/**
 * @route   POST /api/attendance
 * @desc    Сохранить посещаемость
 * @access  Private (Teacher или Admin)
 */
router.post('/', authenticateToken, requireTeacher, attendanceValidation.create, attendanceController.saveAttendance);

/**
 * @route   PUT /api/attendance/:id
 * @desc    Обновить запись о посещаемости
 * @access  Private (Teacher или Admin)
 */
router.put('/:id', authenticateToken, requireTeacher, attendanceController.updateAttendance);

/**
 * @route   DELETE /api/attendance/:id
 * @desc    Удалить запись о посещаемости
 * @access  Private (Teacher или Admin)
 */
router.delete('/:id', authenticateToken, requireTeacher, attendanceController.deleteAttendance);

module.exports = router;