import styles from './StatisticsCard.module.css'

/**
 * Карточка для отображения статистики
 */
const StatisticsCard = ({ 
  title, 
  value, 
  icon, 
  trend, 
  trendValue,
  color = 'default',
  onClick,
  loading = false
}) => {
  const getTrendIcon = () => {
    if (!trend) return null
    if (trend === 'up') return '↗'
    if (trend === 'down') return '↘'
    return '→'
  }

  const getTrendColor = () => {
    if (trend === 'up') return styles.trendUp
    if (trend === 'down') return styles.trendDown
    return styles.trendNeutral
  }

  const cardClasses = `${styles.card} ${styles[color]} ${onClick ? styles.clickable : ''}`

  if (loading) {
    return (
      <div className={cardClasses}>
        <div className={styles.skeleton}>
          <div className={styles.skeletonIcon}></div>
          <div className={styles.skeletonText}>
            <div className={styles.skeletonLine}></div>
            <div className={styles.skeletonLine}></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={cardClasses} onClick={onClick}>
      <div className={styles.content}>
        {icon && (
          <div className={styles.iconWrapper}>
            <span className={styles.icon}>{icon}</span>
          </div>
        )}
        
        <div className={styles.info}>
          <h3 className={styles.title}>{title}</h3>
          <div className={styles.valueWrapper}>
            <span className={styles.value}>{value}</span>
            {trend && trendValue && (
              <span className={`${styles.trend} ${getTrendColor()}`}>
                <span className={styles.trendIcon}>{getTrendIcon()}</span>
                <span className={styles.trendValue}>{trendValue}</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default StatisticsCard