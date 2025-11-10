/**
 * MAX Bridge API Wrapper
 * Обертка для взаимодействия с MAX Bridge JavaScript API
 */

import { useAuthStore } from '@store/authStore'
import { API_BASE_URL } from '@utils/constants'

// Dev mode конфигурация
const isDev = import.meta.env.DEV
// В dev режиме можно выбрать роль через localStorage или использовать админа по умолчанию
const getDevUserEmail = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('dev_user_email') || 'admin@university.ru'
  }
  return 'admin@university.ru'
}
const DEV_USER_EMAIL = getDevUserEmail()

/**
 * Dev login через бэкенд для получения настоящего JWT токена
 */
async function devLoginRequest(email) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/dev-login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    })

    if (!response.ok) {
      throw new Error(`Dev login failed: ${response.statusText}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('❌ Dev login error:', error)
    throw error
  }
}

class MaxBridge {
  constructor() {
    this.isReady = false
    this.bridge = null
    this.initPromise = null
    this.devMode = isDev
  }

  /**
   * Инициализация MAX Bridge
   */
  async init() {
    if (this.initPromise) {
      return this.initPromise
    }

    this.initPromise = new Promise(async (resolve, reject) => {
      // Проверяем доступность MAX Bridge
      if (typeof window.MAXWebApp === 'undefined') {
        if (this.devMode) {
          console.log('🔧 MAX Bridge не обнаружен. Включён режим разработки.')
          console.log('💡 Используйте страницу входа для авторизации')
        } else {
          console.warn('MAX Bridge не обнаружен.')
        }
        this.isReady = false
        resolve(false)
        return
      }

      try {
        this.bridge = window.MAXWebApp
        this.isReady = true
        console.log('✅ MAX Bridge успешно инициализирован')
        resolve(true)
      } catch (error) {
        console.error('❌ Ошибка инициализации MAX Bridge:', error)
        reject(error)
      }
    })

    return this.initPromise
  }

  /**
   * Получение информации о пользователе
   */
  async getUserInfo() {
    // В dev mode возвращаем данные из authStore
    if (this.devMode && !this.isReady) {
      const authStore = useAuthStore.getState()
      return authStore.user
    }

    if (!this.isReady) {
      console.warn('MAX Bridge не готов')
      return null
    }

    try {
      // TODO: Реализовать через реальный MAX Bridge API
      // const userData = await this.bridge.getUserData()
      // return userData
      
      const authStore = useAuthStore.getState()
      return authStore.user
    } catch (error) {
      console.error('Ошибка получения информации о пользователе:', error)
      return null
    }
  }

  /**
   * Отправка события в MAX
   */
  async sendEvent(eventName, eventData = {}) {
    if (!this.isReady) {
      console.warn('MAX Bridge не готов')
      return false
    }

    try {
      console.log('Отправка события:', eventName, eventData)
      // TODO: Реализовать через реальный MAX Bridge API
      return true
    } catch (error) {
      console.error('Ошибка отправки события:', error)
      return false
    }
  }

  /**
   * Закрытие WebApp
   */
  async close() {
    if (!this.isReady) {
      console.warn('MAX Bridge не готов')
      return
    }

    try {
      // TODO: Реализовать через реальный MAX Bridge API
      console.log('Закрытие WebApp')
    } catch (error) {
      console.error('Ошибка закрытия WebApp:', error)
    }
  }

  /**
   * Показать уведомление
   */
  async showNotification(message, type = 'info') {
    if (!this.isReady) {
      console.warn('MAX Bridge не готов')
      return
    }

    try {
      console.log(`Уведомление [${type}]:`, message)
      // TODO: Реализовать через реальный MAX Bridge API
    } catch (error) {
      console.error('Ошибка показа уведомления:', error)
    }
  }
}

// Экспортируем singleton экземпляр
export const maxBridge = new MaxBridge()

// НЕ вызываем init() автоматически - это делается явно в main.jsx