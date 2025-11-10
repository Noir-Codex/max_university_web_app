import { useEffect } from 'react'
import styles from './ConfirmDialog.module.css'

/**
 * Диалог подтверждения действий
 * Использует WebApp.showPopup() для нативных диалогов Telegram
 */
const ConfirmDialog = ({ 
  isOpen, 
  title, 
  message, 
  confirmText = 'Подтвердить',
  cancelText = 'Отмена',
  onConfirm, 
  onCancel,
  type = 'default' // 'default', 'danger', 'warning'
}) => {
  useEffect(() => {
    // Если доступен Telegram WebApp API, используем нативный диалог
    if (isOpen && window.Telegram?.WebApp?.showPopup) {
      window.Telegram.WebApp.showPopup({
        title: title,
        message: message,
        buttons: [
          { id: 'cancel', type: 'cancel', text: cancelText },
          { 
            id: 'confirm', 
            type: type === 'danger' ? 'destructive' : 'default',
            text: confirmText 
          },
        ],
      }, (buttonId) => {
        if (buttonId === 'confirm') {
          onConfirm()
        } else {
          onCancel()
        }
      })
    }
  }, [isOpen, title, message, confirmText, cancelText, type, onConfirm, onCancel])

  // Если WebApp API недоступен, используем кастомный диалог
  if (!isOpen) return null
  
  if (window.Telegram?.WebApp?.showPopup) {
    return null // Нативный диалог уже показан
  }

  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div 
        className={`${styles.dialog} ${styles[type]}`} 
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.header}>
          <h3 className={styles.title}>{title}</h3>
        </div>
        
        <div className={styles.content}>
          <p className={styles.message}>{message}</p>
        </div>
        
        <div className={styles.actions}>
          <button 
            className={styles.cancelButton}
            onClick={onCancel}
          >
            {cancelText}
          </button>
          <button 
            className={`${styles.confirmButton} ${styles[`${type}Button`]}`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmDialog