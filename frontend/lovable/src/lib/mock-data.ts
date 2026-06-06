export type MeetingStatus =
  | "Recorded"
  | "Uploaded"
  | "Transcribing"
  | "Transcript Ready"
  | "Minutes Processing"
  | "Minutes Ready"
  | "Completed";

export type MeetingType = "Physical" | "Zoom" | "Google Meet" | "Microsoft Teams" | "Other";

export interface Meeting {
  id: string;
  title: string;
  type: MeetingType;
  workspace: string;
  language: string;
  status: MeetingStatus;
  date: string;
}

export const mockMeetings: Meeting[] = [
  {
    id: "1",
    title: "Project Kickoff",
    type: "Physical",
    workspace: "NCIT Hackathon Team",
    language: "Nepali-English Mixed",
    status: "Minutes Ready",
    date: "Today",
  },
  {
    id: "2",
    title: "Client Review Meeting",
    type: "Zoom",
    workspace: "Client Meetings",
    language: "English",
    status: "Transcribing",
    date: "6 June 2026",
  },
  {
    id: "3",
    title: "Weekly Planning Sync",
    type: "Google Meet",
    workspace: "Project Alpha",
    language: "English",
    status: "Completed",
    date: "5 June 2026",
  },
];

export const workspaces = [
  "NCIT Hackathon Team",
  "Project Alpha",
  "Client Meetings",
  "Board Meetings",
];
