import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Auto-refresh / logout on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('access_token')
      window.location.href = '/signin'
    }
    return Promise.reject(err)
  }
)

export default api

// ─── Auth ────────────────────────────────────────────────────────────────────

export const authAPI = {
  signUp: (data) => api.post('/api/auth/register', data),
  signIn: (data) =>
    api.post('/api/auth/login', new URLSearchParams(data), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    }),
  googleOAuth: (token) => api.post('/api/auth/google', { token }),
  me: () => api.get('/api/auth/me'),
}

// ─── Meetings ────────────────────────────────────────────────────────────────

export const meetingsAPI = {
  list: () => api.get('/api/meetings/'),
  get: (id) => api.get(`/api/meetings/${id}`),
  create: (data) => api.post('/api/meetings/', data),
  delete: (id) => api.delete(`/api/meetings/${id}`),
}

// ─── Audio ───────────────────────────────────────────────────────────────────

export const audioAPI = {
  upload: (meetingId, blob) => {
    const form = new FormData()
    form.append('file', blob, 'recording.webm')
    return api.post(`/api/audio/upload/${meetingId}`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
}

// ─── Minutes ─────────────────────────────────────────────────────────────────

export const minutesAPI = {
  generate: (meetingId) => api.post(`/api/minutes/generate/${meetingId}`),
  get: (meetingId) => api.get(`/api/minutes/${meetingId}`),
  updateAndExport: (meetingId, markdownContent) =>
    api.post(
      `/api/minutes/export/${meetingId}`,
      { content: markdownContent },
      { responseType: 'blob' }
    ),
}
