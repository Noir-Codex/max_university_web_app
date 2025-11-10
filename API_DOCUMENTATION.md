# 📡 API Documentation - MAX Attendance Tracker

Полная документация REST API для системы учета посещаемости MAX Attendance Tracker.

---

## 📋 Содержание

1. [Общая информация](#-общая-информация)
2. [Аутентификация](#-аутентификация)
3. [API Endpoints](#-api-endpoints)
   - [Auth](#auth---аутентификация)
   - [Users](#users---пользователи)
   - [Groups](#groups---группы)
   - [Subjects](#subjects---дисциплины)
   - [Schedule](#schedule---расписание)
   - [Attendance](#attendance---посещаемость)
   - [Reports](#reports---отчеты)
   - [Import](#import---импорт-данных)
4. [Коды ошибок](#-коды-ошибок)
5. [Rate Limits](#-rate-limits)
6. [Примеры использования](#-примеры-использования)

---

## 🌐 Общая информация

### Base URL

```
Production:  https://your-api-domain.com/api
Development: http://localhost:3001/api
```

### Формат данных

- **Request:** JSON (`Content-Type: application/json`)
- **Response:** JSON
- **Кодировка:** UTF-8
- **Даты:** ISO 8601 (`YYYY-MM-DD`)
- **Время:** 24-часовой формат (`HH:MM`)

### HTTP методы

| Метод | Назначение |
|-------|------------|
| GET | Получение данных |
| POST | Создание новой записи |
| PUT | Полное обновление записи |
| PATCH | Частичное обновление |
| DELETE | Удаление записи |

### Заголовки запроса

```http
Content-Type: application/json
Authorization: Bearer <jwt_token>
X-Init-Data: <telegram_init_data>
```

### Структура ответа

**Успешный ответ:**
```json
{
  "data": { ... },
  "message": "Success message"
}
```

**Ошибка:**
```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": { ... }
}
```

---

## 🔐 Аутентификация

API использует двухэтапную аутентификацию:
1. Валидация MAX WebApp `initData` (при логине)
2. JWT токены для последующих запросов

### Получение токена

При успешном логине сервер возвращает JWT токен, который необходимо включать в заголовок `Authorization` всех последующих запросов.

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Роли пользователей

| Роль | Описание | Права |
|------|----------|-------|
| `student` | Студент | Просмотр собственной посещаемости |
| `teacher` | Преподаватель | Управление посещаемостью своих групп |
| `admin` | Администратор | Полный доступ ко всем функциям |

---

## 📚 API Endpoints

## Auth - Аутентификация

### POST /api/auth/login

Авторизация через MAX WebApp

**Доступ:** Public

**Headers:**
```http
Content-Type: application/json
X-Init-Data: <telegram_init_data>
```

**Request Body:**
```json
{
  "initData": "query_id=AAH...&user=%7B%22id%22%3A123456..."
}
```

**Response:** 200 OK
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "telegram_id": 123456789,
    "username": "john_doe",
    "first_name": "John",
    "last_name": "Doe",
    "role": "teacher",
    "email": "john@example.com",
    "created_at": "2024-01-15T10:30:00.000Z"
  }
}
```

**Errors:**
- `401` - Invalid initData
- `400` - Missing initData
- `500` - Server error

---

### GET /api/auth/me

Получить информацию о текущем пользователе

**Доступ:** Private

**Headers:**
```http
Authorization: Bearer <token>
```

**Response:** 200 OK
```json
{
  "user": {
    "id": 1,
    "telegram_id": 123456789,
    "username": "john_doe",
    "first_name": "John",
    "last_name": "Doe",
    "role": "teacher",
    "email": "john@example.com"
  }
}
```

**Errors:**
- `401` - Unauthorized (invalid or expired token)

---

### POST /api/auth/logout

Выход из системы

**Доступ:** Private

**Headers:**
```http
Authorization: Bearer <token>
```

**Response:** 200 OK
```json
{
  "message": "Logged out successfully"
}
```

---

## Users - Пользователи

### GET /api/users

Получить всех пользователей

**Доступ:** Admin

**Query Parameters:**
| Параметр | Тип | Описание |
|----------|-----|----------|
| role | string | Фильтр по роли: `student`, `teacher`, `admin` |
| search | string | Поиск по имени или username |
| page | number | Номер страницы (default: 1) |
| limit | number | Кол-во на странице (default: 50) |

**Example:**
```
GET /api/users?role=teacher&page=1&limit=20
```

**Response:** 200 OK
```json
{
  "users": [
    {
      "id": 1,
      "telegram_id": 123456789,
      "username": "john_teacher",
      "first_name": "John",
      "last_name": "Smith",
      "role": "teacher",
      "email": "john@example.com",
      "created_at": "2024-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "pages": 3
  }
}
```

---

### GET /api/users/:id

Получить пользователя по ID

**Доступ:** Private

**Parameters:**
- `id` - ID пользователя

**Response:** 200 OK
```json
{
  "user": {
    "id": 1,
    "telegram_id": 123456789,
    "username": "john_doe",
    "first_name": "John",
    "last_name": "Doe",
    "role": "teacher",
    "email": "john@example.com",
    "phone": "+79001234567",
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-20T14:20:00.000Z"
  }
}
```

**Errors:**
- `404` - User not found

---

### GET /api/users/teachers

Получить список всех преподавателей

**Доступ:** Private

**Response:** 200 OK
```json
{
  "teachers": [
    {
      "id": 1,
      "first_name": "John",
      "last_name": "Smith",
      "email": "john@example.com",
      "subjects": ["Математика", "Физика"]
    }
  ]
}
```

---

### GET /api/users/students/:groupId

Получить студентов группы

**Доступ:** Private

**Parameters:**
- `groupId` - ID группы

**Response:** 200 OK
```json
{
  "students": [
    {
      "id": 5,
      "first_name": "Alice",
      "last_name": "Johnson",
      "username": "alice_j",
      "email": "alice@example.com"
    }
  ]
}
```

---

### POST /api/users

Создать пользователя

**Доступ:** Admin

**Request Body:**
```json
{
  "telegram_id": 123456789,
  "username": "new_user",
  "first_name": "Jane",
  "last_name": "Doe",
  "role": "student",
  "email": "jane@example.com",
  "password": "secure_password"
}
```

**Response:** 201 Created
```json
{
  "user": {
    "id": 10,
    "telegram_id": 123456789,
    "username": "new_user",
    "first_name": "Jane",
    "last_name": "Doe",
    "role": "student",
    "email": "jane@example.com",
    "created_at": "2024-01-25T09:15:00.000Z"
  },
  "message": "User created successfully"
}
```

**Errors:**
- `400` - Validation error
- `409` - User already exists (duplicate email/telegram_id)

---

### PUT /api/users/:id

Обновить пользователя

**Доступ:** Admin

**Parameters:**
- `id` - ID пользователя

**Request Body:**
```json
{
  "first_name": "Jane",
  "last_name": "Smith",
  "email": "jane.smith@example.com",
  "role": "teacher"
}
```

**Response:** 200 OK
```json
{
  "user": {
    "id": 10,
    "first_name": "Jane",
    "last_name": "Smith",
    "email": "jane.smith@example.com",
    "role": "teacher",
    "updated_at": "2024-01-26T11:30:00.000Z"
  },
  "message": "User updated successfully"
}
```

---

### DELETE /api/users/:id

Удалить пользователя

**Доступ:** Admin

**Parameters:**
- `id` - ID пользователя

**Response:** 200 OK
```json
{
  "message": "User deleted successfully"
}
```

**Errors:**
- `404` - User not found
- `400` - Cannot delete user with active records

---

## Groups - Группы

### GET /api/groups

Получить все группы

**Доступ:** Private

**Query Parameters:**
| Параметр | Тип | Описание |
|----------|-----|----------|
| course | number | Фильтр по курсу (1-5) |
| search | string | Поиск по названию |

**Response:** 200 OK
```json
{
  "groups": [
    {
      "id": 1,
      "name": "ИС-21",
      "course": 2,
      "specialty": "Информационные системы",
      "curator_id": 3,
      "curator_name": "John Smith",
      "student_count": 25,
      "created_at": "2023-09-01T08:00:00.000Z"
    }
  ]
}
```

---

### GET /api/groups/:id

Получить группу по ID

**Доступ:** Private

**Parameters:**
- `id` - ID группы

**Response:** 200 OK
```json
{
  "group": {
    "id": 1,
    "name": "ИС-21",
    "course": 2,
    "specialty": "Информационные системы",
    "curator": {
      "id": 3,
      "first_name": "John",
      "last_name": "Smith"
    },
    "student_count": 25
  }
}
```

---

### GET /api/groups/:id/students

Получить студентов группы

**Доступ:** Private

**Parameters:**
- `id` - ID группы

**Response:** 200 OK
```json
{
  "students": [
    {
      "id": 5,
      "first_name": "Alice",
      "last_name": "Johnson",
      "email": "alice@example.com",
      "attendance_percentage": 85.5
    }
  ]
}
```

---

### POST /api/groups

Создать группу

**Доступ:** Admin

**Request Body:**
```json
{
  "name": "ИС-31",
  "course": 3,
  "specialty": "Информационные системы",
  "curator_id": 3
}
```

**Response:** 201 Created
```json
{
  "group": {
    "id": 5,
    "name": "ИС-31",
    "course": 3,
    "specialty": "Информационные системы",
    "curator_id": 3,
    "created_at": "2024-01-25T10:00:00.000Z"
  },
  "message": "Group created successfully"
}
```

---

### POST /api/groups/:id/students

Добавить студента в группу

**Доступ:** Admin

**Parameters:**
- `id` - ID группы

**Request Body:**
```json
{
  "student_id": 15
}
```

**Response:** 200 OK
```json
{
  "message": "Student added to group successfully"
}
```

---

### PUT /api/groups/:id

Обновить группу

**Доступ:** Admin

**Parameters:**
- `id` - ID группы

**Request Body:**
```json
{
  "name": "ИС-31 (обновлено)",
  "curator_id": 4
}
```

**Response:** 200 OK
```json
{
  "group": {
    "id": 5,
    "name": "ИС-31 (обновлено)",
    "curator_id": 4,
    "updated_at": "2024-01-26T12:00:00.000Z"
  },
  "message": "Group updated successfully"
}
```

---

### DELETE /api/groups/:id

Удалить группу

**Доступ:** Admin

**Parameters:**
- `id` - ID группы

**Response:** 200 OK
```json
{
  "message": "Group deleted successfully"
}
```

---

### DELETE /api/groups/:id/students/:studentId

Удалить студента из группы

**Доступ:** Admin

**Parameters:**
- `id` - ID группы
- `studentId` - ID студента

**Response:** 200 OK
```json
{
  "message": "Student removed from group successfully"
}
```

---

## Subjects - Дисциплины

### GET /api/subjects

Получить все дисциплины

**Доступ:** Private

**Response:** 200 OK
```json
{
  "subjects": [
    {
      "id": 1,
      "name": "Математический анализ",
      "type": "Лекция",
      "hours": 72,
      "created_at": "2023-09-01T08:00:00.000Z"
    }
  ]
}
```

---

### GET /api/subjects/:id

Получить дисциплину по ID

**Доступ:** Private

**Response:** 200 OK
```json
{
  "subject": {
    "id": 1,
    "name": "Математический анализ",
    "type": "Лекция",
    "hours": 72,
    "description": "Основы матанализа"
  }
}
```

---

### GET /api/subjects/teacher/:teacherId

Получить дисциплины преподавателя

**Доступ:** Private

**Parameters:**
- `teacherId` - ID преподавателя

**Response:** 200 OK
```json
{
  "subjects": [
    {
      "id": 1,
      "name": "Математический анализ",
      "groups": ["ИС-21", "ИС-22"]
    }
  ]
}
```

---

### POST /api/subjects

Создать дисциплину

**Доступ:** Admin

**Request Body:**
```json
{
  "name": "Программирование",
  "type": "Практика",
  "hours": 144,
  "description": "Основы программирования на Python"
}
```

**Response:** 201 Created
```json
{
  "subject": {
    "id": 10,
    "name": "Программирование",
    "type": "Практика",
    "hours": 144,
    "created_at": "2024-01-25T11:00:00.000Z"
  },
  "message": "Subject created successfully"
}
```

---

### PUT /api/subjects/:id

Обновить дисциплину

**Доступ:** Admin

**Response:** 200 OK

---

### DELETE /api/subjects/:id

Удалить дисциплину

**Доступ:** Admin

**Response:** 200 OK
```json
{
  "message": "Subject deleted successfully"
}
```

---

## Schedule - Расписание

### GET /api/schedule

Получить расписание с фильтрами

**Доступ:** Private

**Query Parameters:**
| Параметр | Тип | Описание |
|----------|-----|----------|
| group_id | number | ID группы |
| teacher_id | number | ID преподавателя |
| subject_id | number | ID дисциплины |
| day_of_week | number | День недели (1-7, 1=Понедельник) |
| week_number | number | Номер недели (1 или 2 для чётной/нечётной) |
| date | string | Дата (YYYY-MM-DD) |

**Example:**
```
GET /api/schedule?group_id=1&day_of_week=1
```

**Response:** 200 OK
```json
{
  "schedule": [
    {
      "id": 1,
      "subject": {
        "id": 1,
        "name": "Математический анализ"
      },
      "group": {
        "id": 1,
        "name": "ИС-21"
      },
      "teacher": {
        "id": 3,
        "first_name": "John",
        "last_name": "Smith"
      },
      "day_of_week": 1,
      "time_start": "09:00",
      "time_end": "10:30",
      "room": "301",
      "week_number": 1,
      "lesson_type": "Лекция"
    }
  ]
}
```

---

### GET /api/schedule/today

Получить расписание на сегодня

**Доступ:** Private

**Query Parameters:**
| Параметр | Тип | Описание |
|----------|-----|----------|
| group_id | number | ID группы (опционально) |
| teacher_id | number | ID преподавателя (опционально) |

**Response:** 200 OK
```json
{
  "date": "2024-01-25",
  "day_of_week": 4,
  "week_number": 1,
  "schedule": [
    {
      "id": 15,
      "time_start": "09:00",
      "time_end": "10:30",
      "subject_name": "Математика",
      "group_name": "ИС-21",
      "room": "301",
      "teacher_name": "John Smith"
    }
  ]
}
```

---

### GET /api/schedule/:id

Получить пару по ID

**Доступ:** Private

**Response:** 200 OK
```json
{
  "lesson": {
    "id": 1,
    "subject_id": 1,
    "subject_name": "Математический анализ",
    "group_id": 1,
    "group_name": "ИС-21",
    "teacher_id": 3,
    "teacher_name": "John Smith",
    "day_of_week": 1,
    "time_start": "09:00",
    "time_end": "10:30",
    "room": "301",
    "week_number": 1,
    "lesson_type": "Лекция"
  }
}
```

---

### GET /api/schedule/stats

Получить статистику расписания

**Доступ:** Admin

**Response:** 200 OK
```json
{
  "stats": {
    "total_lessons": 120,
    "lessons_per_week": 30,
    "teachers_count": 15,
    "groups_count": 8,
    "subjects_count": 25
  }
}
```

---

### POST /api/schedule

Создать пару в расписании

**Доступ:** Admin

**Request Body:**
```json
{
  "subject_id": 1,
  "group_id": 1,
  "teacher_id": 3,
  "day_of_week": 1,
  "time_start": "09:00",
  "time_end": "10:30",
  "room": "301",
  "week_number": 1,
  "lesson_type": "Лекция"
}
```

**Response:** 201 Created
```json
{
  "lesson": {
    "id": 25,
    "subject_id": 1,
    "group_id": 1,
    "teacher_id": 3,
    "day_of_week": 1,
    "time_start": "09:00",
    "time_end": "10:30",
    "room": "301",
    "week_number": 1,
    "lesson_type": "Лекция",
    "created_at": "2024-01-25T12:00:00.000Z"
  },
  "message": "Lesson created successfully"
}
```

---

### PUT /api/schedule/:id

Обновить пару в расписании

**Доступ:** Admin

**Request Body:**
```json
{
  "time_start": "10:00",
  "time_end": "11:30",
  "room": "305"
}
```

**Response:** 200 OK
```json
{
  "lesson": {
    "id": 25,
    "time_start": "10:00",
    "time_end": "11:30",
    "room": "305",
    "updated_at": "2024-01-26T09:00:00.000Z"
  },
  "message": "Lesson updated successfully"
}
```

---

### DELETE /api/schedule/:id

Удалить пару из расписания

**Доступ:** Admin

**Response:** 200 OK
```json
{
  "message": "Lesson deleted successfully"
}
```

---

## Attendance - Посещаемость

### GET /api/attendance

Получить посещаемость с фильтрами

**Доступ:** Private

**Query Parameters:**
| Параметр | Тип | Описание |
|----------|-----|----------|
| lesson_id | number | ID пары |
| student_id | number | ID студента |
| group_id | number | ID группы |
| date_from | string | Дата от (YYYY-MM-DD) |
| date_to | string | Дата до (YYYY-MM-DD) |
| status | string | Статус: `present`, `absent`, `late`, `excused` |

**Example:**
```
GET /api/attendance?group_id=1&date_from=2024-01-01&date_to=2024-01-31
```

**Response:** 200 OK
```json
{
  "attendance": [
    {
      "id": 100,
      "lesson_id": 1,
      "student": {
        "id": 5,
        "first_name": "Alice",
        "last_name": "Johnson"
      },
      "date": "2024-01-25",
      "status": "present",
      "notes": "",
      "created_at": "2024-01-25T09:05:00.000Z"
    }
  ]
}
```

---

### GET /api/attendance/lesson/:lessonId

Получить посещаемость для конкретной пары

**Доступ:** Teacher/Admin

**Parameters:**
- `lessonId` - ID пары

**Query Parameters:**
| Параметр | Тип | Описание |
|----------|-----|----------|
| date | string | Дата (YYYY-MM-DD) |

**Response:** 200 OK
```json
{
  "lesson": {
    "id": 1,
    "subject_name": "Математика",
    "group_name": "ИС-21",
    "date": "2024-01-25",
    "time_start": "09:00"
  },
  "attendance": [
    {
      "student_id": 5,
      "student_name": "Alice Johnson",
      "status": "present",
      "notes": ""
    }
  ]
}
```

---

### GET /api/attendance/stats/student/:studentId

Статистика посещаемости студента

**Доступ:** Private

**Parameters:**
- `studentId` - ID студента

**Query Parameters:**
| Параметр | Тип | Описание |
|----------|-----|----------|
| date_from | string | Дата от |
| date_to | string | Дата до |

**Response:** 200 OK
```json
{
  "student": {
    "id": 5,
    "first_name": "Alice",
    "last_name": "Johnson"
  },
  "stats": {
    "total_lessons": 50,
    "present": 42,
    "absent": 5,
    "late": 2,
    "excused": 1,
    "attendance_percentage": 84.0
  },
  "by_subject": [
    {
      "subject_name": "Математика",
      "total": 20,
      "present": 18,
      "percentage": 90.0
    }
  ]
}
```

---

### GET /api/attendance/stats/group/:groupId

Статистика посещаемости по группе

**Доступ:** Private

**Response:** 200 OK
```json
{
  "group": {
    "id": 1,
    "name": "ИС-21"
  },
  "stats": {
    "total_students": 25,
    "average_attendance": 85.5,
    "best_student": {
      "name": "Alice Johnson",
      "percentage": 95.0
    },
    "worst_student": {
      "name": "Bob Smith",
      "percentage": 60.0
    }
  },
  "students": [
    {
      "id": 5,
      "name": "Alice Johnson",
      "attendance_percentage": 95.0
    }
  ]
}
```

---

### GET /api/attendance/stats/subject/:subjectId

Статистика по дисциплине

**Доступ:** Private

**Response:** 200 OK
```json
{
  "subject": {
    "id": 1,
    "name": "Математика"
  },
  "stats": {
    "total_lessons": 36,
    "average_attendance": 82.5,
    "groups": [
      {
        "group_name": "ИС-21",
        "attendance_percentage": 85.0
      }
    ]
  }
}
```

---

### GET /api/attendance/stats/overall

Общая статистика посещаемости

**Доступ:** Admin

**Response:** 200 OK
```json
{
  "stats": {
    "total_students": 200,
    "total_lessons": 1440,
    "average_attendance": 83.5,
    "present_percentage": 83.5,
    "absent_percentage": 10.2,
    "late_percentage": 4.3,
    "excused_percentage": 2.0
  },
  "by_course": [
    {
      "course": 1,
      "attendance_percentage": 88.0
    }
  ],
  "trends": {
    "current_week": 85.0,
    "previous_week": 82.0,
    "change": 3.0
  }
}
```

---

### POST /api/attendance

Сохранить посещаемость

**Доступ:** Teacher/Admin

**Request Body:**
```json
{
  "lesson_id": 1,
  "student_id": 5,
  "date": "2024-01-25",
  "status": "present",
  "notes": ""
}
```

**Response:** 201 Created
```json
{
  "attendance": {
    "id": 150,
    "lesson_id": 1,
    "student_id": 5,
    "date": "2024-01-25",
    "status": "present",
    "notes": "",
    "created_at": "2024-01-25T09:05:00.000Z"
  },
  "message": "Attendance saved successfully"
}
```

---

### POST /api/attendance/bulk

Массовое сохранение посещаемости

**Доступ:** Teacher/Admin

**Request Body:**
```json
{
  "lesson_id": 1,
  "date": "2024-01-25",
  "attendance": [
    {
      "student_id": 5,
      "status": "present"
    },
    {
      "student_id": 6,
      "status": "absent",
      "notes": "Болен"
    },
    {
      "student_id": 7,
      "status": "late"
    }
  ]
}
```

**Response:** 201 Created
```json
{
  "saved": 3,
  "message": "Attendance saved successfully for 3 students"
}
```

---

### PUT /api/attendance/:id

Обновить запись о посещаемости

**Доступ:** Teacher/Admin

**Request Body:**
```json
{
  "status": "excused",
  "notes": "Справка от врача"
}
```

**Response:** 200 OK
```json
{
  "attendance": {
    "id": 150,
    "status": "excused",
    "notes": "Справка от врача",
    "updated_at": "2024-01-26T10:00:00.000Z"
  },
  "message": "Attendance updated successfully"
}
```

---

### DELETE /api/attendance/:id

Удалить запись о посещаемости

**Доступ:** Teacher/Admin

**Response:** 200 OK
```json
{
  "message": "Attendance deleted successfully"
}
```

---

## Reports - Отчеты

### GET /api/reports/attendance

Получить отчет о посещаемости

**Доступ:** Private

**Query Parameters:**
| Параметр | Тип | Описание |
|----------|-----|----------|
| group_id | number | ID группы |
| student_id | number | ID студента |
| subject_id | number | ID дисциплины |
| date_from | string | Дата от |
| date_to | string | Дата до |
| format | string | Формат: `json`, `csv`, `xlsx` |

**Response:** 200 OK (JSON) или файл (CSV/XLSX)

---

### GET /api/reports/export

Экспорт отчета

**Доступ:** Private

**Query Parameters:**
- Same as `/api/reports/attendance`
- `format` - обязательный параметр: `csv` или `xlsx`

**Response:** File download

---

### GET /api/reports/stats/groups

Статистика по группам

**Доступ:** Admin

**Response:** 200 OK
```json
{
  "groups": [
    {
      "id": 1,
      "name": "ИС-21",
      "student_count": 25,
      "attendance_percentage": 85.5,
      "best_attendance": 95.0,
      "worst_attendance": 65.0
    }
  ]
}
```

---

### GET /api/reports/stats/subjects

Статистика по дисциплинам

**Доступ:** Admin

**Response:** 200 OK
```json
{
  "subjects": [
    {
      "id": 1,
      "name": "Математика",
      "groups_count": 3,
      "average_attendance": 82.5
    }
  ]
}
```

---

### GET /api/reports/stats/overall

Общая статистика системы

**Доступ:** Admin

**Response:** 200 OK
```json
{
  "overall": {
    "total_students": 200,
    "total_teachers": 15,
    "total_groups": 8,
    "total_subjects": 25,
    "average_attendance": 83.5
  },
  "trends": {
    "daily": [...],
    "weekly": [...],
    "monthly": [...]
  }
}
```

---

## Import - Импорт данных

### POST /api/import/schedule/validate

Валидировать данные перед импортом

**Доступ:** Admin

**Request:** `multipart/form-data`
```
file: [Excel file]
```

**Response:** 200 OK
```json
{
  "valid": true,
  "records": 120,
  "preview": [
    {
      "subject": "Математика",
      "group": "ИС-21",
      "teacher": "John Smith",
      "day": "Понедельник",
      "time": "09:00-10:30"
    }
  ],
  "errors": []
}
```

---

### POST /api/import/schedule

Импортировать расписание из файла

**Доступ:** Admin

**Request:** `multipart/form-data`
```
file: [Excel file]
mode: "replace" | "append"
```

**Response:** 201 Created
```json
{
  "imported": 120,
  "skipped": 5,
  "errors": [
    {
      "row": 15,
      "error": "Teacher not found"
    }
  ],
  "message": "Import completed successfully"
}
```

---

## 🚨 Коды ошибок

### HTTP Status Codes

| Код | Значение | Описание |
|-----|----------|----------|
| 200 | OK | Успешный запрос |
| 201 | Created | Ресурс создан |
| 400 | Bad Request | Неверный запрос |
| 401 | Unauthorized | Не авторизован |
| 403 | Forbidden | Доступ запрещён |
| 404 | Not Found | Ресурс не найден |
| 409 | Conflict | Конфликт (дубликат) |
| 422 | Unprocessable Entity | Ошибка валидации |
| 429 | Too Many Requests | Превышен rate limit |
| 500 | Internal Server Error | Ошибка сервера |

### Error Codes

| Код | Описание |
|-----|----------|
| `INVALID_INIT_DATA` | Невалидный MAX initData |
| `INVALID_TOKEN` | Невалидный или истёкший JWT токен |
| `VALIDATION_ERROR` | Ошибка валидации данных |
| `NOT_FOUND` | Ресурс не найден |
| `DUPLICATE_ENTRY` | Дубликат записи |
| `INSUFFICIENT_PERMISSIONS` | Недостаточно прав |
| `RATE_LIMIT_EXCEEDED` | Превышен лимит запросов |

### Example Error Response

```json
{
  "error": "Validation failed",
  "code": "VALIDATION_ERROR",
  "details": {
    "email": "Invalid email format",
    "age": "Must be at least 18"
  },
  "timestamp": "2024-01-25T10:30:00.000Z"
}
```

---

## ⏱ Rate Limits

### Лимиты по умолчанию

| Роль | Лимит | Период |
|------|-------|--------|
| Public | 20 запросов | 15 минут |
| Student | 100 запросов | 15 минут |
| Teacher | 200 запросов | 15 минут |
| Admin | 500 запросов | 15 минут |

### Headers

При превышении лимита сервер возвращает:

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1706180400
Retry-After: 900
```

---

## 💡 Примеры использования

### JavaScript (Axios)

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://api.your-domain.com/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Добавить токен к каждому запросу
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Логин
const login = async (initData) => {
  const response = await api.post('/auth/login', { initData });
  localStorage.setItem('auth_token', response.data.token);
  return response.data;
};

// Получить расписание
const getSchedule = async (groupId, date) => {
  const response = await api.get('/schedule', {
    params: { group_id: groupId, date }
  });
  return response.data;
};

// Сохранить посещаемость
const saveAttendance = async (data) => {
  const response = await api.post('/attendance/bulk', data);
  return response.data;
};
```

### Python (requests)

```python
import requests

API_URL = "https://api.your-domain.com/api"
token = None

def login(init_data):
    global token
    response = requests.post(
        f"{API_URL}/auth/login",
        json={"initData": init_data}
    )
    token = response.json()["token"]
    return response.json()

def get_schedule(group_id, date):
    headers = {"Authorization": f"Bearer {token}"}
    params = {"group_id": group_id, "date": date}
    response = requests.get(
        f"{API_URL}/schedule",
        headers=headers,
        params=params
    )
    return response.json()
```

### cURL

```bash
# Логин
curl -X POST https://api.your-domain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"initData": "query_id=..."}'

# Получить расписание
curl -X GET "https://api.your-domain.com/api/schedule?group_id=1" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Сохранить посещаемость
curl -X POST https://api.your-domain.com/api/attendance \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "lesson_id": 1,
    "student_id": 5,
    "date": "2024-01-25",
    "status": "present"
  }'
```

---

## 📞 Поддержка

При возникновении проблем:

1. Проверьте [FAQ](FAQ.md)
2. Просмотрите [Security Guide](SECURITY.md)
3. Создайте Issue на GitHub
4. Свяжитесь с поддержкой: api-support@yourdomain.com

---

**Версия API:** 1.0.0  
**Последнее обновление:** 2024-11-08