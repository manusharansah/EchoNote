import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Check, Loader2, Bell, FileText, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/processing")({
  head: () => ({
    meta: [
      { title: "Transcription Started — MeetingIQ" },
      { name: "description", content: "Your meeting is being transcribed and minutes are being generated." },
    ],
  }),
  component: ProcessingPage,
});

const steps = [
  "Uploading recording",
  "Transcribing audio",
  "Detecting speakers",
  "Preparing transcript",
  "Generating minutes",
  "Creating PDF draft",
];

function ProcessingPage() {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(8);
  const [remind, setRemind] = useState(true);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const id = setInterval(() => {
      setProgress((p) => {
        const next = Math.min(100, p + 4);
        if (next >= 100) {
          clearInterval(id);
          setDone(true);
        }
        return next;
      });
    }, 700);
    return () => clearInterval(id);
  }, []);

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
        {done ? "Transcript is ready" : "Transcription Started"}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {done
          ? "Your meeting has been transcribed. Review the transcript before generating final minutes."
          : "We're processing your meeting. You can leave this page and come back later."}
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <section className="rounded-xl border border-border bg-card p-6 shadow-soft">
            <div className="grid gap-4 sm:grid-cols-2">
              <Info label="Meeting title" value="Project Kickoff" />
              <Info label="Meeting type" value="Physical" />
              <Info label="Workspace" value="NCIT Hackathon Team" />
              <Info label="Language" value="Nepali-English Mixed" />
              <Info label="Estimated processing time" value="~ 3 minutes" />
            </div>
          </section>

          <section className="rounded-xl border border-border bg-card p-6 shadow-soft">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">
                {done ? "Processing complete" : steps[currentStep]}
              </span>
              <span className="text-muted-foreground">{progress}%</span>
            </div>
            <Progress value={progress} className="mt-3 h-2" />
            {!done && (
              <p className="mt-3 text-xs text-muted-foreground">
                Estimated time remaining: {Math.max(1, Math.ceil((100 - progress) / 30))} minutes
              </p>
            )}

            <ol className="mt-6 space-y-3">
              {steps.map((s, i) => {
                const isDone = i < currentStep || done;
                const isActive = !done && i === currentStep;
                return (
                  <li
                    key={s}
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
                        i + 1
                      )}
                    </span>
                    <span className={cn(isDone ? "text-foreground" : "text-muted-foreground")}>
                      {s}
                    </span>
                  </li>
                );
              })}
            </ol>
          </section>

          {done && (
            <section className="rounded-xl border border-border bg-card p-6 shadow-soft">
              <h3 className="text-base font-semibold">Transcript is ready</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Speakers are labelled automatically as Speaker 1, Speaker 2, etc. You can rename
                them later.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <Button variant="outline">
                  <FileText className="h-4 w-4" /> View Transcript
                </Button>
                <Button>
                  <Sparkles className="h-4 w-4" /> Generate Minutes
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
              You can leave this page. We'll remind you when your meeting minutes are ready.
            </p>
            <label className="mt-4 flex items-center gap-2 text-sm">
              <Checkbox checked={remind} onCheckedChange={(v) => setRemind(Boolean(v))} />
              Remind me when minutes are ready
            </label>
            <ul className="mt-3 space-y-1.5 text-xs text-muted-foreground">
              <li>· In-app reminder</li>
              <li>· Browser notification</li>
              <li>· Email notification</li>
            </ul>
            <Button variant="outline" className="mt-4 w-full" onClick={continueInBackground}>
              Continue in background
            </Button>
          </div>

          <div className="rounded-xl border border-border bg-card p-5 shadow-soft">
            <h4 className="text-sm font-semibold">Recent notification</h4>
            <div className="mt-3 flex items-start gap-3 rounded-lg border border-border bg-surface p-3 text-sm">
              <span className="mt-1.5 h-2 w-2 rounded-full bg-primary" />
              <div>
                <p className="font-medium">Project Kickoff</p>
                <p className="text-xs text-muted-foreground">
                  Minutes are ready for review.
                </p>
                <Link
                  to="/meetings"
                  className="mt-1 inline-block text-xs font-medium text-primary hover:underline"
                >
                  Open meeting →
                </Link>
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
