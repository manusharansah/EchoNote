import { jsx, jsxs } from "react/jsx-runtime";
import { useNavigate, Link } from "@tanstack/react-router";
import { A as AppShell } from "./AppShell-BhLMxDhV.js";
import { c as cn, B as Button } from "./button-DRiz9d0t.js";
import { C as Checkbox } from "./checkbox-CAs_BWmM.js";
import * as React from "react";
import { useState } from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { Check, Loader2, FileText, Sparkles, Bell } from "lucide-react";
import { toast } from "sonner";
import { a as useMeetingStatus, b as useMeeting } from "./use-api-BoBrtaux.js";
import { M as MeetingStatus } from "./index-Cc391LeZ.js";
import { R as Route } from "./router-ikPISU9n.js";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "clsx";
import "tailwind-merge";
import "@radix-ui/react-checkbox";
import "@tanstack/react-query";
const Progress = React.forwardRef(({ className, value, ...props }, ref) => /* @__PURE__ */ jsx(
  ProgressPrimitive.Root,
  {
    ref,
    className: cn("relative h-2 w-full overflow-hidden rounded-full bg-primary/20", className),
    ...props,
    children: /* @__PURE__ */ jsx(
      ProgressPrimitive.Indicator,
      {
        className: "h-full w-full flex-1 bg-primary transition-all",
        style: { transform: `translateX(-${100 - (value || 0)}%)` }
      }
    )
  }
));
Progress.displayName = ProgressPrimitive.Root.displayName;
const steps = ["Uploading recording", "Transcribing audio", "Generating minutes", "Creating PDF draft"];
function ProcessingPage() {
  const navigate = useNavigate();
  const {
    meetingId
  } = Route.useSearch();
  const [remind, setRemind] = useState(true);
  const statusQuery = useMeetingStatus(meetingId ?? 0, Boolean(meetingId));
  const meetingQuery = useMeeting(meetingId ?? 0, Boolean(meetingId));
  const meeting = meetingQuery.data;
  const status = statusQuery.data?.status ?? meeting?.status ?? MeetingStatus.PENDING;
  const done = status === MeetingStatus.DONE;
  const failed = status === MeetingStatus.FAILED;
  const progress = getProgress(status);
  const currentStep = Math.min(steps.length - 1, Math.floor(progress / 100 * steps.length));
  const continueInBackground = () => {
    toast.success("Meeting processing started", {
      description: "We'll remind you when minutes are ready."
    });
    navigate({
      to: "/meetings"
    });
  };
  return /* @__PURE__ */ jsxs(AppShell, { children: [
    /* @__PURE__ */ jsx("h1", { className: "text-2xl font-semibold tracking-tight", children: failed ? "Processing failed" : done ? "Minutes are ready" : "Transcription Started" }),
    /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: !meetingId ? "No meeting was selected. Start a new recording or open a meeting from the list." : failed ? statusQuery.data?.error_message || "The backend could not finish processing this recording." : done ? "Your meeting minutes and PDF draft are ready for review." : "We're processing your meeting. You can leave this page and come back later." }),
    /* @__PURE__ */ jsxs("div", { className: "mt-8 grid gap-6 lg:grid-cols-3", children: [
      /* @__PURE__ */ jsxs("div", { className: "space-y-6 lg:col-span-2", children: [
        /* @__PURE__ */ jsx("section", { className: "rounded-xl border border-border bg-card p-6 shadow-soft", children: /* @__PURE__ */ jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [
          /* @__PURE__ */ jsx(Info, { label: "Meeting title", value: meeting?.title ?? "Loading..." }),
          /* @__PURE__ */ jsx(Info, { label: "Status", value: formatStatus(status) }),
          /* @__PURE__ */ jsx(Info, { label: "Created", value: formatDate(meeting?.created_at) }),
          /* @__PURE__ */ jsx(Info, { label: "Completed", value: formatDate(meeting?.completed_at) })
        ] }) }),
        /* @__PURE__ */ jsxs("section", { className: "rounded-xl border border-border bg-card p-6 shadow-soft", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between text-sm", children: [
            /* @__PURE__ */ jsx("span", { className: "font-medium", children: failed ? "Processing failed" : done ? "Processing complete" : steps[currentStep] }),
            /* @__PURE__ */ jsxs("span", { className: "text-muted-foreground", children: [
              progress,
              "%"
            ] })
          ] }),
          /* @__PURE__ */ jsx(Progress, { value: progress, className: "mt-3 h-2" }),
          !done && !failed && /* @__PURE__ */ jsx("p", { className: "mt-3 text-xs text-muted-foreground", children: "Processing is running on the backend. This page polls every few seconds." }),
          /* @__PURE__ */ jsx("ol", { className: "mt-6 space-y-3", children: steps.map((step, index) => {
            const isDone = index < currentStep || done;
            const isActive = !done && !failed && index === currentStep;
            return /* @__PURE__ */ jsxs("li", { className: cn("flex items-center gap-3 rounded-lg border border-border bg-surface px-4 py-3 text-sm", isActive && "border-primary/40 bg-accent/50"), children: [
              /* @__PURE__ */ jsx("span", { className: cn("grid h-6 w-6 place-items-center rounded-full text-xs font-medium", isDone ? "bg-emerald-100 text-emerald-700" : isActive ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"), children: isDone ? /* @__PURE__ */ jsx(Check, { className: "h-3.5 w-3.5" }) : isActive ? /* @__PURE__ */ jsx(Loader2, { className: "h-3.5 w-3.5 animate-spin" }) : index + 1 }),
              /* @__PURE__ */ jsx("span", { className: cn(isDone ? "text-foreground" : "text-muted-foreground"), children: step })
            ] }, step);
          }) })
        ] }),
        done && meetingId && /* @__PURE__ */ jsxs("section", { className: "rounded-xl border border-border bg-card p-6 shadow-soft", children: [
          /* @__PURE__ */ jsx("h3", { className: "text-base font-semibold", children: "Minutes are ready" }),
          /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "Review the generated Markdown, save edits, and download the regenerated PDF." }),
          /* @__PURE__ */ jsxs("div", { className: "mt-5 flex flex-wrap gap-2", children: [
            /* @__PURE__ */ jsx(Button, { asChild: true, variant: "outline", children: /* @__PURE__ */ jsxs(Link, { to: "/meetings", children: [
              /* @__PURE__ */ jsx(FileText, { className: "h-4 w-4" }),
              " Back to Meetings"
            ] }) }),
            /* @__PURE__ */ jsx(Button, { asChild: true, children: /* @__PURE__ */ jsxs(Link, { to: "/meetings/$meetingId", params: {
              meetingId: String(meetingId)
            }, children: [
              /* @__PURE__ */ jsx(Sparkles, { className: "h-4 w-4" }),
              " Review Minutes"
            ] }) })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("aside", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border bg-card p-5 shadow-soft", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsx(Bell, { className: "h-4 w-4 text-primary" }),
            /* @__PURE__ */ jsx("h4", { className: "text-sm font-semibold", children: "Reminders" })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "You can leave this page and return from the meetings list." }),
          /* @__PURE__ */ jsxs("label", { className: "mt-4 flex items-center gap-2 text-sm", children: [
            /* @__PURE__ */ jsx(Checkbox, { checked: remind, onCheckedChange: (value) => setRemind(Boolean(value)) }),
            "Remind me when minutes are ready"
          ] }),
          /* @__PURE__ */ jsx(Button, { variant: "outline", className: "mt-4 w-full", onClick: continueInBackground, children: "Continue in background" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border bg-card p-5 shadow-soft", children: [
          /* @__PURE__ */ jsx("h4", { className: "text-sm font-semibold", children: "Current meeting" }),
          /* @__PURE__ */ jsxs("div", { className: "mt-3 flex items-start gap-3 rounded-lg border border-border bg-surface p-3 text-sm", children: [
            /* @__PURE__ */ jsx("span", { className: "mt-1.5 h-2 w-2 rounded-full bg-primary" }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "font-medium", children: meeting?.title ?? "Meeting" }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: done ? "Minutes are ready for review." : formatStatus(status) }),
              meetingId && /* @__PURE__ */ jsx(Link, { to: done ? "/meetings/$meetingId" : "/meetings", params: done ? {
                meetingId: String(meetingId)
              } : void 0, className: "mt-1 inline-block text-xs font-medium text-primary hover:underline", children: "Open meeting" })
            ] })
          ] })
        ] })
      ] })
    ] })
  ] });
}
function Info({
  label,
  value
}) {
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx("p", { className: "text-xs uppercase tracking-wide text-muted-foreground", children: label }),
    /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm font-medium", children: value })
  ] });
}
function getProgress(status) {
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
function formatStatus(status) {
  return status.replace(/[_-]/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}
function formatDate(value) {
  if (!value) return "Not yet";
  return new Intl.DateTimeFormat(void 0, {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}
export {
  ProcessingPage as component
};
