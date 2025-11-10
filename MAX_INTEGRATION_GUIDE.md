# 📱 Руководство по интеграции с платформой MAX

Пошаговая инструкция по интеграции MAX Attendance Tracker с платформой MAX и публикации мини-приложения.

---

## 📑 Содержание

1. [Введение](#-введение)
2. [Регистрация мини-приложения](#-шаг-1-регистрация-мини-приложения)
3. [Получение Bot Token](#-шаг-2-получение-bot-token)
4. [Настройка WebApp](#-шаг-3-настройка-webapp)
5. [Валидация initData](#-шаг-4-валидация-initdata)
6. [Тестирование](#-шаг-5-тестирование)
7. [Публикация](#-шаг-6-публикация)
8. [Troubleshooting](#-troubleshooting)
9. [Best Practices](#-best-practices)

---

## 🎯 Введение

MAX WebApp - это мини-приложения, которые запускаются внутри MAX мессенджера. Они предоставляют полноценный веб-интерфейс с доступом к данным пользователя через MAX Bridge API.

### Требования для интеграции

- ✅ Приложение доступно по **HTTPS** (HTTP не поддерживается)
- ✅ Действующий MAX бот (создаётся через @BotFather)
- ✅ Валидный домен с SSL сертификатом
- ✅ Серверная валидация initData
- ✅ Соответствие guidelines платформы MAX

### Архитектура интеграции

```
MAX Client (Mobile/Web)
        ↓
   MAX Bridge API
        ↓
 Your Frontend (HTTPS)
        ↓
    Your Backend API
        ↓
    PostgreSQL DB
```

---

## 📝 Шаг 1: Регистрация мини-приложения

### 1.1 Подготовка материалов

Перед регистрацией подготовьте:

**Обязательные материалы:**
- **Название приложения:** MAX Attendance Tracker
- **Короткое имя (username):** attendance_tracker (будет в URL)
- **Описание:** Краткое описание функционала (макс. 512 символов)
- **Полное описание:** Подробное описание возможностей (макс. 4096 символов)
- **URL приложения:** `https://your-domain.com` (HTTPS обязателен!)

**Графические материалы:**
- **Иконка приложения:** 512×512 px, PNG, прозрачный фон
- **Скриншоты:** минимум 3-5 штук, 1080×1920 px (вертикальные)
- **Превью изображение:** 400×300 px для каталога

**Дополнительная информация:**
- **Категория:** Education / Productivity
- **Теги:** education, attendance, school, university, tracking
- **Поддерживаемые языки:** Русский, English
- **Контакты поддержки:** Email, Telegram

### 1.2 Создание бота через @BotFather

Откройте MAX и найдите **@BotFather**:

```
/start
/newbot

# Введите название бота
MAX Attendance Tracker Bot

# Введите username (должен заканчиваться на 'bot')
max_attendance_bot

# ✅ Успешно! Сохраните ваш Bot Token:
123456789:ABCdefGHIjklMNOpqrsTUVwxyz0123456789
```

**⚠️ ВАЖНО:** Сохраните Bot Token в безопасном месте! Он понадобится для валидации данных.

### 1.3 Настройка WebApp в боте

Продолжаем в @BotFather:

```
/mybots
# Выберите ваш бот: MAX Attendance Tracker Bot

# Настройте WebApp
/newapp

# Введите название WebApp
MAX Attendance Tracker

# Введите описание
Система учета посещаемости для образовательных учреждений. Отмечайте посещаемость, просматривайте статистику, управляйте группами.

# Загрузите иконку (512×512 PNG)
[Отправьте файл иконки]

# Введите URL приложения (HTTPS обязателен!)
https://your-production-domain.com

# Введите short name (будет в URL)
attendance

# ✅ WebApp создан!
# URL для прямого доступа: https://t.me/max_attendance_bot/attendance
```

### 1.4 Регистрация в MAX Partner Portal

1. Перейдите на **MAX Partner Portal**: https://partners.max.org
2. Войдите через ваш MAX аккаунт
3. Нажмите **"Создать приложение"** → **"WebApp"**
4. Заполните форму:

**Основная информация:**
```
- Название: MAX Attendance Tracker
- Короткое имя: attendance_tracker
- Категория: Education
- Подкатегория: School Management
- Язык интерфейса: Русский, English
```

**Описание:**
```
Краткое (до 512 символов):
Современная система учета посещаемости для учебных заведений. 
Преподаватели могут быстро отмечать студентов, администраторы 
управляют расписанием, студенты отслеживают свою посещаемость.

Полное (до 4096 символов):
MAX Attendance Tracker - это комплексная система управления 
посещаемостью, специально разработанная для образовательных 
учреждений.

🎓 Возможности для преподавателей:
• Быстрая отметка посещаемости одним касанием
• Просмотр расписания на неделю
• Статистика по группам и дисциплинам
• Экспорт отчётов в Excel

👥 Возможности для администраторов:
• Управление пользователями и группами
• Планирование расписания занятий
• Импорт данных из Excel
• Подробная аналитика посещаемости

📊 Возможности для студентов:
• Просмотр собственной посещаемости
• Статистика по предметам
• Уведомления о занятиях

✨ Преимущества:
• Интуитивный интерфейс
• Работает оффлайн
• Быстрая синхронизация
• Безопасность данных
• Мультиязычность (RU/EN)
```

**Технические данные:**
```
- URL приложения: https://your-domain.com
- Bot Token: [Ваш токен от @BotFather]
- Webhook URL (опционально): https://your-api.com/webhook
- Поддержка platforms: iOS, Android, Web, Desktop
```

**Графические материалы:**
- Загрузите иконку 512×512 px
- Загрузите минимум 3 скриншота
- Добавьте превью изображение

**Контакты:**
```
- Email поддержки: support@yourdomain.com
- Telegram поддержки: @your_support_bot
- Сайт: https://yourdomain.com
- Политика конфиденциальности: https://yourdomain.com/privacy
- Условия использования: https://yourdomain.com/terms
```

5. Нажмите **"Отправить на модерацию"**

---

## 🔑 Шаг 2: Получение Bot Token

### 2.1 Сохранение Bot Token

После создания бота через @BotFather вы получите токен вида:
```
1234567890:ABCdefGHIjklMNOpqrsTUVwxyz0123456789
```

### 2.2 Настройка в backend

Добавьте токен в `server/.env`:

```env
# Telegram Bot Token
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz0123456789
```

### 2.3 Настройка в frontend (опционально)

Если требуется клиентская валидация, добавьте в `max-webapp/.env`:

```env
# Для отображения информации о боте
VITE_BOT_USERNAME=max_attendance_bot
```

---

## 🔧 Шаг 3: Настройка WebApp

### 3.1 Подключение MAX Bridge API

MAX Bridge API предоставляет доступ к функциям платформы. Он автоматически доступен в WebApp контексте.

**В `max-webapp/src/services/max/bridge.js`:**

```javascript
/**
 * MAX Bridge API Service
 * Интеграция с платформой MAX
 */

class MAXBridge {
  constructor() {
    this.isMAXWebApp = this.detectMAXWebApp();
    this.initData = null;
    
    if (this.isMAXWebApp) {
      this.initializeMAX();
    }
  }

  /**
   * Определить, запущено ли приложение в MAX
   */
  detectMAXWebApp() {
    return typeof window !== 'undefined' && 
           typeof window.MAX !== 'undefined' &&
           typeof window.MAX.WebApp !== 'undefined';
  }

  /**
   * Инициализация MAX WebApp
   */
  initializeMAX() {
    if (!this.isMAXWebApp) {
      console.warn('MAX WebApp not available');
      return;
    }

    const WebApp = window.MAX.WebApp;
    
    // Инициализация
    WebApp.ready();
    
    // Получение initData
    this.initData = WebApp.initData;
    
    // Расширить viewport
    WebApp.expand();
    
    // Настроить theme
    this.setupTheme();
    
    console.log('MAX WebApp initialized', {
      version: WebApp.version,
      platform: WebApp.platform,
      colorScheme: WebApp.colorScheme
    });
  }

  /**
   * Настройка темы приложения
   */
  setupTheme() {
    if (!this.isMAXWebApp) return;

    const WebApp = window.MAX.WebApp;
    
    // Применить цвета темы MAX
    document.documentElement.style.setProperty(
      '--max-bg-color', 
      WebApp.backgroundColor
    );
    document.documentElement.style.setProperty(
      '--max-text-color', 
      WebApp.themeParams.text_color
    );
    document.documentElement.style.setProperty(
      '--max-hint-color', 
      WebApp.themeParams.hint_color
    );
    document.documentElement.style.setProperty(
      '--max-link-color', 
      WebApp.themeParams.link_color
    );
    document.documentElement.style.setProperty(
      '--max-button-color', 
      WebApp.themeParams.button_color
    );
    document.documentElement.style.setProperty(
      '--max-button-text-color', 
      WebApp.themeParams.button_text_color
    );
  }

  /**
   * Получить initData для отправки на сервер
   */
  getInitData() {
    if (!this.isMAXWebApp) {
      // Development mode - mock data
      return 'dev_mode=true&user=%7B%22id%22%3A123456%7D';
    }
    
    return window.MAX.WebApp.initData;
  }

  /**
   * Получить информацию о пользователе
   */
  getUserInfo() {
    if (!this.isMAXWebApp) {
      return {
        id: 123456,
        first_name: 'Test',
        last_name: 'User',
        username: 'testuser'
      };
    }

    const WebApp = window.MAX.WebApp;
    return WebApp.initDataUnsafe.user;
  }

  /**
   * Показать главную кнопку
   */
  showMainButton(text, onClick) {
    if (!this.isMAXWebApp) return;

    const WebApp = window.MAX.WebApp;
    WebApp.MainButton.setText(text);
    WebApp.MainButton.show();
    WebApp.MainButton.onClick(onClick);
  }

  /**
   * Скрыть главную кнопку
   */
  hideMainButton() {
    if (!this.isMAXWebApp) return;
    
    window.MAX.WebApp.MainButton.hide();
  }

  /**
   * Показать popup с подтверждением
   */
  async showConfirm(message) {
    if (!this.isMAXWebApp) {
      return window.confirm(message);
    }

    return new Promise((resolve) => {
      window.MAX.WebApp.showConfirm(message, (confirmed) => {
        resolve(confirmed);
      });
    });
  }

  /**
   * Показать alert
   */
  async showAlert(message) {
    if (!this.isMAXWebApp) {
      window.alert(message);
      return;
    }

    return new Promise((resolve) => {
      window.MAX.WebApp.showAlert(message, resolve);
    });
  }

  /**
   * Вибрация (haptic feedback)
   */
  hapticFeedback(type = 'light') {
    if (!this.isMAXWebApp) return;

    const WebApp = window.MAX.WebApp;
    if (WebApp.HapticFeedback) {
      switch(type) {
        case 'light':
          WebApp.HapticFeedback.impactOccurred('light');
          break;
        case 'medium':
          WebApp.HapticFeedback.impactOccurred('medium');
          break;
        case 'heavy':
          WebApp.HapticFeedback.impactOccurred('heavy');
          break;
        case 'success':
          WebApp.HapticFeedback.notificationOccurred('success');
          break;
        case 'error':
          WebApp.HapticFeedback.notificationOccurred('error');
          break;
        default:
          WebApp.HapticFeedback.impactOccurred('light');
      }
    }
  }

  /**
   * Закрыть WebApp
   */
  close() {
    if (!this.isMAXWebApp) {
      window.close();
      return;
    }

    window.MAX.WebApp.close();
  }

  /**
   * Отправить данные боту (опционально)
   */
  sendData(data) {
    if (!this.isMAXWebApp) {
      console.log('Send data:', data);
      return;
    }

    window.MAX.WebApp.sendData(JSON.stringify(data));
  }

  /**
   * Проверить, доступен ли биометрический вход
   */
  isBiometricAvailable() {
    if (!this.isMAXWebApp) return false;

    const WebApp = window.MAX.WebApp;
    return WebApp.BiometricManager && 
           WebApp.BiometricManager.isInited &&
           WebApp.BiometricManager.isBiometricAvailable;
  }
}

// Создать singleton экземпляр
export const maxBridge = new MAXBridge();
```

### 3.2 Использование в компонентах

```javascript
import { maxBridge } from '@/services/max/bridge';

// В компоненте
function AttendancePage() {
  useEffect(() => {
    // Получить данные пользователя
    const user = maxBridge.getUserInfo();
    console.log('Current user:', user);

    // Настроить главную кнопку
    maxBridge.showMainButton('Сохранить', () => {
      // Логика сохранения
      maxBridge.hapticFeedback('success');
    });

    return () => {
      maxBridge.hideMainButton();
    };
  }, []);

  const handleConfirm = async () => {
    const confirmed = await maxBridge.showConfirm(
      'Вы уверены что хотите сохранить?'
    );
    
    if (confirmed) {
      // Сохранить данные
    }
  };

  return (
    <div>
      <button onClick={handleConfirm}>Сохранить</button>
    </div>
  );
}
```

### 3.3 Настройка манифеста (для PWA)

Создайте `max-webapp/public/manifest.json`:

```json
{
  "name": "MAX Attendance Tracker",
  "short_name": "Attendance",
  "description": "Система учета посещаемости",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#007bff",
  "orientation": "portrait",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

---

## 🔐 Шаг 4: Валидация initData

### 4.1 Что такое initData?

`initData` - это строка, содержащая зашифрованные данные пользователя и подпись для валидации. Серверная валидация **обязательна** для безопасности.

### 4.2 Реализация валидации на сервере

**В `server/middleware/auth.js`:**

```javascript
const crypto = require('crypto');

/**
 * Валидация MAX WebApp initData
 */
function validateMAXWebAppData(initData, botToken) {
  try {
    // Разбираем query string
    const params = new URLSearchParams(initData);
    const hash = params.get('hash');
    params.delete('hash');

    // Сортируем параметры
    const dataCheckString = Array.from(params.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    // Вычисляем secret key
    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(botToken)
      .digest();

    // Вычисляем hash
    const calculatedHash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    // Сравниваем с полученным hash
    return calculatedHash === hash;
  } catch (error) {
    console.error('Error validating initData:', error);
    return false;
  }
}

/**
 * Извлечь данные пользователя из initData
 */
function parseMAXWebAppData(initData) {
  try {
    const params = new URLSearchParams(initData);
    const userParam = params.get('user');
    
    if (!userParam) {
      throw new Error('User data not found in initData');
    }

    const user = JSON.parse(userParam);
    return {
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      username: user.username,
      language_code: user.language_code,
      is_premium: user.is_premium || false
    };
  } catch (error) {
    console.error('Error parsing initData:', error);
    return null;
  }
}

/**
 * Middleware для проверки MAX WebApp
 */
function authenticateMAXWebApp(req, res, next) {
  const initData = req.headers['x-init-data'];
  
  if (!initData) {
    return res.status(401).json({ 
      error: 'Missing initData' 
    });
  }

  // Development mode bypass
  if (process.env.NODE_ENV === 'development' && 
      initData.includes('dev_mode=true')) {
    req.user = {
      id: 123456,
      first_name: 'Test',
      last_name: 'User',
      username: 'testuser'
    };
    return next();
  }

  // Валидация
  const isValid = validateMAXWebAppData(
    initData, 
    process.env.TELEGRAM_BOT_TOKEN
  );

  if (!isValid) {
    return res.status(401).json({ 
      error: 'Invalid initData' 
    });
  }

  // Извлекаем данные пользователя
  const userData = parseMAXWebAppData(initData);
  
  if (!userData) {
    return res.status(401).json({ 
      error: 'Cannot parse user data' 
    });
  }

  req.user = userData;
  next();
}

module.exports = {
  validateMAXWebAppData,
  parseMAXWebAppData,
  authenticateMAXWebApp
};
```

### 4.3 Использование middleware

**В `server/routes/auth.js`:**

```javascript
const express = require('express');
const { authenticateMAXWebApp } = require('../middleware/auth');

const router = express.Router();

/**
 * POST /api/auth/login
 * Вход через MAX WebApp
 */
router.post('/login', authenticateMAXWebApp, async (req, res) => {
  try {
    const { id, first_name, last_name, username } = req.user;

    // Найти или создать пользователя в БД
    let user = await User.findByTelegramId(id);

    if (!user) {
      user = await User.create({
        telegram_id: id,
        username: username,
        first_name: first_name,
        last_name: last_name,
        role: 'student' // По умолчанию
      });
    }

    // Создать JWT токен
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        telegram_id: user.telegram_id,
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
```

### 4.4 Отправка initData с клиента

**В `max-webapp/src/services/api/client.js`:**

```javascript
import axios from 'axios';
import { maxBridge } from '../max/bridge';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Добавляем initData к каждому запросу
apiClient.interceptors.request.use((config) => {
  const initData = maxBridge.getInitData();
  
  if (initData) {
    config.headers['X-Init-Data'] = initData;
  }

  // JWT токен (если есть)
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }

  return config;
});

export default apiClient;
```

---

## 🧪 Шаг 5: Тестирование

### 5.1 Локальное тестирование

**Способ 1: Через ngrok (рекомендуется для разработки)**

```bash
# Установите ngrok
brew install ngrok  # macOS
# или скачайте с ngrok.com

# Запустите приложение локально
npm run dev

# В отдельном терминале запустите ngrok
ngrok http 3000

# Получите HTTPS URL:
# https://abc123.ngrok.io

# Обновите URL в @BotFather
/mybots → Выберите бота → Edit WebApp → New URL
https://abc123.ngrok.io
```

**Способ 2: Через локальный HTTPS**

```bash
# Создайте самоподписанный сертификат
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes

# Обновите vite.config.js
export default {
  server: {
    https: {
      key: fs.readFileSync('key.pem'),
      cert: fs.readFileSync('cert.pem')
    }
  }
}
```

### 5.2 Тестирование в MAX Web

1. Откройте MAX Web: https://web.max.org
2. Найдите вашего бота: `@max_attendance_bot`
3. Откройте WebApp через кнопку или команду
4. Проверьте функционал

### 5.3 Тестирование на мобильных устройствах

**iOS:**
1. Откройте MAX на iPhone
2. Найдите бота
3. Запустите WebApp
4. Проверьте touch события, скроллинг, вибрацию

**Android:**
1. Откройте MAX на Android
2. Найдите бота
3. Запустите WebApp
4. Проверьте все функции

### 5.4 Тестовый чеклист

**Функциональное тестирование:**
- [ ] Приложение открывается корректно
- [ ] initData валидируется успешно
- [ ] Аутентификация работает
- [ ] Все API запросы проходят
- [ ] Данные сохраняются и загружаются
- [ ] Навигация работает корректно
- [ ] Формы валидируются правильно

**UI/UX тестирование:**
- [ ] Дизайн адаптивен под разные экраны
- [ ] Нет горизонтального скролла
- [ ] Кнопки достаточно большие для тапа
- [ ] Загрузка показывается корректно
- [ ] Ошибки отображаются понятно
- [ ] Анимации плавные
- [ ] Цвета соответствуют MAX theme

**Performance тестирование:**
- [ ] Приложение загружается < 3 сек
- [ ] Нет лагов при скроллинге
- [ ] API запросы < 1 сек
- [ ] Изображения оптимизированы
- [ ] Bundle size < 500KB

**Безопасность:**
- [ ] HTTPS работает
- [ ] initData валидируется на сервере
- [ ] JWT токены используются правильно
- [ ] Нет XSS уязвимостей
- [ ] Данные пользователя защищены

---

## 📤 Шаг 6: Публикация

### 6.1 Подготовка к публикации

**Production Checklist:**

```bash
# 1. Обновите все зависимости
npm update

# 2. Production build
cd max-webapp
npm run build

# 3. Проверьте bundle size
npm run preview

# 4. Lint код
npm run lint

# 5. Проверьте переменные окружения
cat .env.production
```

**Проверьте:**
- [ ] Все production переменные окружения установлены
- [ ] HTTPS настроен и работает
- [ ] База данных в production
- [ ] Backup настроен
- [ ] Мониторинг подключен
- [ ] Error tracking настроен (Sentry, etc.)

### 6.2 Публикация через Partner Portal

1. Зайдите на https://partners.max.org
2. Найдите ваше приложение
3. Status → **"Ready for Review"**
4. Нажмите **"Submit for Review"**

### 6.3 Процесс модерации

**Что проверяют модераторы:**

✅ **Технические требования:**
- Приложение доступно по HTTPS
- initData валидируется корректно
- Нет критических ошибок в console
- API отвечает быстро (< 3 сек)
- Приложение не крашится

✅ **Контент:**
- Описание соответствует функционалу
- Скриншоты актуальны
- Нет вводящей в заблуждение информации
- Нет запрещённого контента

✅ **UI/UX:**
- Интерфейс понятный и логичный
- Нет критических багов
- Дизайн профессиональный
- Адаптивность на всех устройствах

✅ **Безопасность:**
- Нет утечек данных
- Персональные данные защищены
- Соответствие GDPR (если применимо)

**Время проверки:** обычно 1-3 рабочих дня

### 6.4 Типичные причины отклонения

❌ **Технические проблемы:**
- HTTP вместо HTTPS
- Сертификат SSL невалиден
- Приложение не открывается
- Критические ошибки в console
- Медленная загрузка (> 5 сек)

❌ **Контент:**
- Неточное описание
- Устаревшие скриншоты
- Нет политики конфиденциальности
- Отсутствуют контакты поддержки

❌ **UX проблемы:**
- Сломанная навигация
- Нечитаемые тексты
- Неработающие кнопки
- Плохая адаптивность

### 6.5 После апрува

✅ **Ваше приложение одобрено!**

1. Получите уведомление в MAX
2. Приложение появится в каталоге
3. Пользователи смогут найти его через поиск
4. URL станет постоянным: `https://t.me/max_attendance_bot/attendance`

**Дальнейшие шаги:**
- Настройте аналитику
- Соберите обратную связь
- Мониторьте ошибки
- Планируйте обновления

---

## 🔧 Troubleshooting

### Проблема: "Failed to validate initData"

**Причина:** Неверная валидация initData на сервере

**Решение:**
```javascript
// Проверьте Bot Token
console.log('Bot Token:', process.env.TELEGRAM_BOT_TOKEN);

// Проверьте получаемый initData
console.log('Received initData:', initData);

// Используйте правильный алгоритм валидации
// (см. раздел 4.2)
```

### Проблема: "WebApp не открывается"

**Причина:** Проблемы с HTTPS или CORS

**Решение:**
```bash
# Проверьте SSL сертификат
curl -I https://your-domain.com

# Проверьте CORS headers
curl -I -X OPTIONS https://your-api.com/api/health

# Должны быть headers:
# Access-Control-Allow-Origin: https://t.me
```

### Проблема: "Cannot read property 'WebApp' of undefined"

**Причина:** MAX Bridge API не загружен

**Решение:**
```javascript
// Добавьте проверку
if (typeof window !== 'undefined' && window.MAX) {
  // MAX WebApp доступен
} else {
  // Fallback для development
  console.warn('MAX WebApp not available');
}
```

### Проблема: "User data is null"

**Причина:** initData не содержит user

**Решение:**
```javascript
// Проверьте формат initData
const params = new URLSearchParams(initData);
console.log('All params:', Array.from(params.entries()));

// User должен быть в формате JSON
const user = params.get('user');
console.log('User param:', user);
```

### Проблема: "App rejected during moderation"

**Решение:**
1. Прочитайте причину отклонения в Partner Portal
2. Исправьте указанные проблемы
3. Повторно отправьте на модерацию
4. При повторных отклонениях свяжитесь с поддержкой

---

## 💡 Best Practices

### Производительность

```javascript
// ✅ Хорошо: Lazy loading компонентов
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));

// ✅ Хорошо: Debounce для поиска
const debouncedSearch = useMemo(
  () => debounce(searchFunction, 300),
  []
);

// ✅ Хорошо: Оптимизация изображений
<img 
  src="image.webp" 
  loading="lazy"
  alt="Description"
/>
```

### Безопасность

```javascript
// ✅ ВСЕГДА валидируйте на сервере
router.post('/api/attendance', 
  authenticateMAXWebApp,  // Проверка initData
  authorizeRole(['teacher', 'admin']),  // Проверка роли
  validateInput,  // Валидация входных данных
  async (req, res) => {
    // Ваша логика
  }
);

// ❌ НИКОГДА не доверяйте клиенту
// Плохо
if (req.body.isAdmin) {
  // Дать права админа
}
```

### UX

```javascript
// ✅ Используйте haptic feedback
maxBridge.hapticFeedback('success');

// ✅ Показывайте loading состояния
{isLoading && <LoadingSpinner />}

// ✅ Обрабатывайте ошибки gracefully
try {
  await saveAttendance();
  maxBridge.showAlert('Сохранено!');
} catch (error) {
  maxBridge.showAlert('Ошибка: ' + error.message);
}
```

### Адаптивность

```css
/* ✅ Используйте MAX theme colors */
:root {
  --bg-color: var(--max-bg-color, #ffffff);
  --text-color: var(--max-text-color, #000000);
  --button-color: var(--max-button-color, #007bff);
}

/* ✅ Адаптируйте под разные экраны */
@media (max-width: 768px) {
  .container {
    padding: 12px;
  }
}

/* ✅ Учитывайте safe area */
.content {
  padding-bottom: env(safe-area-inset-bottom);
}
```

---

## 📞 Получение помощи

**Документация:**
- MAX WebApp API: https://docs.max.org/webapps
- MAX Bridge API: https://docs.max.org/bridge-api
- Partner Portal: https://partners.max.org/docs

**Поддержка:**
- Telegram: @MaxDevelopersBot
- Email: developers@max.org
- Forum: https://forum.max.org

**Полезные ресурсы:**
- [FAQ](FAQ.md) - Часто задаваемые вопросы
- [API Documentation](API_DOCUMENTATION.md) - Документация API
- [Security Guide](SECURITY.md) - Руководство по безопасности

---

**Успешной интеграции! 🚀**