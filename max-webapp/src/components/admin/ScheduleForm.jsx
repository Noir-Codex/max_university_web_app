import { useForm } from 'react-hook-form'
import { Button } from '@components/common'
import styles from './ScheduleForm.module.css'

const DAYS = [
  { value: 1, label: 'Понедельник' },
  { value: 2, label: 'Вторник' },
  { value: 3, label: 'Среда' },
  { value: 4, label: 'Четверг' },
  { value: 5, label: 'Пятница' },
  { value: 6, label: 'Суббота' },
]

const ScheduleForm = ({ lesson = null, groups = [], subjects = [], teachers = [], onSubmit, onCancel, loading = false }) => {
  // Логирование для отладки
  console.log('ScheduleForm props:', {
    groupsCount: groups.length,
    subjectsCount: subjects.length,
    teachersCount: teachers.length,
    groups: groups.slice(0, 2), // первые 2 для примера
    teachers: teachers.slice(0, 2)
  })

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: lesson || {
      group_id: '',
      subject_id: '',
      teacher_id: '',
      day_of_week: 1,
      time_start: '09:00',
      time_end: '10:30',
      room: '',
      lesson_type: 'lecture',
      week_type: 0, // 0 = каждую неделю, 1 = первая, 2 = вторая
    },
  })

  const handleFormSubmit = (data) => {
    console.log('📤 Данные формы:', data)
    
    // Форматируем данные для бэкенда
    const formattedData = {
      group_id: parseInt(data.group_id),
      subject_id: parseInt(data.subject_id),
      teacher_id: parseInt(data.teacher_id),
      day_of_week: parseInt(data.day_of_week),
      time_start: data.time_start,
      time_end: data.time_end || calculateEndTime(data.time_start),
      room: data.room || '',
      lesson_type: data.lesson_type,
      week_type: parseInt(data.week_type) || 0,
    }
    
    console.log('📤 Отформатированные данные для отправки:', formattedData)
    
    // Валидация
    if (!formattedData.group_id || !formattedData.subject_id || !formattedData.teacher_id) {
      alert('Пожалуйста, заполните все обязательные поля')
      return
    }
    
    onSubmit(formattedData)
  }

  // Вычисляем время окончания (+ 1.5 часа)
  const calculateEndTime = (startTime) => {
    const [hours, minutes] = startTime.split(':').map(Number)
    const endHours = hours + 1
    const endMinutes = minutes + 30
    return `${String(endHours).padStart(2, '0')}:${String(endMinutes >= 60 ? endMinutes - 60 : endMinutes).padStart(2, '0')}`
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit(handleFormSubmit)}>
      <h2 className={styles.title}>{lesson ? 'Редактировать пару' : 'Добавить пару'}</h2>

      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Группа *</label>
          <select className={styles.select} {...register('group_id', { required: 'Выберите группу' })}>
            <option value="">Выберите...</option>
            {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
          {errors.group_id && <span className={styles.error}>{errors.group_id.message}</span>}
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Дисциплина *</label>
          <select className={styles.select} {...register('subject_id', { required: 'Выберите дисциплину' })}>
            <option value="">Выберите...</option>
            {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          {errors.subject_id && <span className={styles.error}>{errors.subject_id.message}</span>}
        </div>
      </div>

      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Преподаватель *</label>
          <select className={styles.select} {...register('teacher_id', { required: 'Выберите преподавателя' })}>
            <option value="">Выберите...</option>
            {teachers.map(t => (
              <option key={t.id} value={t.id}>
                {t.first_name} {t.last_name}
              </option>
            ))}
          </select>
          {errors.teacher_id && <span className={styles.error}>{errors.teacher_id.message}</span>}
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Тип *</label>
          <select className={styles.select} {...register('lesson_type')}>
            <option value="lecture">Лекция</option>
            <option value="practice">Практика</option>
            <option value="lab">Лабораторная</option>
          </select>
        </div>
      </div>

      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label className={styles.label}>День недели *</label>
          <select className={styles.select} {...register('day_of_week')}>
            {DAYS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
          </select>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Неделя *</label>
          <select className={styles.select} {...register('week_type')}>
            <option value="0">Каждую неделю</option>
            <option value="1">1-я неделя (нечетная)</option>
            <option value="2">2-я неделя (четная)</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Время начала *</label>
          <input type="time" className={styles.input} {...register('time_start', { required: 'Укажите время' })} />
          {errors.time_start && <span className={styles.error}>{errors.time_start.message}</span>}
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Время окончания *</label>
          <input type="time" className={styles.input} {...register('time_end', { required: 'Укажите время' })} />
          {errors.time_end && <span className={styles.error}>{errors.time_end.message}</span>}
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Аудитория</label>
          <input type="text" className={styles.input} placeholder="301" {...register('room')} />
        </div>
      </div>

      <div className={styles.actions}>
        <Button type="button" variant="secondary" onClick={onCancel} disabled={loading}>Отмена</Button>
        <Button type="submit" disabled={loading}>{loading ? 'Сохранение...' : lesson ? 'Сохранить' : 'Создать'}</Button>
      </div>
    </form>
  )
}

export default ScheduleForm