import { api } from './client'

/**
 * API сервис для преподавателя
 */

/**
 * Получить список групп преподавателя
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
 * Получить группы куратора
 * @param {number} curatorId - ID куратора
 */
export const fetchCuratorGroups = async (curatorId) => {
  try {
    const response = await api.get(`/groups/curator/${curatorId}`)
    return response.data
  } catch (error) {
    console.error('Ошибка получения групп куратора:', error)
    throw error
  }
}

/**
 * Получить расписание на неделю
 * @param {number} weekType - тип недели: 0 = каждую, 1 = первая (нечетная), 2 = вторая (четная)
 * @param {number} groupId - ID группы (опционально)
 * @param {number} teacherId - ID преподавателя (опционально)
 */
export const fetchSchedule = async (weekType = null, groupId = null, teacherId = null) => {
  try {
    const params = {}
    // Если weekType не указан, бэкенд автоматически определит текущую неделю
    if (weekType !== null && weekType !== undefined) {
      params.week_type = weekType
    }
    if (groupId) params.group_id = groupId
    if (teacherId) params.teacher_id = teacherId
    console.log('📡 API запрос расписания:', params)
    const response = await api.get('/schedule', { params })
    console.log('📡 API ответ:', response.data.length, 'пар')
    return response.data
  } catch (error) {
    console.error('❌ Ошибка получения расписания:', error)
    throw error
  }
}

/**
 * Получить расписание на месяц
 * @param {number} month - номер месяца (1-12)
 * @param {number} year - год (опционально, по умолчанию текущий)
 * @param {number} groupId - ID группы (опционально)
 * @param {number} teacherId - ID преподавателя (опционально)
 */
export const fetchScheduleByMonth = async (month = 1, year = null, groupId = null, teacherId = null) => {
  try {
    const currentYear = year || new Date().getFullYear()
    const params = { month, year: currentYear }
    if (groupId) params.group_id = groupId
    if (teacherId) params.teacher_id = teacherId
    const response = await api.get('/schedule/month', { params })
    return response.data
  } catch (error) {
    console.error('Ошибка получения расписания на месяц:', error)
    throw error
  }
}

/**
 * Получить информацию о паре
 * @param {number} lessonId - ID пары
 */
export const fetchLessonInfo = async (lessonId) => {
  try {
    const response = await api.get(`/schedule/${lessonId}`)
    return response.data
  } catch (error) {
    console.error('Ошибка получения информации о паре:', error)
    throw error
  }
}

/**
 * Получить список студентов группы
 * @param {number} groupId - ID группы
 */
export const fetchStudents = async (groupId) => {
  try {
    const response = await api.get(`/groups/${groupId}/students`)
    return response.data
  } catch (error) {
    console.error('Ошибка получения списка студентов:', error)
    throw error
  }
}

/**
 * Сохранить посещаемость
 * @param {number} lessonId - ID пары
 * @param {Array} attendanceData - массив {student_id, status, date}
 */
export const saveAttendance = async (lessonId, attendanceData) => {
  try {
    const currentDate = new Date().toISOString().split('T')[0]
    const response = await api.post(`/attendance/bulk`, {
      lesson_id: lessonId,
      attendance: attendanceData,
      date: currentDate,
    })
    return response.data
  } catch (error) {
    console.error('Ошибка сохранения посещаемости:', error)
    throw error
  }
}

/**
 * Получить посещаемость для пары
 * @param {number} lessonId - ID пары
 * @param {string} date - дата в формате YYYY-MM-DD
 */
export const fetchAttendance = async (lessonId, date) => {
  try {
    const response = await api.get(`/attendance/lesson/${lessonId}`, {
      params: { date }
    })
    return response.data
  } catch (error) {
    console.error('Ошибка получения посещаемости:', error)
    throw error
  }
}

/**
 * Экспорт ведомости посещаемости
 * @param {number} groupId - ID группы
 * @param {string} dateFrom - дата начала периода
 * @param {string} dateTo - дата окончания периода
 */
export const exportAttendance = async (groupId, dateFrom, dateTo) => {
  try {
    const response = await api.get('/reports/export', {
      params: {
        group_id: groupId,
        date_from: dateFrom,
        date_to: dateTo,
        format: 'xlsx'
      },
      responseType: 'blob',
    })
    
    // Создаем ссылку для скачивания файла
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `attendance_${groupId}_${dateFrom}_${dateTo}.xlsx`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
    
    return { success: true }
  } catch (error) {
    console.error('Ошибка экспорта ведомости:', error)
    throw error
  }
}

/**
 * Получить статистику преподавателя
 */
export const fetchTeacherStats = async () => {
  try {
    const response = await api.get('/reports/dashboard-stats')
    return response.data
  } catch (error) {
    console.error('Ошибка получения статистики:', error)
    throw error
  }
}

/**
 * Получить сегодняшние пары
 * @param {number} teacherId - ID преподавателя (опционально)
 */
export const fetchTodayLessons = async (teacherId = null) => {
  try {
    const params = {}
    if (teacherId) params.teacher_id = teacherId
    const response = await api.get('/schedule/today', { params })
    return response.data
  } catch (error) {
    console.error('Ошибка получения сегодняшних пар:', error)
    throw error
  }
}