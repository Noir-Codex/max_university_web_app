import { Button, LoadingSpinner } from '@components/common'
import styles from './SubjectList.module.css'

const SubjectList = ({ subjects = [], onEdit, onDelete, loading = false }) => {
  if (loading) return <div className={styles.loading}><LoadingSpinner /></div>
  if (subjects.length === 0) return <div className={styles.empty}>Нет дисциплин</div>

  return (
    <div className={styles.list}>
      {subjects.map(subject => (
        <div key={subject.id} className={styles.card}>
          <div className={styles.info}>
            <h3 className={styles.name}>{subject.name}</h3>
            <p className={styles.detail}>Тип: {subject.type} • Часов: {subject.hours}</p>
            {subject.teacherNames && subject.teacherNames.length > 0 && (
              <p className={styles.detail}>Преподаватели: {subject.teacherNames.join(', ')}</p>
            )}
          </div>
          <div className={styles.actions}>
            <Button size="small" variant="secondary" onClick={() => onEdit(subject)}>Изменить</Button>
            <Button size="small" variant="danger" onClick={() => onDelete(subject)}>Удалить</Button>
          </div>
        </div>
      ))}
    </div>
  )
}

export default SubjectList