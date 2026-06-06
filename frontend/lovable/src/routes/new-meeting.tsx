import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Mic,
  Video,
  Users,
  Upload,
  ArrowLeft,
  X,
  Pause,
  Play,
  Square,
  FileAudio,
  Loader2,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { workspaces } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { useCreateMeeting, useUploadAudio } from "@/hooks/use-api";
import { toast } from "sonner";

export const Route = createFileRoute("/new-meeting")({
  head: () => ({
    meta: [
      { title: "New Meeting — MeetingIQ" },
      {
        name: "description",
        content: "Record a physical meeting or upload a recording to transcribe.",
      },
    ],
  }),
  component: NewMeetingPage,
});

type MeetingType = "physical" | "zoom" | "gmeet" | "teams" | "other";

const meetingTypes: {
  id: MeetingType;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  {
    id: "physical",
    title: "Physical Meeting",
    description: "Record an in-person meeting directly from your device.",
    icon: Mic,
  },
  {
    id: "zoom",
    title: "Zoom Recording",
    description: "Upload a downloaded Zoom meeting recording.",
    icon: Video,
  },
  {
    id: "gmeet",
    title: "Google Meet Recording",
    description: "Upload a downloaded Google Meet recording.",
    icon: Video,
  },
  {
    id: "teams",
    title: "Microsoft Teams Recording",
    description: "Upload a downloaded Teams meeting recording.",
    icon: Users,
  },
  {
    id: "other",
    title: "Other Recording",
    description: "Upload another audio or video meeting file.",
    icon: Upload,
  },
];

function NewMeetingPage() {
  const [type, setType] = useState<MeetingType | null>(null);

  return (
    <AppShell>
      <div className="mb-2">
        {type && (
          <button
            onClick={() => setType(null)}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Back to meeting type
          </button>
        )}
      </div>
      <h1 className="text-2xl font-semibold tracking-tight">New Meeting</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {type
          ? "Fill in the meeting details and start transcribing."
          : "Step 1 · Choose meeting type"}
      </p>

      {!type ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {meetingTypes.map((m) => {
            const Icon = m.icon;
            return (
              <button
                key={m.id}
                onClick={() => setType(m.id)}
                className="group flex items-start gap-4 rounded-xl border border-border bg-card p-5 text-left shadow-soft transition-all hover:border-primary/40 hover:shadow-card"
              >
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-accent text-accent-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold">{m.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{m.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <MeetingForm type={type} />
      )}
    </AppShell>
  );
}

function MeetingForm({ type }: { type: MeetingType }) {
  const navigate = useNavigate();
  const isPhysical = type === "physical";
  const [title, setTitle] = useState("");
  const [workspace, setWorkspace] = useState("");
  const [visibility, setVisibility] = useState("Private");
  const [attendees, setAttendees] = useState("4");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [language, setLanguage] = useState("English");
  const [outputLanguage, setOutputLanguage] = useState("English");
  const [agenda, setAgenda] = useState("");

  const createMeeting = useCreateMeeting();
  const uploadAudio = useUploadAudio();

  const handleRecorderSuccess = async (audioBlob: Blob) => {
    if (!title.trim()) {
      toast.error("Please enter a meeting title");
      return;
    }

    try {
      const meeting = await createMeeting.mutateAsync({ title: title.trim() });
      const uploadedMeeting = await uploadAudio.mutateAsync({
        meetingId: meeting.id,
        audioBlob,
      });
      toast.success("Recording uploaded. Processing started.");
      navigate({ to: "/processing", search: { meetingId: uploadedMeeting.id } });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to upload recording";
      toast.error(message);
    }
  };

  const handleUploaderSuccess = async (file: File) => {
    if (!title.trim()) {
      toast.error("Please enter a meeting title");
      return;
    }

    try {
      const meeting = await createMeeting.mutateAsync({ title: title.trim() });
      const uploadedMeeting = await uploadAudio.mutateAsync({
        meetingId: meeting.id,
        audioBlob: file,
      });
      toast.success("Recording uploaded. Processing started.");
      navigate({ to: "/processing", search: { meetingId: uploadedMeeting.id } });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to upload recording";
      toast.error(message);
    }
  };

  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <Card title="Meeting details">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Meeting title" className="sm:col-span-2">
              <Input
                placeholder="e.g. Project Kickoff"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </Field>
            <Field label="Workspace">
              <Select value={workspace} onValueChange={setWorkspace}>
                <SelectTrigger>
                  <SelectValue placeholder="Select workspace" />
                </SelectTrigger>
                <SelectContent>
                  {workspaces.map((w) => (
                    <SelectItem key={w} value={w}>
                      {w}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field
              label="Visibility"
              helper="Private: only you. Workspace: everyone in workspace. Shared: selected people."
            >
              <Select value={visibility} onValueChange={setVisibility}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Private">Private</SelectItem>
                  <SelectItem value="Workspace">Workspace</SelectItem>
                  <SelectItem value="Shared">Shared</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Number of attendees">
              <Input
                type="number"
                min={1}
                value={attendees}
                onChange={(e) => setAttendees(e.target.value)}
              />
            </Field>
            {!isPhysical && (
              <>
                <Field label="Meeting date">
                  <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                </Field>
                <Field label="Meeting time (optional)">
                  <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
                </Field>
              </>
            )}
            <Field label="Transcription language">
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="English">English</SelectItem>
                  <SelectItem value="Nepali-English Mixed">Nepali-English Mixed</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Minutes output language">
              <Select value={outputLanguage} onValueChange={setOutputLanguage}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="English">English</SelectItem>
                  <SelectItem value="Nepali">Nepali</SelectItem>
                  <SelectItem value="Bilingual">Bilingual</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Agenda / context (optional)" className="sm:col-span-2">
              <Textarea
                rows={4}
                placeholder="Add meeting agenda, important names, or context to improve the minutes. Optional."
                value={agenda}
                onChange={(e) => setAgenda(e.target.value)}
              />
            </Field>
            {isPhysical && (
              <p className="sm:col-span-2 text-xs text-muted-foreground">
                Date and time will be automatically captured from the recording session.
              </p>
            )}
          </div>
        </Card>

        {isPhysical ? (
          <Recorder
            onTranscribe={handleRecorderSuccess}
            isCreating={createMeeting.isPending || uploadAudio.isPending}
          />
        ) : (
          <Uploader
            onTranscribe={handleUploaderSuccess}
            isCreating={createMeeting.isPending || uploadAudio.isPending}
          />
        )}
      </div>

      <aside className="space-y-4">
        <div className="rounded-xl border border-border bg-card p-5 text-sm shadow-soft">
          <h4 className="font-semibold">Consent reminder</h4>
          <p className="mt-2 text-muted-foreground">
            By continuing, you confirm that meeting participants have consented to recording and AI
            processing.
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5 text-sm shadow-soft">
          <h4 className="font-semibold">Speakers</h4>
          <p className="mt-2 text-muted-foreground">
            Speakers are labelled automatically as Speaker 1, Speaker 2, etc. You can rename them
            later.
          </p>
        </div>
      </aside>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-border bg-card p-6 shadow-soft">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Field({
  label,
  helper,
  children,
  className,
}: {
  label: string;
  helper?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label>{label}</Label>
      {children}
      {helper && <p className="text-xs text-muted-foreground">{helper}</p>}
    </div>
  );
}

type RecState = "ready" | "recording" | "paused" | "stopped" | "uploading";

function Recorder({
  onTranscribe,
  isCreating,
}: {
  onTranscribe: (blob: Blob) => Promise<void>;
  isCreating: boolean;
}) {
  const [state, setState] = useState<RecState>("ready");
  const [seconds, setSeconds] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);

  useEffect(() => {
    if (state === "recording") {
      intervalRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [state]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
        stream.getTracks().forEach((track) => track.stop());
        handleStop(audioBlob);
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setState("recording");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to access microphone";
      toast.error(message);
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.pause();
      setState("paused");
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.resume();
      setState("recording");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setState("uploading");
    }
  };

  const handleStop = async (audioBlob: Blob) => {
    setState("stopped");
  };

  const handleUpload = async () => {
    if (chunksRef.current.length === 0) {
      toast.error("No audio recorded");
      return;
    }

    const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
    setState("uploading");

    try {
      setUploadProgress(20);
      await onTranscribe(audioBlob);
      setUploadProgress(100);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Upload failed";
      toast.error(message);
      setState("stopped");
    }
  };

  const reset = () => {
    setState("ready");
    setSeconds(0);
    setUploadProgress(0);
    chunksRef.current = [];
  };

  const fmt = (s: number) => {
    const m = Math.floor(s / 60)
      .toString()
      .padStart(2, "0");
    const r = (s % 60).toString().padStart(2, "0");
    return `00:${m}:${r}`;
  };

  const statusLabel = {
    ready: "Ready to record",
    recording: "Recording",
    paused: "Recording paused",
    stopped: "Recording complete",
    uploading: "Uploading audio...",
  }[state];

  const isDisabled = isCreating || state === "uploading";

  return (
    <Card title="Record meeting">
      <div className="flex flex-col items-center rounded-xl border border-dashed border-border bg-surface px-6 py-10 text-center">
        <div
          className={cn(
            "grid h-20 w-20 place-items-center rounded-full bg-card shadow-soft",
            state === "recording" && "ring-4 ring-destructive/20",
            state === "uploading" && "ring-4 ring-primary/20",
          )}
        >
          {state === "uploading" ? (
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          ) : (
            <Mic
              className={cn("h-8 w-8", state === "recording" ? "text-destructive" : "text-primary")}
            />
          )}
        </div>

        <div className="mt-4 inline-flex items-center gap-2 text-sm font-medium">
          {state === "recording" && (
            <span className="h-2 w-2 animate-pulse rounded-full bg-destructive" />
          )}
          {statusLabel}
        </div>

        <div className="mt-2 font-mono text-3xl font-semibold tracking-tight">{fmt(seconds)}</div>

        {state === "uploading" && uploadProgress > 0 && (
          <div className="mt-4 w-full max-w-sm rounded-lg bg-surface p-2">
            <div className="h-2 w-full overflow-hidden rounded-full bg-border">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">{uploadProgress}% uploaded</p>
          </div>
        )}

        <Waveform active={state === "recording"} />

        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          {state === "ready" && (
            <Button onClick={startRecording} className="h-10" disabled={isDisabled}>
              <Mic className="h-4 w-4" /> Start Recording
            </Button>
          )}
          {state === "recording" && (
            <>
              <Button variant="outline" onClick={pauseRecording} disabled={isDisabled}>
                <Pause className="h-4 w-4" /> Pause Recording
              </Button>
              <Button variant="destructive" onClick={stopRecording} disabled={isDisabled}>
                <Square className="h-4 w-4" /> Stop Recording
              </Button>
            </>
          )}
          {state === "paused" && (
            <>
              <Button onClick={resumeRecording} disabled={isDisabled}>
                <Play className="h-4 w-4" /> Resume Recording
              </Button>
              <Button variant="destructive" onClick={stopRecording} disabled={isDisabled}>
                <Square className="h-4 w-4" /> Stop Recording
              </Button>
            </>
          )}
          {state === "stopped" && (
            <>
              <Button variant="outline" onClick={reset} disabled={isDisabled}>
                Discard
              </Button>
              <Button onClick={handleUpload} disabled={isDisabled}>
                {isCreating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Creating...
                  </>
                ) : (
                  "Transcribe Meeting"
                )}
              </Button>
            </>
          )}
          {state === "uploading" && (
            <Button disabled className="h-10">
              <Loader2 className="h-4 w-4 animate-spin" /> Processing...
            </Button>
          )}
        </div>

        {state === "stopped" && (
          <div className="mt-5 w-full max-w-sm rounded-lg border border-border bg-card p-3 text-left text-xs text-muted-foreground">
            Playback preview · Duration {fmt(seconds)}
          </div>
        )}
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        Use pause when the meeting is on break or when off-record discussions happen.
      </p>
    </Card>
  );
}

function Waveform({ active }: { active: boolean }) {
  return (
    <div className="mt-4 flex h-10 items-center justify-center gap-1">
      {Array.from({ length: 32 }).map((_, i) => (
        <span
          key={i}
          className={cn(
            "w-1 rounded-full bg-border transition-all",
            active ? "bg-primary/70" : "bg-border",
          )}
          style={{
            height: `${active ? 10 + ((i * 7) % 28) : 6}px`,
            animation: active ? `pulse 1.${(i % 9) + 1}s ease-in-out infinite` : undefined,
          }}
        />
      ))}
    </div>
  );
}

function Uploader({
  onTranscribe,
  isCreating,
}: {
  onTranscribe: (file: File) => Promise<void>;
  isCreating: boolean;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a file to upload");
      return;
    }

    let progressInterval: ReturnType<typeof setInterval> | undefined;
    try {
      setUploadProgress(0);
      // Fetch does not expose upload progress, so this keeps the UI responsive while it waits.
      progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + Math.random() * 30, 90));
      }, 500);

      await onTranscribe(file);

      setUploadProgress(100);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Upload failed";
      toast.error(message);
      setUploadProgress(0);
    } finally {
      if (progressInterval) clearInterval(progressInterval);
    }
  };

  const isDisabled = isCreating || uploadProgress > 0;

  return (
    <Card title="Upload recording">
      {!file ? (
        <div
          onClick={() => inputRef.current?.click()}
          className="flex cursor-pointer flex-col items-center rounded-xl border border-dashed border-border bg-surface px-6 py-10 text-center transition-colors hover:border-primary/40"
        >
          <div className="grid h-12 w-12 place-items-center rounded-full bg-accent text-accent-foreground">
            <Upload className="h-5 w-5" />
          </div>
          <h3 className="mt-4 font-semibold">Upload meeting recording</h3>
          <p className="mt-1 max-w-md text-sm text-muted-foreground">
            Upload a downloaded Zoom, Google Meet, Teams, or other meeting recording.
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Supported files: MP3, WAV, M4A, WEBM, MP4
          </p>
          <Button
            type="button"
            variant="outline"
            className="mt-5"
            onClick={(e) => {
              e.stopPropagation();
              inputRef.current?.click();
            }}
            disabled={isDisabled}
          >
            <Upload className="h-4 w-4" /> Upload Recording
          </Button>
          <input
            ref={inputRef}
            type="file"
            accept=".mp3,.wav,.m4a,.webm,.mp4,audio/*,video/*"
            className="hidden"
            onChange={(e) => {
              const selectedFile = e.target.files?.[0];
              if (selectedFile) {
                setFile(selectedFile);
                toast.success(`File selected: ${selectedFile.name}`);
              }
            }}
          />
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-surface p-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-accent text-accent-foreground">
              <FileAudio className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{file.name}</p>
              <p className="text-xs text-muted-foreground">
                {(file.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setFile(null);
                setUploadProgress(0);
              }}
              disabled={isDisabled}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="mt-4 rounded-lg bg-card p-3">
              <div className="h-2 w-full overflow-hidden rounded-full bg-border">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="mt-2 text-center text-xs text-muted-foreground">
                {Math.round(uploadProgress)}% uploaded
              </p>
            </div>
          )}
        </div>
      )}
      <div className="mt-5 flex justify-end gap-2">
        {file && (
          <Button
            variant="outline"
            onClick={() => {
              setFile(null);
              setUploadProgress(0);
            }}
            disabled={isDisabled}
          >
            Choose Different File
          </Button>
        )}
        <Button disabled={!file || isDisabled} onClick={handleUpload}>
          {isCreating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Creating...
            </>
          ) : uploadProgress > 0 ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Uploading...
            </>
          ) : (
            "Upload and Transcribe"
          )}
        </Button>
      </div>
    </Card>
  );
}
