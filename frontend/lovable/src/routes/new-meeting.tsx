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
import { Mic, Video, Users, Upload, ArrowLeft, X, Pause, Play, Square, FileAudio } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { workspaces } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/new-meeting")({
  head: () => ({
    meta: [
      { title: "New Meeting — MeetingIQ" },
      { name: "description", content: "Record a physical meeting or upload a recording to transcribe." },
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
  { id: "physical", title: "Physical Meeting", description: "Record an in-person meeting directly from your device.", icon: Mic },
  { id: "zoom", title: "Zoom Recording", description: "Upload a downloaded Zoom meeting recording.", icon: Video },
  { id: "gmeet", title: "Google Meet Recording", description: "Upload a downloaded Google Meet recording.", icon: Video },
  { id: "teams", title: "Microsoft Teams Recording", description: "Upload a downloaded Teams meeting recording.", icon: Users },
  { id: "other", title: "Other Recording", description: "Upload another audio or video meeting file.", icon: Upload },
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
        {type ? "Fill in the meeting details and start transcribing." : "Step 1 · Choose meeting type"}
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

  const start = () => navigate({ to: "/processing" });

  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <Card title="Meeting details">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Meeting title" className="sm:col-span-2">
              <Input placeholder="e.g. Project Kickoff" />
            </Field>
            <Field label="Workspace">
              <Select>
                <SelectTrigger><SelectValue placeholder="Select workspace" /></SelectTrigger>
                <SelectContent>
                  {workspaces.map((w) => (
                    <SelectItem key={w} value={w}>{w}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Visibility" helper="Private: only you. Workspace: everyone in workspace. Shared: selected people.">
              <Select defaultValue="Private">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Private">Private</SelectItem>
                  <SelectItem value="Workspace">Workspace</SelectItem>
                  <SelectItem value="Shared">Shared</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Number of attendees">
              <Input type="number" min={1} defaultValue={4} />
            </Field>
            {!isPhysical && (
              <>
                <Field label="Meeting date">
                  <Input type="date" />
                </Field>
                <Field label="Meeting time (optional)">
                  <Input type="time" />
                </Field>
              </>
            )}
            <Field label="Transcription language">
              <Select defaultValue="English">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="English">English</SelectItem>
                  <SelectItem value="Nepali-English Mixed">Nepali-English Mixed</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <Field label="Minutes output language">
              <Select defaultValue="English">
                <SelectTrigger><SelectValue /></SelectTrigger>
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
              />
            </Field>
            {isPhysical && (
              <p className="sm:col-span-2 text-xs text-muted-foreground">
                Date and time will be automatically captured from the recording session.
              </p>
            )}
          </div>
        </Card>

        {isPhysical ? <Recorder onTranscribe={start} /> : <Uploader onTranscribe={start} />}
      </div>

      <aside className="space-y-4">
        <div className="rounded-xl border border-border bg-card p-5 text-sm shadow-soft">
          <h4 className="font-semibold">Consent reminder</h4>
          <p className="mt-2 text-muted-foreground">
            By continuing, you confirm that meeting participants have consented to recording
            and AI processing.
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5 text-sm shadow-soft">
          <h4 className="font-semibold">Speakers</h4>
          <p className="mt-2 text-muted-foreground">
            Speakers are labelled automatically as Speaker 1, Speaker 2, etc. You can rename
            them later.
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

type RecState = "ready" | "recording" | "paused" | "stopped";

function Recorder({ onTranscribe }: { onTranscribe: () => void }) {
  const [state, setState] = useState<RecState>("ready");
  const [seconds, setSeconds] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

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

  const reset = () => {
    setState("ready");
    setSeconds(0);
  };

  const fmt = (s: number) => {
    const m = Math.floor(s / 60).toString().padStart(2, "0");
    const r = (s % 60).toString().padStart(2, "0");
    return `00:${m}:${r}`;
  };

  const statusLabel = {
    ready: "Ready to record",
    recording: "Recording",
    paused: "Recording paused",
    stopped: "Recording complete",
  }[state];

  return (
    <Card title="Record meeting">
      <div className="flex flex-col items-center rounded-xl border border-dashed border-border bg-surface px-6 py-10 text-center">
        <div
          className={cn(
            "grid h-20 w-20 place-items-center rounded-full bg-card shadow-soft",
            state === "recording" && "ring-4 ring-destructive/20",
          )}
        >
          <Mic
            className={cn(
              "h-8 w-8",
              state === "recording" ? "text-destructive" : "text-primary",
            )}
          />
        </div>

        <div className="mt-4 inline-flex items-center gap-2 text-sm font-medium">
          {state === "recording" && (
            <span className="h-2 w-2 animate-pulse rounded-full bg-destructive" />
          )}
          {statusLabel}
        </div>

        <div className="mt-2 font-mono text-3xl font-semibold tracking-tight">
          {fmt(seconds)}
        </div>

        <Waveform active={state === "recording"} />

        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          {state === "ready" && (
            <Button onClick={() => setState("recording")} className="h-10">
              <Mic className="h-4 w-4" /> Start Recording
            </Button>
          )}
          {state === "recording" && (
            <>
              <Button variant="outline" onClick={() => setState("paused")}>
                <Pause className="h-4 w-4" /> Pause Recording
              </Button>
              <Button variant="destructive" onClick={() => setState("stopped")}>
                <Square className="h-4 w-4" /> Stop Recording
              </Button>
            </>
          )}
          {state === "paused" && (
            <>
              <Button onClick={() => setState("recording")}>
                <Play className="h-4 w-4" /> Resume Recording
              </Button>
              <Button variant="destructive" onClick={() => setState("stopped")}>
                <Square className="h-4 w-4" /> Stop Recording
              </Button>
            </>
          )}
          {state === "stopped" && (
            <>
              <Button variant="outline" onClick={reset}>Discard</Button>
              <Button onClick={onTranscribe}>Transcribe Meeting</Button>
            </>
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

function Uploader({ onTranscribe }: { onTranscribe: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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
          <Button type="button" variant="outline" className="mt-5" onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}>
            <Upload className="h-4 w-4" /> Upload Recording
          </Button>
          <input
            ref={inputRef}
            type="file"
            accept=".mp3,.wav,.m4a,.webm,.mp4,audio/*,video/*"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
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
            <Button variant="ghost" size="icon" onClick={() => setFile(null)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
      <div className="mt-5 flex justify-end">
        <Button disabled={!file} onClick={onTranscribe}>
          Upload and Transcribe
        </Button>
      </div>
    </Card>
  );
}
