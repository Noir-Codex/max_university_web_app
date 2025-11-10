/**
 * Middleware для проверки роли пользователя
 * @param {Array<string>} allowedRoles - массив разрешенных ролей
 */
function requireRole(allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Требуется авторизация'
      });
    }

    const userRole = req.user.role;
    
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Недостаточно прав для выполнения операции',
        requiredRoles: allowedRoles,
        userRole: userRole
      });
    }

    next();
  };
}

/**
 * Middleware для проверки, что пользователь - администратор
 */
function requireAdmin(req, res, next) {
  return requireRole(['admin'])(req, res, next);
}

/**
 * Middleware для проверки, что пользователь - преподаватель или администратор
 */
function requireTeacher(req, res, next) {
  return requireRole(['teacher', 'admin'])(req, res, next);
}

/**
 * Middleware для проверки доступа к ресурсу
 * Пользователь может получить доступ к своим данным или админ к любым
 */
function requireOwnerOrAdmin(resourceUserIdField = 'userId') {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Требуется авторизация'
      });
    }

    const isAdmin = req.user.role === 'admin';
    const resourceUserId = req.params[resourceUserIdField] || req.body[resourceUserIdField];
    const isOwner = req.user.id === parseInt(resourceUserId);

    if (!isAdmin && !isOwner) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Доступ запрещен'
      });
    }

    next();
  };
}

module.exports = {
  requireRole,
  requireAdmin,
  requireTeacher,
  requireOwnerOrAdmin
};