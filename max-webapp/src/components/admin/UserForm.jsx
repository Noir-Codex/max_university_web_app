import { useForm } from 'react-hook-form'
import { Button, ErrorMessage } from '@components/common'
import styles from './UserForm.module.css'

/**
 * Форма создания/редактирования пользователя
 */
const UserForm = ({
  user = null,
  groups = [],
  onSubmit,
  onCancel,
  loading = false
}) => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: user || {
      first_name: '',
      email: '',
      role: 'student',
      password: '',
      group_id: '',
      group_ids: [],
    },
  })

  // Отслеживаем изменение роли
  const selectedRole = watch('role')

  const handleFormSubmit = (data) => {
    // Парсим ФИО на составные части
    const fullName = data.first_name || data.name || ''
    const nameParts = fullName.trim().split(/\s+/)
    
    let firstName = ''
    let lastName = ''
    
    if (nameParts.length >= 2) {
      lastName = nameParts[0] // Фамилия
      firstName = nameParts.slice(1).join(' ') // Имя + отчество
    } else {
      firstName = fullName
      lastName = fullName
    }
    
    // Генерируем username из email если не указан
    const username = data.email ? data.email.split('@')[0] : `user_${Date.now()}`
    
    // Форматируем данные для бэкенда
    const formattedData = {
      first_name: firstName,
      last_name: lastName,
      username: username,
      email: data.email,
      role: data.role,
    }
    
    // Добавляем пароль только при создании
    if (data.password) {
      formattedData.password = data.password
    }

    // Добавляем группу для студента
    if (data.role === 'student' && data.group_id) {
      formattedData.group_id = parseInt(data.group_id)
    }

    // Добавляем группы для преподавателя
    if (data.role === 'teacher' && data.group_ids) {
      // Собираем выбранные группы из чекбоксов
      const selectedGroups = Object.keys(data.group_ids)
        .filter(key => data.group_ids[key])
        .map(id => parseInt(id))
      if (selectedGroups.length > 0) {
        formattedData.group_ids = selectedGroups
      }
    }

    console.log('📤 Отправка данных пользователя:', formattedData)
    onSubmit(formattedData)
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit(handleFormSubmit)}>
      <h2 className={styles.title}>
        {user ? 'Редактировать пользователя' : 'Создать пользователя'}
      </h2>

      <div className={styles.formGroup}>
        <label className={styles.label} htmlFor="name">
          ФИО <span className={styles.required}>*</span>
        </label>
        <input
          id="first_name"
          type="text"
          className={styles.input}
          placeholder="Иванов Иван Иванович"
          {...register('first_name', {
            required: 'ФИО обязательно',
            minLength: {
              value: 3,
              message: 'ФИО должно содержать минимум 3 символа',
            },
          })}
        />
        {errors.first_name && (
          <span className={styles.error}>{errors.first_name.message}</span>
        )}
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label} htmlFor="email">
          Email <span className={styles.required}>*</span>
        </label>
        <input
          id="email"
          type="email"
          className={styles.input}
          placeholder="user@example.com"
          {...register('email', {
            required: 'Email обязателен',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Некорректный формат email',
            },
          })}
        />
        {errors.email && (
          <span className={styles.error}>{errors.email.message}</span>
        )}
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label} htmlFor="role">
          Роль <span className={styles.required}>*</span>
        </label>
        <select
          id="role"
          className={styles.select}
          {...register('role', {
            required: 'Выберите роль',
          })}
        >
          <option value="student">Студент</option>
          <option value="teacher">Преподаватель</option>
          <option value="admin">Администратор</option>
        </select>
        {errors.role && (
          <span className={styles.error}>{errors.role.message}</span>
        )}
      </div>

      {!user && (
        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="password">
            Пароль <span className={styles.required}>*</span>
          </label>
          <input
            id="password"
            type="password"
            className={styles.input}
            placeholder="Введите пароль"
            {...register('password', {
              required: user ? false : 'Пароль обязателен',
              minLength: {
                value: 6,
                message: 'Пароль должен содержать минимум 6 символов',
              },
            })}
          />
          {errors.password && (
            <span className={styles.error}>{errors.password.message}</span>
          )}
        </div>
      )}

      {/* Поле выбора группы для студента */}
      {selectedRole === 'student' && (
        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="group_id">
            Группа <span className={styles.required}>*</span>
          </label>
          <select
            id="group_id"
            className={styles.select}
            {...register('group_id', {
              required: 'Выберите группу для студента',
            })}
          >
            <option value="">Выберите группу</option>
            {groups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name} - {group.specialty}
              </option>
            ))}
          </select>
          {errors.group_id && (
            <span className={styles.error}>{errors.group_id.message}</span>
          )}
        </div>
      )}

      {/* Поле выбора групп для преподавателя */}
      {selectedRole === 'teacher' && (
        <div className={styles.formGroup}>
          <label className={styles.label}>Группы (необязательно)</label>
          <div className={styles.checkboxGroup}>
            {groups.length === 0 ? (
              <p className={styles.hint}>Нет доступных групп</p>
            ) : (
              groups.map((group) => (
                <label key={group.id} className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    value={group.id}
                    {...register(`group_ids.${group.id}`)}
                  />
                  <span>{group.name} - {group.specialty}</span>
                </label>
              ))
            )}
          </div>
          <p className={styles.hint}>
            Выберите группы, которые будет преподавать этот преподаватель
          </p>
        </div>
      )}

      <div className={styles.actions}>
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={loading}
        >
          Отмена
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Сохранение...' : user ? 'Сохранить' : 'Создать'}
        </Button>
      </div>
    </form>
  )
}

export default UserForm