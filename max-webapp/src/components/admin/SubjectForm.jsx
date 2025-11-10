import { useForm } from 'react-hook-form'
import { Button } from '@components/common'
import styles from './SubjectForm.module.css'

const SubjectForm = ({ subject = null, onSubmit, onCancel, loading = false }) => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: subject || { name: '', type: 'Лекция', hours: 40 },
  })

  return (
    <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
      <h2 className={styles.title}>{subject ? 'Редактировать дисциплину' : 'Создать дисциплину'}</h2>

      <div className={styles.formGroup}>
        <label className={styles.label}>Название *</label>
        <input type="text" className={styles.input} placeholder="Программирование" {...register('name', { required: 'Название обязательно' })} />
        {errors.name && <span className={styles.error}>{errors.name.message}</span>}
      </div>

      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Тип *</label>
          <select className={styles.select} {...register('type')}>
            <option value="Лекция">Лекция</option>
            <option value="Практика">Практика</option>
            <option value="Лабораторная">Лабораторная</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Часов *</label>
          <input type="number" className={styles.input} {...register('hours', { required: 'Укажите часы', min: 1 })} />
          {errors.hours && <span className={styles.error}>{errors.hours.message}</span>}
        </div>
      </div>

      <div className={styles.actions}>
        <Button type="button" variant="secondary" onClick={onCancel} disabled={loading}>Отмена</Button>
        <Button type="submit" disabled={loading}>{loading ? 'Сохранение...' : subject ? 'Сохранить' : 'Создать'}</Button>
      </div>
    </form>
  )
}

export default SubjectForm