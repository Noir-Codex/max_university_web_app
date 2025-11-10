import { Button } from '@components/common'
import styles from './ImportPreview.module.css'

const ImportPreview = ({ validationResult, onConfirm, onCancel, loading = false }) => {
  if (!validationResult) return null

  const { totalRecords, newRecords, updatedRecords, conflicts = [], warnings = [] } = validationResult

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Предпросмотр импорта</h3>
      
      <div className={styles.summary}>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Всего записей:</span>
          <span className={styles.statValue}>{totalRecords}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Новых:</span>
          <span className={`${styles.statValue} ${styles.new}`}>{newRecords}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Обновлений:</span>
          <span className={`${styles.statValue} ${styles.updated}`}>{updatedRecords}</span>
        </div>
      </div>

      {conflicts.length > 0 && (
        <div className={styles.section}>
          <h4 className={styles.sectionTitle}>⚠️ Конфликты ({conflicts.length})</h4>
          <div className={styles.issues}>
            {conflicts.map((conflict, idx) => (
              <div key={idx} className={`${styles.issue} ${styles.error}`}>
                <span className={styles.issueRow}>Строка {conflict.row}</span>
                <span className={styles.issueMsg}>{conflict.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {warnings.length > 0 && (
        <div className={styles.section}>
          <h4 className={styles.sectionTitle}>⚠ Предупреждения ({warnings.length})</h4>
          <div className={styles.issues}>
            {warnings.map((warning, idx) => (
              <div key={idx} className={`${styles.issue} ${styles.warning}`}>
                <span className={styles.issueRow}>Строка {warning.row}</span>
                <span className={styles.issueMsg}>{warning.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className={styles.actions}>
        <Button variant="secondary" onClick={onCancel} disabled={loading}>Отмена</Button>
        <Button onClick={onConfirm} disabled={loading || conflicts.length > 0}>
          {loading ? 'Импорт...' : 'Подтвердить импорт'}
        </Button>
      </div>

      {conflicts.length > 0 && (
        <p className={styles.note}>Невозможно импортировать данные с конфликтами</p>
      )}
    </div>
  )
}

export default ImportPreview