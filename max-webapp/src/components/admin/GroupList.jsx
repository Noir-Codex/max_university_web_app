import { Button, LoadingSpinner } from '@components/common'
import styles from './GroupList.module.css'

/**
 * Список групп
 */
const GroupList = ({ groups = [], onEdit, onDelete, onViewStudents, loading = false }) => {
  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <LoadingSpinner />
      </div>
    )
  }

  if (groups.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p className={styles.emptyText}>Нет групп</p>
      </div>
    )
  }

  return (
    <div className={styles.grid}>
      {groups.map((group) => (
        <div key={group.id} className={styles.card}>
          <div className={styles.header}>
            <h3 className={styles.groupName}>{group.name}</h3>
            <span className={styles.badge}>{group.course} курс</span>
          </div>
          
          <div className={styles.info}>
            <p className={styles.infoItem}>
              <span className={styles.infoLabel}>Специальность:</span>
              <span className={styles.infoValue}>{group.specialty}</span>
            </p>
            <p className={styles.infoItem}>
              <span className={styles.infoLabel}>Куратор:</span>
              <span className={styles.infoValue}>{group.curator}</span>
            </p>
            <p className={styles.infoItem}>
              <span className={styles.infoLabel}>Студентов:</span>
              <span className={styles.infoValue}>{group.studentsCount}</span>
            </p>
          </div>

          <div className={styles.actions}>
            <Button size="small" variant="secondary" onClick={() => onViewStudents(group)}>
              Студенты
            </Button>
            <Button size="small" variant="secondary" onClick={() => onEdit(group)}>
              Изменить
            </Button>
            <Button size="small" variant="danger" onClick={() => onDelete(group)}>
              Удалить
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}

export default GroupList