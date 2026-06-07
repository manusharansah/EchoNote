import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import useAuthStore from '../../store/authStore'
import GoogleButton from '../../components/auth/GoogleButton'
import styles from './Auth.module.css'

export default function SignIn() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { signIn, loading } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    const result = await signIn(email, password)
    if (result.success) {
      navigate('/dashboard')
    } else {
      toast.error(result.error)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.blob} aria-hidden />

      <div className={styles.card}>
        <div className={styles.logo}>
          <span className={styles.logoMark}>M</span>
          <span className={styles.logoText}>eetScribe</span>
        </div>

        <h1 className={styles.heading}>Welcome back</h1>
        <p className={styles.sub}>Sign in to your account to continue.</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label}>Email</label>
            <input
              type="email"
              className={styles.input}
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Password</label>
            <input
              type="password"
              className={styles.input}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className={styles.btn} disabled={loading}>
            {loading ? <span className={styles.spinner} /> : 'Sign In'}
          </button>
        </form>

        <div className={styles.divider}><span>or</span></div>

        <GoogleButton />

        <p className={styles.footer}>
          Don't have an account?{' '}
          <Link to="/signup" className={styles.link}>Create one</Link>
        </p>
      </div>
    </div>
  )
}
