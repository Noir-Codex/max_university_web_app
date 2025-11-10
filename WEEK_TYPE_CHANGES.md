# Изменения системы расписания: переход на week_type

## Описание изменений

Система расписания обновлена для поддержки чередования недель в вузах (первая/вторая неделя или нечетная/четная).

### Основные изменения:

**Вместо:** `week_number` (1-52) - номер недели в году  
**Теперь:** `week_type` (0, 1, 2) - тип недели:
- `0` = пара идет каждую неделю
- `1` = первая (нечетная) неделя
- `2` = вторая (четная) неделя

## Изменения в базе данных

### Схема таблицы `schedule`

```sql
-- Добавлен новый столбец
ALTER TABLE schedule ADD COLUMN week_type INTEGER DEFAULT 0 CHECK (week_type IN (0, 1, 2));

-- Создан индекс
CREATE INDEX idx_schedule_week_type ON schedule(week_type);
```

**Комментарий:** week_type = 0 (каждую неделю), 1 (первая неделя), 2 (вторая неделя)

## Изменения в бэкенде

### 1. Модель `Schedule` (`server/models/Schedule.js`)

#### Метод `getCurrentWeekType()`
Новый статический метод для определения текущего типа недели:
- Отсчет ведется от 1 сентября текущего учебного года
- Возвращает 1 (нечетная) или 2 (четная)

```javascript
static getCurrentWeekType() {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  
  const academicYearStart = new Date(
    currentMonth >= 8 ? currentYear : currentYear - 1,
    8, // сентябрь
    1
  );
  
  const diffTime = now.getTime() - academicYearStart.getTime();
  const diffWeeks = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7));
  
  return (diffWeeks % 2 === 0) ? 1 : 2;
}
```

#### Метод `findAll(filters)`
- Параметр `week` заменен на `week_type`
- Логика фильтрации: показывает пары для указанной недели И пары с `week_type = 0` (каждую неделю)

```javascript
if (filters.week_type !== undefined && filters.week_type !== null) {
  sql += ` AND (s.week_type = $${paramCount} OR s.week_type = 0)`;
  params.push(filters.week_type);
  paramCount++;
}
```

#### Метод `findToday(teacherId)`
- Автоматически определяет текущий тип недели через `getCurrentWeekType()`
- Возвращает пары для текущей недели + пары с `week_type = 0`

#### Остальные методы
- `create()` - принимает `week_type` вместо `week_number`
- `update()` - обновлен список разрешенных полей
- `bulkCreate()` - поддержка `week_type`
- `getStatistics()` - фильтрация по `week_type`

### 2. Контроллер `scheduleController` (`server/controllers/scheduleController.js`)

#### `getSchedule()`
```javascript
// Если week_type не указан, определяем текущую неделю
if (week_type === undefined || week_type === null || week_type === '') {
  week_type = Schedule.getCurrentWeekType();
} else {
  week_type = parseInt(week_type);
}
```

#### `createLesson()` и `updateLesson()`
- Параметр `week_number` заменен на `week_type`
- Значение по умолчанию: `week_type = 0`

#### `getScheduleStats()`
- Автоматическое определение текущей недели, если не указана

## Изменения во фронтенде

### 1. API сервис (`max-webapp/src/services/api/teacher.js`)

```javascript
export const fetchSchedule = async (weekType = null, groupId = null, teacherId = null) => {
  const params = {}
  // Если weekType не указан, бэкенд автоматически определит текущую неделю
  if (weekType !== null && weekType !== undefined) {
    params.week_type = weekType
  }
  if (groupId) params.group_id = groupId
  if (teacherId) params.teacher_id = teacherId
  const response = await api.get('/schedule', { params })
  return response.data
}
```

### 2. Store (`max-webapp/src/store/teacherStore.js`)

```javascript
// Было:
currentWeek: 1,

// Стало:
currentWeekType: null, // null = автоопределение, 1 = первая, 2 = вторая

// Было:
setCurrentWeek: (week) => set({ currentWeek: week }),

// Стало:
setCurrentWeekType: (weekType) => set({ currentWeekType: weekType }),
```

### 3. Компонент `WeekSelector` (`max-webapp/src/components/teacher/WeekSelector.jsx`)

**Новый функционал:**
- Кнопка переключения между 1-й и 2-й неделей
- Кнопка сброса (↻) для возврата к автоопределению текущей недели
- Локальная функция `getCurrentWeekType()` для отображения текущей недели

**Props:**
```javascript
// Было:
currentWeek: PropTypes.number.isRequired,
onWeekChange: PropTypes.func.isRequired,

// Стало:
currentWeekType: PropTypes.number, // null, 1, или 2
onWeekTypeChange: PropTypes.func.isRequired,
```

**UI:**
```
Неделя: [1-я (нечетная)] [↻]  // если выбрана вручную
Неделя: [2-я (четная)]         // если автоопределение
```

### 4. Страница расписания (`max-webapp/src/pages/TeacherDashboard/Schedule.jsx`)

```javascript
// Обновлены хуки и обработчики
const {
  currentWeekType,  // было: currentWeek
  setCurrentWeekType,  // было: setCurrentWeek
  // ...
} = useTeacherStore()

const handleWeekTypeChange = (weekType) => {
  setCurrentWeekType(weekType)
}

// Обновлен queryKey
queryKey: ['teacherSchedule', viewMode, currentWeekType, currentMonth, groupId, user?.id]
```

### 5. Админ-панель (`max-webapp/src/components/admin/ScheduleForm.jsx`)

**Добавлено поле выбора недели:**
```jsx
<div className={styles.formGroup}>
  <label className={styles.label}>Неделя *</label>
  <select className={styles.select} {...register('week_type')}>
    <option value="0">Каждую неделю</option>
    <option value="1">1-я неделя (нечетная)</option>
    <option value="2">2-я неделя (четная)</option>
  </select>
</div>
```

## Скрипты для работы с БД

### Создание тестовых данных
```bash
node server/scripts/seedScheduleWithWeekType.js
```

Создает расписание с примерами:
- Пары на 1-й неделе (week_type = 1)
- Пары на 2-й неделе (week_type = 2)
- Пары каждую неделю (week_type = 0)

## API Endpoints

### GET `/api/schedule`
**Query параметры:**
- `week_type` (опционально): 0, 1, 2 или null (автоопределение)
- `group_id` (опционально)
- `teacher_id` (опционально)
- `day_of_week` (опционально)
- `subject_id` (опционально)

**Логика:**
- Если `week_type` не указан → автоматически определяется текущая неделя
- Возвращает пары для указанной недели + пары с `week_type = 0`

### POST `/api/schedule`
**Body:**
```json
{
  "subject_id": 1,
  "group_id": 1,
  "teacher_id": 1,
  "day_of_week": 1,
  "time_start": "09:00",
  "time_end": "10:30",
  "room": "301",
  "week_type": 1,  // 0, 1 или 2
  "lesson_type": "lecture"
}
```

### PUT `/api/schedule/:id`
Аналогично POST, но для обновления существующей пары.

## Миграция существующих данных

Если в БД уже есть данные с `week_number`, они автоматически преобразуются:
- Нечетные недели (1, 3, 5...) → `week_type = 1`
- Четные недели (2, 4, 6...) → `week_type = 2`

## Обратная совместимость

⚠️ **Внимание:** Старые API запросы с параметром `week` больше не поддерживаются.
Необходимо обновить все клиентские приложения для использования `week_type`.

## Преимущества новой системы

1. ✅ **Соответствие реальному расписанию вузов** - первая/вторая неделя
2. ✅ **Автоматическое определение текущей недели** - не нужно вручную указывать
3. ✅ **Поддержка пар "каждую неделю"** - `week_type = 0`
4. ✅ **Простота переключения** - одна кнопка в UI
5. ✅ **Правильный отсчет** - от начала учебного года (1 сентября)

## Тестирование

### Проверка текущей недели:
```bash
curl "http://localhost:3001/api/schedule" -H "Authorization: Bearer TOKEN"
```

### Проверка конкретной недели:
```bash
# Первая неделя
curl "http://localhost:3001/api/schedule?week_type=1" -H "Authorization: Bearer TOKEN"

# Вторая неделя
curl "http://localhost:3001/api/schedule?week_type=2" -H "Authorization: Bearer TOKEN"
```

### Проверка в UI:
1. Откройте панель преподавателя
2. Перейдите в "Расписание"
3. Нажмите кнопку с типом недели для переключения
4. Нажмите ↻ для возврата к текущей неделе

## Файлы, затронутые изменениями

### Backend:
- `server/scripts/init-database.sql` - схема БД
- `server/models/Schedule.js` - модель расписания
- `server/controllers/scheduleController.js` - контроллер
- `server/scripts/seedScheduleWithWeekType.js` - новый скрипт для тестовых данных

### Frontend:
- `max-webapp/src/services/api/teacher.js` - API сервис
- `max-webapp/src/store/teacherStore.js` - store
- `max-webapp/src/pages/TeacherDashboard/Schedule.jsx` - страница расписания
- `max-webapp/src/components/teacher/WeekSelector.jsx` - селектор недели
- `max-webapp/src/components/teacher/WeekSelector.module.css` - стили
- `max-webapp/src/components/admin/ScheduleForm.jsx` - форма создания/редактирования

---

**Дата обновления:** 9 ноября 2025  
**Версия:** 2.0.0



