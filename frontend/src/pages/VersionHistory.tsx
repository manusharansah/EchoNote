import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  GitCompareArrows,
  History,
  Download,
  FileText,
  Eye,
  Check,
} from "lucide-react";
import api, { versionsApi, meetingsApi } from "../api/client";
import type { VersionListItem } from "../types";
import DiffViewer from "../components/DiffViewer";
import { AppHeader } from "../components/AppHeader";
import AuthedPDFViewer from "../components/AuthedPDFViewer";

async function downloadAuthedPdf(url: string, fileName: string) {
  try {
    const res = await api.get(url, { responseType: "blob" });
    const blobUrl = URL.createObjectURL(
      new Blob([res.data], { type: "application/pdf" })
    );
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
  } catch {
    alert("Could not download PDF.");
  }
}

type ViewMode = "list" | "diff";

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function VersionHistory() {
  const { id } = useParams<{ id: string }>();
  const meetingId = Number(id);
  const navigate = useNavigate();

  const [versions, setVersions] = useState<VersionListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [meetingTitle, setMeetingTitle] = useState("");
  const [selected, setSelected] = useState<number[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [diffData, setDiffData] = useState<{
    v1: { version_number: number; markdown: string; created_at: string };
    v2: { version_number: number; markdown: string; created_at: string };
  } | null>(null);
  const [diffLoading, setDiffLoading] = useState(false);
  const [previewVersion, setPreviewVersion] = useState<number | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [versionsRes, meetingRes] = await Promise.all([
          versionsApi.list(meetingId),
          meetingsApi.get(meetingId),
        ]);
        setVersions(versionsRes.data);
        setMeetingTitle(meetingRes.data.title);
      } catch {
        setError("Failed to load version history");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [meetingId]);

  const toggleSelect = (vn: number) => {
    setSelected((prev) => {
      if (prev.includes(vn)) return prev.filter((v) => v !== vn);
      if (prev.length >= 2) return [prev[1], vn];
      return [...prev, vn];
    });
  };

  const handleCompare = async () => {
    if (selected.length !== 2) return;
    setDiffLoading(true);
    try {
      const [v1, v2] = [...selected].sort((a, b) => a - b);
      const res = await versionsApi.diff(meetingId, v1, v2);
      setDiffData(res.data);
      setViewMode("diff");
    } catch {
      alert("Failed to load diff");
    } finally {
      setDiffLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
        <div className="flex flex-col items-center gap-3">
          <div className="spinner" />
          <p className="text-sm text-slate-500">Loading versions…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col">
      <AppHeader
        back={
          viewMode === "diff"
            ? { to: `/meetings/${meetingId}/versions`, label: "Versions" }
            : { to: `/meetings/${meetingId}`, label: "Meeting" }
        }
        crumbs={[
          { label: meetingTitle || "Meeting", to: `/meetings/${meetingId}` },
          { label: viewMode === "diff" ? "Diff view" : "Versions" },
        ]}
        right={
          viewMode === "list" && selected.length === 2 ? (
            <button
              onClick={handleCompare}
              disabled={diffLoading}
              className="btn-primary !py-2 text-sm"
            >
              {diffLoading ? (
                <>
                  <div className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                  Loading…
                </>
              ) : (
                <>
                  <GitCompareArrows size={14} />
                  Compare v{Math.min(...selected)} & v{Math.max(...selected)}
                </>
              )}
            </button>
          ) : null
        }
      />

      {error && (
        <div className="mx-auto mt-5 w-full max-w-3xl px-6">
          <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
            {error}
          </div>
        </div>
      )}

      {/* Diff view */}
      {viewMode === "diff" && diffData && (
        <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">
          <DiffViewer v1={diffData.v1} v2={diffData.v2} />
        </main>
      )}

      {/* List view */}
      {viewMode === "list" && (
        <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
          <div className="animate-fade-up mb-6 flex items-end justify-between">
            <div>
              <p className="mb-1.5 inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700">
                <History size={12} /> Version history
              </p>
              <h1 className="font-display text-3xl font-bold tracking-tight text-slate-900">
                All versions
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                {versions.length} saved version{versions.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          {versions.length >= 2 && (
            <div className="animate-fade-up mb-5 flex items-start gap-2 rounded-lg border border-brand-200 bg-brand-50/50 px-3.5 py-2.5 text-sm text-brand-800">
              <GitCompareArrows size={15} className="mt-0.5 flex-shrink-0" />
              <span>
                Select any two versions to compare them side-by-side.
                {selected.length > 0 && (
                  <span className="ml-1.5 font-semibold">
                    {selected.length}/2 selected
                  </span>
                )}
              </span>
            </div>
          )}

          {versions.length === 0 ? (
            <div className="card flex flex-col items-center justify-center px-6 py-20 text-center">
              <div className="mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-slate-100 text-slate-500">
                <FileText size={20} />
              </div>
              <h3 className="font-display text-lg font-semibold text-slate-900">
                No versions yet
              </h3>
              <p className="mt-1.5 max-w-sm text-sm text-slate-500">
                Edit and save your minutes to create version snapshots.
              </p>
              <button
                onClick={() => navigate(`/meetings/${meetingId}`)}
                className="btn-secondary mt-5"
              >
                Go to meeting
              </button>
            </div>
          ) : (
            <ul className="flex flex-col gap-3">
              {versions.map((version, index) => {
                const isSelected = selected.includes(version.version_number);
                const isPreview = previewVersion === version.version_number;
                const isLatest = index === 0;
                return (
                  <li
                    key={version.id}
                    className={`card overflow-hidden transition-all ${
                      isSelected
                        ? "ring-2 ring-brand-500 border-brand-300"
                        : "hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-4 px-5 py-4">
                      <button
                        onClick={() => toggleSelect(version.version_number)}
                        className={`grid h-5 w-5 flex-shrink-0 place-items-center rounded-md border transition ${
                          isSelected
                            ? "border-brand-600 bg-brand-600 text-white"
                            : "border-slate-300 bg-white hover:border-brand-400"
                        }`}
                        aria-label={isSelected ? "Deselect" : "Select"}
                      >
                        {isSelected && <Check size={13} strokeWidth={3} />}
                      </button>

                      <div className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700 font-display font-bold text-sm">
                        v{version.version_number}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900">
                            Version {version.version_number}
                          </span>
                          {isLatest && (
                            <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-700 border border-emerald-200">
                              Latest
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500">
                          Saved {formatDate(version.created_at)}
                        </p>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() =>
                            setPreviewVersion(isPreview ? null : version.version_number)
                          }
                          className="btn-ghost !py-1.5 text-xs"
                        >
                          <Eye size={13} />
                          {isPreview ? "Hide" : "Preview"}
                        </button>
                        <button
                          onClick={() =>
                            downloadAuthedPdf(
                              versionsApi.pdfUrl(meetingId, version.version_number),
                              `minutes_v${version.version_number}.pdf`
                            )
                          }
                          className="btn-ghost !py-1.5 text-xs"
                        >
                          <Download size={13} />
                          PDF
                        </button>
                      </div>
                    </div>

                    {isPreview && (
                      <div className="border-t border-slate-200 bg-slate-50/50 px-5 py-3">
                        <AuthedPDFViewer
                          url={versionsApi.pdfUrl(meetingId, version.version_number)}
                          fileName={`minutes_v${version.version_number}.pdf`}
                          className="!h-[60vh]"
                        />
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </main>
      )}
    </div>
  );
}
