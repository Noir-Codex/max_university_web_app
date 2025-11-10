const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');
const { authValidation } = require('../utils/validation');

/**
 * @route   POST /api/auth/login
 * @desc    Авторизация по email и паролю
 * @access  Public
 */
router.post('/login', authController.emailLogin);

/**
 * @route   POST /api/auth/telegram
 * @desc    Авторизация через Telegram WebApp
 * @access  Public
 */
router.post('/telegram', authController.login);

/**
 * @route   GET /api/auth/me
 * @desc    Получить текущего пользователя
 * @access  Private
 */
router.get('/me', authenticateToken, authController.getMe);

/**
 * @route   POST /api/auth/logout
 * @desc    Выход из системы
 * @access  Private
 */
router.post('/logout', authenticateToken, authController.logout);

/**
 * @route   POST /api/auth/dev-login
 * @desc    Dev login (только development)
 * @access  Public (только в development!)
 */
if (process.env.NODE_ENV === 'development') {
  router.post('/dev-login', authController.devLogin);
}

module.exports = router;