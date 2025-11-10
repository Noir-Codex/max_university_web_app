import PropTypes from 'prop-types'
import styles from './ErrorMessage.module.css'

/**
 * Компонент для отображения сообщений об ошибках
 */
const ErrorMessage = ({ message, onRetry = null, className = '' }) => {
  return (
    <div className={`${styles.container} ${className}`}>
      <div className={styles.icon}>⚠️</div>
      <p className={styles.message}>{message}</p>
      {onRetry && (
        <button className={styles.retryButton} onClick={onRetry}>
          Попробовать снова
        </button>
      )}
    </div>
  )
}

ErrorMessage.propTypes = {
  message: PropTypes.string.isRequired,
  onRetry: PropTypes.func,
  className: PropTypes.string,
}

export default ErrorMessage