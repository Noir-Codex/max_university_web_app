import { api } from './client'

/**
 * API сервис для администратора
 */

// ============== ПОЛЬЗОВАТЕЛИ ==============

/**
 * Получить список всех пользователей
 * @param {Object} filters - фильтры (role, search)
 */
const formatUserName = (user = {}) => {
  if (user.name) return user.name
  if (user.full_name) return user.full_name

  const fullName = [user.last_name, user.first_name]
    .filter(Boolean)
    .join(' ')
    .trim()

  if (fullName) return fullName
  if (user.first_name) return user.first_name
  if (user.username) return user.username
  return user.email || 'Без имени'
}

export const fetchUsers = async (filters = {}) => {
  try {
    const response = await api.get('/users', { params: filters })
    return response.data.map((user) => ({
      ...user,
      name: formatUserName(user),
    }))
  } catch (error) {
    console.error('Ошибка получения списка пользователей:', error)
    throw error
  }
}

/**
 * Создать нового пользователя
 * @param {Object} userData - данные пользователя
 */
export const createUser = async (userData) => {
  try {
    const response = await api.post('/users', userData)
    return response.data
  } catch (error) {
    console.error('Ошибка создания пользователя:', error)
    throw error
  }
}

/**
 * Обновить пользователя
 * @param {number} userId - ID пользователя
 * @param {Object} userData - новые данные
 */
export const updateUser = async (userId, userData) => {
  try {
    const response = await api.put(`/users/${userId}`, userData)
    return response.data
  } catch (error) {
    console.error('Ошибка обновления пользователя:', error)
    throw error
  }
}

/**
 * Удалить пользователя
 * @param {number} userId - ID пользователя
 */
export const deleteUser = async (userId) => {
  try {
    const response = await api.delete(`/users/${userId}`)
    return response.data
  } catch (error) {
    console.error('Ошибка удаления пользователя:', error)
    throw error
  }
}

// ============== ГРУППЫ ==============

/**
 * Получить список всех групп
 */
export const fetchGroups = async () => {
  try {
    const response = await api.get('/groups')
    return response.data
  } catch (error) {
    console.error('Ошибка получения списка групп:', error)
    throw error
  }
}

/**
 * Создать новую группу
 * @param {Object} groupData - данные группы
 */
export const createGroup = async (groupData) => {
  try {
    const response = await api.post('/groups', groupData)
    return response.data
  } catch (error) {
    console.error('Ошибка создания группы:', error)
    throw error
  }
}

/**
 * Обновить группу
 * @param {number} groupId - ID группы
 * @param {Object} groupData - новые данные
 */
export const updateGroup = async (groupId, groupData) => {
  try {
    const response = await api.put(`/groups/${groupId}`, groupData)
    return response.data
  } catch (error) {
    console.error('Ошибка обновления группы:', error)
    throw error
  }
}

/**
 * Удалить группу
 * @param {number} groupId - ID группы
 */
export const deleteGroup = async (groupId) => {
  try {
    const response = await api.delete(`/groups/${groupId}`)
    return response.data
  } catch (error) {
    console.error('Ошибка удаления группы:', error)
    throw error
  }
}

/**
 * Получить студентов группы
 * @param {number} groupId - ID группы
 */
export const fetchGroupStudents = async (groupId) => {
  try {
    const response = await api.get(`/groups/${groupId}/students`)
    return response.data
  } catch (error) {
    console.error('Ошибка получения студентов группы:', error)
    throw error
  }
}

// ============== РАСПИСАНИЕ ==============

/**
 * Получить расписание
 * @param {number} weekType - тип недели: null = все, 0 = каждую, 1 = первая, 2 = вторая
 * @param {number} groupId - ID группы (опционально)
 * @param {number} teacherId - ID преподавателя (опционально)
 */
export const fetchSchedule = async (weekType = null, groupId = null, teacherId = null) => {
  try {
    const params = {}
    // Если weekType не указан, запрашиваем все расписание
    if (weekType !== null && weekType !== undefined) {
      params.week_type = weekType
    } else {
      // Для админ панели запрашиваем все расписание
      params.all = 'true'
    }
    if (groupId) params.group_id = groupId
    if (teacherId) params.teacher_id = teacherId
    console.log('📡 Запрос расписания (админ):', params)
    const response = await api.get('/schedule', { params })
    console.log('📡 Получено пар:', response.data.length)
    return response.data
  } catch (error) {
    console.error('Ошибка получения расписания:', error)
    throw error
  }
}

/**
 * Создать новую пару
 * @param {Object} lessonData - данные пары
 */
export const createLesson = async (lessonData) => {
  try {
    console.log('📡 Отправка запроса на создание пары:', lessonData)
    const response = await api.post('/schedule', lessonData)
    console.log('✅ Пара создана успешно:', response.data)
    return response.data
  } catch (error) {
    console.error('❌ Ошибка создания пары:', error)
    console.error('Детали ошибки:', error.response?.data)
    throw error
  }
}

/**
 * Обновить пару
 * @param {number} lessonId - ID пары
 * @param {Object} lessonData - новые данные
 */
export const updateLesson = async (lessonId, lessonData) => {
  try {
    const response = await api.put(`/schedule/${lessonId}`, lessonData)
    return response.data
  } catch (error) {
    console.error('Ошибка обновления пары:', error)
    throw error
  }
}

/**
 * Удалить пару
 * @param {number} lessonId - ID пары
 */
export const deleteLesson = async (lessonId) => {
  try {
    const response = await api.delete(`/schedule/${lessonId}`)
    return response.data
  } catch (error) {
    console.error('Ошибка удаления пары:', error)
    throw error
  }
}

// ============== ДИСЦИПЛИНЫ ==============

/**
 * Получить список всех дисциплин
 */
export const fetchSubjects = async () => {
  try {
    const response = await api.get('/subjects')
    return response.data
  } catch (error) {
    console.error('Ошибка получения списка дисциплин:', error)
    throw error
  }
}

/**
 * Создать новую дисциплину
 * @param {Object} subjectData - данные дисциплины
 */
export const createSubject = async (subjectData) => {
  try {
    const response = await api.post('/subjects', subjectData)
    return response.data
  } catch (error) {
    console.error('Ошибка создания дисциплины:', error)
    throw error
  }
}

/**
 * Обновить дисциплину
 * @param {number} subjectId - ID дисциплины
 * @param {Object} subjectData - новые данные
 */
export const updateSubject = async (subjectId, subjectData) => {
  try {
    const response = await api.put(`/subjects/${subjectId}`, subjectData)
    return response.data
  } catch (error) {
    console.error('Ошибка обновления дисциплины:', error)
    throw error
  }
}

/**
 * Удалить дисциплину
 * @param {number} subjectId - ID дисциплины
 */
export const deleteSubject = async (subjectId) => {
  try {
    const response = await api.delete(`/subjects/${subjectId}`)
    return response.data
  } catch (error) {
    console.error('Ошибка удаления дисциплины:', error)
    throw error
  }
}

// ============== ИМПОРТ РАСПИСАНИЯ ==============

/**
 * Валидировать данные импорта
 * @param {Array} data - данные для валидации
 */
export const validateSchedule = async (data) => {
  try {
    const response = await api.post('/import/validate', { data })
    return response.data
  } catch (error) {
    console.error('Ошибка валидации расписания:', error)
    throw error
  }
}

/**
 * Импортировать расписание
 * @param {Array} data - данные для импорта
 */
export const importSchedule = async (data) => {
  try {
    const response = await api.post('/import/schedule', { data })
    return response.data
  } catch (error) {
    console.error('Ошибка импорта расписания:', error)
    throw error
  }
}

// ============== СТАТИСТИКА ==============

/**
 * Получить общую статистику системы
 */
export const fetchAdminStats = async () => {
  try {
    const response = await api.get('/reports/dashboard-stats')
    return response.data
  } catch (error) {
    console.error('Ошибка получения статистики:', error)
    throw error
  }
}

/**
 * Получить статистику посещаемости
 * @param {Object} filters - фильтры (group_id, subject_id, student_id, date_from, date_to)
 */
export const fetchAttendanceStats = async (filters = {}) => {
  try {
    const response = await api.get('/reports/stats/overall', { params: filters })
    return response.data
  } catch (error) {
    console.error('Ошибка получения статистики посещаемости:', error)
    throw error
  }
}

/**
 * Экспорт отчета по посещаемости
 * @param {Object} filters - фильтры
 * @param {string} format - формат (csv, xlsx)
 */
export const exportAttendanceReport = async (filters = {}, format = 'xlsx') => {
  try {
    const response = await api.get('/reports/export', {
      params: { ...filters, format },
      responseType: 'blob',
    })
    
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    const filename = `attendance_report_${new Date().toISOString().split('T')[0]}.${format}`
    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
    
    return { success: true }
  } catch (error) {
    console.error('Ошибка экспорта отчета:', error)
    throw error
  }
}

/**
 * Получить список всех преподавателей (для форм)
 */
export const fetchTeachers = async () => {
  try {
    const response = await api.get('/users', { params: { role: 'teacher' } })
    return response.data.map((user) => ({
      ...user,
      name: formatUserName(user),
    }))
  } catch (error) {
    console.error('Ошибка получения списка преподавателей:', error)
    throw error
  }
}