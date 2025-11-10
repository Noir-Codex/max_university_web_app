import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'
import styles from './StudentCheckList.module.css'

/**
 * Список студентов с чекбоксами для отметки посещаемости
 */
const StudentCheckList = ({ students, attendance, onToggle }) => {
  const { t } = useTranslation()

  const handleToggle = (studentId) => {
    onToggle(studentId)
  }

  const presentCount = attendance.filter((a) => a.present).length
  const totalCount = students.length

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>{t('teacher.studentsList')}</h3>
        <span className={styles.counter}>
          {presentCount} / {totalCount}
        </span>
      </div>
      <div className={styles.list}>
        {students.map((student) => {
          const studentAttendance = attendance.find(
            (a) => a.studentId === student.id
          )
          const isPresent = studentAttendance?.present || false
          const fullName = student.name || `${student.last_name || ''} ${student.first_name || ''}`.trim()

          return (
            <label key={student.id} className={`${styles.studentItem} ${isPresent ? styles.present : ''}`}>
              <input
                type="checkbox"
                checked={isPresent}
                onChange={() => handleToggle(student.id)}
                className={styles.checkbox}
              />
              <div className={styles.studentInfo}>
                <span className={styles.studentName}>{fullName}</span>
                {student.email && (
                  <span className={styles.studentEmail}>{student.email}</span>
                )}
              </div>
              {isPresent && <span className={styles.presentIcon}>✓</span>}
            </label>
          )
        })}
      </div>
    </div>
  )
}

StudentCheckList.propTypes = {
  students: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
    })
  ).isRequired,
  attendance: PropTypes.arrayOf(
    PropTypes.shape({
      studentId: PropTypes.number.isRequired,
      present: PropTypes.bool.isRequired,
    })
  ).isRequired,
  onToggle: PropTypes.func.isRequired,
}

export default StudentCheckList