import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import { useUser } from './hooks/useUser'
import { useRealtimeNotifications } from './hooks/useRealtimeNotifications'
import { Login } from './components/auth/Login'
import { Signup } from './components/auth/Signup'
import { OnboardingCarousel } from './components/OnboardingCarousel'
import { BiometricLogin } from './components/auth/BiometricLogin'
import { Dashboard } from './components/dashboard/Dashboard'
import { Deposit } from './components/wallet/Deposit'
import { Withdraw } from './components/wallet/Withdraw'
import { AdminPanel } from './components/admin/AdminPanel'
import { UserList } from './components/admin/UserList'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useUser()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, isAdmin } = useUser()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}

function LoginWithBiometric() {
  return (
    <div className="relative">
      <Login />
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-full max-w-md px-8">
        <BiometricLogin />
      </div>
    </div>
  )
}

function App() {
  const { user } = useUser()
  useRealtimeNotifications(user?.id)

  return (
    <BrowserRouter>
      <Toaster position="top-center" richColors expand={true} />
      <Routes>
        <Route path="/" element={<OnboardingCarousel />} />
        <Route path="/login" element={<LoginWithBiometric />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/deposit"
          element={
            <ProtectedRoute>
              <Deposit />
            </ProtectedRoute>
          }
        />
        <Route
          path="/withdraw"
          element={
            <ProtectedRoute>
              <Withdraw />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminPanel />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <AdminRoute>
              <UserList />
            </AdminRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
