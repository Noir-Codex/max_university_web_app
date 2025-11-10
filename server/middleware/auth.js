const jwt = require('jsonwebtoken');
const crypto = require('crypto');

/**
 * Валидация Telegram initData
 * @param {string} initData - данные из Telegram WebApp
 * @param {string} botToken - токен бота
 * @returns {Object|null} - расшифрованные данные пользователя или null
 */
function validateTelegramInitData(initData, botToken) {
  try {
    // Парсим initData
    const params = new URLSearchParams(initData);
    const hash = params.get('hash');
    params.delete('hash');
    
    // Сортируем параметры
    const dataCheckString = Array.from(params.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');
    
    // Создаем секретный ключ
    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(botToken)
      .digest();
    
    // Вычисляем hash
    const calculatedHash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');
    
    // Проверяем совпадение hash
    if (calculatedHash !== hash) {
      console.error('Invalid hash in initData');
      return null;
    }
    
    // Проверяем auth_date (не старше 24 часов)
    const authDate = parseInt(params.get('auth_date'));
    const currentTime = Math.floor(Date.now() / 1000);
    if (currentTime - authDate > 86400) {
      console.error('InitData is too old');
      return null;
    }
    
    // Извлекаем данные пользователя
    const userParam = params.get('user');
    if (!userParam) {
      console.error('No user data in initData');
      return null;
    }
    
    const user = JSON.parse(userParam);
    return user;
  } catch (error) {
    console.error('Error validating initData:', error);
    return null;
  }
}

/**
 * Middleware для проверки JWT токена
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ 
      error: 'Access token required',
      message: 'Требуется токен авторизации'
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.error('JWT verification error:', err.message);
      return res.status(403).json({ 
        error: 'Invalid token',
        message: 'Недействительный токен'
      });
    }
    
    req.user = user;
    next();
  });
}

/**
 * Генерация JWT токена
 * @param {Object} payload - данные для токена
 * @returns {string} - JWT токен
 */
function generateToken(payload) {
  return jwt.sign(
    payload, 
    process.env.JWT_SECRET, 
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

/**
 * Middleware для опциональной аутентификации
 * Не требует токен, но если он есть - извлекает пользователя
 */
function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return next();
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (!err) {
      req.user = user;
    }
    next();
  });
}

module.exports = {
  validateTelegramInitData,
  authenticateToken,
  optionalAuth,
  generateToken
};