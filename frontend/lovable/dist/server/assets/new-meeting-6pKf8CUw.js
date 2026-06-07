import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { useNavigate } from "@tanstack/react-router";
import { A as AppShell } from "./AppShell-BhLMxDhV.js";
import { c as cn, B as Button } from "./button-DRiz9d0t.js";
import { I as Input } from "./input-BfG4f_p9.js";
import { L as Label } from "./label-8OFGJuPk.js";
import { T as Textarea } from "./textarea-Afsg2eJD.js";
import * as React from "react";
import { useState, useRef, useEffect } from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { ChevronDown, Check, ChevronUp, ArrowLeft, Mic, Video, Users, Upload, Loader2, Pause, Square, Play, FileAudio, X } from "lucide-react";
import { c as useCreateMeeting, d as useUploadAudio } from "./use-api-BoBrtaux.js";
import { toast } from "sonner";
import "./router-ikPISU9n.js";
import "@tanstack/react-query";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "clsx";
import "tailwind-merge";
import "@radix-ui/react-label";
const Select = SelectPrimitive.Root;
const SelectValue = SelectPrimitive.Value;
const SelectTrigger = React.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxs(
  SelectPrimitive.Trigger,
  {
    ref,
    className: cn(
      "flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background cursor-pointer data-[placeholder]:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
      className
    ),
    ...props,
    children: [
      children,
      /* @__PURE__ */ jsx(SelectPrimitive.Icon, { asChild: true, children: /* @__PURE__ */ jsx(ChevronDown, { className: "h-4 w-4 opacity-50" }) })
    ]
  }
));
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;
const SelectScrollUpButton = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  SelectPrimitive.ScrollUpButton,
  {
    ref,
    className: cn("flex cursor-default items-center justify-center py-1", className),
    ...props,
    children: /* @__PURE__ */ jsx(ChevronUp, { className: "h-4 w-4" })
  }
));
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName;
const SelectScrollDownButton = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  SelectPrimitive.ScrollDownButton,
  {
    ref,
    className: cn("flex cursor-default items-center justify-center py-1", className),
    ...props,
    children: /* @__PURE__ */ jsx(ChevronDown, { className: "h-4 w-4" })
  }
));
SelectScrollDownButton.displayName = SelectPrimitive.ScrollDownButton.displayName;
const SelectContent = React.forwardRef(({ className, children, position = "popper", ...props }, ref) => /* @__PURE__ */ jsx(SelectPrimitive.Portal, { children: /* @__PURE__ */ jsxs(
  SelectPrimitive.Content,
  {
    ref,
    className: cn(
      "relative z-50 max-h-(--radix-select-content-available-height) min-w-[8rem] overflow-y-auto overflow-x-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-select-content-transform-origin)",
      position === "popper" && "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
      className
    ),
    position,
    ...props,
    children: [
      /* @__PURE__ */ jsx(SelectScrollUpButton, {}),
      /* @__PURE__ */ jsx(
        SelectPrimitive.Viewport,
        {
          className: cn(
            "p-1",
            position === "popper" && "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"
          ),
          children
        }
      ),
      /* @__PURE__ */ jsx(SelectScrollDownButton, {})
    ]
  }
) }));
SelectContent.displayName = SelectPrimitive.Content.displayName;
const SelectLabel = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  SelectPrimitive.Label,
  {
    ref,
    className: cn("px-2 py-1.5 text-sm font-semibold", className),
    ...props
  }
));
SelectLabel.displayName = SelectPrimitive.Label.displayName;
const SelectItem = React.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxs(
  SelectPrimitive.Item,
  {
    ref,
    className: cn(
      "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    ),
    ...props,
    children: [
      /* @__PURE__ */ jsx("span", { className: "absolute right-2 flex h-3.5 w-3.5 items-center justify-center", children: /* @__PURE__ */ jsx(SelectPrimitive.ItemIndicator, { children: /* @__PURE__ */ jsx(Check, { className: "h-4 w-4" }) }) }),
      /* @__PURE__ */ jsx(SelectPrimitive.ItemText, { children })
    ]
  }
));
SelectItem.displayName = SelectPrimitive.Item.displayName;
const SelectSeparator = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  SelectPrimitive.Separator,
  {
    ref,
    className: cn("-mx-1 my-1 h-px bg-muted", className),
    ...props
  }
));
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;
const workspaces = [
  "NCIT Hackathon Team",
  "Project Alpha",
  "Client Meetings",
  "Board Meetings"
];
const meetingTypes = [{
  id: "physical",
  title: "Physical Meeting",
  description: "Record an in-person meeting directly from your device.",
  icon: Mic
}, {
  id: "zoom",
  title: "Zoom Recording",
  description: "Upload a downloaded Zoom meeting recording.",
  icon: Video
}, {
  id: "gmeet",
  title: "Google Meet Recording",
  description: "Upload a downloaded Google Meet recording.",
  icon: Video
}, {
  id: "teams",
  title: "Microsoft Teams Recording",
  description: "Upload a downloaded Teams meeting recording.",
  icon: Users
}, {
  id: "other",
  title: "Other Recording",
  description: "Upload another audio or video meeting file.",
  icon: Upload
}];
function NewMeetingPage() {
  const [type, setType] = useState(null);
  return /* @__PURE__ */ jsxs(AppShell, { children: [
    /* @__PURE__ */ jsx("div", { className: "mb-2", children: type && /* @__PURE__ */ jsxs("button", { onClick: () => setType(null), className: "inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground", children: [
      /* @__PURE__ */ jsx(ArrowLeft, { className: "h-4 w-4" }),
      " Back to meeting type"
    ] }) }),
    /* @__PURE__ */ jsx("h1", { className: "text-2xl font-semibold tracking-tight", children: "New Meeting" }),
    /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: type ? "Fill in the meeting details and start transcribing." : "Step 1 · Choose meeting type" }),
    !type ? /* @__PURE__ */ jsx("div", { className: "mt-8 grid gap-4 sm:grid-cols-2", children: meetingTypes.map((m) => {
      const Icon = m.icon;
      return /* @__PURE__ */ jsxs("button", { onClick: () => setType(m.id), className: "group flex items-start gap-4 rounded-xl border border-border bg-card p-5 text-left shadow-soft transition-all hover:border-primary/40 hover:shadow-card", children: [
        /* @__PURE__ */ jsx("div", { className: "grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-accent text-accent-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground", children: /* @__PURE__ */ jsx(Icon, { className: "h-5 w-5" }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h3", { className: "font-semibold", children: m.title }),
          /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: m.description })
        ] })
      ] }, m.id);
    }) }) : /* @__PURE__ */ jsx(MeetingForm, { type })
  ] });
}
function MeetingForm({
  type
}) {
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
  const handleRecorderSuccess = async (audioBlob) => {
    if (!title.trim()) {
      toast.error("Please enter a meeting title");
      return;
    }
    try {
      const meeting = await createMeeting.mutateAsync({
        title: title.trim()
      });
      const uploadedMeeting = await uploadAudio.mutateAsync({
        meetingId: meeting.id,
        audioBlob
      });
      toast.success("Recording uploaded. Processing started.");
      navigate({
        to: "/processing",
        search: {
          meetingId: uploadedMeeting.id
        }
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to upload recording";
      toast.error(message);
    }
  };
  const handleUploaderSuccess = async (file) => {
    if (!title.trim()) {
      toast.error("Please enter a meeting title");
      return;
    }
    try {
      const meeting = await createMeeting.mutateAsync({
        title: title.trim()
      });
      const uploadedMeeting = await uploadAudio.mutateAsync({
        meetingId: meeting.id,
        audioBlob: file
      });
      toast.success("Recording uploaded. Processing started.");
      navigate({
        to: "/processing",
        search: {
          meetingId: uploadedMeeting.id
        }
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to upload recording";
      toast.error(message);
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "mt-8 grid gap-6 lg:grid-cols-3", children: [
    /* @__PURE__ */ jsxs("div", { className: "space-y-6 lg:col-span-2", children: [
      /* @__PURE__ */ jsx(Card, { title: "Meeting details", children: /* @__PURE__ */ jsxs("div", { className: "grid gap-4 sm:grid-cols-2", children: [
        /* @__PURE__ */ jsx(Field, { label: "Meeting title", className: "sm:col-span-2", children: /* @__PURE__ */ jsx(Input, { placeholder: "e.g. Project Kickoff", value: title, onChange: (e) => setTitle(e.target.value) }) }),
        /* @__PURE__ */ jsx(Field, { label: "Workspace", children: /* @__PURE__ */ jsxs(Select, { value: workspace, onValueChange: setWorkspace, children: [
          /* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Select workspace" }) }),
          /* @__PURE__ */ jsx(SelectContent, { children: workspaces.map((w) => /* @__PURE__ */ jsx(SelectItem, { value: w, children: w }, w)) })
        ] }) }),
        /* @__PURE__ */ jsx(Field, { label: "Visibility", helper: "Private: only you. Workspace: everyone in workspace. Shared: selected people.", children: /* @__PURE__ */ jsxs(Select, { value: visibility, onValueChange: setVisibility, children: [
          /* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsx(SelectItem, { value: "Private", children: "Private" }),
            /* @__PURE__ */ jsx(SelectItem, { value: "Workspace", children: "Workspace" }),
            /* @__PURE__ */ jsx(SelectItem, { value: "Shared", children: "Shared" })
          ] })
        ] }) }),
        /* @__PURE__ */ jsx(Field, { label: "Number of attendees", children: /* @__PURE__ */ jsx(Input, { type: "number", min: 1, value: attendees, onChange: (e) => setAttendees(e.target.value) }) }),
        !isPhysical && /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(Field, { label: "Meeting date", children: /* @__PURE__ */ jsx(Input, { type: "date", value: date, onChange: (e) => setDate(e.target.value) }) }),
          /* @__PURE__ */ jsx(Field, { label: "Meeting time (optional)", children: /* @__PURE__ */ jsx(Input, { type: "time", value: time, onChange: (e) => setTime(e.target.value) }) })
        ] }),
        /* @__PURE__ */ jsx(Field, { label: "Transcription language", children: /* @__PURE__ */ jsxs(Select, { value: language, onValueChange: setLanguage, children: [
          /* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsx(SelectItem, { value: "English", children: "English" }),
            /* @__PURE__ */ jsx(SelectItem, { value: "Nepali-English Mixed", children: "Nepali-English Mixed" })
          ] })
        ] }) }),
        /* @__PURE__ */ jsx(Field, { label: "Minutes output language", children: /* @__PURE__ */ jsxs(Select, { value: outputLanguage, onValueChange: setOutputLanguage, children: [
          /* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsx(SelectItem, { value: "English", children: "English" }),
            /* @__PURE__ */ jsx(SelectItem, { value: "Nepali", children: "Nepali" }),
            /* @__PURE__ */ jsx(SelectItem, { value: "Bilingual", children: "Bilingual" })
          ] })
        ] }) }),
        /* @__PURE__ */ jsx(Field, { label: "Agenda / context (optional)", className: "sm:col-span-2", children: /* @__PURE__ */ jsx(Textarea, { rows: 4, placeholder: "Add meeting agenda, important names, or context to improve the minutes. Optional.", value: agenda, onChange: (e) => setAgenda(e.target.value) }) }),
        isPhysical && /* @__PURE__ */ jsx("p", { className: "sm:col-span-2 text-xs text-muted-foreground", children: "Date and time will be automatically captured from the recording session." })
      ] }) }),
      isPhysical ? /* @__PURE__ */ jsx(Recorder, { onTranscribe: handleRecorderSuccess, isCreating: createMeeting.isPending || uploadAudio.isPending }) : /* @__PURE__ */ jsx(Uploader, { onTranscribe: handleUploaderSuccess, isCreating: createMeeting.isPending || uploadAudio.isPending })
    ] }),
    /* @__PURE__ */ jsxs("aside", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border bg-card p-5 text-sm shadow-soft", children: [
        /* @__PURE__ */ jsx("h4", { className: "font-semibold", children: "Consent reminder" }),
        /* @__PURE__ */ jsx("p", { className: "mt-2 text-muted-foreground", children: "By continuing, you confirm that meeting participants have consented to recording and AI processing." })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border bg-card p-5 text-sm shadow-soft", children: [
        /* @__PURE__ */ jsx("h4", { className: "font-semibold", children: "Speakers" }),
        /* @__PURE__ */ jsx("p", { className: "mt-2 text-muted-foreground", children: "Speakers are labelled automatically as Speaker 1, Speaker 2, etc. You can rename them later." })
      ] })
    ] })
  ] });
}
function Card({
  title,
  children
}) {
  return /* @__PURE__ */ jsxs("section", { className: "rounded-xl border border-border bg-card p-6 shadow-soft", children: [
    /* @__PURE__ */ jsx("h2", { className: "text-sm font-semibold uppercase tracking-wide text-muted-foreground", children: title }),
    /* @__PURE__ */ jsx("div", { className: "mt-5", children })
  ] });
}
function Field({
  label,
  helper,
  children,
  className
}) {
  return /* @__PURE__ */ jsxs("div", { className: cn("space-y-1.5", className), children: [
    /* @__PURE__ */ jsx(Label, { children: label }),
    children,
    helper && /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: helper })
  ] });
}
function Recorder({
  onTranscribe,
  isCreating
}) {
  const [state, setState] = useState("ready");
  const [seconds, setSeconds] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);
  const intervalRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  useEffect(() => {
    if (state === "recording") {
      intervalRef.current = setInterval(() => setSeconds((s) => s + 1), 1e3);
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
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true
      });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, {
          type: "audio/webm"
        });
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
  const handleStop = async (audioBlob) => {
    setState("stopped");
  };
  const handleUpload = async () => {
    if (chunksRef.current.length === 0) {
      toast.error("No audio recorded");
      return;
    }
    const audioBlob = new Blob(chunksRef.current, {
      type: "audio/webm"
    });
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
  const fmt = (s) => {
    const m = Math.floor(s / 60).toString().padStart(2, "0");
    const r = (s % 60).toString().padStart(2, "0");
    return `00:${m}:${r}`;
  };
  const statusLabel = {
    ready: "Ready to record",
    recording: "Recording",
    paused: "Recording paused",
    stopped: "Recording complete",
    uploading: "Uploading audio..."
  }[state];
  const isDisabled = isCreating || state === "uploading";
  return /* @__PURE__ */ jsxs(Card, { title: "Record meeting", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center rounded-xl border border-dashed border-border bg-surface px-6 py-10 text-center", children: [
      /* @__PURE__ */ jsx("div", { className: cn("grid h-20 w-20 place-items-center rounded-full bg-card shadow-soft", state === "recording" && "ring-4 ring-destructive/20", state === "uploading" && "ring-4 ring-primary/20"), children: state === "uploading" ? /* @__PURE__ */ jsx(Loader2, { className: "h-8 w-8 animate-spin text-primary" }) : /* @__PURE__ */ jsx(Mic, { className: cn("h-8 w-8", state === "recording" ? "text-destructive" : "text-primary") }) }),
      /* @__PURE__ */ jsxs("div", { className: "mt-4 inline-flex items-center gap-2 text-sm font-medium", children: [
        state === "recording" && /* @__PURE__ */ jsx("span", { className: "h-2 w-2 animate-pulse rounded-full bg-destructive" }),
        statusLabel
      ] }),
      /* @__PURE__ */ jsx("div", { className: "mt-2 font-mono text-3xl font-semibold tracking-tight", children: fmt(seconds) }),
      state === "uploading" && uploadProgress > 0 && /* @__PURE__ */ jsxs("div", { className: "mt-4 w-full max-w-sm rounded-lg bg-surface p-2", children: [
        /* @__PURE__ */ jsx("div", { className: "h-2 w-full overflow-hidden rounded-full bg-border", children: /* @__PURE__ */ jsx("div", { className: "h-full bg-primary transition-all", style: {
          width: `${uploadProgress}%`
        } }) }),
        /* @__PURE__ */ jsxs("p", { className: "mt-2 text-xs text-muted-foreground", children: [
          uploadProgress,
          "% uploaded"
        ] })
      ] }),
      /* @__PURE__ */ jsx(Waveform, { active: state === "recording" }),
      /* @__PURE__ */ jsxs("div", { className: "mt-6 flex flex-wrap items-center justify-center gap-2", children: [
        state === "ready" && /* @__PURE__ */ jsxs(Button, { onClick: startRecording, className: "h-10", disabled: isDisabled, children: [
          /* @__PURE__ */ jsx(Mic, { className: "h-4 w-4" }),
          " Start Recording"
        ] }),
        state === "recording" && /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsxs(Button, { variant: "outline", onClick: pauseRecording, disabled: isDisabled, children: [
            /* @__PURE__ */ jsx(Pause, { className: "h-4 w-4" }),
            " Pause Recording"
          ] }),
          /* @__PURE__ */ jsxs(Button, { variant: "destructive", onClick: stopRecording, disabled: isDisabled, children: [
            /* @__PURE__ */ jsx(Square, { className: "h-4 w-4" }),
            " Stop Recording"
          ] })
        ] }),
        state === "paused" && /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsxs(Button, { onClick: resumeRecording, disabled: isDisabled, children: [
            /* @__PURE__ */ jsx(Play, { className: "h-4 w-4" }),
            " Resume Recording"
          ] }),
          /* @__PURE__ */ jsxs(Button, { variant: "destructive", onClick: stopRecording, disabled: isDisabled, children: [
            /* @__PURE__ */ jsx(Square, { className: "h-4 w-4" }),
            " Stop Recording"
          ] })
        ] }),
        state === "stopped" && /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(Button, { variant: "outline", onClick: reset, disabled: isDisabled, children: "Discard" }),
          /* @__PURE__ */ jsx(Button, { onClick: handleUpload, disabled: isDisabled, children: isCreating ? /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 animate-spin" }),
            " Creating..."
          ] }) : "Transcribe Meeting" })
        ] }),
        state === "uploading" && /* @__PURE__ */ jsxs(Button, { disabled: true, className: "h-10", children: [
          /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 animate-spin" }),
          " Processing..."
        ] })
      ] }),
      state === "stopped" && /* @__PURE__ */ jsxs("div", { className: "mt-5 w-full max-w-sm rounded-lg border border-border bg-card p-3 text-left text-xs text-muted-foreground", children: [
        "Playback preview · Duration ",
        fmt(seconds)
      ] })
    ] }),
    /* @__PURE__ */ jsx("p", { className: "mt-3 text-xs text-muted-foreground", children: "Use pause when the meeting is on break or when off-record discussions happen." })
  ] });
}
function Waveform({
  active
}) {
  return /* @__PURE__ */ jsx("div", { className: "mt-4 flex h-10 items-center justify-center gap-1", children: Array.from({
    length: 32
  }).map((_, i) => /* @__PURE__ */ jsx("span", { className: cn("w-1 rounded-full bg-border transition-all", active ? "bg-primary/70" : "bg-border"), style: {
    height: `${active ? 10 + i * 7 % 28 : 6}px`,
    animation: active ? `pulse 1.${i % 9 + 1}s ease-in-out infinite` : void 0
  } }, i)) });
}
function Uploader({
  onTranscribe,
  isCreating
}) {
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const inputRef = useRef(null);
  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a file to upload");
      return;
    }
    let progressInterval;
    try {
      setUploadProgress(0);
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
  return /* @__PURE__ */ jsxs(Card, { title: "Upload recording", children: [
    !file ? /* @__PURE__ */ jsxs("div", { onClick: () => inputRef.current?.click(), className: "flex cursor-pointer flex-col items-center rounded-xl border border-dashed border-border bg-surface px-6 py-10 text-center transition-colors hover:border-primary/40", children: [
      /* @__PURE__ */ jsx("div", { className: "grid h-12 w-12 place-items-center rounded-full bg-accent text-accent-foreground", children: /* @__PURE__ */ jsx(Upload, { className: "h-5 w-5" }) }),
      /* @__PURE__ */ jsx("h3", { className: "mt-4 font-semibold", children: "Upload meeting recording" }),
      /* @__PURE__ */ jsx("p", { className: "mt-1 max-w-md text-sm text-muted-foreground", children: "Upload a downloaded Zoom, Google Meet, Teams, or other meeting recording." }),
      /* @__PURE__ */ jsx("p", { className: "mt-2 text-xs text-muted-foreground", children: "Supported files: MP3, WAV, M4A, WEBM, MP4" }),
      /* @__PURE__ */ jsxs(Button, { type: "button", variant: "outline", className: "mt-5", onClick: (e) => {
        e.stopPropagation();
        inputRef.current?.click();
      }, disabled: isDisabled, children: [
        /* @__PURE__ */ jsx(Upload, { className: "h-4 w-4" }),
        " Upload Recording"
      ] }),
      /* @__PURE__ */ jsx("input", { ref: inputRef, type: "file", accept: ".mp3,.wav,.m4a,.webm,.mp4,audio/*,video/*", className: "hidden", onChange: (e) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
          setFile(selectedFile);
          toast.success(`File selected: ${selectedFile.name}`);
        }
      } })
    ] }) : /* @__PURE__ */ jsxs("div", { className: "rounded-xl border border-border bg-surface p-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsx("div", { className: "grid h-10 w-10 place-items-center rounded-lg bg-accent text-accent-foreground", children: /* @__PURE__ */ jsx(FileAudio, { className: "h-5 w-5" }) }),
        /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
          /* @__PURE__ */ jsx("p", { className: "truncate text-sm font-medium", children: file.name }),
          /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-foreground", children: [
            (file.size / (1024 * 1024)).toFixed(2),
            " MB"
          ] })
        ] }),
        /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "icon", onClick: () => {
          setFile(null);
          setUploadProgress(0);
        }, disabled: isDisabled, children: /* @__PURE__ */ jsx(X, { className: "h-4 w-4" }) })
      ] }),
      uploadProgress > 0 && uploadProgress < 100 && /* @__PURE__ */ jsxs("div", { className: "mt-4 rounded-lg bg-card p-3", children: [
        /* @__PURE__ */ jsx("div", { className: "h-2 w-full overflow-hidden rounded-full bg-border", children: /* @__PURE__ */ jsx("div", { className: "h-full bg-primary transition-all", style: {
          width: `${uploadProgress}%`
        } }) }),
        /* @__PURE__ */ jsxs("p", { className: "mt-2 text-center text-xs text-muted-foreground", children: [
          Math.round(uploadProgress),
          "% uploaded"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mt-5 flex justify-end gap-2", children: [
      file && /* @__PURE__ */ jsx(Button, { variant: "outline", onClick: () => {
        setFile(null);
        setUploadProgress(0);
      }, disabled: isDisabled, children: "Choose Different File" }),
      /* @__PURE__ */ jsx(Button, { disabled: !file || isDisabled, onClick: handleUpload, children: isCreating ? /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 animate-spin" }),
        " Creating..."
      ] }) : uploadProgress > 0 ? /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 animate-spin" }),
        " Uploading..."
      ] }) : "Upload and Transcribe" })
    ] })
  ] });
}
export {
  NewMeetingPage as component
};
