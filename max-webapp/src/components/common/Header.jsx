import PropTypes from 'prop-types'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '@store/authStore'
import styles from './Header.module.css'

/**
 * Шапка приложения
 */
const Header = ({ title = '', showUserInfo = true }) => {
  const { t } = useTranslation()
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className={styles.header}>
      <div className={styles.content}>
        <h1 className={styles.title}>{title}</h1>
        {showUserInfo && user && (
          <div className={styles.userInfo}>
            <div className={styles.userDetails}>
              <span className={styles.userName}>
                {user.first_name} {user.last_name}
              </span>
              <span className={styles.userRole}>
                ({user.role === 'admin' ? 'Администратор' : user.role === 'teacher' ? 'Преподаватель' : 'Студент'})
              </span>
            </div>
            <button className={styles.logoutButton} onClick={handleLogout}>
              Выйти
            </button>
          </div>
        )}
      </div>
    </header>
  )
}

Header.propTypes = {
  title: PropTypes.string,
  showUserInfo: PropTypes.bool,
}

export default Header