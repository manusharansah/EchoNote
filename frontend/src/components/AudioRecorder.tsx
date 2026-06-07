import { useRef, useState, useEffect } from "react";
import { Mic, Pause, Play, Square, RotateCcw, Check } from "lucide-react";

interface Props {
  onAudioReady: (file: File) => void;
}

type RecordState = "idle" | "recording" | "paused" | "stopped";

export default function AudioRecorder({ onAudioReady }: Props) {
  const [state, setState] = useState<RecordState>("idle");
  const [seconds, setSeconds] = useState(0);
  const [audioURL, setAudioURL] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (animRef.current) cancelAnimationFrame(animRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const drawWaveform = (analyser: AnalyserNode) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const draw = () => {
      animRef.current = requestAnimationFrame(draw);
      analyser.getByteTimeDomainData(dataArray);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
      gradient.addColorStop(0, "rgba(79, 90, 232, 0.25)");
      gradient.addColorStop(0.5, "rgba(59, 65, 196, 1)");
      gradient.addColorStop(1, "rgba(79, 90, 232, 0.25)");
      ctx.lineWidth = 2;
      ctx.strokeStyle = gradient;
      ctx.shadowBlur = 6;
      ctx.shadowColor = "rgba(59, 65, 196, 0.45)";
      ctx.beginPath();
      const sliceWidth = canvas.width / bufferLength;
      let x = 0;
      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * canvas.height) / 2;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        x += sliceWidth;
      }
      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
    };
    draw();
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const audioCtx = new AudioContext();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 512;
      source.connect(analyser);
      analyserRef.current = analyser;
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setAudioURL(url);
        const file = new File([blob], "recording.webm", { type: "audio/webm" });
        onAudioReady(file);
      };
      recorder.start(100);
      setState("recording");
      setSeconds(0);
      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
      drawWaveform(analyser);
    } catch {
      alert("Microphone access denied. Please allow microphone access and try again.");
    }
  };

  const pauseRecording = () => {
    mediaRecorderRef.current?.pause();
    if (timerRef.current) clearInterval(timerRef.current);
    if (animRef.current) cancelAnimationFrame(animRef.current);
    setState("paused");
  };

  const resumeRecording = () => {
    mediaRecorderRef.current?.resume();
    timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    if (analyserRef.current) drawWaveform(analyserRef.current);
    setState("recording");
  };

  const stopRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (animRef.current) cancelAnimationFrame(animRef.current);
    if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
    mediaRecorderRef.current?.stop();
    setState("stopped");
  };

  const resetRecording = () => {
    setAudioURL(null);
    setSeconds(0);
    setState("idle");
    chunksRef.current = [];
  };

  const formatTime = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  // ── Idle ──
  if (state === "idle") {
    return (
      <div className="rounded-xl border-2 border-dashed border-slate-300 bg-slate-50/40 px-6 py-10 text-center">
        <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-full bg-white text-brand-600 ring-1 ring-slate-200">
          <Mic size={22} />
        </div>
        <p className="text-sm font-medium text-slate-900">Record audio in browser</p>
        <p className="mt-1 text-xs text-slate-500">
          MeetingIQ records locally and uploads when you stop.
        </p>
        <button onClick={startRecording} className="btn-primary mt-5">
          <Mic size={15} />
          Start recording
        </button>
      </div>
    );
  }

  // ── Recording / Paused ──
  if (state === "recording" || state === "paused") {
    const isRec = state === "recording";
    return (
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-soft">
        <div className="relative px-5 pt-5 pb-2">
          {isRec ? (
            <canvas
              ref={canvasRef}
              width={600}
              height={72}
              className="block w-full h-[72px]"
            />
          ) : (
            <div className="flex h-[72px] items-center justify-center gap-[3px]">
              {Array.from({ length: 40 }).map((_, i) => (
                <div
                  key={i}
                  className="w-[3px] rounded-sm bg-slate-300"
                  style={{
                    height: `${8 + Math.sin(i * 0.6) * 12 + Math.cos(i * 0.3) * 8}px`,
                  }}
                />
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/60 px-5 py-2.5">
          <div className="flex items-center gap-2">
            <span
              className={`h-2 w-2 rounded-full ${
                isRec ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)] animate-pulse" : "bg-amber-500"
              }`}
            />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              {isRec ? "Recording" : "Paused"}
            </span>
          </div>
          <span className="font-mono text-lg font-bold tabular-nums text-slate-900">
            {formatTime(seconds)}
          </span>
        </div>
        <div className="flex items-center justify-center gap-2 border-t border-slate-100 bg-white px-5 py-3">
          {isRec ? (
            <button onClick={pauseRecording} className="btn-secondary !py-2">
              <Pause size={14} /> Pause
            </button>
          ) : (
            <button onClick={resumeRecording} className="btn-secondary !py-2">
              <Play size={14} /> Resume
            </button>
          )}
          <button
            onClick={stopRecording}
            className="btn !py-2 bg-red-600 text-white hover:bg-red-700 shadow-soft"
          >
            <Square size={13} fill="currentColor" />
            Stop
          </button>
        </div>
      </div>
    );
  }

  // ── Stopped (preview) ──
  return (
    <div className="overflow-hidden rounded-xl border border-emerald-200 bg-emerald-50/40 shadow-soft">
      <div className="flex items-center gap-2.5 border-b border-emerald-100 bg-white px-4 py-3">
        <div className="grid h-7 w-7 place-items-center rounded-md bg-emerald-600 text-white">
          <Check size={14} strokeWidth={3} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-slate-900">Recording ready</p>
          <p className="text-xs text-slate-500">{formatTime(seconds)} captured</p>
        </div>
        <button
          onClick={resetRecording}
          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-700"
        >
          <RotateCcw size={12} />
          Re-record
        </button>
      </div>
      {audioURL && (
        <div className="bg-white px-4 py-3">
          <audio src={audioURL} controls className="w-full" />
        </div>
      )}
    </div>
  );
}
