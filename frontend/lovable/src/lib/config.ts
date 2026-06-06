// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// Auth tokens
export const TOKEN_KEY = "auth_token";
export const USER_KEY = "auth_user";

// API Endpoints
export const ENDPOINTS = {
  // Auth
  AUTH: {
    REGISTER: "/api/auth/register",
    LOGIN: "/api/auth/login",
    GOOGLE: "/api/auth/google",
    GOOGLE_CALLBACK: "/api/auth/google/callback",
    ME: "/api/auth/me",
  },
  // Meetings
  MEETINGS: {
    LIST: "/api/meetings",
    CREATE: "/api/meetings",
    GET: (id: number) => `/api/meetings/${id}`,
    UPDATE_TITLE: (id: number) => `/api/meetings/${id}/title`,
    DELETE: (id: number) => `/api/meetings/${id}`,
    STATUS: (id: number) => `/api/meetings/${id}/status`,
  },
  // Audio
  AUDIO: {
    UPLOAD: (id: number) => `/api/audio/upload/${id}`,
  },
  // Minutes
  MINUTES: {
    GET_MARKDOWN: (id: number) => `/api/minutes/${id}/markdown`,
    UPDATE_MARKDOWN: (id: number) => `/api/minutes/${id}/markdown`,
    DOWNLOAD_PDF: (id: number) => `/api/minutes/${id}/pdf/download`,
  },
};

// Poll intervals (ms)
export const POLL_INTERVALS = {
  PROCESSING_STATUS: 2000, // Poll every 2 seconds
  LONG_POLLING: 5000, // Poll every 5 seconds
};

// File size limits
export const MAX_AUDIO_SIZE_MB = 200;
export const ALLOWED_AUDIO_TYPES = [
  "audio/webm",
  "audio/ogg",
  "audio/mp4",
  "audio/mpeg",
  "audio/wav",
];
