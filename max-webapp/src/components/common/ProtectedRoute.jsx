import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@store/authStore'

/**
 * Компонент для защиты маршрутов по ролям
 */
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, userRole } = useAuthStore()

  // Если не авторизован - редирект на логин
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Если роль не разрешена - редирект на главную
  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    console.warn(`⚠️ Доступ запрещен. Требуется роль: ${allowedRoles.join(' или ')}, текущая роль: ${userRole}`)
    return <Navigate to="/" replace />
  }

  return children
}

export default ProtectedRoute



