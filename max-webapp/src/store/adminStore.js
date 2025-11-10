import { create } from 'zustand'

/**
 * Store для управления данными администратора
 */
export const useAdminStore = create((set, get) => ({
  // ============== СОСТОЯНИЕ ==============
  
  // Пользователи
  users: [],
  selectedUser: null,
  
  // Группы
  groups: [],
  selectedGroup: null,
  groupStudents: [],
  
  // Расписание
  schedule: [],
  selectedLesson: null,
  currentWeek: 1,
  
  // Дисциплины
  subjects: [],
  selectedSubject: null,
  
  // Преподаватели (для форм)
  teachers: [],
  
  // Статистика
  stats: null,
  attendanceStats: null,
  
  // Импорт
  importData: null,
  validationResult: null,
  
  // Фильтры
  filters: {
    userRole: null,
    userSearch: '',
    groupSearch: '',
    subjectSearch: '',
    scheduleGroupId: null,
    statsGroupId: null,
    statsSubjectId: null,
    statsStudentId: null,
    statsDateFrom: null,
    statsDateTo: null,
  },
  
  // Состояние загрузки
  loading: {
    users: false,
    groups: false,
    schedule: false,
    subjects: false,
    teachers: false,
    stats: false,
    attendanceStats: false,
    import: false,
    validation: false,
  },
  
  // Ошибки
  errors: {
    users: null,
    groups: null,
    schedule: null,
    subjects: null,
    teachers: null,
    stats: null,
    attendanceStats: null,
    import: null,
    validation: null,
  },
  
  // ============== ДЕЙСТВИЯ ДЛЯ ПОЛЬЗОВАТЕЛЕЙ ==============
  
  setUsers: (users) => set({ users }),
  
  setSelectedUser: (user) => set({ selectedUser: user }),
  
  addUser: (user) =>
    set((state) => ({
      users: [...state.users, user],
    })),
  
  updateUserInStore: (userId, userData) =>
    set((state) => ({
      users: state.users.map((u) => (u.id === userId ? { ...u, ...userData } : u)),
    })),
  
  removeUser: (userId) =>
    set((state) => ({
      users: state.users.filter((u) => u.id !== userId),
    })),
  
  setUsersLoading: (loading) =>
    set((state) => ({
      loading: { ...state.loading, users: loading },
    })),
  
  setUsersError: (error) =>
    set((state) => ({
      errors: { ...state.errors, users: error },
    })),
  
  // ============== ДЕЙСТВИЯ ДЛЯ ГРУПП ==============
  
  setGroups: (groups) => set({ groups }),
  
  setSelectedGroup: (group) => set({ selectedGroup: group }),
  
  setGroupStudents: (students) => set({ groupStudents: students }),
  
  addGroup: (group) =>
    set((state) => ({
      groups: [...state.groups, group],
    })),
  
  updateGroupInStore: (groupId, groupData) =>
    set((state) => ({
      groups: state.groups.map((g) => (g.id === groupId ? { ...g, ...groupData } : g)),
    })),
  
  removeGroup: (groupId) =>
    set((state) => ({
      groups: state.groups.filter((g) => g.id !== groupId),
    })),
  
  setGroupsLoading: (loading) =>
    set((state) => ({
      loading: { ...state.loading, groups: loading },
    })),
  
  setGroupsError: (error) =>
    set((state) => ({
      errors: { ...state.errors, groups: error },
    })),
  
  // ============== ДЕЙСТВИЯ ДЛЯ РАСПИСАНИЯ ==============
  
  setSchedule: (schedule) => set({ schedule }),
  
  setSelectedLesson: (lesson) => set({ selectedLesson: lesson }),
  
  setCurrentWeek: (week) => set({ currentWeek: week }),
  
  addLesson: (lesson) =>
    set((state) => ({
      schedule: [...state.schedule, lesson],
    })),
  
  updateLessonInStore: (lessonId, lessonData) =>
    set((state) => ({
      schedule: state.schedule.map((l) => (l.id === lessonId ? { ...l, ...lessonData } : l)),
    })),
  
  removeLesson: (lessonId) =>
    set((state) => ({
      schedule: state.schedule.filter((l) => l.id !== lessonId),
    })),
  
  setScheduleLoading: (loading) =>
    set((state) => ({
      loading: { ...state.loading, schedule: loading },
    })),
  
  setScheduleError: (error) =>
    set((state) => ({
      errors: { ...state.errors, schedule: error },
    })),
  
  // ============== ДЕЙСТВИЯ ДЛЯ ДИСЦИПЛИН ==============
  
  setSubjects: (subjects) => set({ subjects }),
  
  setSelectedSubject: (subject) => set({ selectedSubject: subject }),
  
  addSubject: (subject) =>
    set((state) => ({
      subjects: [...state.subjects, subject],
    })),
  
  updateSubjectInStore: (subjectId, subjectData) =>
    set((state) => ({
      subjects: state.subjects.map((s) => (s.id === subjectId ? { ...s, ...subjectData } : s)),
    })),
  
  removeSubject: (subjectId) =>
    set((state) => ({
      subjects: state.subjects.filter((s) => s.id !== subjectId),
    })),
  
  setSubjectsLoading: (loading) =>
    set((state) => ({
      loading: { ...state.loading, subjects: loading },
    })),
  
  setSubjectsError: (error) =>
    set((state) => ({
      errors: { ...state.errors, subjects: error },
    })),
  
  // ============== ДЕЙСТВИЯ ДЛЯ ПРЕПОДАВАТЕЛЕЙ ==============
  
  setTeachers: (teachers) => set({ teachers }),
  
  setTeachersLoading: (loading) =>
    set((state) => ({
      loading: { ...state.loading, teachers: loading },
    })),
  
  setTeachersError: (error) =>
    set((state) => ({
      errors: { ...state.errors, teachers: error },
    })),
  
  // ============== ДЕЙСТВИЯ ДЛЯ СТАТИСТИКИ ==============
  
  setStats: (stats) => set({ stats }),
  
  setAttendanceStats: (attendanceStats) => set({ attendanceStats }),
  
  setStatsLoading: (loading) =>
    set((state) => ({
      loading: { ...state.loading, stats: loading },
    })),
  
  setStatsError: (error) =>
    set((state) => ({
      errors: { ...state.errors, stats: error },
    })),
  
  setAttendanceStatsLoading: (loading) =>
    set((state) => ({
      loading: { ...state.loading, attendanceStats: loading },
    })),
  
  setAttendanceStatsError: (error) =>
    set((state) => ({
      errors: { ...state.errors, attendanceStats: error },
    })),
  
  // ============== ДЕЙСТВИЯ ДЛЯ ИМПОРТА ==============
  
  setImportData: (data) => set({ importData: data }),
  
  setValidationResult: (result) => set({ validationResult: result }),
  
  setImportLoading: (loading) =>
    set((state) => ({
      loading: { ...state.loading, import: loading },
    })),
  
  setImportError: (error) =>
    set((state) => ({
      errors: { ...state.errors, import: error },
    })),
  
  setValidationLoading: (loading) =>
    set((state) => ({
      loading: { ...state.loading, validation: loading },
    })),
  
  setValidationError: (error) =>
    set((state) => ({
      errors: { ...state.errors, validation: error },
    })),
  
  clearImportData: () =>
    set({
      importData: null,
      validationResult: null,
    }),
  
  // ============== ДЕЙСТВИЯ ДЛЯ ФИЛЬТРОВ ==============
  
  setUserRoleFilter: (role) =>
    set((state) => ({
      filters: { ...state.filters, userRole: role },
    })),
  
  setUserSearchFilter: (search) =>
    set((state) => ({
      filters: { ...state.filters, userSearch: search },
    })),
  
  setGroupSearchFilter: (search) =>
    set((state) => ({
      filters: { ...state.filters, groupSearch: search },
    })),
  
  setSubjectSearchFilter: (search) =>
    set((state) => ({
      filters: { ...state.filters, subjectSearch: search },
    })),
  
  setScheduleGroupFilter: (groupId) =>
    set((state) => ({
      filters: { ...state.filters, scheduleGroupId: groupId },
    })),
  
  setStatsFilters: (filters) =>
    set((state) => ({
      filters: { ...state.filters, ...filters },
    })),
  
  clearFilters: () =>
    set({
      filters: {
        userRole: null,
        userSearch: '',
        groupSearch: '',
        subjectSearch: '',
        scheduleGroupId: null,
        statsGroupId: null,
        statsSubjectId: null,
        statsStudentId: null,
        statsDateFrom: null,
        statsDateTo: null,
      },
    }),
  
  // ============== ВСПОМОГАТЕЛЬНЫЕ ГЕТТЕРЫ ==============
  
  getFilteredUsers: () => {
    const { users, filters } = get()
    let filtered = [...users]
    
    if (filters.userRole) {
      filtered = filtered.filter((u) => u.role === filters.userRole)
    }
    
    if (filters.userSearch) {
      const search = filters.userSearch.toLowerCase()
      filtered = filtered.filter(
        (u) =>
          u.name.toLowerCase().includes(search) ||
          u.email.toLowerCase().includes(search)
      )
    }
    
    return filtered
  },
  
  getFilteredGroups: () => {
    const { groups, filters } = get()
    let filtered = [...groups]
    
    if (filters.groupSearch) {
      const search = filters.groupSearch.toLowerCase()
      filtered = filtered.filter(
        (g) =>
          g.name.toLowerCase().includes(search) ||
          g.specialty?.toLowerCase().includes(search) ||
          g.curator?.toLowerCase().includes(search)
      )
    }
    
    return filtered
  },
  
  getFilteredSubjects: () => {
    const { subjects, filters } = get()
    let filtered = [...subjects]
    
    if (filters.subjectSearch) {
      const search = filters.subjectSearch.toLowerCase()
      filtered = filtered.filter((s) =>
        s.name.toLowerCase().includes(search)
      )
    }
    
    return filtered
  },
  
  getFilteredSchedule: () => {
    const { schedule, filters } = get()
    let filtered = [...schedule]
    
    if (filters.scheduleGroupId) {
      filtered = filtered.filter((l) => l.groupId === filters.scheduleGroupId)
    }
    
    return filtered
  },
  
  getScheduleByDay: (dayNumber) => {
    const filtered = get().getFilteredSchedule()
    return filtered.filter((item) => item.dayNumber === dayNumber)
  },
  
  getUsersByRole: (role) => {
    const { users } = get()
    return users.filter((u) => u.role === role)
  },
  
  // ============== ОЧИСТКА СОСТОЯНИЯ ==============
  
  clearSelectedUser: () => set({ selectedUser: null }),
  
  clearSelectedGroup: () => set({ selectedGroup: null, groupStudents: [] }),
  
  clearSelectedLesson: () => set({ selectedLesson: null }),
  
  clearSelectedSubject: () => set({ selectedSubject: null }),
  
  clearErrors: () =>
    set({
      errors: {
        users: null,
        groups: null,
        schedule: null,
        subjects: null,
        teachers: null,
        stats: null,
        attendanceStats: null,
        import: null,
        validation: null,
      },
    }),
  
  reset: () =>
    set({
      users: [],
      selectedUser: null,
      groups: [],
      selectedGroup: null,
      groupStudents: [],
      schedule: [],
      selectedLesson: null,
      currentWeek: 1,
      subjects: [],
      selectedSubject: null,
      teachers: [],
      stats: null,
      attendanceStats: null,
      importData: null,
      validationResult: null,
      filters: {
        userRole: null,
        userSearch: '',
        groupSearch: '',
        subjectSearch: '',
        scheduleGroupId: null,
        statsGroupId: null,
        statsSubjectId: null,
        statsStudentId: null,
        statsDateFrom: null,
        statsDateTo: null,
      },
      loading: {
        users: false,
        groups: false,
        schedule: false,
        subjects: false,
        teachers: false,
        stats: false,
        attendanceStats: false,
        import: false,
        validation: false,
      },
      errors: {
        users: null,
        groups: null,
        schedule: null,
        subjects: null,
        teachers: null,
        stats: null,
        attendanceStats: null,
        import: null,
        validation: null,
      },
    }),
}))