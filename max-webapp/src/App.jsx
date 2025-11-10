import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAuthStore } from '@store/authStore'
import { ProtectedRoute } from '@components/common'

// Страница входа
import Login from '@pages/Login'

// Импорты страниц преподавателя
import TeacherDashboard from '@pages/TeacherDashboard'
import GroupsList from '@pages/TeacherDashboard/GroupsList'
import Schedule from '@pages/TeacherDashboard/Schedule'
import Attendance from '@pages/TeacherDashboard/Attendance'

// Импорты страниц администратора
import AdminDashboard from '@pages/AdminDashboard'
import AdminUsers from '@pages/AdminDashboard/Users'
import AdminGroups from '@pages/AdminDashboard/Groups'
import AdminSchedule from '@pages/AdminDashboard/Schedule'
import AdminSubjects from '@pages/AdminDashboard/Subjects'
import AdminStatistics from '@pages/AdminDashboard/Statistics'
import AdminImport from '@pages/AdminDashboard/ImportSchedule'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 минут
    },
  },
})

function AppContent() {
  const { isAuthenticated, userRole } = useAuthStore()

  // Если не авторизован - показываем страницу входа
  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    )
  }

  return (
    <Routes>
      {/* Главная страница с выбором роли */}
      <Route
        path="/"
        element={
          <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '20px'
          }}>
            <div style={{
              maxWidth: '500px',
              width: '100%',
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '40px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
            }}>
              <h1 style={{ marginTop: 0, marginBottom: '10px', fontSize: '32px', color: '#333' }}>MAX WebApp</h1>
              <p style={{ marginTop: 0, color: '#666', fontSize: '16px' }}>Система учёта посещаемости</p>
              
              {isAuthenticated && (
                <p style={{ marginTop: '20px', padding: '12px', backgroundColor: '#f0f9ff', borderRadius: '8px', color: '#0369a1', fontWeight: '500' }}>
                  ✅ Вы авторизованы как: {userRole}
                </p>
              )}
              
              <div style={{ marginTop: '32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {(userRole === 'teacher' || userRole === 'admin') && (
                  <Link
                    to="/teacher"
                    style={{
                      padding: '16px 24px',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      textDecoration: 'none',
                      borderRadius: '12px',
                      fontWeight: '600',
                      fontSize: '18px',
                      textAlign: 'center',
                      boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                      transition: 'transform 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                    onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
                    onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
                  >
                    🎓 Интерфейс преподавателя
                  </Link>
                )}
                {userRole === 'admin' && (
                  <Link
                    to="/admin"
                    style={{
                      padding: '16px 24px',
                      background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                      color: 'white',
                      textDecoration: 'none',
                      borderRadius: '12px',
                      fontWeight: '600',
                      fontSize: '18px',
                      textAlign: 'center',
                      boxShadow: '0 4px 15px rgba(245, 87, 108, 0.4)',
                      transition: 'transform 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                    onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
                    onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
                  >
                    👨‍💼 Панель администратора
                  </Link>
                )}
              </div>
            </div>
          </div>
        }
      />

      {/* Маршруты для преподавателя */}
      <Route path="/teacher" element={<ProtectedRoute allowedRoles={['teacher', 'admin']}><TeacherDashboard /></ProtectedRoute>} />
      <Route path="/teacher/groups" element={<ProtectedRoute allowedRoles={['teacher', 'admin']}><GroupsList /></ProtectedRoute>} />
      <Route path="/teacher/schedule" element={<ProtectedRoute allowedRoles={['teacher', 'admin']}><Schedule /></ProtectedRoute>} />
      <Route path="/teacher/attendance/:lessonId" element={<ProtectedRoute allowedRoles={['teacher', 'admin']}><Attendance /></ProtectedRoute>} />

      {/* Маршруты для администратора */}
      <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin']}><AdminUsers /></ProtectedRoute>} />
      <Route path="/admin/groups" element={<ProtectedRoute allowedRoles={['admin']}><AdminGroups /></ProtectedRoute>} />
      <Route path="/admin/schedule" element={<ProtectedRoute allowedRoles={['admin']}><AdminSchedule /></ProtectedRoute>} />
      <Route path="/admin/subjects" element={<ProtectedRoute allowedRoles={['admin']}><AdminSubjects /></ProtectedRoute>} />
      <Route path="/admin/statistics" element={<ProtectedRoute allowedRoles={['admin']}><AdminStatistics /></ProtectedRoute>} />
      <Route path="/admin/import" element={<ProtectedRoute allowedRoles={['admin']}><AdminImport /></ProtectedRoute>} />

      {/* Перенаправление на главную для неизвестных маршрутов */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AppContent />
      </Router>
    </QueryClientProvider>
  )
}

export default App
