import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Download,
  History,
  FileText,
  Pencil,
  AlertCircle,
  Check,
  ArrowLeft,
} from "lucide-react";
import api, { meetingsApi } from "../api/client";
import type { Meeting } from "../types";
import PipelineProgress from "../components/PipelineProgress";
import MarkdownEditor from "../components/MarkdownEditor";
import { AppHeader } from "../components/AppHeader";
import AuthedPDFViewer from "../components/AuthedPDFViewer";

type Panel = "pdf" | "edit";

export default function MeetingDetail() {
  const { id } = useParams<{ id: string }>();
  const meetingId = Number(id);
  const navigate = useNavigate();

  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [panel, setPanel] = useState<Panel>("pdf");
  const [markdown, setMarkdown] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [pipelineError, setPipelineError] = useState("");

  const fetchMeeting = async () => {
    try {
      const res = await meetingsApi.get(meetingId);
      setMeeting(res.data);
      if (res.data.markdown) setMarkdown(res.data.markdown);
    } catch {
      setError("Meeting not found");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeeting();
  }, [meetingId]);

  const handlePipelineComplete = async () => {
    const res = await meetingsApi.get(meetingId);
    setMeeting(res.data);
    if (res.data.markdown) setMarkdown(res.data.markdown);
  };

  const handleSave = async (newMarkdown: string) => {
    setSaving(true);
    setSaveSuccess(false);
    try {
      await meetingsApi.saveVersion(meetingId, newMarkdown);
      setMarkdown(newMarkdown);
      setSaveSuccess(true);
      const res = await meetingsApi.get(meetingId);
      setMeeting(res.data);
      setPanel("pdf");
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      alert(err.response?.data?.detail || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
        <div className="flex flex-col items-center gap-3">
          <div className="spinner" />
          <p className="text-sm text-slate-500">Loading meeting…</p>
        </div>
      </div>
    );
  }

  if (error || !meeting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg)] px-6">
        <div className="card max-w-sm px-8 py-10 text-center">
          <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-red-50 text-red-600">
            <AlertCircle size={22} />
          </div>
          <p className="font-semibold text-slate-900">{error || "Meeting not found"}</p>
          <button
            onClick={() => navigate("/dashboard")}
            className="btn-ghost mt-4"
          >
            <ArrowLeft size={14} /> Back to dashboard
          </button>
        </div>
      </div>
    );
  }

  const isDone = meeting.status === "done";
  const isProcessing = !["done", "failed"].includes(meeting.status);
  const isFailed = meeting.status === "failed";

  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col">
      <AppHeader
        back={{ to: "/dashboard", label: "Dashboard" }}
        crumbs={[{ label: meeting.title }]}
        badge={
          isDone ? (
            <span className="ml-2 inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Complete
            </span>
          ) : null
        }
        right={
          isDone ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate(`/meetings/${meetingId}/versions`)}
                className="btn-secondary !py-2 text-sm hidden sm:inline-flex"
              >
                <History size={14} /> History
              </button>
              <button
                onClick={async () => {
                  try {
                    const res = await api.get(meetingsApi.pdfUrl(meetingId), {
                      responseType: "blob",
                    });
                    const blobUrl = URL.createObjectURL(
                      new Blob([res.data], { type: "application/pdf" })
                    );
                    const a = document.createElement("a");
                    a.href = blobUrl;
                    a.download = `minutes_${meetingId}.pdf`;
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                    setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
                  } catch {
                    alert("Could not download PDF.");
                  }
                }}
                className="btn-primary !py-2 text-sm"
              >
                <Download size={14} /> Download PDF
              </button>
            </div>
          ) : null
        }
      />

      {/* Pipeline progress */}
      {isProcessing && (
        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-2xl px-6 py-8">
            <PipelineProgress
              meetingId={meetingId}
              onComplete={handlePipelineComplete}
              onFailed={(err) => setPipelineError(err)}
            />
            {pipelineError && (
              <div className="mt-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
                <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                <span>{pipelineError}</span>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Save toast */}
      {saveSuccess && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl border border-emerald-200 bg-white px-4 py-2.5 shadow-card animate-fade-up">
          <Check size={15} strokeWidth={3} className="text-emerald-600" />
          <span className="text-sm font-medium text-slate-900">
            Version saved & PDF regenerated
          </span>
        </div>
      )}

      {/* Done panel view */}
      {isDone && (
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="border-b border-slate-200 bg-white">
            <div className="mx-auto flex max-w-6xl items-center gap-1 px-6">
              {(["pdf", "edit"] as Panel[]).map((p) => {
                const Icon = p === "pdf" ? FileText : Pencil;
                const active = panel === p;
                return (
                  <button
                    key={p}
                    onClick={() => setPanel(p)}
                    className={`relative flex items-center gap-1.5 px-3 py-3 text-sm font-medium transition-colors ${
                      active ? "text-brand-700" : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    <Icon size={14} />
                    {p === "pdf" ? "PDF Preview" : "Edit Minutes"}
                    {active && (
                      <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-brand-600" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mx-auto w-full max-w-6xl flex-1 px-6 py-6">
            {panel === "pdf" && (
              <AuthedPDFViewer
                url={meetingsApi.pdfUrl(meetingId)}
                fileName={`minutes_${meetingId}.pdf`}
              />
            )}
            {panel === "edit" && (
              <div className="h-[80vh] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-soft">
                <MarkdownEditor
                  initialValue={markdown}
                  onSave={handleSave}
                  saving={saving}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Failed */}
      {isFailed && (
        <div className="flex flex-1 items-center justify-center px-6 py-10">
          <div className="card max-w-md px-8 py-10 text-center">
            <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-red-50 text-red-600">
              <AlertCircle size={26} />
            </div>
            <h2 className="font-display text-xl font-bold text-slate-900">
              Pipeline failed
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              {meeting.error_message ||
                "Something went wrong while processing this meeting. Please try uploading again."}
            </p>
            <button
              onClick={() => navigate("/meetings/new")}
              className="btn-primary mt-6"
            >
              Upload another meeting
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
