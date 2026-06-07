export type MeetingStatus =
  | "pending"
  | "transcribing"
  | "summarising"
  | "separating"
  | "generating"
  | "done"
  | "failed";

export interface User {
  id: number;
  email: string;
  name: string | null;
  created_at: string;
}

export interface Meeting {
  id: number;
  title: string;
  status: MeetingStatus;
  transcript: string | null;
  markdown: string | null;
  pdf_path: string | null;
  error_message: string | null;
  created_at: string;
  completed_at: string | null;
}

export interface MeetingListItem {
  id: number;
  title: string;
  status: MeetingStatus;
  created_at: string;
  completed_at: string | null;
}

export interface MeetingListResponse {
  meetings: MeetingListItem[];
  total: number;
}

export interface MeetingStatusResponse {
  id: number;
  status: MeetingStatus;
  progress_pct: number;
  error_message: string | null;
}

export interface Version {
  id: number;
  meeting_id: number;
  version_number: number;
  markdown_snapshot: string;
  pdf_path: string | null;
  created_at: string;
}

export interface VersionListItem {
  id: number;
  version_number: number;
  pdf_path: string | null;
  created_at: string;
}

export const PROGRESS_MAP: Record<MeetingStatus, number> = {
  pending: 0,
  transcribing: 20,
  summarising: 45,
  separating: 70,
  generating: 85,
  done: 100,
  failed: -1,
};

export const STATUS_LABEL: Record<MeetingStatus, string> = {
  pending: "Pending",
  transcribing: "Transcribing audio...",
  summarising: "Generating minutes...",
  separating: "Structuring content...",
  generating: "Creating PDF...",
  done: "Complete",
  failed: "Failed",
};