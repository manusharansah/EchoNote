import { create } from 'zustand'
import { authAPI } from '../services/api'

const useAuthStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem('access_token') || null,
  loading: false,
  initialized: false,

  setToken: (token) => {
    localStorage.setItem('access_token', token)
    set({ token })
  },

  initialize: async () => {
    const token = localStorage.getItem('access_token')
    if (!token) { set({ initialized: true }); return }
    try {
      const { data } = await authAPI.me()
      set({ user: data, initialized: true })
    } catch {
      localStorage.removeItem('access_token')
      set({ token: null, initialized: true })
    }
  },

  signIn: async (email, password) => {
    set({ loading: true })
    try {
      const { data } = await authAPI.signIn({ username: email, password })
      localStorage.setItem('access_token', data.access_token)
      set({ token: data.access_token })
      const me = await authAPI.me()
      set({ user: me.data, loading: false })
      return { success: true }
    } catch (err) {
      set({ loading: false })
      return { success: false, error: err.response?.data?.detail || 'Sign in failed' }
    }
  },

  signUp: async (email, password, fullName) => {
    set({ loading: true })
    try {
      await authAPI.signUp({ email, password, full_name: fullName })
      set({ loading: false })
      return { success: true }
    } catch (err) {
      set({ loading: false })
      return { success: false, error: err.response?.data?.detail || 'Sign up failed' }
    }
  },

  googleSignIn: async (googleToken) => {
    set({ loading: true })
    try {
      const { data } = await authAPI.googleOAuth(googleToken)
      localStorage.setItem('access_token', data.access_token)
      set({ token: data.access_token })
      const me = await authAPI.me()
      set({ user: me.data, loading: false })
      return { success: true }
    } catch (err) {
      set({ loading: false })
      return { success: false, error: err.response?.data?.detail || 'Google sign in failed' }
    }
  },

  signOut: () => {
    localStorage.removeItem('access_token')
    set({ user: null, token: null })
  },
}))

export default useAuthStore
