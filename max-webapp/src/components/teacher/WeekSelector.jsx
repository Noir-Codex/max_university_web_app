import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'
import Button from '@components/common/Button'
import styles from './WeekSelector.module.css'

/**
 * Выбор недели/месяца для расписания
 */
const WeekSelector = ({ 
  currentWeekType, 
  weekOffset = 0,
  currentMonth, 
  currentYear,
  viewMode, 
  onWeekTypeChange, 
  onWeekOffsetChange,
  onMonthChange,
  onYearChange,
  onViewModeChange 
}) => {
  const { t } = useTranslation()

  // Определяем текущий тип недели (1 или 2), если не указан
  const getCurrentWeekType = (offset = 0) => {
    const now = new Date()
    const targetDate = new Date(now)
    targetDate.setDate(targetDate.getDate() + (offset * 7)) // Смещаем на offset недель
    
    const currentYear = targetDate.getFullYear()
    const currentMonth = targetDate.getMonth()
    
    const academicYearStart = new Date(
      currentMonth >= 8 ? currentYear : currentYear - 1,
      8, // сентябрь
      1
    )
    
    const diffTime = targetDate.getTime() - academicYearStart.getTime()
    const diffWeeks = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7))
    
    return (diffWeeks % 2 === 0) ? 1 : 2
  }

  const displayWeekType = currentWeekType === null ? getCurrentWeekType(weekOffset) : currentWeekType

  const handleWeekTypeToggle = () => {
    // Переключаем между 1 и 2
    const newWeekType = displayWeekType === 1 ? 2 : 1
    onWeekTypeChange(newWeekType)
  }

  const handleResetWeekType = () => {
    // Сбрасываем на автоопределение
    onWeekTypeChange(null)
  }

  const handlePrevWeek = () => {
    if (onWeekOffsetChange) {
      onWeekOffsetChange(weekOffset - 1)
    }
  }

  const handleNextWeek = () => {
    if (onWeekOffsetChange) {
      onWeekOffsetChange(weekOffset + 1)
    }
  }

  const handleResetWeek = () => {
    if (onWeekOffsetChange) {
      onWeekOffsetChange(0)
    }
    if (onWeekTypeChange) {
      onWeekTypeChange(null)
    }
  }

  const handlePrevMonth = () => {
    if (currentMonth > 1) {
      onMonthChange(currentMonth - 1)
    } else if (onYearChange) {
      onMonthChange(12)
      onYearChange(currentYear - 1)
    }
  }

  const handleNextMonth = () => {
    if (currentMonth < 12) {
      onMonthChange(currentMonth + 1)
    } else if (onYearChange) {
      onMonthChange(1)
      onYearChange(currentYear + 1)
    }
  }

  const getWeekLabel = () => {
    if (weekOffset === 0) {
      return 'Текущая неделя'
    } else if (weekOffset < 0) {
      return `${Math.abs(weekOffset)} недель назад`
    } else {
      return `Через ${weekOffset} недель`
    }
  }

  const getMonthName = (monthNumber) => {
    const months = [
      'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
      'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
    ]
    return months[monthNumber - 1] || ''
  }

  return (
    <div className={styles.selector}>
      {/* Переключатель режима просмотра */}
      <div className={styles.viewModeToggle}>
        <button
          className={`${styles.viewModeButton} ${viewMode === 'week' ? styles.active : ''}`}
          onClick={() => onViewModeChange('week')}
        >
          Неделя
        </button>
        <button
          className={`${styles.viewModeButton} ${viewMode === 'month' ? styles.active : ''}`}
          onClick={() => onViewModeChange('month')}
        >
          Месяц
        </button>
      </div>

      {/* Навигация по неделе */}
      {viewMode === 'week' && (
        <>
          <Button
            variant="secondary"
            size="small"
            onClick={handlePrevWeek}
            title="Предыдущая неделя"
          >
            ←
          </Button>
          <div className={styles.weekInfo}>
            <span className={styles.label}>{getWeekLabel()}:</span>
            <button
              className={`${styles.weekTypeButton} ${displayWeekType === 1 ? styles.active : ''}`}
              onClick={handleWeekTypeToggle}
              title="Переключить неделю"
            >
              {displayWeekType === 1 ? '1-я (нечетная)' : '2-я (четная)'}
            </button>
            {(currentWeekType !== null || weekOffset !== 0) && (
              <button
                className={styles.resetButton}
                onClick={handleResetWeek}
                title="Показать текущую неделю"
              >
                ↻
              </button>
            )}
          </div>
          <Button
            variant="secondary"
            size="small"
            onClick={handleNextWeek}
            title="Следующая неделя"
          >
            →
          </Button>
        </>
      )}

      {/* Навигация по месяцу */}
      {viewMode === 'month' && (
        <>
          <Button
            variant="secondary"
            size="small"
            onClick={handlePrevMonth}
            disabled={currentMonth <= 1}
          >
            ←
          </Button>
          <div className={styles.monthInfo}>
            <span className={styles.monthName}>{getMonthName(currentMonth)}</span>
            <span className={styles.monthNumber}>{currentMonth}</span>
          </div>
          <Button
            variant="secondary"
            size="small"
            onClick={handleNextMonth}
            disabled={currentMonth >= 12}
          >
            →
          </Button>
        </>
      )}
    </div>
  )
}

WeekSelector.propTypes = {
  currentWeekType: PropTypes.number, // null, 1, или 2
  weekOffset: PropTypes.number, // 0 = текущая, -1 = прошлая и т.д.
  currentMonth: PropTypes.number,
  currentYear: PropTypes.number,
  viewMode: PropTypes.oneOf(['week', 'month']).isRequired,
  onWeekTypeChange: PropTypes.func.isRequired,
  onWeekOffsetChange: PropTypes.func,
  onMonthChange: PropTypes.func,
  onYearChange: PropTypes.func,
  onViewModeChange: PropTypes.func.isRequired,
}

WeekSelector.defaultProps = {
  currentWeekType: null,
  weekOffset: 0,
  currentMonth: new Date().getMonth() + 1,
  currentYear: new Date().getFullYear(),
}

export default WeekSelector