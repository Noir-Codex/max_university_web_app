import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'
import Button from '@components/common/Button'
import styles from './QuickActions.module.css'

/**
 * Быстрые действия для отметки посещаемости
 */
const QuickActions = ({ onMarkAll, onClearAll }) => {
  const { t } = useTranslation()

  return (
    <div className={styles.actions}>
      <Button variant="secondary" size="small" onClick={onMarkAll}>
        ✓ {t('teacher.markAll')}
      </Button>
      <Button variant="ghost" size="small" onClick={onClearAll}>
        ✗ {t('teacher.clearAll')}
      </Button>
    </div>
  )
}

QuickActions.propTypes = {
  onMarkAll: PropTypes.func.isRequired,
  onClearAll: PropTypes.func.isRequired,
}

export default QuickActions