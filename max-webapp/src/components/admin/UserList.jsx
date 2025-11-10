import { useState } from 'react'
import { Button, LoadingSpinner } from '@components/common'
import styles from './UserList.module.css'

/**
 * Список пользователей с фильтрацией и действиями
 */
const UserList = ({ 
  users = [], 
  onEdit, 
  onDelete, 
  loading = false 
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('')

  const getRoleBadge = (role) => {
    const badges = {
      student: { label: 'Студент', color: 'blue' },
      teacher: { label: 'Преподаватель', color: 'green' },
      admin: { label: 'Администратор', color: 'red' },
    }
    return badges[role] || { label: role, color: 'gray' }
  }

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      (user.name?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
      (user.email?.toLowerCase().includes(searchQuery.toLowerCase()) || false)
    
    const matchesRole = roleFilter ? user.role === roleFilter : true

    return matchesSearch && matchesRole
  })

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.filters}>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Поиск по имени или email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        
        <select
          className={styles.roleFilter}
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="">Все роли</option>
          <option value="student">Студенты</option>
          <option value="teacher">Преподаватели</option>
          <option value="admin">Администраторы</option>
        </select>
      </div>

      {filteredUsers.length === 0 ? (
        <div className={styles.emptyState}>
          <p className={styles.emptyText}>
            {searchQuery || roleFilter 
              ? 'Пользователи не найдены' 
              : 'Нет пользователей'}
          </p>
        </div>
      ) : (
        <div className={styles.list}>
          {filteredUsers.map((user) => {
            const badge = getRoleBadge(user.role)
            return (
              <div key={user.id} className={styles.userCard}>
                <div className={styles.userInfo}>
                  <div className={styles.userHeader}>
                    <h3 className={styles.userName}>{user.name}</h3>
                    <span className={`${styles.badge} ${styles[badge.color]}`}>
                      {badge.label}
                    </span>
                  </div>
                  
                  <p className={styles.userEmail}>{user.email}</p>
                  
                  {user.createdAt && (
                    <p className={styles.userDate}>
                      Создан: {new Date(user.createdAt).toLocaleDateString('ru-RU')}
                    </p>
                  )}
                </div>

                <div className={styles.userActions}>
                  <Button
                    size="small"
                    variant="secondary"
                    onClick={() => onEdit(user)}
                  >
                    Редактировать
                  </Button>
                  <Button
                    size="small"
                    variant="danger"
                    onClick={() => onDelete(user)}
                  >
                    Удалить
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <div className={styles.footer}>
        <p className={styles.count}>
          Показано: {filteredUsers.length} из {users.length}
        </p>
      </div>
    </div>
  )
}

export default UserList