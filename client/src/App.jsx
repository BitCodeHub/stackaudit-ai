import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'

// Layouts
import AuthLayout from './components/auth/AuthLayout'
import DashboardLayout from './components/dashboard/DashboardLayout'

// Auth Pages
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'

// Dashboard Pages
import DashboardPage from './pages/DashboardPage'
import NewAuditPage from './pages/NewAuditPage'
import AuditResultsPage from './pages/AuditResultsPage'
import RecommendationsPage from './pages/RecommendationsPage'
import SettingsPage from './pages/SettingsPage'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }
  
  if (!user) {
    return <Navigate to="/login" replace />
  }
  
  return children
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth()
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }
  
  if (user) {
    return <Navigate to="/dashboard" replace />
  }
  
  return children
}

export default function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/signup" element={<PublicRoute><SignupPage /></PublicRoute>} />
      </Route>
      
      {/* Protected Routes */}
      <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/audit/new" element={<NewAuditPage />} />
        <Route path="/audit/:id" element={<AuditResultsPage />} />
        <Route path="/recommendations" element={<RecommendationsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
      
      {/* Default Redirect */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
