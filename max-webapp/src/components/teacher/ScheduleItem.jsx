import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'
import styles from './ScheduleItem.module.css'

/**
 * Элемент расписания (пара)
 */
const ScheduleItem = ({ lesson, onClick, isToday = false }) => {
  const { t } = useTranslation()

  const typeColors = {
    lecture: '#3390ec',
    practice: '#10b981',
    lab: '#f59e0b',
  }

  const lessonType = lesson.lesson_type || lesson.type || 'lecture'
  const timeDisplay = lesson.time || `${lesson.time_start} - ${lesson.time_end}`
  const subjectName = lesson.subject_name || lesson.subject
  const groupName = lesson.group_name || lesson.groupName

  return (
    <div
      className={`${styles.item} ${isToday ? styles.today : ''}`}
      onClick={() => onClick?.(lesson)}
    >
      <div className={styles.header}>
        <span
          className={styles.type}
          style={{ backgroundColor: typeColors[lessonType] || '#929292' }}
        >
          {t(`teacher.lessonTypes.${lessonType}`)}
        </span>
        <span className={styles.time}>{timeDisplay}</span>
      </div>
      <h4 className={styles.subject}>{subjectName}</h4>
      <div className={styles.details}>
        <span className={styles.group}>👥 {groupName}</span>
        {lesson.room && (
          <span className={styles.room}>
            📍 {lesson.room}
          </span>
        )}
      </div>
    </div>
  )
}

ScheduleItem.propTypes = {
  lesson: PropTypes.shape({
    id: PropTypes.number.isRequired,
    subject: PropTypes.string.isRequired,
    time: PropTypes.string.isRequired,
    groupName: PropTypes.string.isRequired,
    room: PropTypes.string.isRequired,
    type: PropTypes.oneOf(['lecture', 'practice', 'lab']).isRequired,
  }).isRequired,
  onClick: PropTypes.func,
  isToday: PropTypes.bool,
}

export default ScheduleItem