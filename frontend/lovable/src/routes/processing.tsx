import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Check, Loader2, Bell, FileText, Sparkles } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useMeeting, useMeetingStatus } from "@/hooks/use-api";
import { MeetingStatus } from "@/types";

export const Route = createFileRoute("/processing")({
  validateSearch: (search: Record<string, unknown>) => ({
    meetingId: Number(search.meetingId) || undefined,
  }),
  head: () => ({
    meta: [
      { title: "Processing Meeting - MeetingIQ" },
      {
        name: "description",
        content: "Your meeting is being transcribed and minutes are being generated.",
      },
    ],
  }),
  component: ProcessingPage,
});

const steps = [
  "Uploading recording",
  "Transcribing audio",
  "Generating minutes",
  "Creating PDF draft",
];

function ProcessingPage() {
  const navigate = useNavigate();
  const { meetingId } = Route.useSearch();
  const [remind, setRemind] = useState(true);
  const statusQuery = useMeetingStatus(meetingId ?? 0, Boolean(meetingId));
  const meetingQuery = useMeeting(meetingId ?? 0, Boolean(meetingId));

  const meeting = meetingQuery.data;
  const status = statusQuery.data?.status ?? meeting?.status ?? MeetingStatus.PENDING;
  const done = status === MeetingStatus.DONE;
  const failed = status === MeetingStatus.FAILED;
  const progress = getProgress(status);
  const currentStep = Math.min(steps.length - 1, Math.floor((progress / 100) * steps.length));

  const continueInBackground = () => {
    toast.success("Meeting processing started", {
      description: "We'll remind you when minutes are ready.",
    });
    navigate({ to: "/meetings" });
  };

  return (
    <AppShell>
      <h1 className="text-2xl font-semibold tracking-tight">
        {failed ? "Processing failed" : done ? "Minutes are ready" : "Transcription Started"}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {!meetingId
          ? "No meeting was selected. Start a new recording or open a meeting from the list."
          : failed
            ? statusQuery.data?.error_message ||
              "The backend could not finish processing this recording."
            : done
              ? "Your meeting minutes and PDF draft are ready for review."
              : "We're processing your meeting. You can leave this page and come back later."}
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-xl border border-border bg-card p-6 shadow-soft">
            <div className="grid gap-4 sm:grid-cols-2">
              <Info label="Meeting title" value={meeting?.title ?? "Loading..."} />
              <Info label="Status" value={formatStatus(status)} />
              <Info label="Created" value={formatDate(meeting?.created_at)} />
              <Info label="Completed" value={formatDate(meeting?.completed_at)} />
            </div>
          </section>

          <section className="rounded-xl border border-border bg-card p-6 shadow-soft">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">
                {failed ? "Processing failed" : done ? "Processing complete" : steps[currentStep]}
              </span>
              <span className="text-muted-foreground">{progress}%</span>
            </div>
            <Progress value={progress} className="mt-3 h-2" />
            {!done && !failed && (
              <p className="mt-3 text-xs text-muted-foreground">
                Processing is running on the backend. This page polls every few seconds.
              </p>
            )}

            <ol className="mt-6 space-y-3">
              {steps.map((step, index) => {
                const isDone = index < currentStep || done;
                const isActive = !done && !failed && index === currentStep;
                return (
                  <li
                    key={step}
                    className={cn(
                      "flex items-center gap-3 rounded-lg border border-border bg-surface px-4 py-3 text-sm",
                      isActive && "border-primary/40 bg-accent/50",
                    )}
                  >
                    <span
                      className={cn(
                        "grid h-6 w-6 place-items-center rounded-full text-xs font-medium",
                        isDone
                          ? "bg-emerald-100 text-emerald-700"
                          : isActive
                            ? "bg-primary/10 text-primary"
                            : "bg-muted text-muted-foreground",
                      )}
                    >
                      {isDone ? (
                        <Check className="h-3.5 w-3.5" />
                      ) : isActive ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        index + 1
                      )}
                    </span>
                    <span className={cn(isDone ? "text-foreground" : "text-muted-foreground")}>
                      {step}
                    </span>
                  </li>
                );
              })}
            </ol>
          </section>

          {done && meetingId && (
            <section className="rounded-xl border border-border bg-card p-6 shadow-soft">
              <h3 className="text-base font-semibold">Minutes are ready</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Review the generated Markdown, save edits, and download the regenerated PDF.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <Button asChild variant="outline">
                  <Link to="/meetings">
                    <FileText className="h-4 w-4" /> Back to Meetings
                  </Link>
                </Button>
                <Button asChild>
                  <Link to="/meetings/$meetingId" params={{ meetingId: String(meetingId) }}>
                    <Sparkles className="h-4 w-4" /> Review Minutes
                  </Link>
                </Button>
              </div>
            </section>
          )}
        </div>

        <aside className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-5 shadow-soft">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-primary" />
              <h4 className="text-sm font-semibold">Reminders</h4>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              You can leave this page and return from the meetings list.
            </p>
            <label className="mt-4 flex items-center gap-2 text-sm">
              <Checkbox checked={remind} onCheckedChange={(value) => setRemind(Boolean(value))} />
              Remind me when minutes are ready
            </label>
            <Button variant="outline" className="mt-4 w-full" onClick={continueInBackground}>
              Continue in background
            </Button>
          </div>

          <div className="rounded-xl border border-border bg-card p-5 shadow-soft">
            <h4 className="text-sm font-semibold">Current meeting</h4>
            <div className="mt-3 flex items-start gap-3 rounded-lg border border-border bg-surface p-3 text-sm">
              <span className="mt-1.5 h-2 w-2 rounded-full bg-primary" />
              <div>
                <p className="font-medium">{meeting?.title ?? "Meeting"}</p>
                <p className="text-xs text-muted-foreground">
                  {done ? "Minutes are ready for review." : formatStatus(status)}
                </p>
                {meetingId && (
                  <Link
                    to={done ? "/meetings/$meetingId" : "/meetings"}
                    params={done ? { meetingId: String(meetingId) } : undefined}
                    className="mt-1 inline-block text-xs font-medium text-primary hover:underline"
                  >
                    Open meeting
                  </Link>
                )}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </AppShell>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-medium">{value}</p>
    </div>
  );
}

function getProgress(status: string) {
  switch (status) {
    case MeetingStatus.TRANSCRIBING:
      return 35;
    case MeetingStatus.SUMMARIZING:
      return 65;
    case MeetingStatus.GENERATING:
      return 85;
    case MeetingStatus.DONE:
    case MeetingStatus.FAILED:
      return 100;
    case MeetingStatus.PENDING:
    default:
      return 15;
  }
}

function formatStatus(status: string) {
  return status.replace(/[_-]/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDate(value?: string) {
  if (!value) return "Not yet";
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
