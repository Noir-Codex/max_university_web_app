const express = require('express');
const router = express.Router();
const importController = require('../controllers/importController');
const { authenticateToken } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/roles');

/**
 * @route   POST /api/import/schedule/validate
 * @desc    Валидировать данные расписания перед импортом
 * @access  Private (Admin)
 */
router.post(
  '/schedule/validate',
  authenticateToken,
  requireAdmin,
  importController.uploadFile,
  importController.validateSchedule
);

/**
 * @route   POST /api/import/schedule
 * @desc    Импортировать расписание из файла
 * @access  Private (Admin)
 */
router.post(
  '/schedule',
  authenticateToken,
  requireAdmin,
  importController.uploadFile,
  importController.importSchedule
);

module.exports = router;