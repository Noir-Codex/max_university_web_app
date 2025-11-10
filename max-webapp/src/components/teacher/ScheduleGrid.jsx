import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'
import ScheduleItem from './ScheduleItem'
import styles from './ScheduleGrid.module.css'

/**
 * Сетка расписания (неделя или месяц)
 */
const ScheduleGrid = ({ schedule, onLessonClick, viewMode = 'week' }) => {
  const { t } = useTranslation()

  const daysOfWeek = [
    { number: 1, name: 'Monday' },
    { number: 2, name: 'Tuesday' },
    { number: 3, name: 'Wednesday' },
    { number: 4, name: 'Thursday' },
    { number: 5, name: 'Friday' },
    { number: 6, name: 'Saturday' },
  ]

  // today: 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  // day_of_week в API: 1 = Monday, 2 = Tuesday, ..., 7 = Sunday
  const todayJS = new Date().getDay() // 0-6
  const today = todayJS === 0 ? 7 : todayJS // Преобразуем в 1-7 (понедельник-воскресенье)

  const getLessonsForDay = (dayNumber) => {
    // API возвращает day_of_week (1-7), где 1 = понедельник, 7 = воскресенье
    // В компоненте используется 1-6 (понедельник-суббота)
    return schedule.filter((lesson) => {
      const dayOfWeek = lesson.day_of_week || lesson.dayNumber
      return dayOfWeek === dayNumber
    })
  }

  // Для месячного режима группируем по датам
  const getLessonsByDate = () => {
    const grouped = {}
    schedule.forEach((lesson) => {
      const date = lesson.date || lesson.dayNumber
      if (!grouped[date]) {
        grouped[date] = []
      }
      grouped[date].push(lesson)
    })
    return grouped
  }

  if (viewMode === 'month') {
    const lessonsByDate = getLessonsByDate()
    const dates = Object.keys(lessonsByDate).sort()

    return (
      <div className={styles.monthGrid}>
        {dates.map((date) => {
          const dayLessons = lessonsByDate[date]
          const dateObj = new Date(date)
          const dayNumber = dateObj.getDay() === 0 ? 7 : dateObj.getDay()
          const isToday = dateObj.toDateString() === new Date().toDateString()

          return (
            <div key={date} className={styles.monthDay}>
              <div className={`${styles.monthDayHeader} ${isToday ? styles.today : ''}`}>
                <span className={styles.monthDate}>{dateObj.getDate()}</span>
                <span className={styles.monthDayName}>
                  {t(`teacher.days.${daysOfWeek.find(d => d.number === dayNumber)?.name || 'Monday'}`)}
                </span>
                {isToday && <span className={styles.todayBadge}>{t('teacher.today')}</span>}
              </div>
              <div className={styles.monthLessons}>
                {dayLessons.map((lesson) => (
                  <ScheduleItem
                    key={lesson.id}
                    lesson={lesson}
                    onClick={onLessonClick}
                    isToday={isToday}
                  />
                ))}
              </div>
            </div>
          )
        })}
        {dates.length === 0 && (
          <div className={styles.noLessons}>
            {t('teacher.noLessons')}
          </div>
        )}
      </div>
    )
  }

  // Режим недели (по умолчанию)
  return (
    <div className={styles.grid}>
      {daysOfWeek.map((day) => {
        const dayLessons = getLessonsForDay(day.number)
        const isToday = today === day.number

        return (
          <div key={day.number} className={styles.dayColumn}>
            <div className={`${styles.dayHeader} ${isToday ? styles.today : ''}`}>
              <h3 className={styles.dayName}>{t(`teacher.days.${day.name}`)}</h3>
              {isToday && (
                <span className={styles.todayBadge}>{t('teacher.today')}</span>
              )}
            </div>
            <div className={styles.lessonsContainer}>
              {dayLessons.length > 0 ? (
                dayLessons.map((lesson) => (
                  <ScheduleItem
                    key={lesson.id}
                    lesson={lesson}
                    onClick={onLessonClick}
                    isToday={isToday}
                  />
                ))
              ) : (
                <div className={styles.noLessons}>
                  {t('teacher.noLessons')}
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

ScheduleGrid.propTypes = {
  schedule: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      dayNumber: PropTypes.number,
      date: PropTypes.string,
    })
  ).isRequired,
  onLessonClick: PropTypes.func,
  viewMode: PropTypes.oneOf(['week', 'month']),
}

ScheduleGrid.defaultProps = {
  viewMode: 'week',
}

export default ScheduleGrid