import { useState } from 'react'
import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'
import Button from '@components/common/Button'
import { exportAttendance } from '@services/api/teacher'
import styles from './ExportButton.module.css'

/**
 * Кнопка экспорта ведомости
 */
const ExportButton = ({ groupId, dateFrom, dateTo }) => {
  const { t } = useTranslation()
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    setIsExporting(true)
    try {
      await exportAttendance(groupId, dateFrom, dateTo)
      // WebApp.showAlert может быть использован здесь
      alert(t('teacher.exportSuccess'))
    } catch (error) {
      console.error('Ошибка экспорта:', error)
      alert(t('teacher.exportError'))
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className={styles.container}>
      <Button
        onClick={handleExport}
        loading={isExporting}
        disabled={!groupId}
        variant="secondary"
      >
        📥 {t('teacher.exportAttendance')}
      </Button>
    </div>
  )
}

ExportButton.propTypes = {
  groupId: PropTypes.number,
  dateFrom: PropTypes.string,
  dateTo: PropTypes.string,
}

export default ExportButton