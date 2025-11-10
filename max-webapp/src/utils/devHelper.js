/**
 * Dev Helper - утилита для переключения пользователей в режиме разработки
 */

export const DEV_USERS = {
  admin: 'admin@university.ru',
  teacher_ivanov: 'ivanov@university.ru',
  teacher_petrov: 'petrov@university.ru',
  teacher_sidorova: 'sidorova@university.ru',
  student: 'smirnov@university.ru',
}

/**
 * Переключить пользователя в dev режиме
 */
export function switchDevUser(email) {
  if (import.meta.env.DEV) {
    localStorage.setItem('dev_user_email', email)
    console.log('🔄 Dev user changed to:', email)
    console.log('🔄 Перезагрузите страницу для применения изменений')
    window.location.reload()
  } else {
    console.warn('Эта функция доступна только в режиме разработки')
  }
}

/**
 * Получить текущего dev пользователя
 */
export function getCurrentDevUser() {
  return localStorage.getItem('dev_user_email') || 'admin@university.ru'
}

/**
 * Показать доступных пользователей
 */
export function showDevUsers() {
  console.log('👥 Доступные пользователи для разработки:')
  Object.entries(DEV_USERS).forEach(([key, email]) => {
    const current = email === getCurrentDevUser() ? ' ← текущий' : ''
    console.log(`  ${key}: ${email}${current}`)
  })
  console.log('\n💡 Для переключения используйте:')
  console.log('  switchDevUser(DEV_USERS.teacher_ivanov)')
  console.log('  или')
  console.log('  switchDevUser("ivanov@university.ru")')
}

// Экспортируем в window для удобства использования в консоли
if (import.meta.env.DEV && typeof window !== 'undefined') {
  window.switchDevUser = switchDevUser
  window.showDevUsers = showDevUsers
  window.DEV_USERS = DEV_USERS
}

