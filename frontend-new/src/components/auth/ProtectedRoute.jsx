import { Navigate } from 'react-router-dom'
import useAuthStore from '../../store/authStore'

export default function ProtectedRoute({ children }) {
  const { token, initialized } = useAuthStore()
  if (!initialized) return null  // splash / loading handled in App
  if (!token) return <Navigate to="/signin" replace />
  return children
}
