/**
 * Константы приложения MAX WebApp
 */

// Роли пользователей
export const USER_ROLES = {
  TEACHER: 'teacher',
  ADMIN: 'admin',
}

// Статусы запросов
export const REQUEST_STATUS = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error',
}

// API Base URL (с /api в конце для всех запросов)
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'

// API endpoints (заглушки)
export const API_ENDPOINTS = {
  BASE_URL: API_BASE_URL,
  AUTH: '/auth',
  USERS: '/users',
  COURSES: '/courses',
  ASSIGNMENTS: '/assignments',
  GRADES: '/grades',
}

// Маршруты приложения
export const ROUTES = {
  HOME: '/',
  TEACHER_DASHBOARD: '/teacher',
  ADMIN_DASHBOARD: '/admin',
  PROFILE: '/profile',
  SETTINGS: '/settings',
}

// Языки
export const LANGUAGES = {
  RU: 'ru',
  EN: 'en',
}

// Типы уведомлений
export const NOTIFICATION_TYPES = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
}

// Настройки пагинации
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
}

// Форматы дат
export const DATE_FORMATS = {
  DISPLAY: 'dd.MM.yyyy',
  DISPLAY_WITH_TIME: 'dd.MM.yyyy HH:mm',
  API: 'yyyy-MM-dd',
  API_WITH_TIME: "yyyy-MM-dd'T'HH:mm:ss",
}

// Локальное хранилище ключи
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_PREFERENCES: 'user_preferences',
  THEME: 'theme',
  LANGUAGE: 'language',
}

// Таймауты (в миллисекундах)
export const TIMEOUTS = {
  DEBOUNCE: 300,
  API_REQUEST: 30000, // 30 секунд
  NOTIFICATION: 5000, // 5 секунд
}

// MAX Bridge события
export const MAX_EVENTS = {
  READY: 'ready',
  USER_DATA: 'user_data',
  CLOSE: 'close',
  ERROR: 'error',
}