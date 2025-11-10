import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@store/authStore'
import Button from '@components/common/Button'
import { API_BASE_URL } from '@utils/constants'
import styles from './Login.module.css'

/**
 * Страница входа
 */
const Login = () => {
  const navigate = useNavigate()
  const login = useAuthStore((state) => state.login)
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const apiBaseUrl = import.meta.env.VITE_API_URL || API_BASE_URL
      const response = await fetch(`${apiBaseUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Ошибка входа')
      }

      // Сохраняем пользователя и токен
      login(data.user, data.token)

      // Перенаправляем в зависимости от роли
      if (data.user.role === 'admin') {
        navigate('/admin')
      } else if (data.user.role === 'teacher') {
        navigate('/teacher')
      } else {
        navigate('/')
      }
    } catch (err) {
      setError(err.message || 'Неверный логин или пароль')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.loginBox}>
        <div className={styles.header}>
          <h1 className={styles.title}>MAX WebApp</h1>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="email">
              Email (логин)
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className={styles.input}
              placeholder="ivanov@university.ru"
              value={formData.email}
              onChange={handleChange}
              required
              autoComplete="email"
              disabled={loading}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="password">
              Пароль
            </label>
            <input
              type="password"
              id="password"
              name="password"
              className={styles.input}
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
              autoComplete="current-password"
              disabled={loading}
            />
          </div>

          {error && (
            <div className={styles.error}>
              <span className={styles.errorIcon}>⚠️</span>
              {error}
            </div>
          )}

          <Button
            type="submit"
            className={styles.submitButton}
            disabled={loading}
          >
            {loading ? 'Вход...' : 'Войти'}
          </Button>
        </form>
      </div>
    </div>
  )
}

export default Login

