# MAX WebApp

React-приложение (мини-приложение для платформы MAX).

## Технологии

- **React 18** - UI библиотека
- **Vite** - сборщик и dev server
- **React Router DOM** - маршрутизация
- **Zustand** - state management
- **TanStack Query** - управление серверным состоянием
- **i18next** - локализация
- **Axios** - HTTP клиент
- **React Hook Form** - работа с формами
- **date-fns** - работа с датами

## Структура проекта

```
max-webapp/
├── public/              # Статические файлы
├── src/
│   ├── assets/         # Ресурсы (изображения, стили и т.д.)
│   ├── components/     # React компоненты
│   │   ├── common/     # Общие компоненты
│   │   ├── teacher/    # Компоненты для учителя
│   │   └── admin/      # Компоненты для администратора
│   ├── pages/          # Страницы приложения
│   │   ├── TeacherDashboard/
│   │   └── AdminDashboard/
│   ├── services/       # Сервисы
│   │   ├── api/        # API клиент
│   │   └── max/        # MAX Bridge интеграция
│   ├── hooks/          # Custom React hooks
│   ├── store/          # Zustand stores
│   ├── utils/          # Утилиты и хелперы
│   ├── i18n/           # Конфигурация локализации
│   ├── App.jsx         # Главный компонент
│   └── main.jsx        # Точка входа
├── .eslintrc.json      # ESLint конфигурация
├── .prettierrc         # Prettier конфигурация
├── vite.config.js      # Vite конфигурация
└── package.json
```

## Установка и запуск

### Установка зависимостей

```bash
npm install
```

### Запуск в режиме разработки

```bash
npm run dev
```

Приложение будет доступно по адресу: http://localhost:3000

### Сборка для production

```bash
npm run build
```

### Preview production сборки

```bash
npm run preview
```

## Переменные окружения

Создайте файл `.env` на основе `.env.example`:

```bash
cp .env.example .env
```

## Особенности

### MAX Bridge API

Приложение интегрировано с MAX Bridge JavaScript API для взаимодействия с платформой MAX.

Основные методы доступны через `maxBridge`:

```javascript
import { maxBridge } from '@services/max/bridge'

// Получить информацию о пользователе
const userInfo = await maxBridge.getUserInfo()

// Отправить событие
await maxBridge.sendEvent('event_name', { data: 'value' })

// Показать уведомление
await maxBridge.showNotification('Сообщение', 'success')
```

### Авторизация

Управление состоянием авторизации через Zustand store:

```javascript
import { useAuthStore } from '@store/authStore'

const { isAuthenticated, user, setUser, logout } = useAuthStore()
```

### Локализация

Поддержка русского и английского языков через i18next:

```javascript
import { useTranslation } from 'react-i18next'

const { t, i18n } = useTranslation()

// Использование
<h1>{t('common.loading')}</h1>

// Смена языка
i18n.changeLanguage('en')
```

## Разработка

### Линтинг

```bash
npm run lint
```

### Форматирование кода

```bash
npm run format
```

## Deployment

Приложение готово для развертывания на статическом хостинге с HTTPS.

## Лицензия

Проприетарное ПО
