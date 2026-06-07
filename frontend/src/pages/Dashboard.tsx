import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  LogOut,
  FileText,
  Clock,
  CheckCircle2,
  Loader2,
  AlertCircle,
  ChevronRight,
  Mic,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { meetingsApi } from "../api/client";
import type { MeetingListItem, MeetingStatus } from "../types";
import { STATUS_LABEL } from "../types";
import { Logo } from "../components/Logo";

const statusStyles: Record<MeetingStatus, { dot: string; pill: string }> = {
  pending:      { dot: "bg-slate-400",   pill: "bg-slate-100 text-slate-700" },
  transcribing: { dot: "bg-amber-500",   pill: "bg-amber-50 text-amber-700 border border-amber-200" },
  summarising:  { dot: "bg-blue-500",    pill: "bg-blue-50 text-blue-700 border border-blue-200" },
  separating:   { dot: "bg-violet-500",  pill: "bg-violet-50 text-violet-700 border border-violet-200" },
  generating:   { dot: "bg-indigo-500",  pill: "bg-indigo-50 text-indigo-700 border border-indigo-200" },
  done:         { dot: "bg-emerald-500", pill: "bg-emerald-50 text-emerald-700 border border-emerald-200" },
  failed:       { dot: "bg-red-500",     pill: "bg-red-50 text-red-700 border border-red-200" },
};

function formatDate(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffH = diffMs / (1000 * 60 * 60);
  if (diffH < 1) {
    const m = Math.max(1, Math.round(diffMs / 60000));
    return `${m}m ago`;
  }
  if (diffH < 24) return `${Math.round(diffH)}h ago`;
  if (diffH < 24 * 7) return `${Math.round(diffH / 24)}d ago`;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [meetings, setMeetings] = useState<MeetingListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<"all" | "done" | "processing">("all");
  const [query, setQuery] = useState("");

  useEffect(() => {
    meetingsApi
      .list()
      .then((res) => setMeetings(res.data.meetings))
      .catch(() => setError("Failed to load meetings"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return meetings.filter((m) => {
      if (filter === "done" && m.status !== "done") return false;
      if (filter === "processing" && ["done", "failed"].includes(m.status)) return false;
      if (query && !m.title.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  }, [meetings, filter, query]);

  const stats = useMemo(
    () => ({
      total: meetings.length,
      done: meetings.filter((m) => m.status === "done").length,
      processing: meetings.filter((m) => !["done", "failed"].includes(m.status)).length,
    }),
    [meetings]
  );

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : user?.email?.[0]?.toUpperCase() ?? "?";

  const firstName = user?.name?.split(" ")[0];

  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col">
      {/* Topbar */}
      <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Logo size="sm" />

          <nav className="hidden md:flex items-center gap-1 text-sm">
            <button className="rounded-md px-3 py-1.5 font-medium text-brand-700 bg-brand-50">
              Meetings
            </button>
            <button className="rounded-md px-3 py-1.5 font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-100">
              Workspace
            </button>
            <button className="rounded-md px-3 py-1.5 font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-100">
              Settings
            </button>
          </nav>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => navigate("/meetings/new")}
              className="btn-primary !py-2 text-sm"
            >
              <Plus size={15} strokeWidth={2.5} />
              <span className="hidden sm:inline">New meeting</span>
            </button>

            <div className="group relative">
              <button
                className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-white text-sm font-semibold ring-2 ring-white shadow-soft"
                title={user?.email}
              >
                {initials}
              </button>
              <div className="invisible absolute right-0 top-11 z-30 w-56 origin-top-right scale-95 rounded-xl border border-slate-200 bg-white p-2 opacity-0 shadow-card transition-all duration-150 group-hover:visible group-hover:scale-100 group-hover:opacity-100">
                <div className="px-2.5 py-2 border-b border-slate-100 mb-1">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    {user?.name || "Account"}
                  </p>
                  <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                </div>
                <button
                  onClick={logout}
                  className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-sm text-slate-700 hover:bg-slate-100"
                >
                  <LogOut size={14} />
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10">
        {/* Greeting */}
        <div className="animate-fade-up mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-1.5 inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700">
              <Sparkles size={12} /> AI minutes ready
            </p>
            <h1 className="font-display text-3xl font-bold tracking-tight text-slate-900">
              {firstName ? `Good to see you, ${firstName}.` : "Your meetings"}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {stats.total === 0
                ? "Upload your first recording and we'll generate polished minutes."
                : `${stats.total} meeting${stats.total !== 1 ? "s" : ""} · ${stats.done} complete`}
            </p>
          </div>
        </div>

        {/* Stat tiles */}
        {stats.total > 0 && (
          <div className="animate-fade-up mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard label="Total meetings" value={stats.total} icon={FileText} tint="brand" />
            <StatCard label="Complete" value={stats.done} icon={CheckCircle2} tint="emerald" />
            <StatCard label="Processing" value={stats.processing} icon={Loader2} tint="amber" spin={stats.processing > 0} />
          </div>
        )}

        {/* Toolbar */}
        {stats.total > 0 && (
          <div className="animate-fade-up mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1 shadow-soft">
              {([
                ["all", "All"],
                ["done", "Complete"],
                ["processing", "Processing"],
              ] as const).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  className={`rounded-md px-3.5 py-1.5 text-sm font-medium transition-colors ${
                    filter === key
                      ? "bg-slate-900 text-white"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-72">
              <Search
                size={15}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search meetings…"
                className="input !py-2 pl-9"
              />
            </div>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-24">
            <div className="spinner" />
          </div>
        ) : error ? (
          <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle size={16} className="mt-0.5" />
            {error}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            filter={filter}
            onCreate={() => navigate("/meetings/new")}
          />
        ) : (
          <ul className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((m, i) => (
              <li
                key={m.id}
                className="animate-fade-up"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <MeetingCard meeting={m} onClick={() => navigate(`/meetings/${m.id}`)} />
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  tint,
  spin,
}: {
  label: string;
  value: number;
  icon: any;
  tint: "brand" | "emerald" | "amber";
  spin?: boolean;
}) {
  const tintMap = {
    brand: "bg-brand-50 text-brand-700",
    emerald: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
  };
  return (
    <div className="card flex items-center gap-4 p-5">
      <div className={`grid h-11 w-11 place-items-center rounded-xl ${tintMap[tint]}`}>
        <Icon size={20} className={spin ? "animate-spin" : ""} />
      </div>
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
          {label}
        </p>
        <p className="font-display text-2xl font-bold text-slate-900 leading-tight">
          {value}
        </p>
      </div>
    </div>
  );
}

function MeetingCard({
  meeting,
  onClick,
}: {
  meeting: MeetingListItem;
  onClick: () => void;
}) {
  const s = statusStyles[meeting.status];
  const isProcessing = !["done", "failed"].includes(meeting.status);

  return (
    <button
      onClick={onClick}
      className="group card relative w-full overflow-hidden p-5 text-left transition-all hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-card"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-500 group-hover:bg-brand-50 group-hover:text-brand-600 transition-colors">
          <Mic size={18} />
        </div>
        <ChevronRight
          size={16}
          className="mt-1 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-brand-600"
        />
      </div>

      <h3 className="mt-4 line-clamp-2 font-semibold text-slate-900 leading-snug">
        {meeting.title || "Untitled meeting"}
      </h3>

      <div className="mt-4 flex items-center justify-between text-xs">
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 font-medium ${s.pill}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${s.dot} ${isProcessing ? "animate-pulse" : ""}`} />
          {STATUS_LABEL[meeting.status]}
        </span>
        <span className="flex items-center gap-1 text-slate-400">
          <Clock size={11} />
          {formatDate(meeting.created_at)}
        </span>
      </div>
    </button>
  );
}

function EmptyState({
  filter,
  onCreate,
}: {
  filter: "all" | "done" | "processing";
  onCreate: () => void;
}) {
  return (
    <div className="animate-fade-up card flex flex-col items-center justify-center px-6 py-20 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-50 text-brand-600 mb-4">
        <Mic size={24} />
      </div>
      <h3 className="font-display text-lg font-semibold text-slate-900">
        {filter === "all" ? "No meetings yet" : `No ${filter} meetings`}
      </h3>
      <p className="mt-1.5 max-w-sm text-sm text-slate-500">
        {filter === "all"
          ? "Upload a recording and EchoNote will turn it into polished minutes automatically."
          : `You don't have any ${filter} meetings right now.`}
      </p>
      {filter === "all" && (
        <button onClick={onCreate} className="btn-primary mt-6">
          <Plus size={15} strokeWidth={2.5} />
          Upload your first meeting
        </button>
      )}
    </div>
  );
}
