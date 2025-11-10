import { useState } from 'react'
import styles from './FilterPanel.module.css'

/**
 * Панель фильтров с поддержкой различных типов фильтров
 */
const FilterPanel = ({ 
  filters = [],
  onFilterChange,
  onClear,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(false)

  const handleFilterChange = (filterId, value) => {
    onFilterChange(filterId, value)
  }

  const handleClear = () => {
    onClear()
  }

  const renderFilter = (filter) => {
    switch (filter.type) {
      case 'search':
        return (
          <div key={filter.id} className={styles.filterItem}>
            <label className={styles.filterLabel}>{filter.label}</label>
            <input
              type="text"
              className={styles.filterInput}
              placeholder={filter.placeholder}
              value={filter.value || ''}
              onChange={(e) => handleFilterChange(filter.id, e.target.value)}
            />
          </div>
        )

      case 'select':
        return (
          <div key={filter.id} className={styles.filterItem}>
            <label className={styles.filterLabel}>{filter.label}</label>
            <select
              className={styles.filterSelect}
              value={filter.value || ''}
              onChange={(e) => handleFilterChange(filter.id, e.target.value)}
            >
              <option value="">Все</option>
              {filter.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        )

      case 'date':
        return (
          <div key={filter.id} className={styles.filterItem}>
            <label className={styles.filterLabel}>{filter.label}</label>
            <input
              type="date"
              className={styles.filterInput}
              value={filter.value || ''}
              onChange={(e) => handleFilterChange(filter.id, e.target.value)}
            />
          </div>
        )

      case 'dateRange':
        return (
          <div key={filter.id} className={styles.filterItem}>
            <label className={styles.filterLabel}>{filter.label}</label>
            <div className={styles.dateRange}>
              <input
                type="date"
                className={styles.filterInput}
                placeholder="От"
                value={filter.value?.from || ''}
                onChange={(e) => 
                  handleFilterChange(filter.id, { 
                    ...filter.value, 
                    from: e.target.value 
                  })
                }
              />
              <span className={styles.dateRangeSeparator}>—</span>
              <input
                type="date"
                className={styles.filterInput}
                placeholder="До"
                value={filter.value?.to || ''}
                onChange={(e) => 
                  handleFilterChange(filter.id, { 
                    ...filter.value, 
                    to: e.target.value 
                  })
                }
              />
            </div>
          </div>
        )

      default:
        return null
    }
  }

  const hasActiveFilters = filters.some(f => {
    if (f.type === 'dateRange') {
      return f.value?.from || f.value?.to
    }
    return f.value && f.value !== ''
  })

  return (
    <div className={`${styles.filterPanel} ${className}`}>
      <div className={styles.filterHeader}>
        <button
          className={styles.toggleButton}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <span className={styles.toggleIcon}>
            {isExpanded ? '▼' : '▶'}
          </span>
          <span className={styles.toggleText}>Фильтры</span>
          {hasActiveFilters && (
            <span className={styles.activeIndicator}>●</span>
          )}
        </button>

        {hasActiveFilters && (
          <button
            className={styles.clearButton}
            onClick={handleClear}
          >
            Сбросить
          </button>
        )}
      </div>

      {isExpanded && (
        <div className={styles.filterContent}>
          <div className={styles.filterGrid}>
            {filters.map(renderFilter)}
          </div>
        </div>
      )}
    </div>
  )
}

export default FilterPanel