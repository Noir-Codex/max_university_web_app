import PropTypes from 'prop-types'
import Header from './Header'
import Navigation from './Navigation'
import styles from './Layout.module.css'

/**
 * Общий layout с навигацией
 */
const Layout = ({
  children,
  title = '',
  showHeader = true,
  showNavigation = false,
  navigationItems = [],
}) => {
  return (
    <div className={styles.layout}>
      {showHeader && <Header title={title} />}
      {showNavigation && navigationItems.length > 0 && (
        <Navigation items={navigationItems} />
      )}
      <main className={styles.main}>{children}</main>
    </div>
  )
}

Layout.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.string,
  showHeader: PropTypes.bool,
  showNavigation: PropTypes.bool,
  navigationItems: PropTypes.array,
}

export default Layout