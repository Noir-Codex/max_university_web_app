import axios from 'axios'
import { API_BASE_URL, TIMEOUTS } from '@utils/constants'
import { useAuthStore } from '@store/authStore'

/**
 * Базовый клиент для API запросов
 */
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: TIMEOUTS.API_REQUEST,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Dev mode logging
const isDev = import.meta.env.DEV

/**
 * Interceptor для добавления токена авторизации
 */
apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // Логирование в dev режиме
    if (isDev) {
      console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, {
        params: config.params,
        data: config.data
      })
    }
    
    return config
  },
  (error) => {
    console.error('[API Request Error]', error)
    return Promise.reject(error)
  }
)

/**
 * Interceptor для обработки ответов
 */
apiClient.interceptors.response.use(
  (response) => {
    // Логирование успешных ответов в dev режиме
    if (isDev) {
      console.log(`[API Response] ${response.config.method?.toUpperCase()} ${response.config.url}`, {
        status: response.status,
        data: response.data
      })
    }
    return response
  },
  (error) => {
    // Обработка ошибок авторизации
    if (error.response?.status === 401) {
      useAuthStore.getState().logout()
      console.error('❌ Сессия истекла. Необходима повторная авторизация.')
      // Редирект на главную страницу
      if (typeof window !== 'undefined') {
        window.location.href = '/'
      }
    }

    // Логирование ошибок
    console.error('❌ API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.message,
      data: error.response?.data,
    })

    return Promise.reject(error)
  }
)

/**
 * Обертки для HTTP методов
 */
export const api = {
  get: (url, config) => apiClient.get(url, config),
  post: (url, data, config) => apiClient.post(url, data, config),
  put: (url, data, config) => apiClient.put(url, data, config),
  patch: (url, data, config) => apiClient.patch(url, data, config),
  delete: (url, config) => apiClient.delete(url, config),
}

export default apiClient