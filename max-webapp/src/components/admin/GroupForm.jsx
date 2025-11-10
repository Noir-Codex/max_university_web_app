import { useForm } from 'react-hook-form'
import { Button } from '@components/common'
import styles from './GroupForm.module.css'

/**
 * Форма создания/редактирования группы
 */
const GroupForm = ({ 
  group = null, 
  teachers = [],
  onSubmit, 
  onCancel, 
  loading = false 
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: group || {
      name: '',
      course: 1,
      specialty: '',
      curatorId: '',
    },
  })

  return (
    <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
      <h2 className={styles.title}>
        {group ? 'Редактировать группу' : 'Создать группу'}
      </h2>

      <div className={styles.formGroup}>
        <label className={styles.label}>
          Название группы <span className={styles.required}>*</span>
        </label>
        <input
          type="text"
          className={styles.input}
          placeholder="ИС-301"
          {...register('name', {
            required: 'Название обязательно',
            minLength: { value: 2, message: 'Минимум 2 символа' },
          })}
        />
        {errors.name && <span className={styles.error}>{errors.name.message}</span>}
      </div>

      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label className={styles.label}>
            Курс <span className={styles.required}>*</span>
          </label>
          <select
            className={styles.select}
            {...register('course', { required: 'Выберите курс' })}
          >
            <option value="1">1 курс</option>
            <option value="2">2 курс</option>
            <option value="3">3 курс</option>
            <option value="4">4 курс</option>
          </select>
          {errors.course && <span className={styles.error}>{errors.course.message}</span>}
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>
            Куратор <span className={styles.required}>*</span>
          </label>
          <select
            className={styles.select}
            {...register('curatorId', { required: 'Выберите куратора' })}
          >
            <option value="">Выберите...</option>
            {teachers.map((teacher) => (
              <option key={teacher.id} value={teacher.id}>
                {teacher.first_name} {teacher.last_name}
              </option>
            ))}
          </select>
          {errors.curatorId && <span className={styles.error}>{errors.curatorId.message}</span>}
        </div>
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>
          Специальность <span className={styles.required}>*</span>
        </label>
        <input
          type="text"
          className={styles.input}
          placeholder="Информационные системы"
          {...register('specialty', {
            required: 'Специальность обязательна',
          })}
        />
        {errors.specialty && <span className={styles.error}>{errors.specialty.message}</span>}
      </div>

      <div className={styles.actions}>
        <Button type="button" variant="secondary" onClick={onCancel} disabled={loading}>
          Отмена
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Сохранение...' : group ? 'Сохранить' : 'Создать'}
        </Button>
      </div>
    </form>
  )
}

export default GroupForm