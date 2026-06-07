import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import useAuthStore from './store/authStore'
import ProtectedRoute from './components/auth/ProtectedRoute'
import SignIn from './pages/SignIn'
import SignUp from './pages/SignUp'
import Dashboard from './pages/Dashboard'
import Record from './pages/Record'
import Minutes from './pages/Minutes'
import './styles/globals.css'

function AppLoader({ children }) {
  const { initialize, initialized } = useAuthStore()

  useEffect(() => { initialize() }, [])

  if (!initialized) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', background: 'var(--ink)',
      }}>
        <div style={{
          width: 32, height: 32,
          border: '2px solid rgba(240,235,226,0.1)',
          borderTopColor: 'var(--amber)',
          borderRadius: '50%',
          animation: 'spin 0.7s linear infinite',
        }} />
      </div>
    )
  }

  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <AppLoader>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/dashboard" element={
            <ProtectedRoute><Dashboard /></ProtectedRoute>
          } />
          <Route path="/record/:meetingId" element={
            <ProtectedRoute><Record /></ProtectedRoute>
          } />
          <Route path="/minutes/:meetingId" element={
            <ProtectedRoute><Minutes /></ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AppLoader>
      <Toaster
        position="bottom-center"
        toastOptions={{
          style: {
            background: 'var(--ink-mid)',
            color: 'var(--cream)',
            border: '1px solid var(--border)',
            fontFamily: 'var(--font-body)',
            fontSize: '14px',
            borderRadius: 'var(--radius-md)',
          },
          success: { iconTheme: { primary: 'var(--success)', secondary: 'var(--ink)' } },
          error: { iconTheme: { primary: 'var(--error)', secondary: 'var(--ink)' } },
        }}
      />
    </BrowserRouter>
  )
}
