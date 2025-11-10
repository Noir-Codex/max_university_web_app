import { create } from 'zustand'

/**
 * Store для управления данными преподавателя
 */
export const useTeacherStore = create((set, get) => ({
  // Состояние
  groups: [],
  selectedGroup: null,
  schedule: [],
  students: [],
  attendance: {},
  stats: null,
  todayLessons: [],
  currentWeekType: null, // null = автоопределение, 1 = первая (нечетная), 2 = вторая (четная)
  weekOffset: 0, // 0 = текущая неделя, -1 = прошлая, -2 = позапрошлая и т.д.
  currentMonth: new Date().getMonth() + 1,
  currentYear: new Date().getFullYear(),
  viewMode: 'week', // 'week' или 'month'
  selectedLesson: null,
  
  // Фильтры
  filters: {
    searchQuery: '',
    subjectFilter: null,
  },

  // Состояние загрузки
  loading: {
    groups: false,
    schedule: false,
    students: false,
    attendance: false,
    stats: false,
  },

  // Ошибки
  errors: {
    groups: null,
    schedule: null,
    students: null,
    attendance: null,
    stats: null,
  },

  // Действия для групп
  setGroups: (groups) => set({ groups }),
  
  setSelectedGroup: (group) => set({ selectedGroup: group }),
  
  setGroupsLoading: (loading) =>
    set((state) => ({
      loading: { ...state.loading, groups: loading },
    })),
  
  setGroupsError: (error) =>
    set((state) => ({
      errors: { ...state.errors, groups: error },
    })),

  // Действия для расписания
  setSchedule: (schedule) => set({ schedule }),
  
  setCurrentWeekType: (weekType) => set({ currentWeekType: weekType }),
  
  setWeekOffset: (offset) => set({ weekOffset: offset }),
  
  setCurrentMonth: (month) => set({ currentMonth: month }),
  
  setCurrentYear: (year) => set({ currentYear: year }),
  
  setViewMode: (mode) => set({ viewMode: mode }),
  
  setScheduleLoading: (loading) =>
    set((state) => ({
      loading: { ...state.loading, schedule: loading },
    })),
  
  setScheduleError: (error) =>
    set((state) => ({
      errors: { ...state.errors, schedule: error },
    })),

  // Действия для студентов
  setStudents: (students) => set({ students }),
  
  setStudentsLoading: (loading) =>
    set((state) => ({
      loading: { ...state.loading, students: loading },
    })),
  
  setStudentsError: (error) =>
    set((state) => ({
      errors: { ...state.errors, students: error },
    })),

  // Действия для посещаемости
  setSelectedLesson: (lesson) => set({ selectedLesson: lesson }),
  
  setAttendance: (lessonId, attendanceData) =>
    set((state) => ({
      attendance: {
        ...state.attendance,
        [lessonId]: attendanceData,
      },
    })),
  
  updateStudentAttendance: (studentId, present) => {
    const { selectedLesson, attendance } = get()
    if (!selectedLesson) return

    const lessonAttendance = attendance[selectedLesson.id] || []
    const updatedAttendance = lessonAttendance.map((item) =>
      item.studentId === studentId ? { ...item, present } : item
    )

    set((state) => ({
      attendance: {
        ...state.attendance,
        [selectedLesson.id]: updatedAttendance,
      },
    }))
  },
  
  toggleAllStudentsAttendance: (present) => {
    const { selectedLesson, attendance } = get()
    if (!selectedLesson) return

    const lessonAttendance = attendance[selectedLesson.id] || []
    const updatedAttendance = lessonAttendance.map((item) => ({
      ...item,
      present,
    }))

    set((state) => ({
      attendance: {
        ...state.attendance,
        [selectedLesson.id]: updatedAttendance,
      },
    }))
  },
  
  setAttendanceLoading: (loading) =>
    set((state) => ({
      loading: { ...state.loading, attendance: loading },
    })),
  
  setAttendanceError: (error) =>
    set((state) => ({
      errors: { ...state.errors, attendance: error },
    })),

  // Действия для статистики
  setStats: (stats) => set({ stats }),
  
  setStatsLoading: (loading) =>
    set((state) => ({
      loading: { ...state.loading, stats: loading },
    })),
  
  setStatsError: (error) =>
    set((state) => ({
      errors: { ...state.errors, stats: error },
    })),

  // Действия для сегодняшних пар
  setTodayLessons: (lessons) => set({ todayLessons: lessons }),

  // Действия для фильтров
  setSearchQuery: (query) =>
    set((state) => ({
      filters: { ...state.filters, searchQuery: query },
    })),
  
  setSubjectFilter: (subject) =>
    set((state) => ({
      filters: { ...state.filters, subjectFilter: subject },
    })),
  
  clearFilters: () =>
    set({
      filters: {
        searchQuery: '',
        subjectFilter: null,
      },
    }),

  // Вспомогательные геттеры
  getFilteredGroups: () => {
    const { groups, filters } = get()
    let filtered = [...groups]

    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase()
      filtered = filtered.filter(
        (group) =>
          group.name.toLowerCase().includes(query) ||
          group.specialty?.toLowerCase().includes(query)
      )
    }

    return filtered
  },

  getFilteredSchedule: () => {
    const { schedule, filters } = get()
    let filtered = [...schedule]

    if (filters.subjectFilter) {
      filtered = filtered.filter(
        (item) => item.subject_name === filters.subjectFilter
      )
    }

    return filtered
  },

  getScheduleByDay: (dayNumber) => {
    const filtered = get().getFilteredSchedule()
    return filtered.filter((item) => item.dayNumber === dayNumber)
  },

  getAllSubjects: () => {
    const { schedule } = get()
    const subjects = [...new Set(schedule.map((item) => item.subject_name).filter(Boolean))]
    return subjects.sort()
  },

  // Очистка состояния
  clearSelectedLesson: () =>
    set({ selectedLesson: null }),
  
  clearErrors: () =>
    set({
      errors: {
        groups: null,
        schedule: null,
        students: null,
        attendance: null,
        stats: null,
      },
    }),
  
  reset: () =>
    set({
      groups: [],
      selectedGroup: null,
      schedule: [],
      students: [],
      attendance: {},
      stats: null,
      todayLessons: [],
      currentWeek: 1,
      selectedLesson: null,
      filters: {
        searchQuery: '',
        subjectFilter: null,
      },
      loading: {
        groups: false,
        schedule: false,
        students: false,
        attendance: false,
        stats: false,
      },
      errors: {
        groups: null,
        schedule: null,
        students: null,
        attendance: null,
        stats: null,
      },
    }),
}))