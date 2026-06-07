import { useEffect, useRef, useState } from "react";
import {
  UploadCloud,
  Mic,
  FileText,
  ListOrdered,
  FileOutput,
  Check,
  AlertCircle,
  Bell,
  BellOff,
} from "lucide-react";
import { meetingsApi } from "../api/client";
import type { MeetingStatusResponse } from "../types";
import { STATUS_LABEL } from "../types";
import {
  ensureNotificationPermission,
  notificationPermission,
  notificationsSupported,
  notify,
} from "../lib/notifications";

interface Props {
  meetingId: number;
  onComplete: () => void;
  onFailed: (error: string) => void;
}

const STAGES = [
  { key: "uploading",    label: "Upload",     Icon: UploadCloud, pct: 0 },
  { key: "transcribing", label: "Transcribe", Icon: Mic,         pct: 20 },
  { key: "summarizing",  label: "Summarise",  Icon: FileText,    pct: 45 },
  { key: "structuring",  label: "Structure",  Icon: ListOrdered, pct: 70 },
  { key: "pdf",          label: "PDF",        Icon: FileOutput,  pct: 85 },
  { key: "done",         label: "Done",       Icon: Check,       pct: 100 },
];

export default function PipelineProgress({ meetingId, onComplete, onFailed }: Props) {
  const [status, setStatus] = useState<MeetingStatusResponse | null>(null);
  const notifiedRef = useRef(false);
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">(
    notificationPermission()
  );

  // Proactively ask for notification permission once when the pipeline mounts.
  useEffect(() => {
    if (!notificationsSupported()) return;
    if (Notification.permission === "default") {
      ensureNotificationPermission().then((p) => setPermission(p));
    }
  }, []);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    const poll = async () => {
      try {
        const res = await meetingsApi.getStatus(meetingId);
        setStatus(res.data);
        if (res.data.status === "done") {
          clearInterval(interval);
          if (!notifiedRef.current) {
            notifiedRef.current = true;
            notify("Minutes ready", {
              body: "Your meeting minutes have been generated.",
              tag: `meeting-${meetingId}`,
              onlyWhenHidden: true,
              onClick: () => {
                window.location.href = `/meetings/${meetingId}`;
              },
            });
          }
          onComplete();
        } else if (res.data.status === "failed") {
          clearInterval(interval);
          if (!notifiedRef.current) {
            notifiedRef.current = true;
            notify("Processing failed", {
              body: res.data.error_message || "Pipeline failed",
              tag: `meeting-${meetingId}`,
              onlyWhenHidden: true,
            });
          }
          onFailed(res.data.error_message || "Pipeline failed");
        }
      } catch {
        // swallow
      }
    };
    poll();
    interval = setInterval(poll, 2000);
    return () => clearInterval(interval);
  }, [meetingId]);

  const requestPerm = async () => {
    const p = await ensureNotificationPermission();
    setPermission(p);
  };

  if (!status) {
    return (
      <div className="flex items-center justify-center gap-3 py-10 text-slate-500">
        <div className="spinner" />
        <span className="text-base">Initialising pipeline…</span>
      </div>
    );
  }

  const pct = Math.max(0, status.progress_pct);
  const label = STATUS_LABEL[status.status];
  const isFailed = status.status === "failed";
  const isDone = pct >= 100;

  // Circular ring geometry
  const size = 220;
  const stroke = 14;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const displayPct = isFailed ? 100 : pct;
  const offset = circumference - (displayPct / 100) * circumference;

  // Currently-active stage (highest reached, but not yet completed)
  const activeStage =
    [...STAGES].reverse().find((s) => pct >= s.pct) ?? STAGES[0];
  const ActiveIcon = isFailed
    ? AlertCircle
    : isDone
      ? Check
      : activeStage.Icon;

  const ringColor = isFailed
    ? "stroke-red-500"
    : isDone
      ? "stroke-emerald-500"
      : "stroke-brand-600";

  return (
    <div className="flex flex-col items-center gap-8">
      {/* Notification status */}
      {permission !== "unsupported" && !isDone && !isFailed && (
        <div className="w-full flex justify-center">
          {permission === "granted" ? (
            <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
              <Bell size={12} strokeWidth={2.4} />
              You'll be notified when it's done
            </div>
          ) : permission === "denied" ? (
            <div className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-500">
              <BellOff size={12} strokeWidth={2.4} />
              Notifications blocked in browser settings
            </div>
          ) : (
            <button
              type="button"
              onClick={requestPerm}
              className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700 hover:bg-brand-100 transition-colors"
            >
              <Bell size={12} strokeWidth={2.4} />
              Enable notifications
            </button>
          )}
        </div>
      )}


      {/* Circular progress */}
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          className="-rotate-90"
          aria-hidden="true"
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={stroke}
            className="stroke-slate-100 fill-none"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={stroke}
            strokeLinecap="round"
            className={`fill-none transition-all duration-700 ease-out ${ringColor}`}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>

        {/* Inner content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
          <div
            className={`grid h-12 w-12 place-items-center rounded-2xl ${
              isFailed
                ? "bg-red-50 text-red-600"
                : isDone
                  ? "bg-emerald-50 text-emerald-600"
                  : "bg-brand-50 text-brand-700"
            }`}
          >
            <ActiveIcon size={22} strokeWidth={2.2} />
          </div>
          {!isFailed && (
            <div className="font-mono text-3xl font-bold tabular-nums text-slate-900">
              {pct}%
            </div>
          )}
          <div
            className={`text-xs font-semibold uppercase tracking-wider ${
              isFailed
                ? "text-red-600"
                : isDone
                  ? "text-emerald-600"
                  : "text-slate-500"
            }`}
          >
            {isFailed ? "Failed" : isDone ? "Complete" : activeStage.label}
          </div>
        </div>
      </div>

      {/* Status label */}
      <div className="text-center">
        <p
          className={`text-base font-semibold ${
            isFailed ? "text-red-700" : "text-slate-900"
          }`}
        >
          {label}
        </p>
        {!isFailed && !isDone && (
          <p className="mt-1 text-sm text-slate-500">
            This usually takes 1–3 minutes
          </p>
        )}
      </div>

      {/* Stage chips */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {STAGES.map((s) => {
          const reached = !isFailed && pct >= s.pct;
          const isCurrent =
            !isFailed && !isDone && s.key === activeStage.key && s.pct < 100;
          return (
            <div
              key={s.key}
              className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${
                isFailed
                  ? "border-slate-200 bg-white text-slate-400"
                  : isCurrent
                    ? "border-brand-300 bg-brand-50 text-brand-700"
                    : reached
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-slate-200 bg-white text-slate-400"
              }`}
            >
              {reached && !isCurrent ? (
                <Check size={12} strokeWidth={3} />
              ) : (
                <s.Icon size={12} strokeWidth={2.2} />
              )}
              {s.label}
            </div>
          );
        })}
      </div>

      {/* Error */}
      {isFailed && status.error_message && (
        <div className="flex w-full items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
          <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
          <span>{status.error_message}</span>
        </div>
      )}
    </div>
  );
}
