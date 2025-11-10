import styles from './AttendanceChart.module.css'

const AttendanceChart = ({ data = [], type = 'bar' }) => {
  if (!data || data.length === 0) {
    return <div className={styles.empty}>Нет данных для отображения</div>
  }

  const maxValue = Math.max(...data.map(d => d.value || 0))

  if (type === 'bar') {
    return (
      <div className={styles.chart}>
        <div className={styles.bars}>
          {data.map((item, idx) => (
            <div key={idx} className={styles.barItem}>
              <div className={styles.bar}>
                <div 
                  className={styles.barFill} 
                  style={{ height: `${(item.value / maxValue) * 100}%` }}
                >
                  <span className={styles.barValue}>{item.value}%</span>
                </div>
              </div>
              <span className={styles.barLabel}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (type === 'line') {
    const width = 600
    const height = 300
    const padding = 40
    const chartWidth = width - padding * 2
    const chartHeight = height - padding * 2

    const points = data.map((item, idx) => {
      const x = padding + (chartWidth / (data.length - 1)) * idx
      const y = padding + chartHeight - (item.value / maxValue) * chartHeight
      return `${x},${y}`
    }).join(' ')

    return (
      <div className={styles.chart}>
        <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
          <polyline
            points={points}
            fill="none"
            stroke="var(--tg-theme-button-color, #3390ec)"
            strokeWidth="3"
          />
          {data.map((item, idx) => {
            const x = padding + (chartWidth / (data.length - 1)) * idx
            const y = padding + chartHeight - (item.value / maxValue) * chartHeight
            return (
              <g key={idx}>
                <circle cx={x} cy={y} r="5" fill="var(--tg-theme-button-color, #3390ec)" />
                <text x={x} y={height - 10} textAnchor="middle" fontSize="12" fill="var(--tg-theme-text-color, #000)">
                  {item.label}
                </text>
              </g>
            )
          })}
        </svg>
      </div>
    )
  }

  return null
}

export default AttendanceChart