import { Button, LoadingSpinner } from '@components/common'
import styles from './ScheduleTable.module.css'

const DAYS = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота']

const ScheduleTable = ({ schedule = [], onEdit, onDelete, loading = false }) => {
  const getTypeLabel = (type) => {
    const types = { lecture: 'Лек', practice: 'Прак', lab: 'Лаб' }
    return types[type] || type
  }

  const scheduleByDay = DAYS.map((_, index) => ({
    day: DAYS[index],
    dayNumber: index + 1,
    lessons: schedule.filter(l => l.day_of_week === index + 1).sort((a, b) => (a.time_start || '').localeCompare(b.time_start || ''))
  }))

  if (loading) {
    return <div className={styles.loading}><LoadingSpinner /></div>
  }

  return (
    <div className={styles.container}>
      {scheduleByDay.map(({ day, lessons }) => (
        <div key={day} className={styles.daySection}>
          <h3 className={styles.dayTitle}>{day}</h3>
          {lessons.length === 0 ? (
            <p className={styles.emptyDay}>Нет пар</p>
          ) : (
            <div className={styles.lessonsList}>
              {lessons.map(lesson => (
                <div key={lesson.id} className={styles.lessonCard}>
                  <div className={styles.lessonHeader}>
                    <span className={styles.time}>{lesson.time_start} - {lesson.time_end}</span>
                    <span className={`${styles.type} ${styles[lesson.lesson_type]}`}>{getTypeLabel(lesson.lesson_type)}</span>
                  </div>
                  <div className={styles.lessonInfo}>
                    <p className={styles.subject}>{lesson.subject_name}</p>
                    <p className={styles.detail}>Группа: {lesson.group_name}</p>
                    <p className={styles.detail}>Преподаватель: {lesson.teacher_name}</p>
                    {lesson.room && <p className={styles.detail}>Аудитория: {lesson.room}</p>}
                  </div>
                  <div className={styles.lessonActions}>
                    <Button size="small" variant="secondary" onClick={() => onEdit(lesson)}>Изменить</Button>
                    <Button size="small" variant="danger" onClick={() => onDelete(lesson)}>Удалить</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export default ScheduleTable