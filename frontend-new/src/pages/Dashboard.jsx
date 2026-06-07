import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Mic, LogOut, FileText, Trash2, Clock } from 'lucide-react'
import toast from 'react-hot-toast'
import useAuthStore from '../../store/authStore'
import useMeetingStore from '../../store/meetingStore'
import styles from './Dashboard.module.css'

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

export default function Dashboard() {
  const { user, signOut } = useAuthStore()
  const { meetings, fetchMeetings, createMeeting, setCurrentMeeting, loadingMeetings } = useMeetingStore()
  const navigate = useNavigate()
  const [creating, setCreating] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [showNew, setShowNew] = useState(false)

  useEffect(() => { fetchMeetings() }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!newTitle.trim()) return
    setCreating(true)
    try {
      const meeting = await createMeeting(newTitle.trim())
      setCurrentMeeting(meeting)
      navigate(`/record/${meeting.id}`)
    } catch {
      toast.error('Failed to create meeting')
    } finally {
      setCreating(false)
      setShowNew(false)
      setNewTitle('')
    }
  }

  const openMeeting = (meeting) => {
    setCurrentMeeting(meeting)
    navigate(`/record/${meeting.id}`)
  }

  return (
    <div className={styles.page}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.logo}>
            <span className={styles.logoMark}>M</span>
            <span className={styles.logoText}>eetScribe</span>
          </div>
          <div className={styles.headerRight}>
            <span className={styles.userName}>{user?.full_name || user?.email}</span>
            <button className={styles.iconBtn} onClick={signOut} title="Sign out">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.container}>
          {/* Hero */}
          <div className={styles.hero}>
            <h1 className={styles.heroTitle}>Your Meetings</h1>
            <p className={styles.heroSub}>Record, transcribe and generate structured minutes in minutes.</p>
            <button className={styles.newBtn} onClick={() => setShowNew(true)}>
              <Plus size={18} />
              New Meeting
            </button>
          </div>

          {/* New meeting form */}
          {showNew && (
            <div className={styles.newForm}>
              <form onSubmit={handleCreate} className={styles.newFormInner}>
                <input
                  className={styles.newInput}
                  placeholder="Meeting title…"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  autoFocus
                />
                <button type="submit" className={styles.confirmBtn} disabled={creating}>
                  {creating ? <span className={styles.spinner} /> : 'Start'}
                </button>
                <button type="button" className={styles.cancelBtn} onClick={() => setShowNew(false)}>
                  Cancel
                </button>
              </form>
            </div>
          )}

          {/* Meeting list */}
          {loadingMeetings ? (
            <div className={styles.emptyState}>
              <span className={styles.spinner} style={{ width: 28, height: 28 }} />
            </div>
          ) : meetings.length === 0 ? (
            <div className={styles.emptyState}>
              <Mic size={40} className={styles.emptyIcon} />
              <p>No meetings yet. Create your first one above.</p>
            </div>
          ) : (
            <div className={styles.grid}>
              {meetings.map((m, i) => (
                <div
                  key={m.id}
                  className={styles.card}
                  style={{ animationDelay: `${i * 40}ms` }}
                  onClick={() => openMeeting(m)}
                >
                  <div className={styles.cardIcon}>
                    <FileText size={20} />
                  </div>
                  <div className={styles.cardBody}>
                    <h3 className={styles.cardTitle}>{m.title}</h3>
                    <div className={styles.cardMeta}>
                      <Clock size={12} />
                      <span>{formatDate(m.created_at)}</span>
                      {m.status && (
                        <span className={`${styles.badge} ${styles[`badge_${m.status}`]}`}>
                          {m.status}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className={styles.cardArrow}>→</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
