import { jsx, jsxs } from "react/jsx-runtime";
import { Link, useNavigate } from "@tanstack/react-router";
import { A as AppShell } from "./AppShell-BhLMxDhV.js";
import { c as cn, B as Button } from "./button-DRiz9d0t.js";
import * as React from "react";
import { useState, useMemo } from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { ChevronRight, Check, Circle, Plus, Mic, MoreHorizontal, Eye, Download, FileText, Trash2 } from "lucide-react";
import { M as MeetingStatus } from "./index-Cc391LeZ.js";
import { e as useMeetings, f as useDownloadPDF, g as useDeleteMeeting } from "./use-api-BoBrtaux.js";
import { toast } from "sonner";
import "./router-ikPISU9n.js";
import "@tanstack/react-query";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "clsx";
import "tailwind-merge";
const Tabs = TabsPrimitive.Root;
const TabsList = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  TabsPrimitive.List,
  {
    ref,
    className: cn(
      "inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground",
      className
    ),
    ...props
  }
));
TabsList.displayName = TabsPrimitive.List.displayName;
const TabsTrigger = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  TabsPrimitive.Trigger,
  {
    ref,
    className: cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background cursor-pointer transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow",
      className
    ),
    ...props
  }
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;
const TabsContent = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  TabsPrimitive.Content,
  {
    ref,
    className: cn(
      "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className
    ),
    ...props
  }
));
TabsContent.displayName = TabsPrimitive.Content.displayName;
const DropdownMenu = DropdownMenuPrimitive.Root;
const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;
const DropdownMenuSubTrigger = React.forwardRef(({ className, inset, children, ...props }, ref) => /* @__PURE__ */ jsxs(
  DropdownMenuPrimitive.SubTrigger,
  {
    ref,
    className: cn(
      "flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent data-[state=open]:bg-accent [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
      inset && "pl-8",
      className
    ),
    ...props,
    children: [
      children,
      /* @__PURE__ */ jsx(ChevronRight, { className: "ml-auto" })
    ]
  }
));
DropdownMenuSubTrigger.displayName = DropdownMenuPrimitive.SubTrigger.displayName;
const DropdownMenuSubContent = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  DropdownMenuPrimitive.SubContent,
  {
    ref,
    className: cn(
      "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-dropdown-menu-content-transform-origin)",
      className
    ),
    ...props
  }
));
DropdownMenuSubContent.displayName = DropdownMenuPrimitive.SubContent.displayName;
const DropdownMenuContent = React.forwardRef(({ className, sideOffset = 4, ...props }, ref) => /* @__PURE__ */ jsx(DropdownMenuPrimitive.Portal, { children: /* @__PURE__ */ jsx(
  DropdownMenuPrimitive.Content,
  {
    ref,
    sideOffset,
    className: cn(
      "z-50 max-h-[var(--radix-dropdown-menu-content-available-height)] min-w-[8rem] overflow-y-auto overflow-x-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md",
      "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-dropdown-menu-content-transform-origin)",
      className
    ),
    ...props
  }
) }));
DropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName;
const DropdownMenuItem = React.forwardRef(({ className, inset, ...props }, ref) => /* @__PURE__ */ jsx(
  DropdownMenuPrimitive.Item,
  {
    ref,
    className: cn(
      "relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&>svg]:size-4 [&>svg]:shrink-0",
      inset && "pl-8",
      className
    ),
    ...props
  }
));
DropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName;
const DropdownMenuCheckboxItem = React.forwardRef(({ className, children, checked, ...props }, ref) => /* @__PURE__ */ jsxs(
  DropdownMenuPrimitive.CheckboxItem,
  {
    ref,
    className: cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    ),
    checked,
    ...props,
    children: [
      /* @__PURE__ */ jsx("span", { className: "absolute left-2 flex h-3.5 w-3.5 items-center justify-center", children: /* @__PURE__ */ jsx(DropdownMenuPrimitive.ItemIndicator, { children: /* @__PURE__ */ jsx(Check, { className: "h-4 w-4" }) }) }),
      children
    ]
  }
));
DropdownMenuCheckboxItem.displayName = DropdownMenuPrimitive.CheckboxItem.displayName;
const DropdownMenuRadioItem = React.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxs(
  DropdownMenuPrimitive.RadioItem,
  {
    ref,
    className: cn(
      "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    ),
    ...props,
    children: [
      /* @__PURE__ */ jsx("span", { className: "absolute left-2 flex h-3.5 w-3.5 items-center justify-center", children: /* @__PURE__ */ jsx(DropdownMenuPrimitive.ItemIndicator, { children: /* @__PURE__ */ jsx(Circle, { className: "h-2 w-2 fill-current" }) }) }),
      children
    ]
  }
));
DropdownMenuRadioItem.displayName = DropdownMenuPrimitive.RadioItem.displayName;
const DropdownMenuLabel = React.forwardRef(({ className, inset, ...props }, ref) => /* @__PURE__ */ jsx(
  DropdownMenuPrimitive.Label,
  {
    ref,
    className: cn("px-2 py-1.5 text-sm font-semibold", inset && "pl-8", className),
    ...props
  }
));
DropdownMenuLabel.displayName = DropdownMenuPrimitive.Label.displayName;
const DropdownMenuSeparator = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  DropdownMenuPrimitive.Separator,
  {
    ref,
    className: cn("-mx-1 my-1 h-px bg-muted", className),
    ...props
  }
));
DropdownMenuSeparator.displayName = DropdownMenuPrimitive.Separator.displayName;
const statusStyles = {
  [MeetingStatus.PENDING]: "bg-slate-100 text-slate-700",
  [MeetingStatus.TRANSCRIBING]: "bg-amber-50 text-amber-700",
  [MeetingStatus.SUMMARIZING]: "bg-amber-50 text-amber-700",
  [MeetingStatus.GENERATING]: "bg-blue-50 text-blue-700",
  [MeetingStatus.DONE]: "bg-emerald-50 text-emerald-700",
  [MeetingStatus.FAILED]: "bg-red-50 text-red-700"
};
function MeetingsPage() {
  const [tab, setTab] = useState("all");
  const meetingsQuery = useMeetings();
  const meetings = useMemo(() => meetingsQuery.data ?? [], [meetingsQuery.data]);
  const filtered = useMemo(() => {
    switch (tab) {
      case "processing":
        return meetings.filter((meeting) => [MeetingStatus.PENDING, MeetingStatus.TRANSCRIBING, MeetingStatus.SUMMARIZING, MeetingStatus.GENERATING].includes(meeting.status));
      case "completed":
        return meetings.filter((meeting) => meeting.status === MeetingStatus.DONE);
      case "failed":
        return meetings.filter((meeting) => meeting.status === MeetingStatus.FAILED);
      default:
        return meetings;
    }
  }, [tab, meetings]);
  return /* @__PURE__ */ jsxs(AppShell, { children: [
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { className: "text-2xl font-semibold tracking-tight", children: "Meetings" }),
        /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "Record, upload, transcribe and generate minutes." })
      ] }),
      /* @__PURE__ */ jsx(Button, { asChild: true, className: "h-10", children: /* @__PURE__ */ jsxs(Link, { to: "/new-meeting", children: [
        /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" }),
        " New Meeting"
      ] }) })
    ] }),
    /* @__PURE__ */ jsxs(Tabs, { value: tab, onValueChange: setTab, className: "mt-8", children: [
      /* @__PURE__ */ jsxs(TabsList, { className: "bg-card", children: [
        /* @__PURE__ */ jsx(TabsTrigger, { value: "all", children: "All Meetings" }),
        /* @__PURE__ */ jsx(TabsTrigger, { value: "processing", children: "Processing" }),
        /* @__PURE__ */ jsx(TabsTrigger, { value: "completed", children: "Completed" }),
        /* @__PURE__ */ jsx(TabsTrigger, { value: "failed", children: "Failed" })
      ] }),
      /* @__PURE__ */ jsx(TabsContent, { value: tab, className: "mt-6", children: meetingsQuery.isLoading ? /* @__PURE__ */ jsx("div", { className: "rounded-xl border border-border bg-card p-8 text-sm text-muted-foreground shadow-soft", children: "Loading meetings..." }) : filtered.length === 0 ? /* @__PURE__ */ jsx(EmptyState, {}) : /* @__PURE__ */ jsx(MeetingsTable, { rows: filtered }) })
    ] })
  ] });
}
function MeetingsTable({
  rows
}) {
  const navigate = useNavigate();
  const downloadPDF = useDownloadPDF();
  const deleteMeeting = useDeleteMeeting();
  const openMeeting = (meeting) => {
    if (meeting.status === MeetingStatus.DONE) {
      navigate({
        to: "/meetings/$meetingId",
        params: {
          meetingId: String(meeting.id)
        }
      });
      return;
    }
    navigate({
      to: "/processing",
      search: {
        meetingId: meeting.id
      }
    });
  };
  const deleteRow = async (meeting) => {
    try {
      await deleteMeeting.mutateAsync(meeting.id);
      toast.success("Meeting deleted");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete meeting");
    }
  };
  const download = async (meeting) => {
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
  return /* @__PURE__ */ jsx("div", { className: "overflow-hidden rounded-xl border border-border bg-card shadow-soft", children: /* @__PURE__ */ jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-sm", children: [
    /* @__PURE__ */ jsx("thead", { className: "border-b border-border bg-surface text-xs uppercase tracking-wide text-muted-foreground", children: /* @__PURE__ */ jsxs("tr", { children: [
      /* @__PURE__ */ jsx("th", { className: "px-5 py-3 text-left font-medium", children: "Meeting Title" }),
      /* @__PURE__ */ jsx("th", { className: "px-5 py-3 text-left font-medium", children: "Status" }),
      /* @__PURE__ */ jsx("th", { className: "px-5 py-3 text-left font-medium", children: "Created" }),
      /* @__PURE__ */ jsx("th", { className: "px-5 py-3 text-left font-medium", children: "Completed" }),
      /* @__PURE__ */ jsx("th", { className: "px-5 py-3 text-right font-medium", children: "Actions" })
    ] }) }),
    /* @__PURE__ */ jsx("tbody", { children: rows.map((meeting) => /* @__PURE__ */ jsxs("tr", { className: "border-b border-border last:border-0 hover:bg-surface/60", children: [
      /* @__PURE__ */ jsx("td", { className: "px-5 py-4 font-medium text-foreground", children: meeting.title }),
      /* @__PURE__ */ jsx("td", { className: "px-5 py-4", children: /* @__PURE__ */ jsx("span", { className: cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium", statusStyles[meeting.status] ?? "bg-slate-100 text-slate-700"), children: formatStatus(meeting.status) }) }),
      /* @__PURE__ */ jsx("td", { className: "px-5 py-4 text-muted-foreground", children: formatDate(meeting.created_at) }),
      /* @__PURE__ */ jsx("td", { className: "px-5 py-4 text-muted-foreground", children: formatDate(meeting.completed_at) }),
      /* @__PURE__ */ jsx("td", { className: "px-5 py-4 text-right", children: /* @__PURE__ */ jsxs(DropdownMenu, { children: [
        /* @__PURE__ */ jsx(DropdownMenuTrigger, { asChild: true, children: /* @__PURE__ */ jsx(Button, { variant: "ghost", size: "icon", className: "h-8 w-8", children: /* @__PURE__ */ jsx(MoreHorizontal, { className: "h-4 w-4" }) }) }),
        /* @__PURE__ */ jsxs(DropdownMenuContent, { align: "end", children: [
          /* @__PURE__ */ jsxs(DropdownMenuItem, { onClick: () => openMeeting(meeting), children: [
            /* @__PURE__ */ jsx(Eye, { className: "h-4 w-4" }),
            " Open"
          ] }),
          /* @__PURE__ */ jsxs(DropdownMenuItem, { onClick: () => download(meeting), disabled: meeting.status !== MeetingStatus.DONE, children: [
            /* @__PURE__ */ jsx(Download, { className: "h-4 w-4" }),
            " Download PDF"
          ] }),
          /* @__PURE__ */ jsxs(DropdownMenuItem, { onClick: () => openMeeting(meeting), disabled: meeting.status !== MeetingStatus.DONE, children: [
            /* @__PURE__ */ jsx(FileText, { className: "h-4 w-4" }),
            " Edit Minutes"
          ] }),
          /* @__PURE__ */ jsxs(DropdownMenuItem, { onClick: () => deleteRow(meeting), className: "text-destructive", children: [
            /* @__PURE__ */ jsx(Trash2, { className: "h-4 w-4" }),
            " Delete"
          ] })
        ] })
      ] }) })
    ] }, meeting.id)) })
  ] }) }) });
}
function EmptyState() {
  const navigate = useNavigate();
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card px-6 py-16 text-center shadow-soft", children: [
    /* @__PURE__ */ jsx("div", { className: "grid h-12 w-12 place-items-center rounded-full bg-accent text-accent-foreground", children: /* @__PURE__ */ jsx(Mic, { className: "h-5 w-5" }) }),
    /* @__PURE__ */ jsx("h3", { className: "mt-4 text-lg font-semibold", children: "No meetings here" }),
    /* @__PURE__ */ jsx("p", { className: "mt-1 max-w-sm text-sm text-muted-foreground", children: "Record a meeting or upload a recording to generate minutes." }),
    /* @__PURE__ */ jsxs(Button, { className: "mt-6", onClick: () => navigate({
      to: "/new-meeting"
    }), children: [
      /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" }),
      " New Meeting"
    ] })
  ] });
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
  MeetingsPage as component
};
