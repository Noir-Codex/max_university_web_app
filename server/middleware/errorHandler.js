/**
 * Централизованный обработчик ошибок
 */
function errorHandler(err, req, res, next) {
  // Логирование ошибки
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    body: req.body,
    params: req.params,
    query: req.query
  });

  // Определение типа ошибки и статуса
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Внутренняя ошибка сервера';
  let errorType = err.name || 'ServerError';

  // Обработка специфичных ошибок базы данных PostgreSQL
  if (err.code) {
    switch (err.code) {
      case '23505': // unique_violation
        statusCode = 409;
        message = 'Запись с такими данными уже существует';
        errorType = 'UniqueViolation';
        break;
      case '23503': // foreign_key_violation
        statusCode = 400;
        message = 'Ссылка на несуществующую запись';
        errorType = 'ForeignKeyViolation';
        break;
      case '23502': // not_null_violation
        statusCode = 400;
        message = 'Обязательное поле не заполнено';
        errorType = 'NotNullViolation';
        break;
      case '22P02': // invalid_text_representation
        statusCode = 400;
        message = 'Неверный формат данных';
        errorType = 'InvalidFormat';
        break;
      case '42P01': // undefined_table
        statusCode = 500;
        message = 'Таблица не найдена в базе данных';
        errorType = 'DatabaseError';
        break;
      default:
        if (err.code.startsWith('23')) {
          statusCode = 400;
          message = 'Ошибка в данных запроса';
          errorType = 'DataError';
        }
    }
  }

  // Обработка ошибок валидации express-validator
  if (err.array && typeof err.array === 'function') {
    statusCode = 400;
    const errors = err.array();
    message = 'Ошибка валидации данных';
    errorType = 'ValidationError';
    
    return res.status(statusCode).json({
      error: errorType,
      message: message,
      validation_errors: errors.map(e => ({
        field: e.param,
        message: e.msg,
        value: e.value
      }))
    });
  }

  // Обработка ошибок JWT
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Недействительный токен авторизации';
    errorType = 'AuthenticationError';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Токен авторизации истек';
    errorType = 'TokenExpired';
  }

  // В режиме разработки отправляем stack trace
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  const errorResponse = {
    error: errorType,
    message: message,
    statusCode: statusCode
  };

  if (isDevelopment) {
    errorResponse.stack = err.stack;
    errorResponse.details = err.details;
  }

  res.status(statusCode).json(errorResponse);
}

/**
 * Обработчик для несуществующих роутов (404)
 */
function notFoundHandler(req, res, next) {
  res.status(404).json({
    error: 'NotFound',
    message: 'Запрашиваемый ресурс не найден',
    path: req.url,
    method: req.method
  });
}

/**
 * Обертка для async route handlers
 * Автоматически ловит ошибки и передает их в errorHandler
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Создание кастомной ошибки
 */
class AppError extends Error {
  constructor(message, statusCode = 500, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = {
  errorHandler,
  notFoundHandler,
  asyncHandler,
  AppError
};