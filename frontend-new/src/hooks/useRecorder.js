import { useState, useRef, useCallback, useEffect } from 'react'

export const RECORDER_STATE = {
  IDLE: 'idle',
  RECORDING: 'recording',
  PAUSED: 'paused',
  STOPPED: 'stopped',
}

export function useRecorder() {
  const [state, setState] = useState(RECORDER_STATE.IDLE)
  const [duration, setDuration] = useState(0)         // seconds
  const [audioBlob, setAudioBlob] = useState(null)
  const [error, setError] = useState(null)
  const [audioLevel, setAudioLevel] = useState(0)    // 0–1 for visualiser

  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])
  const streamRef = useRef(null)
  const timerRef = useRef(null)
  const analyserRef = useRef(null)
  const animFrameRef = useRef(null)

  // clean up on unmount
  useEffect(() => () => {
    clearInterval(timerRef.current)
    cancelAnimationFrame(animFrameRef.current)
    streamRef.current?.getTracks().forEach((t) => t.stop())
  }, [])

  const startAnalyser = (stream) => {
    try {
      const ctx = new AudioContext()
      const src = ctx.createMediaStreamSource(stream)
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 256
      src.connect(analyser)
      analyserRef.current = analyser

      const data = new Uint8Array(analyser.frequencyBinCount)
      const tick = () => {
        analyser.getByteFrequencyData(data)
        const avg = data.reduce((a, b) => a + b, 0) / data.length
        setAudioLevel(Math.min(avg / 80, 1))
        animFrameRef.current = requestAnimationFrame(tick)
      }
      tick()
    } catch { /* non-fatal */ }
  }

  const start = useCallback(async () => {
    setError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      startAnalyser(stream)

      const mr = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' })
      mediaRecorderRef.current = mr
      chunksRef.current = []

      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        setAudioBlob(blob)
        stream.getTracks().forEach((t) => t.stop())
        cancelAnimationFrame(animFrameRef.current)
        setAudioLevel(0)
      }

      mr.start(1000) // collect chunks every 1s
      setState(RECORDER_STATE.RECORDING)
      setDuration(0)
      timerRef.current = setInterval(() => setDuration((d) => d + 1), 1000)
    } catch (err) {
      setError(err.message || 'Microphone access denied')
    }
  }, [])

  const pause = useCallback(() => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.pause()
      setState(RECORDER_STATE.PAUSED)
      clearInterval(timerRef.current)
      cancelAnimationFrame(animFrameRef.current)
      setAudioLevel(0)
    }
  }, [])

  const resume = useCallback(() => {
    if (mediaRecorderRef.current?.state === 'paused') {
      mediaRecorderRef.current.resume()
      setState(RECORDER_STATE.RECORDING)
      timerRef.current = setInterval(() => setDuration((d) => d + 1), 1000)
      if (streamRef.current) startAnalyser(streamRef.current)
    }
  }, [])

  const stop = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
      setState(RECORDER_STATE.STOPPED)
      clearInterval(timerRef.current)
    }
  }, [])

  const reset = useCallback(() => {
    setState(RECORDER_STATE.IDLE)
    setDuration(0)
    setAudioBlob(null)
    setError(null)
    chunksRef.current = []
  }, [])

  const formatDuration = (secs) => {
    const h = Math.floor(secs / 3600)
    const m = Math.floor((secs % 3600) / 60)
    const s = secs % 60
    if (h > 0) return `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
    return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
  }

  return {
    state,
    duration,
    formattedDuration: formatDuration(duration),
    audioBlob,
    audioLevel,
    error,
    start,
    pause,
    resume,
    stop,
    reset,
    isIdle: state === RECORDER_STATE.IDLE,
    isRecording: state === RECORDER_STATE.RECORDING,
    isPaused: state === RECORDER_STATE.PAUSED,
    isStopped: state === RECORDER_STATE.STOPPED,
  }
}
