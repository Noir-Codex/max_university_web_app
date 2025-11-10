import PropTypes from 'prop-types'
import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import styles from './Navigation.module.css'

/**
 * Навигация между разделами
 */
const Navigation = ({ items = [] }) => {
  const { t } = useTranslation()

  return (
    <nav className={styles.navigation}>
      <div className={styles.content}>
        {items.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `${styles.navItem} ${isActive ? styles.active : ''}`
            }
          >
            {item.icon && <span className={styles.icon}>{item.icon}</span>}
            <span className={styles.label}>{t(item.label)}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

Navigation.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      path: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      icon: PropTypes.node,
    })
  ),
}

export default Navigation