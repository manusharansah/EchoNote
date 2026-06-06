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
import { MoreHorizontal, Plus, FileText, Download, Sparkles, Eye, Mic } from "lucide-react";
import { mockMeetings, type Meeting, type MeetingStatus } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/meetings")({
  head: () => ({
    meta: [
      { title: "Meetings — MeetingIQ" },
      { name: "description", content: "View, transcribe and generate minutes for your meetings." },
    ],
  }),
  component: MeetingsPage,
});

const statusStyles: Record<MeetingStatus, string> = {
  Recorded: "bg-slate-100 text-slate-700",
  Uploaded: "bg-slate-100 text-slate-700",
  Transcribing: "bg-amber-50 text-amber-700",
  "Transcript Ready": "bg-blue-50 text-blue-700",
  "Minutes Processing": "bg-amber-50 text-amber-700",
  "Minutes Ready": "bg-emerald-50 text-emerald-700",
  Completed: "bg-emerald-50 text-emerald-700",
};

function MeetingsPage() {
  const [tab, setTab] = useState("all");
  const meetings: Meeting[] = mockMeetings;

  const filtered = useMemo(() => {
    switch (tab) {
      case "physical":
        return meetings.filter((m) => m.type === "Physical");
      case "online":
        return meetings.filter((m) => m.type !== "Physical");
      case "processing":
        return meetings.filter((m) =>
          ["Transcribing", "Minutes Processing", "Uploaded", "Recorded"].includes(m.status),
        );
      case "completed":
        return meetings.filter((m) =>
          ["Completed", "Minutes Ready"].includes(m.status),
        );
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
          <TabsTrigger value="physical">Physical</TabsTrigger>
          <TabsTrigger value="online">Online Recordings</TabsTrigger>
          <TabsTrigger value="processing">Processing</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value={tab} className="mt-6">
          {filtered.length === 0 ? <EmptyState /> : <MeetingsTable rows={filtered} />}
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}

function MeetingsTable({ rows }: { rows: Meeting[] }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-soft">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-surface text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-5 py-3 text-left font-medium">Meeting Title</th>
              <th className="px-5 py-3 text-left font-medium">Type</th>
              <th className="px-5 py-3 text-left font-medium">Workspace</th>
              <th className="px-5 py-3 text-left font-medium">Language</th>
              <th className="px-5 py-3 text-left font-medium">Status</th>
              <th className="px-5 py-3 text-left font-medium">Date</th>
              <th className="px-5 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((m) => (
              <tr key={m.id} className="border-b border-border last:border-0 hover:bg-surface/60">
                <td className="px-5 py-4 font-medium text-foreground">{m.title}</td>
                <td className="px-5 py-4 text-muted-foreground">{m.type}</td>
                <td className="px-5 py-4 text-muted-foreground">{m.workspace}</td>
                <td className="px-5 py-4 text-muted-foreground">{m.language}</td>
                <td className="px-5 py-4">
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
                      statusStyles[m.status],
                    )}
                  >
                    {m.status}
                  </span>
                </td>
                <td className="px-5 py-4 text-muted-foreground">{m.date}</td>
                <td className="px-5 py-4 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem><Eye className="h-4 w-4" /> Open</DropdownMenuItem>
                      <DropdownMenuItem><FileText className="h-4 w-4" /> View Transcript</DropdownMenuItem>
                      <DropdownMenuItem><Sparkles className="h-4 w-4" /> Generate Minutes</DropdownMenuItem>
                      <DropdownMenuItem><Download className="h-4 w-4" /> Download PDF</DropdownMenuItem>
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
      <h3 className="mt-4 text-lg font-semibold">No meetings yet</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        Record your first meeting or upload a meeting recording to generate minutes.
      </p>
      <Button className="mt-6" onClick={() => navigate({ to: "/new-meeting" })}>
        <Plus className="h-4 w-4" /> New Meeting
      </Button>
    </div>
  );
}
