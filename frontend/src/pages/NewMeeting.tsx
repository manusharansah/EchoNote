import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  UploadCloud,
  Mic,
  FileAudio,
  X,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { meetingsApi } from "../api/client";
import AudioRecorder from "../components/AudioRecorder";
import { AppHeader } from "../components/AppHeader";

type Mode = "record" | "upload";
const ACCEPTED = ".webm,.mp4,.wav,.ogg,.mp3,.m4a";
const MAX_MB = 200;

function formatSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function NewMeeting() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("upload");
  const [title, setTitle] = useState("");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    setError("");
    if (file.size > MAX_MB * 1024 * 1024) {
      setError(`File too large. Max ${MAX_MB}MB.`);
      return;
    }
    setAudioFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError("Please enter a meeting title");
      return;
    }
    if (!audioFile) {
      setError("Please provide an audio file");
      return;
    }
    setError("");
    setUploading(true);
    try {
      const createRes = await meetingsApi.create(title.trim());
      const meetingId = createRes.data.id;
      await meetingsApi.uploadAudio(meetingId, audioFile, setUploadProgress);
      navigate(`/meetings/${meetingId}`);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Upload failed. Please try again.");
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)]">
      <AppHeader
        back={{ to: "/dashboard", label: "Dashboard" }}
        crumbs={[{ label: "New meeting" }]}
      />

      <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-12">
        <div className="animate-fade-up mb-8">
          <p className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700">
            Step 1 of 2
          </p>
          <h1 className="font-display text-3xl font-bold tracking-tight text-slate-900">
            Upload a meeting
          </h1>
          <p className="mt-1.5 text-sm text-slate-500">
            Provide a title and audio — we'll generate polished minutes automatically.
          </p>
        </div>

        <div className="space-y-5">
          {/* Title */}
          <section className="card p-5 animate-fade-up">
            <label className="label" htmlFor="title">
              Meeting title <span className="text-red-500">*</span>
            </label>
            <input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Q2 Planning Meeting"
              className="input"
              disabled={uploading}
            />
          </section>

          {/* Audio source */}
          <section className="card p-5 animate-fade-up">
            <p className="label">Audio source</p>

            <div className="grid grid-cols-2 gap-3 mb-5">
              {(["upload", "record"] as Mode[]).map((m) => {
                const active = mode === m;
                const Icon = m === "upload" ? UploadCloud : Mic;
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => {
                      setMode(m);
                      setAudioFile(null);
                      setError("");
                    }}
                    disabled={uploading}
                    className={`relative rounded-xl border p-4 text-left transition-all ${
                      active
                        ? "border-brand-500 bg-brand-50/60 shadow-soft"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <div
                      className={`mb-2.5 grid h-9 w-9 place-items-center rounded-lg ${
                        active ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      <Icon size={16} />
                    </div>
                    <p className={`text-sm font-semibold ${active ? "text-brand-700" : "text-slate-900"}`}>
                      {m === "upload" ? "Upload file" : "Record now"}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {m === "upload" ? "MP3, WAV, M4A, WebM…" : "Use your microphone"}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Upload zone */}
            {mode === "upload" && (
              <>
                {!audioFile ? (
                  <div
                    onDrop={handleDrop}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOver(true);
                    }}
                    onDragLeave={() => setDragOver(false)}
                    onClick={() => fileInputRef.current?.click()}
                    className={`group cursor-pointer rounded-xl border-2 border-dashed px-6 py-10 text-center transition-all ${
                      dragOver
                        ? "border-brand-500 bg-brand-50"
                        : "border-slate-300 bg-slate-50/40 hover:border-brand-400 hover:bg-brand-50/40"
                    }`}
                  >
                    <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-white text-brand-600 ring-1 ring-slate-200 group-hover:bg-brand-100 group-hover:ring-brand-200 transition">
                      <UploadCloud size={22} />
                    </div>
                    <p className="text-sm font-medium text-slate-900">
                      Drop your file here, or{" "}
                      <span className="text-brand-600 underline-offset-2 group-hover:underline">browse</span>
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      MP3, WAV, M4A, WebM, OGG · Max {MAX_MB}MB
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50/60 px-4 py-3.5">
                    <div className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-lg bg-emerald-600 text-white">
                      <FileAudio size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-900">
                        {audioFile.name}
                      </p>
                      <p className="text-xs text-slate-500">{formatSize(audioFile.size)}</p>
                    </div>
                    {!uploading && (
                      <button
                        onClick={() => setAudioFile(null)}
                        className="grid h-8 w-8 place-items-center rounded-md text-slate-400 hover:bg-white hover:text-slate-700"
                        aria-label="Remove file"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={ACCEPTED}
                  hidden
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFile(f);
                  }}
                />
              </>
            )}

            {/* Recorder */}
            {mode === "record" && <AudioRecorder onAudioReady={handleFile} />}
          </section>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 animate-fade-up">
              <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Upload progress */}
          {uploading && (
            <div className="card p-4 animate-fade-up">
              <div className="flex items-center justify-between mb-2 text-sm">
                <span className="font-medium text-slate-900">Uploading…</span>
                <span className="font-mono text-slate-500">{uploadProgress}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-700 transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Submit */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => navigate("/dashboard")}
              disabled={uploading}
              className="btn-ghost"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={uploading || !title.trim() || !audioFile}
              className="btn-primary"
            >
              {uploading ? (
                <>
                  <div className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                  Uploading…
                </>
              ) : (
                <>
                  Generate Minutes
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
