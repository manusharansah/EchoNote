import { jsxs, jsx } from "react/jsx-runtime";
import { Link } from "@tanstack/react-router";
import { A as AppShell } from "./AppShell-BhLMxDhV.js";
import { B as Button } from "./button-DRiz9d0t.js";
import { T as Textarea } from "./textarea-Afsg2eJD.js";
import { L as Label } from "./label-8OFGJuPk.js";
import { ArrowLeft, Loader2, Download, Save } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { b as useMeeting, i as useGetMarkdown, j as useUpdateMarkdown, f as useDownloadPDF } from "./use-api-BoBrtaux.js";
import { M as MeetingStatus } from "./index-Cc391LeZ.js";
import { b as Route } from "./router-ikPISU9n.js";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "clsx";
import "tailwind-merge";
import "@radix-ui/react-label";
import "@tanstack/react-query";
function MeetingReviewPage() {
  const {
    meetingId
  } = Route.useParams();
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
        data: {
          markdown
        }
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
  return /* @__PURE__ */ jsxs(AppShell, { children: [
    /* @__PURE__ */ jsx("div", { className: "mb-6", children: /* @__PURE__ */ jsx(Button, { asChild: true, variant: "ghost", className: "px-0 text-muted-foreground", children: /* @__PURE__ */ jsxs(Link, { to: "/meetings", children: [
      /* @__PURE__ */ jsx(ArrowLeft, { className: "h-4 w-4" }),
      " Back to meetings"
    ] }) }) }),
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { className: "text-2xl font-semibold tracking-tight", children: meeting?.title ?? "Meeting minutes" }),
        /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "Edit the generated Markdown. Saving regenerates the PDF on the backend." })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-2", children: [
        /* @__PURE__ */ jsxs(Button, { variant: "outline", onClick: download, disabled: !isReady || downloadPDF.isPending, children: [
          downloadPDF.isPending ? /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsx(Download, { className: "h-4 w-4" }),
          "Download PDF"
        ] }),
        /* @__PURE__ */ jsxs(Button, { onClick: saveChanges, disabled: !isReady || updateMarkdown.isPending || !markdown.trim(), children: [
          updateMarkdown.isPending ? /* @__PURE__ */ jsx(Loader2, { className: "h-4 w-4 animate-spin" }) : /* @__PURE__ */ jsx(Save, { className: "h-4 w-4" }),
          "Save Changes"
        ] })
      ] })
    ] }),
    !isReady && !meetingQuery.isLoading ? /* @__PURE__ */ jsxs("section", { className: "mt-8 rounded-xl border border-border bg-card p-6 shadow-soft", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-base font-semibold", children: "Minutes are not ready yet" }),
      /* @__PURE__ */ jsxs("p", { className: "mt-1 text-sm text-muted-foreground", children: [
        "Current status: ",
        meeting?.status ?? "unknown",
        ". Return to the processing page to follow progress."
      ] }),
      /* @__PURE__ */ jsx(Button, { asChild: true, className: "mt-4", children: /* @__PURE__ */ jsx(Link, { to: "/processing", search: {
        meetingId: id
      }, children: "View Processing" }) })
    ] }) : /* @__PURE__ */ jsxs("section", { className: "mt-8 rounded-xl border border-border bg-card p-6 shadow-soft", children: [
      /* @__PURE__ */ jsx(Label, { htmlFor: "minutes-markdown", children: "Generated minutes" }),
      /* @__PURE__ */ jsx(Textarea, { id: "minutes-markdown", value: markdown, onChange: (event) => setMarkdown(event.target.value), className: "mt-3 min-h-[560px] resize-y font-mono text-sm leading-6", placeholder: markdownQuery.isLoading ? "Loading minutes..." : "Generated minutes will appear here.", disabled: markdownQuery.isLoading || updateMarkdown.isPending })
    ] })
  ] });
}
export {
  MeetingReviewPage as component
};
