import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Plus, FileText, Download, Eye, Mic, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMemo, useState } from "react";
import { Meeting, MeetingStatus } from "@/types";
import { useDeleteMeeting, useDownloadPDF, useMeetings } from "@/hooks/use-api";
import { toast } from "sonner";

export const Route = createFileRoute("/meetings")({
  head: () => ({
    meta: [
      { title: "Meetings - MeetingIQ" },
      { name: "description", content: "View, transcribe and generate minutes for your meetings." },
    ],
  }),
  component: MeetingsPage,
});

const statusStyles: Record<string, string> = {
  [MeetingStatus.PENDING]: "bg-slate-100 text-slate-700",
  [MeetingStatus.TRANSCRIBING]: "bg-amber-50 text-amber-700",
  [MeetingStatus.SUMMARIZING]: "bg-amber-50 text-amber-700",
  [MeetingStatus.GENERATING]: "bg-blue-50 text-blue-700",
  [MeetingStatus.DONE]: "bg-emerald-50 text-emerald-700",
  [MeetingStatus.FAILED]: "bg-red-50 text-red-700",
};

function MeetingsPage() {
  const [tab, setTab] = useState("all");
  const meetingsQuery = useMeetings();
  const meetings = useMemo(() => meetingsQuery.data ?? [], [meetingsQuery.data]);

  const filtered = useMemo(() => {
    switch (tab) {
      case "processing":
        return meetings.filter((meeting) =>
          [
            MeetingStatus.PENDING,
            MeetingStatus.TRANSCRIBING,
            MeetingStatus.SUMMARIZING,
            MeetingStatus.GENERATING,
          ].includes(meeting.status as MeetingStatus),
        );
      case "completed":
        return meetings.filter((meeting) => meeting.status === MeetingStatus.DONE);
      case "failed":
        return meetings.filter((meeting) => meeting.status === MeetingStatus.FAILED);
      default:
        return meetings;
    }
  }, [tab, meetings]);

  return (
    <AppShell>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Meetings</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Record, upload, transcribe and generate minutes.
          </p>
        </div>
        <Button asChild className="h-10">
          <Link to="/new-meeting">
            <Plus className="h-4 w-4" /> New Meeting
          </Link>
        </Button>
      </div>

      <Tabs value={tab} onValueChange={setTab} className="mt-8">
        <TabsList className="bg-card">
          <TabsTrigger value="all">All Meetings</TabsTrigger>
          <TabsTrigger value="processing">Processing</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="failed">Failed</TabsTrigger>
        </TabsList>

        <TabsContent value={tab} className="mt-6">
          {meetingsQuery.isLoading ? (
            <div className="rounded-xl border border-border bg-card p-8 text-sm text-muted-foreground shadow-soft">
              Loading meetings...
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState />
          ) : (
            <MeetingsTable rows={filtered} />
          )}
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}

function MeetingsTable({ rows }: { rows: Meeting[] }) {
  const navigate = useNavigate();
  const downloadPDF = useDownloadPDF();
  const deleteMeeting = useDeleteMeeting();

  const openMeeting = (meeting: Meeting) => {
    if (meeting.status === MeetingStatus.DONE) {
      navigate({ to: "/meetings/$meetingId", params: { meetingId: String(meeting.id) } });
      return;
    }
    navigate({ to: "/processing", search: { meetingId: meeting.id } });
  };

  const deleteRow = async (meeting: Meeting) => {
    try {
      await deleteMeeting.mutateAsync(meeting.id);
      toast.success("Meeting deleted");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete meeting");
    }
  };

  const download = async (meeting: Meeting) => {
    if (meeting.status !== MeetingStatus.DONE) {
      toast.error("PDF is not ready yet");
      return;
    }
    try {
      await downloadPDF.mutateAsync(meeting.id);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to download PDF");
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-soft">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-surface text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-5 py-3 text-left font-medium">Meeting Title</th>
              <th className="px-5 py-3 text-left font-medium">Status</th>
              <th className="px-5 py-3 text-left font-medium">Created</th>
              <th className="px-5 py-3 text-left font-medium">Completed</th>
              <th className="px-5 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((meeting) => (
              <tr
                key={meeting.id}
                className="border-b border-border last:border-0 hover:bg-surface/60"
              >
                <td className="px-5 py-4 font-medium text-foreground">{meeting.title}</td>
                <td className="px-5 py-4">
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
                      statusStyles[meeting.status] ?? "bg-slate-100 text-slate-700",
                    )}
                  >
                    {formatStatus(meeting.status)}
                  </span>
                </td>
                <td className="px-5 py-4 text-muted-foreground">
                  {formatDate(meeting.created_at)}
                </td>
                <td className="px-5 py-4 text-muted-foreground">
                  {formatDate(meeting.completed_at)}
                </td>
                <td className="px-5 py-4 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openMeeting(meeting)}>
                        <Eye className="h-4 w-4" /> Open
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => download(meeting)}
                        disabled={meeting.status !== MeetingStatus.DONE}
                      >
                        <Download className="h-4 w-4" /> Download PDF
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => openMeeting(meeting)}
                        disabled={meeting.status !== MeetingStatus.DONE}
                      >
                        <FileText className="h-4 w-4" /> Edit Minutes
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => deleteRow(meeting)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function EmptyState() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card px-6 py-16 text-center shadow-soft">
      <div className="grid h-12 w-12 place-items-center rounded-full bg-accent text-accent-foreground">
        <Mic className="h-5 w-5" />
      </div>
      <h3 className="mt-4 text-lg font-semibold">No meetings here</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        Record a meeting or upload a recording to generate minutes.
      </p>
      <Button className="mt-6" onClick={() => navigate({ to: "/new-meeting" })}>
        <Plus className="h-4 w-4" /> New Meeting
      </Button>
    </div>
  );
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
