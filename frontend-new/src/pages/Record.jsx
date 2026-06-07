import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Mic, Pause, Play, Square, ArrowLeft, Sparkles, Upload } from 'lucide-react'
import toast from 'react-hot-toast'
import { useRecorder, RECORDER_STATE } from '../../hooks/useRecorder'
import useMeetingStore from '../../store/meetingStore'
import WaveVisualizer from '../../components/recorder/WaveVisualizer'
import styles from './Record.module.css'

export default function Record() {
  const { meetingId } = useParams()
  const navigate = useNavigate()
  const { meetings, fetchMeetings, uploadAudio, generateMinutes, generatingMinutes } = useMeetingStore()
  const [uploading, setUploading] = useState(false)

  const recorder = useRecorder()

  // Load meeting title
  const meeting = meetings.find((m) => m.id === meetingId)

  useEffect(() => {
    if (meetings.length === 0) fetchMeetings()
  }, [])

  const handleStop = async () => {
    recorder.stop()
  }

  // Once blob is ready after stop → auto-upload
  useEffect(() => {
    if (recorder.isStopped && recorder.audioBlob) {
      handleUpload()
    }
  }, [recorder.isStopped, recorder.audioBlob])

  const handleUpload = async () => {
    if (!recorder.audioBlob) return
    setUploading(true)
    try {
      await uploadAudio(meetingId, recorder.audioBlob)
      toast.success('Recording saved!')
    } catch {
      toast.error('Failed to upload recording')
    } finally {
      setUploading(false)
    }
  }

  const handleGenerateMinutes = async () => {
    const result = await generateMinutes(meetingId)
    if (result.success) {
      navigate(`/minutes/${meetingId}`)
    } else {
      toast.error(result.error || 'Failed to generate minutes')
    }
  }

  const stateLabel = {
    [RECORDER_STATE.IDLE]: 'Ready to record',
    [RECORDER_STATE.RECORDING]: 'Recording…',
    [RECORDER_STATE.PAUSED]: 'Paused',
    [RECORDER_STATE.STOPPED]: uploading ? 'Uploading…' : 'Recording saved',
  }

  return (
    <div className={styles.page}>
      <div className={styles.blob} aria-hidden />

      {/* Nav */}
      <header className={styles.nav}>
        <button className={styles.backBtn} onClick={() => navigate('/dashboard')}>
          <ArrowLeft size={16} /> Dashboard
        </button>
        <span className={styles.meetingTitle}>{meeting?.title || 'Recording'}</span>
      </header>

      <main className={styles.main}>
        {/* Status label */}
        <p className={styles.statusLabel}>{stateLabel[recorder.state]}</p>

        {/* Timer */}
        <div className={`${styles.timer} ${recorder.isRecording ? styles.timerActive : ''}`}>
          {recorder.formattedDuration}
        </div>

        {/* Waveform */}
        <div className={styles.waveWrap}>
          <WaveVisualizer
            level={recorder.audioLevel}
            isActive={recorder.isRecording}
          />
        </div>

        {/* Recording ring */}
        {recorder.isRecording && (
          <div className={styles.ring} aria-hidden>
            <div className={styles.ringPulse} />
            <div className={styles.ringDot} />
          </div>
        )}

        {/* Controls */}
        <div className={styles.controls}>
          {recorder.isIdle && (
            <button className={styles.startBtn} onClick={recorder.start}>
              <Mic size={22} />
              Start Recording
            </button>
          )}

          {(recorder.isRecording || recorder.isPaused) && (
            <>
              <button
                className={styles.pauseBtn}
                onClick={recorder.isRecording ? recorder.pause : recorder.resume}
              >
                {recorder.isRecording ? <Pause size={20} /> : <Play size={20} />}
                {recorder.isRecording ? 'Pause' : 'Resume'}
              </button>
              <button className={styles.stopBtn} onClick={handleStop}>
                <Square size={16} fill="currentColor" />
                Stop
              </button>
            </>
          )}

          {recorder.isStopped && !uploading && (
            <button
              className={styles.generateBtn}
              onClick={handleGenerateMinutes}
              disabled={generatingMinutes}
            >
              {generatingMinutes ? (
                <>
                  <span className={styles.spinner} />
                  Generating minutes…
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  Generate Minutes
                </>
              )}
            </button>
          )}

          {uploading && (
            <div className={styles.uploadState}>
              <span className={styles.spinner} />
              <span>Uploading recording…</span>
            </div>
          )}
        </div>

        {/* New recording button after stopped */}
        {recorder.isStopped && !uploading && !generatingMinutes && (
          <button className={styles.resetBtn} onClick={recorder.reset}>
            <Mic size={14} /> Record another
          </button>
        )}

        {recorder.error && (
          <p className={styles.error}>{recorder.error}</p>
        )}
      </main>
    </div>
  )
}
