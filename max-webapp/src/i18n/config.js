import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

// Ресурсы локализации
const resources = {
  ru: {
    translation: {
      // Общие
      common: {
        loading: 'Загрузка...',
        error: 'Ошибка',
        success: 'Успешно',
        cancel: 'Отмена',
        save: 'Сохранить',
        delete: 'Удалить',
        edit: 'Редактировать',
        search: 'Поиск',
        filter: 'Фильтр',
        noData: 'Нет данных',
      },
      // Навигация
      navigation: {
        home: 'Главная',
        dashboard: 'Панель управления',
        settings: 'Настройки',
        profile: 'Профиль',
        logout: 'Выход',
      },
      // Авторизация
      auth: {
        login: 'Вход',
        logout: 'Выход',
        unauthorized: 'Необходима авторизация',
      },
      // Роли
      roles: {
        teacher: 'Преподаватель',
        admin: 'Администратор',
      },
      // Интерфейс преподавателя
      teacher: {
        dashboard: 'Дашборд',
        groups: 'Группы',
        schedule: 'Расписание',
        attendance: 'Посещаемость',
        course: 'курс',
        specialty: 'Специальность',
        students: 'Студентов',
        viewSchedule: 'Посмотреть расписание',
        searchGroups: 'Поиск групп...',
        noGroupsFound: 'Группы не найдены',
        errorLoadingGroups: 'Ошибка загрузки групп',
        errorLoadingSchedule: 'Ошибка загрузки расписания',
        errorLoadingData: 'Ошибка загрузки данных',
        week: 'Неделя',
        filterBySubject: 'Фильтр по предмету',
        allSubjects: 'Все предметы',
        noScheduleForWeek: 'Нет расписания на эту неделю',
        noLessons: 'Нет пар',
        today: 'Сегодня',
        room: 'Ауд.',
        lesson: 'Пара',
        markStudentAttendance: 'Отметьте присутствующих студентов',
        studentsList: 'Список студентов',
        markAll: 'Отметить всех',
        clearAll: 'Снять все',
        saveAttendance: 'Сохранить посещаемость',
        attendanceSaved: 'Посещаемость успешно сохранена',
        errorSavingAttendance: 'Ошибка сохранения посещаемости',
        unsavedChanges: 'У вас есть несохраненные изменения',
        exportAttendance: 'Экспортировать ведомость',
        exportSuccess: 'Ведомость успешно экспортирована',
        exportError: 'Ошибка экспорта ведомости',
        totalGroups: 'Всего групп',
        totalStudents: 'Всего студентов',
        todayLessonsCount: 'Пар сегодня',
        avgAttendance: 'Средняя посещаемость',
        todayLessons: 'Сегодняшние пары',
        noLessonsToday: 'Сегодня нет пар',
        viewGroups: 'Посмотреть группы',
        viewSchedule: 'Посмотреть расписание',
        lessonTypes: {
          lecture: 'Лекция',
          practice: 'Практика',
          lab: 'Лаб. работа',
        },
        days: {
          Monday: 'Понедельник',
          Tuesday: 'Вторник',
          Wednesday: 'Среда',
          Thursday: 'Четверг',
          Friday: 'Пятница',
          Saturday: 'Суббота',
          Sunday: 'Воскресенье',
        },
      },
    },
  },
  en: {
    translation: {
      // Общие
      common: {
        loading: 'Loading...',
        error: 'Error',
        success: 'Success',
        cancel: 'Cancel',
        save: 'Save',
        delete: 'Delete',
        edit: 'Edit',
        search: 'Search',
        filter: 'Filter',
        noData: 'No data',
      },
      // Навигация
      navigation: {
        home: 'Home',
        dashboard: 'Dashboard',
        settings: 'Settings',
        profile: 'Profile',
        logout: 'Logout',
      },
      // Авторизация
      auth: {
        login: 'Login',
        logout: 'Logout',
        unauthorized: 'Authorization required',
      },
      // Роли
      roles: {
        teacher: 'Teacher',
        admin: 'Administrator',
      },
      // Teacher Interface
      teacher: {
        dashboard: 'Dashboard',
        groups: 'Groups',
        schedule: 'Schedule',
        attendance: 'Attendance',
        course: 'year',
        specialty: 'Specialty',
        students: 'Students',
        viewSchedule: 'View schedule',
        searchGroups: 'Search groups...',
        noGroupsFound: 'No groups found',
        errorLoadingGroups: 'Error loading groups',
        errorLoadingSchedule: 'Error loading schedule',
        errorLoadingData: 'Error loading data',
        week: 'Week',
        filterBySubject: 'Filter by subject',
        allSubjects: 'All subjects',
        noScheduleForWeek: 'No schedule for this week',
        noLessons: 'No lessons',
        today: 'Today',
        room: 'Room',
        lesson: 'Lesson',
        markStudentAttendance: 'Mark present students',
        studentsList: 'Students list',
        markAll: 'Mark all',
        clearAll: 'Clear all',
        saveAttendance: 'Save attendance',
        attendanceSaved: 'Attendance saved successfully',
        errorSavingAttendance: 'Error saving attendance',
        unsavedChanges: 'You have unsaved changes',
        exportAttendance: 'Export attendance',
        exportSuccess: 'Attendance exported successfully',
        exportError: 'Error exporting attendance',
        totalGroups: 'Total groups',
        totalStudents: 'Total students',
        todayLessonsCount: 'Today\'s lessons',
        avgAttendance: 'Average attendance',
        todayLessons: 'Today\'s lessons',
        noLessonsToday: 'No lessons today',
        viewGroups: 'View groups',
        lessonTypes: {
          lecture: 'Lecture',
          practice: 'Practice',
          lab: 'Lab work',
        },
        days: {
          Monday: 'Monday',
          Tuesday: 'Tuesday',
          Wednesday: 'Wednesday',
          Thursday: 'Thursday',
          Friday: 'Friday',
          Saturday: 'Saturday',
          Sunday: 'Sunday',
        },
      },
    },
  },
}

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'ru', // Язык по умолчанию
    fallbackLng: 'ru',
    interpolation: {
      escapeValue: false, // React уже защищает от XSS
    },
    react: {
      useSuspense: false,
    },
  })

export default i18n