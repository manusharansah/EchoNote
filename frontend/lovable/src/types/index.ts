// User and Auth types
export interface User {
  id: number;
  email: string;
  full_name: string;
  avatar_url?: string;
  auth_provider: "email" | "google";
  google_id?: string;
  is_active: boolean;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface UserRegister {
  email: string;
  password: string;
  full_name: string;
}

export interface UserLogin {
  email: string;
  password: string;
}

export interface GoogleCallbackRequest {
  code: string;
}

// Meeting types
export enum MeetingStatus {
  PENDING = "pending",
  TRANSCRIBING = "transcribing",
  SUMMARIZING = "summarizing",
  GENERATING = "generating",
  DONE = "done",
  FAILED = "failed",
}

export interface Meeting {
  id: number;
  owner_id: number;
  title: string;
  status: MeetingStatus | string;
  audio_path?: string;
  pdf_path?: string;
  transcript?: string;
  markdown?: string;
  error_message?: string;
  created_at: string;
  completed_at?: string;
  updated_at: string;
}

export interface MeetingCreate {
  title: string;
}

export interface MeetingStatusUpdate {
  id: number;
  status: MeetingStatus | string;
  error_message?: string;
  completed_at?: string;
}

export interface UpdateTitleRequest {
  title: string;
}

export interface UpdateMarkdownRequest {
  markdown: string;
}

// API Response types
export interface ApiError {
  detail?: string;
  message?: string;
  status?: number;
}

export interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
  success: boolean;
}
