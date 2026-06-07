import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import useAuthStore from '../../store/authStore'
import GoogleButton from '../../components/auth/GoogleButton'
import styles from './Auth.module.css'

export default function SignUp() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { signUp, loading } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }
    const result = await signUp(email, password, fullName)
    if (result.success) {
      toast.success('Account created! Please sign in.')
      navigate('/signin')
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

        <h1 className={styles.heading}>Create account</h1>
        <p className={styles.sub}>Start turning meetings into structured minutes.</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label}>Full Name</label>
            <input
              type="text"
              className={styles.input}
              placeholder="Ada Lovelace"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>

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
              placeholder="Min. 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className={styles.btn} disabled={loading}>
            {loading ? <span className={styles.spinner} /> : 'Create Account'}
          </button>
        </form>

        <div className={styles.divider}><span>or</span></div>

        <GoogleButton />

        <p className={styles.footer}>
          Already have an account?{' '}
          <Link to="/signin" className={styles.link}>Sign in</Link>
        </p>
      </div>
    </div>
  )
}
