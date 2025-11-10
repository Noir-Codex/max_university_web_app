import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * Store для управления авторизацией и пользовательскими данными
 */
export const useAuthStore = create(
  persist(
    (set, get) => ({
      // Состояние
      isAuthenticated: false,
      user: null,
      userRole: null,
      token: null,

      // Действия
      /**
       * Установить данные пользователя после авторизации
       */
      setUser: (userData) => {
        set({
          isAuthenticated: true,
          user: userData,
          userRole: userData?.role || null,
        })
      },

      /**
       * Установить токен авторизации
       */
      setToken: (token) => {
        set({ token })
        // Сохраняем токен также в localStorage для API client
        if (token) {
          localStorage.setItem('jwt_token', token)
        } else {
          localStorage.removeItem('jwt_token')
        }
      },

      /**
       * Авторизация пользователя (установить и токен и данные пользователя)
       */
      login: (userData, token) => {
        set({
          isAuthenticated: true,
          user: userData,
          userRole: userData?.role || null,
          token: token,
        })
        if (token) {
          localStorage.setItem('jwt_token', token)
        }
      },

      /**
       * Выход из системы
       */
      logout: () => {
        set({
          isAuthenticated: false,
          user: null,
          userRole: null,
          token: null,
        })
        localStorage.removeItem('jwt_token')
      },

      /**
       * Проверка роли пользователя
       */
      hasRole: (role) => {
        const { userRole } = get()
        return userRole === role
      },

      /**
       * Проверка авторизации
       */
      checkAuth: async () => {
        const { token } = get()
        return !!token
      },

      /**
       * Получить токен из localStorage при инициализации
       */
      initAuth: () => {
        const token = localStorage.getItem('jwt_token')
        if (token && !get().token) {
          set({ token })
        }
      },
    }),
    {
      name: 'auth-storage',
      // Сохраняем только необходимые поля в localStorage
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        userRole: state.userRole,
        token: state.token,
      }),
    }
  )
)