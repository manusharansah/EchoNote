import { useEffect, useRef } from 'react'
import useAuthStore from '../../store/authStore'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID

export default function GoogleButton() {
  const btnRef = useRef(null)
  const { googleSignIn } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || !window.google) return

    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: async (response) => {
        const result = await googleSignIn(response.credential)
        if (result.success) {
          navigate('/dashboard')
        } else {
          toast.error(result.error)
        }
      },
    })

    window.google.accounts.id.renderButton(btnRef.current, {
      theme: 'filled_black',
      size: 'large',
      width: 340,
      text: 'continue_with',
    })
  }, [])

  // Load GSI script lazily
  useEffect(() => {
    if (document.getElementById('gsi-script')) return
    const script = document.createElement('script')
    script.id = 'gsi-script'
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    document.body.appendChild(script)
  }, [])

  if (!GOOGLE_CLIENT_ID) return null

  return (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <div ref={btnRef} />
    </div>
  )
}
