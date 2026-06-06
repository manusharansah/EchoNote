import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Download, Loader2, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useDownloadPDF, useGetMarkdown, useMeeting, useUpdateMarkdown } from "@/hooks/use-api";
import { MeetingStatus } from "@/types";

export const Route = createFileRoute("/meetings/$meetingId")({
  head: () => ({
    meta: [
      { title: "Review Minutes - MeetingIQ" },
      { name: "description", content: "Review and edit generated meeting minutes." },
    ],
  }),
  component: MeetingReviewPage,
});

function MeetingReviewPage() {
  const { meetingId } = Route.useParams();
  const id = Number(meetingId);
  const meetingQuery = useMeeting(id);
  const markdownQuery = useGetMarkdown(id);
  const updateMarkdown = useUpdateMarkdown();
  const downloadPDF = useDownloadPDF();
  const [markdown, setMarkdown] = useState("");

  useEffect(() => {
    if (markdownQuery.data?.markdown) {
      setMarkdown(markdownQuery.data.markdown);
    }
  }, [markdownQuery.data?.markdown]);

  const meeting = meetingQuery.data;
  const isReady = meeting?.status === MeetingStatus.DONE;

  const saveChanges = async () => {
    try {
      await updateMarkdown.mutateAsync({
        meetingId: id,
        data: { markdown },
      });
      toast.success("Minutes saved and PDF regenerated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save minutes");
    }
  };

  const download = async () => {
    try {
      await downloadPDF.mutateAsync(id);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to download PDF");
    }
  };

  return (
    <AppShell>
      <div className="mb-6">
        <Button asChild variant="ghost" className="px-0 text-muted-foreground">
          <Link to="/meetings">
            <ArrowLeft className="h-4 w-4" /> Back to meetings
          </Link>
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {meeting?.title ?? "Meeting minutes"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Edit the generated Markdown. Saving regenerates the PDF on the backend.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={download} disabled={!isReady || downloadPDF.isPending}>
            {downloadPDF.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            Download PDF
          </Button>
          <Button
            onClick={saveChanges}
            disabled={!isReady || updateMarkdown.isPending || !markdown.trim()}
          >
            {updateMarkdown.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save Changes
          </Button>
        </div>
      </div>

      {!isReady && !meetingQuery.isLoading ? (
        <section className="mt-8 rounded-xl border border-border bg-card p-6 shadow-soft">
          <h2 className="text-base font-semibold">Minutes are not ready yet</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Current status: {meeting?.status ?? "unknown"}. Return to the processing page to follow
            progress.
          </p>
          <Button asChild className="mt-4">
            <Link to="/processing" search={{ meetingId: id }}>
              View Processing
            </Link>
          </Button>
        </section>
      ) : (
        <section className="mt-8 rounded-xl border border-border bg-card p-6 shadow-soft">
          <Label htmlFor="minutes-markdown">Generated minutes</Label>
          <Textarea
            id="minutes-markdown"
            value={markdown}
            onChange={(event) => setMarkdown(event.target.value)}
            className="mt-3 min-h-[560px] resize-y font-mono text-sm leading-6"
            placeholder={
              markdownQuery.isLoading ? "Loading minutes..." : "Generated minutes will appear here."
            }
            disabled={markdownQuery.isLoading || updateMarkdown.isPending}
          />
        </section>
      )}
    </AppShell>
  );
}
