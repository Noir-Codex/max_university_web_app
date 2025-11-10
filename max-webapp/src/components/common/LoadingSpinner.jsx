import PropTypes from 'prop-types'
import styles from './LoadingSpinner.module.css'

/**
 * Индикатор загрузки
 */
const LoadingSpinner = ({ size = 'medium', text = '' }) => {
  return (
    <div className={styles.container}>
      <div className={`${styles.spinner} ${styles[size]}`} />
      {text && <p className={styles.text}>{text}</p>}
    </div>
  )
}

LoadingSpinner.propTypes = {
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  text: PropTypes.string,
}

export default LoadingSpinner