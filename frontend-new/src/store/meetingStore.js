import { create } from 'zustand'
import { meetingsAPI, audioAPI, minutesAPI } from '../services/api'

const useMeetingStore = create((set, get) => ({
  meetings: [],
  currentMeeting: null,
  minutes: null,        // raw markdown string from backend
  pdfBlob: null,
  loadingMeetings: false,
  loadingMinutes: false,
  generatingMinutes: false,

  // ── Meetings ──────────────────────────────────────────────────
  fetchMeetings: async () => {
    set({ loadingMeetings: true })
    try {
      const { data } = await meetingsAPI.list()
      set({ meetings: data, loadingMeetings: false })
    } catch {
      set({ loadingMeetings: false })
    }
  },

  createMeeting: async (title) => {
    const { data } = await meetingsAPI.create({ title })
    set((s) => ({ meetings: [data, ...s.meetings], currentMeeting: data }))
    return data
  },

  setCurrentMeeting: (meeting) => set({ currentMeeting: meeting, minutes: null, pdfBlob: null }),

  // ── Audio upload ──────────────────────────────────────────────
  uploadAudio: async (meetingId, blob) => {
    await audioAPI.upload(meetingId, blob)
  },

  // ── Minutes ───────────────────────────────────────────────────
  generateMinutes: async (meetingId) => {
    set({ generatingMinutes: true, minutes: null })
    try {
      const { data } = await minutesAPI.generate(meetingId)
      set({ minutes: data.content || data.markdown || '', generatingMinutes: false })
      return { success: true }
    } catch (err) {
      set({ generatingMinutes: false })
      return { success: false, error: err.response?.data?.detail || 'Failed to generate minutes' }
    }
  },

  fetchMinutes: async (meetingId) => {
    set({ loadingMinutes: true })
    try {
      const { data } = await minutesAPI.get(meetingId)
      set({ minutes: data.content || data.markdown || '', loadingMinutes: false })
    } catch {
      set({ loadingMinutes: false })
    }
  },

  saveAndExport: async (meetingId, markdownContent) => {
    const { data } = await minutesAPI.updateAndExport(meetingId, markdownContent)
    const url = window.URL.createObjectURL(new Blob([data], { type: 'application/pdf' }))
    const a = document.createElement('a')
    a.href = url
    a.download = `meeting-minutes-${meetingId}.pdf`
    a.click()
    window.URL.revokeObjectURL(url)
    return { success: true }
  },
}))

export default useMeetingStore
