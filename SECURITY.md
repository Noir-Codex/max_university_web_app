# 🔒 Руководство по безопасности MAX Attendance Tracker

Этот документ описывает политики безопасности, best practices и процедуры для MAX Attendance Tracker.

---

## 📑 Содержание

1. [Поддерживаемые версии](#-поддерживаемые-версии)
2. [Сообщить об уязвимости](#-сообщить-об-уязвимости)
3. [Меры безопасности](#-меры-безопасности)
4. [Аутентификация и авторизация](#-аутентификация-и-авторизация)
5. [Защита данных](#-защита-данных)
6. [Best Practices](#-best-practices)
7. [GDPR соответствие](#-gdpr-соответствие)
8. [Security Checklist](#-security-checklist)

---

## 🛡 Поддерживаемые версии

Мы предоставляем обновления безопасности для следующих версий:

| Версия | Поддержка | Конец поддержки |
|--------|-----------|-----------------|
| 1.0.x  | ✅ Активная | - |
| 0.9.x  | ⚠️ Критические обновления только | 2024-12-31 |
| < 0.9  | ❌ Не поддерживается | - |

**Рекомендация:** Всегда используйте последнюю стабильную версию.

---

## 🚨 Сообщить об уязвимости

### Благодарим за ответственное раскрытие!

Если вы обнаружили уязвимость безопасности, пожалуйста:

**НЕ** создавайте публичный Issue на GitHub.

**Вместо этого:**

1. Напишите на **security@yourdomain.com**
2. Используйте наш PGP ключ для шифрования (опционально):
   ```
   Fingerprint: XXXX XXXX XXXX XXXX XXXX
   ```
3. Или свяжитесь через MAX: **@MaxAttendanceSecurityBot**

### Что включить в отчет?

- **Описание уязвимости:** Детальное описание проблемы
- **Шаги воспроизведения:** Как воспроизвести уязвимость
- **Потенциальное влияние:** Оценка серьёзности
- **Предложения по исправлению:** Если есть идеи
- **Ваши контакты:** Для дальнейшей связи

### Процесс обработки

1. **Подтверждение получения** - в течение 48 часов
2. **Первичная оценка** - в течение 7 дней
3. **Исправление** - зависит от серьёзности:
   - Критическая: 1-3 дня
   - Высокая: 7-14 дней
   - Средняя: 30 дней
   - Низкая: следующий релиз
4. **Публикация fix** и благодарность исследователю

### Программа вознаграждений

Мы благодарим исследователей безопасности:

- **Публичная благодарность** в CHANGELOG
- **Упоминание** на странице Security Hall of Fame
- **Денежное вознаграждение** (для критических уязвимостей):
  - Критическая: $500-2000
  - Высокая: $200-500
  - Средняя: $50-200

---

## 🔐 Меры безопасности

### Transport Security

✅ **HTTPS везде**
- Все соединения шифруются TLS 1.2+
- HSTS включен (Strict-Transport-Security)
- Сертификаты от Let's Encrypt или надёжных CA

```nginx
# nginx конфигурация
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
```

### Database Security

✅ **SSL/TLS для PostgreSQL**
```javascript
// server/config/database.js
const pool = new Pool({
  ssl: {
    rejectUnauthorized: true,
    ca: fs.readFileSync(process.env.DB_SSL_CERT_PATH)
  }
});
```

✅ **Параметризованные запросы**
```javascript
// ✅ Правильно - защита от SQL injection
const result = await pool.query(
  'SELECT * FROM users WHERE id = $1',
  [userId]
);

// ❌ НИКОГДА так не делайте!
const result = await pool.query(
  `SELECT * FROM users WHERE id = ${userId}`
);
```

✅ **Минимальные привилегии**
```sql
-- Создайте пользователя БД с минимальными правами
CREATE USER app_user WITH PASSWORD 'secure_password';
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;
REVOKE CREATE ON SCHEMA public FROM app_user;
```

### Application Security

✅ **Helmet для HTTP headers**
```javascript
// server/server.js
const helmet = require('helmet');

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));
```

✅ **Rate Limiting**
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 100, // макс 100 запросов
  message: 'Too many requests from this IP'
});

app.use('/api/', limiter);

// Строже для логина
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many login attempts'
});

app.use('/api/auth/login', loginLimiter);
```

✅ **CORS правильно настроен**
```javascript
const cors = require('cors');

app.use(cors({
  origin: process.env.ALLOWED_ORIGINS.split(','),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Init-Data']
}));
```

✅ **Input Validation**
```javascript
const { body, validationResult } = require('express-validator');

const validateUser = [
  body('email').isEmail().normalizeEmail(),
  body('first_name').trim().isLength({ min: 1, max: 100 }),
  body('role').isIn(['student', 'teacher', 'admin']),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];
```

✅ **XSS Protection**
```javascript
// Санитизация HTML на фронтенде
import DOMPurify from 'dompurify';

const sanitizedHTML = DOMPurify.sanitize(userInput);

// На бэкенде
const xss = require('xss');
const clean = xss(userInput);
```

---

## 🔑 Аутентификация и авторизация

### MAX WebApp initData Validation

**⚠️ Критически важно:** Всегда валидируйте initData на сервере!

```javascript
const crypto = require('crypto');

function validateInitData(initData, botToken) {
  const params = new URLSearchParams(initData);
  const hash = params.get('hash');
  params.delete('hash');
  
  const dataCheckString = Array.from(params.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');
  
  const secretKey = crypto
    .createHmac('sha256', 'WebAppData')
    .update(botToken)
    .digest();
  
  const calculatedHash = crypto
    .createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex');
  
  return calculatedHash === hash;
}
```

### JWT Tokens

✅ **Используйте сильный секрет**
```bash
# Генерация криптостойкого секрета
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

✅ **Правильная конфигурация**
```javascript
const jwt = require('jsonwebtoken');

// Генерация токена
const token = jwt.sign(
  { 
    userId: user.id,
    role: user.role 
  },
  process.env.JWT_SECRET,
  { 
    expiresIn: '7d',
    algorithm: 'HS256'
  }
);

// Верификация токена
jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
  if (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
  req.user = decoded;
  next();
});
```

✅ **Храните токены безопасно**
```javascript
// В localStorage (для WebApp - OK)
localStorage.setItem('auth_token', token);

// ❌ НИКОГДА в cookies без httpOnly для публичных приложений
// ❌ НИКОГДА в URL параметрах
// ❌ НИКОГДА не отправляйте в логи
```

### Role-Based Access Control (RBAC)

```javascript
// middleware/roles.js
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      error: 'Access denied. Admin role required.' 
    });
  }
  next();
};

const requireTeacher = (req, res, next) => {
  if (!['teacher', 'admin'].includes(req.user.role)) {
    return res.status(403).json({ 
      error: 'Access denied. Teacher role required.' 
    });
  }
  next();
};

// Использование
router.post('/users', authenticateToken, requireAdmin, createUser);
router.post('/attendance', authenticateToken, requireTeacher, saveAttendance);
```

### Password Security

✅ **Bcrypt для хеширования**
```javascript
const bcrypt = require('bcrypt');

// Хеширование при создании
const saltRounds = 12; // Минимум 10, рекомендуется 12+
const hashedPassword = await bcrypt.hash(password, saltRounds);

// Верификация
const isValid = await bcrypt.compare(password, hashedPassword);
```

✅ **Требования к паролям**
- Минимум 8 символов
- Минимум 1 заглавная буква
- Минимум 1 строчная буква
- Минимум 1 цифра
- Минимум 1 специальный символ

```javascript
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

if (!passwordRegex.test(password)) {
  throw new Error('Password does not meet requirements');
}
```

---

## 🛡 Защита данных

### Персональные данные

**Какие данные мы храним:**
- Telegram ID (обязательно)
- Имя и фамилия
- Username
- Email (опционально)
- Роль в системе
- История посещаемости

**Принципы обработки:**
- ✅ Минимизация данных
- ✅ Шифрование при передаче (HTTPS)
- ✅ Шифрование чувствительных данных в БД (опционально)
- ✅ Логирование доступа к данным
- ✅ Право на удаление

### Шифрование данных

**В transit:** TLS 1.2+

**At rest (опционально):**
```javascript
const crypto = require('crypto');

// Шифрование
function encrypt(text, key) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(
    'aes-256-gcm', 
    Buffer.from(key, 'hex'), 
    iv
  );
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  return {
    encrypted,
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex')
  };
}

// Дешифрование
function decrypt(encrypted, key, iv, authTag) {
  const decipher = crypto.createDecipheriv(
    'aes-256-gcm',
    Buffer.from(key, 'hex'),
    Buffer.from(iv, 'hex')
  );
  
  decipher.setAuthTag(Buffer.from(authTag, 'hex'));
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}
```

### Backup и восстановление

✅ **Регулярные бэкапы**
```bash
#!/bin/bash
# backup-db.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/postgresql"

# Бэкап с шифрованием
pg_dump -h $DB_HOST -U $DB_USER -d $DB_NAME | \
  gzip | \
  openssl enc -aes-256-cbc -salt -pbkdf2 -pass pass:$BACKUP_PASSWORD \
  > $BACKUP_DIR/backup_$DATE.sql.gz.enc

# Удалить старые бэкапы (старше 30 дней)
find $BACKUP_DIR -name "*.enc" -mtime +30 -delete
```

✅ **Тестируйте восстановление**
```bash
# Восстановление из зашифрованного бэкапа
openssl enc -aes-256-cbc -d -pbkdf2 -pass pass:$BACKUP_PASSWORD \
  -in backup.sql.gz.enc | \
  gunzip | \
  psql -h $DB_HOST -U $DB_USER -d $DB_NAME
```

### Логирование

✅ **Что логировать:**
- Попытки входа (успешные и неуспешные)
- Доступ к чувствительным данным
- Изменение прав пользователей
- Ошибки безопасности
- API запросы (без чувствительных данных)

✅ **Что НЕ логировать:**
- Пароли
- JWT токены
- Полные данные кредитных карт
- Персональные данные (если не требуется)

```javascript
// Winston logger
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ 
      filename: 'error.log', 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: 'combined.log' 
    })
  ]
});

// Логирование security событий
logger.info('Login attempt', {
  userId: user.id,
  ip: req.ip,
  success: true,
  timestamp: new Date()
});
```

---

## 💡 Best Practices

### Environment Variables

✅ **Всегда используйте environment variables для секретов**
```bash
# .env (НИКОГДА не коммитьте в git!)
JWT_SECRET=your-super-secret-key
DB_PASSWORD=your-db-password
TELEGRAM_BOT_TOKEN=your-bot-token
```

✅ **Добавьте .env в .gitignore**
```bash
# .gitignore
.env
.env.local
.env.production
*.pem
*.key
*.crt
```

✅ **Используйте разные секреты для разных окружений**
```
Development: JWT_SECRET_DEV
Staging: JWT_SECRET_STAGING
Production: JWT_SECRET_PROD
```

### Dependency Management

✅ **Регулярно обновляйте зависимости**
```bash
# Проверка уязвимостей
npm audit

# Автоматическое исправление
npm audit fix

# Обновление зависимостей
npm update
```

✅ **Используйте Dependabot или Snyk**
```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/max-webapp"
    schedule:
      interval: "weekly"
  - package-ecosystem: "npm"
    directory: "/server"
    schedule:
      interval: "weekly"
```

### Code Review

✅ **Обязательный code review для:**
- Изменений в аутентификации
- Доступа к данным
- Валидации input
- Криптографических операций

✅ **Используйте static analysis**
```bash
# ESLint security plugin
npm install --save-dev eslint-plugin-security

# .eslintrc.json
{
  "plugins": ["security"],
  "extends": ["plugin:security/recommended"]
}
```

### Error Handling

✅ **Не раскрывайте детали в продакшене**
```javascript
// ❌ Плохо
app.use((err, req, res, next) => {
  res.status(500).json({ 
    error: err.message,
    stack: err.stack  // Раскрывает структуру кода!
  });
});

// ✅ Хорошо
app.use((err, req, res, next) => {
  logger.error('Internal error', { error: err });
  
  res.status(500).json({ 
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error'
      : err.message
  });
});
```

---

## 🇪🇺 GDPR соответствие

### Права пользователей

В соответствии с GDPR, пользователи имеют право на:

1. **Право на информацию** - что мы собираем и зачем
2. **Право на доступ** - получить копию своих данных
3. **Право на исправление** - исправить неточные данные
4. **Право на удаление** - "право быть забытым"
5. **Право на портабельность** - получить данные в машиночитаемом формате
6. **Право на возражение** - против обработки данных

### Реализация

```javascript
// GET /api/users/me/data - Экспорт данных
router.get('/me/data', authenticateToken, async (req, res) => {
  const userData = await User.getAllDataForUser(req.user.id);
  res.json({
    user: userData.profile,
    attendance: userData.attendance,
    groups: userData.groups
  });
});

// DELETE /api/users/me - Удаление аккаунта
router.delete('/me', authenticateToken, async (req, res) => {
  // Анонимизировать данные пользователя
  await User.anonymize(req.user.id);
  
  // Удалить персональные данные
  await User.deletePersonalData(req.user.id);
  
  res.json({ message: 'Account deleted successfully' });
});
```

### Privacy Policy

Обязательно создайте:
- **Privacy Policy** - политика конфиденциальности
- **Terms of Service** - условия использования
- **Cookie Policy** - политика cookies

Разместите их по адресам:
- `https://yourdomain.com/privacy`
- `https://yourdomain.com/terms`

---

## ✅ Security Checklist

### Pre-Deployment

- [ ] Все секреты в environment variables
- [ ] `.env` в `.gitignore`
- [ ] HTTPS включен
- [ ] SSL сертификаты валидны
- [ ] Rate limiting настроен
- [ ] CORS правильно настроен
- [ ] Helmet middleware включен
- [ ] Input validation на всех endpoints
- [ ] Параметризованные SQL запросы
- [ ] JWT секрет криптостойкий (64+ символов)
- [ ] Bcrypt для паролей (rounds >= 12)
- [ ] MAX initData валидируется на сервере
- [ ] RBAC правильно настроен
- [ ] Error handling не раскрывает детали
- [ ] Логирование настроено
- [ ] Зависимости обновлены (`npm audit`)
- [ ] Static analysis пройден
- [ ] Privacy Policy и ToS размещены

### Post-Deployment

- [ ] Мониторинг безопасности настроен
- [ ] Алерты настроены для подозрительной активности
- [ ] Бэкапы БД работают
- [ ] Восстановление из бэкапа протестировано
- [ ] Penetration testing выполнен
- [ ] Security headers проверены (securityheaders.com)
- [ ] SSL rating проверен (ssllabs.com)

### Регулярные проверки

**Еженедельно:**
- [ ] Проверить логи на подозрительную активность
- [ ] Проверить failed login attempts

**Ежемесячно:**
- [ ] Обновить зависимости
- [ ] `npm audit` проверка
- [ ] Проверить бэкапы

**Ежеквартально:**
- [ ] Ротация секретов (JWT secret, API keys)
- [ ] Security audit кода
- [ ] Penetration testing

---

## 📞 Контакты безопасности

**Security Team:**
- Email: security@yourdomain.com
- PGP: [Публичный ключ]
- MAX: @MaxAttendanceSecurityBot

**Bug Bounty Program:**
- HackerOne: hackerone.com/maxattendance
- Минимальное вознаграждение: $50
- Максимальное вознаграждение: $2000

---

## 📚 Дополнительные ресурсы

**Стандарты и руководства:**
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP API Security](https://owasp.org/www-project-api-security/)
- [CWE Top 25](https://cwe.mitre.org/top25/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)

**Инструменты:**
- [npm audit](https://docs.npmjs.com/cli/v8/commands/npm-audit)
- [Snyk](https://snyk.io/)
- [OWASP ZAP](https://www.zaproxy.org/)
- [Burp Suite](https://portswigger.net/burp)

---

**Последнее обновление:** 2024-11-08  
**Версия документа:** 1.0.0

---

<div align="center">

**🔒 Безопасность - наш приоритет**

Если вы обнаружили уязвимость, пожалуйста, свяжитесь с нами немедленно.

</div>