import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import { useUser } from './hooks/useUser'
import { Login } from './components/auth/Login'
import { Signup } from './components/auth/Signup'
import { OnboardingCarousel } from './components/OnboardingCarousel'
import { BiometricLogin } from './components/auth/BiometricLogin'

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

function Dashboard() {
  const { user, profile, isAdmin } = useUser()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center justify-center text-center space-y-8">
          <img src="/logo.png" alt="Safvacut Logo" className="w-24 h-24 rounded-full" />
          
          <h1 className="text-5xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
            Safvacut V3
          </h1>
          
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Welcome!</h2>
            <p className="text-gray-400 mb-2">Email: {user?.email}</p>
            <p className="text-gray-400 mb-2">UID: {profile?.uid || 'Loading...'}</p>
            {isAdmin && (
              <p className="text-orange-400 font-semibold mt-4">🔑 Admin Access</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 w-full max-w-4xl">
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
              <div className="text-green-500 text-4xl mb-4">✓</div>
              <h3 className="text-lg font-semibold mb-2">Phase 1 Complete</h3>
              <p className="text-gray-400 text-sm">React + TypeScript stack initialized</p>
            </div>
            
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
              <div className="text-green-500 text-4xl mb-4">✓</div>
              <h3 className="text-lg font-semibold mb-2">Phase 2 Complete</h3>
              <p className="text-gray-400 text-sm">Supabase backend & migrations</p>
            </div>
            
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
              <div className="text-green-500 text-4xl mb-4">✓</div>
              <h3 className="text-lg font-semibold mb-2">Phase 3 Complete</h3>
              <p className="text-gray-400 text-sm">Auth & User Flow</p>
            </div>
          </div>

          <button
            onClick={() => {
              import('./lib/supabase').then(({ supabase }) => supabase.auth.signOut())
            }}
            className="mt-8 px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  )
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
  return (
    <BrowserRouter>
      <Toaster position="top-center" richColors />
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
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
