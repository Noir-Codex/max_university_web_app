const User = require('../models/User');
const { validateTelegramInitData, generateToken } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const bcrypt = require('bcrypt');

/**
 * Вход по email и паролю
 * POST /api/auth/email-login
 */
exports.emailLogin = asyncHandler(async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('🔐 Попытка входа:', { email });

    // Проверка наличия данных
    if (!email || !password) {
      return res.status(400).json({
        error: 'MissingCredentials',
        message: 'Email и пароль обязательны'
      });
    }

    // Находим пользователя по email
    const user = await User.findByEmail(email);

    if (!user) {
      console.log('❌ Пользователь не найден:', email);
      return res.status(401).json({
        error: 'InvalidCredentials',
        message: 'Неверный email или пароль'
      });
    }

    console.log('✅ Пользователь найден:', { id: user.id, email: user.email, role: user.role });

    // Проверяем пароль
    const isValidPassword = await User.verifyPassword(user.id, password);

    if (!isValidPassword) {
      console.log('❌ Неверный пароль для пользователя:', email);
      return res.status(401).json({
        error: 'InvalidCredentials',
        message: 'Неверный email или пароль'
      });
    }

    console.log('✅ Пароль верный');

    // Генерируем JWT токен
    const token = generateToken({
      id: user.id,
      telegram_id: user.telegram_id,
      role: user.role
    });

    console.log('✅ Токен сгенерирован для пользователя:', email);

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        telegram_id: user.telegram_id,
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        email: user.email
      }
    });
  } catch (error) {
    console.error('❌ Ошибка при входе:', error);
    throw error; // asyncHandler обработает ошибку
  }
});

/**
 * Вход через Telegram WebApp
 * POST /api/auth/login
 */
exports.login = asyncHandler(async (req, res) => {
  const { initData } = req.body;

  // Валидация Telegram initData
  const telegramUser = validateTelegramInitData(
    initData,
    process.env.TELEGRAM_BOT_TOKEN
  );

  if (!telegramUser) {
    return res.status(401).json({
      error: 'InvalidInitData',
      message: 'Недействительные данные авторизации Telegram'
    });
  }

  // Создаем или обновляем пользователя
  const user = await User.upsertFromTelegram(telegramUser);

  // Генерируем JWT токен
  const token = generateToken({
    id: user.id,
    telegram_id: user.telegram_id,
    role: user.role
  });

  res.json({
    success: true,
    token,
    user: {
      id: user.id,
      telegram_id: user.telegram_id,
      username: user.username,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role,
      email: user.email
    }
  });
});

/**
 * Получить текущего пользователя
 * GET /api/auth/me
 */
exports.getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    return res.status(404).json({
      error: 'UserNotFound',
      message: 'Пользователь не найден'
    });
  }

  res.json({
    id: user.id,
    telegram_id: user.telegram_id,
    username: user.username,
    first_name: user.first_name,
    last_name: user.last_name,
    role: user.role,
    email: user.email,
    created_at: user.created_at
  });
});

/**
 * Выход (опционально, токены хранятся на клиенте)
 * POST /api/auth/logout
 */
exports.logout = asyncHandler(async (req, res) => {
  // JWT токены stateless, просто возвращаем успех
  // Клиент должен удалить токен из хранилища
  res.json({
    success: true,
    message: 'Успешный выход из системы'
  });
});

/**
 * Dev login (только для разработки!)
 * POST /api/auth/dev-login
 */
exports.devLogin = asyncHandler(async (req, res) => {
  // Проверяем что мы в dev окружении
  if (process.env.NODE_ENV !== 'development') {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Dev login доступен только в dev окружении'
    });
  }

  const { email } = req.body;

  // Находим пользователя по email
  const user = await User.findByEmail(email);

  if (!user) {
    return res.status(404).json({
      error: 'UserNotFound',
      message: 'Пользователь не найден'
    });
  }

  // Генерируем JWT токен
  const token = generateToken({
    id: user.id,
    telegram_id: user.telegram_id,
    role: user.role
  });

  res.json({
    success: true,
    token,
    user: {
      id: user.id,
      telegram_id: user.telegram_id,
      username: user.username,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role,
      email: user.email
    }
  });
});