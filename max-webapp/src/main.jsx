import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import './i18n/config'
import { maxBridge } from './services/max/bridge'

// Dev helper - показываем подсказку
if (import.meta.env.DEV) {
  console.log('%c🎓 MAX WebApp - Режим разработки', 'font-size: 16px; font-weight: bold; color: #3390ec;')
  console.log('%c🔐 Для входа используйте:', 'font-size: 14px; color: #666;')
  console.log('%c   admin@university.ru / admin123%c - Администратор', 'color: #0066cc; font-weight: bold;', 'color: #666;')
  console.log('%c   ivanov@university.ru / admin123%c - Преподаватель', 'color: #0066cc; font-weight: bold;', 'color: #666;')
  console.log('')
}

// Инициализируем MAX Bridge и ждем готовности перед рендером
async function initAndRender() {
  try {
    console.log('🚀 Запуск MAX WebApp...')
    
    // Ждем инициализации MAX Bridge (включая авторизацию в dev mode)
    await maxBridge.init()
    console.log('✅ MAX Bridge инициализирован')
    
    // Даём время на установку токена
    await new Promise(resolve => setTimeout(resolve, 100))
    
    // Убираем экран загрузки
    const loadingElement = document.getElementById('loading')
    if (loadingElement) {
      loadingElement.style.opacity = '0'
      loadingElement.style.transition = 'opacity 0.3s'
      setTimeout(() => loadingElement.remove(), 300)
    }
    
    // Рендерим приложение
    ReactDOM.createRoot(document.getElementById('root')).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    )
    
    console.log('✅ Приложение загружено')
  } catch (error) {
    console.error('❌ Ошибка инициализации:', error)
    
    // Убираем экран загрузки даже при ошибке
    const loadingElement = document.getElementById('loading')
    if (loadingElement) {
      loadingElement.remove()
    }
    
    // Рендерим приложение даже при ошибке
    ReactDOM.createRoot(document.getElementById('root')).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    )
  }
}

// Запускаем приложение
initAndRender()
