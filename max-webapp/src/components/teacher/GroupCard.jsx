import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'
import styles from './GroupCard.module.css'

/**
 * Карточка группы
 */
const GroupCard = ({ group, onClick }) => {
  const { t } = useTranslation()

  return (
    <div className={styles.card} onClick={onClick}>
      <div className={styles.header}>
        <h3 className={styles.groupName}>{group.name}</h3>
        <span className={styles.course}>
          {group.course} {t('teacher.course')}
        </span>
      </div>
      <div className={styles.info}>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>{t('teacher.specialty')}:</span>
          <span className={styles.infoValue}>{group.specialty}</span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>{t('teacher.students')}:</span>
          <span className={styles.infoValue}>{group.studentsCount}</span>
        </div>
      </div>
      <div className={styles.footer}>
        <span className={styles.viewSchedule}>
          {t('teacher.viewSchedule')} →
        </span>
      </div>
    </div>
  )
}

GroupCard.propTypes = {
  group: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    course: PropTypes.number.isRequired,
    studentsCount: PropTypes.number.isRequired,
    specialty: PropTypes.string,
  }).isRequired,
  onClick: PropTypes.func,
}

export default GroupCard