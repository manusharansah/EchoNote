import axios from "axios";
import type {
  Meeting, MeetingListResponse, MeetingStatusResponse,
  Version, VersionListItem,
} from "../types";

const api = axios.create({
  baseURL: "/",
  headers: { "Content-Type": "application/json" },
});

const token = localStorage.getItem("access_token");
if (token) {
  api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
}

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("access_token");
      delete api.defaults.headers.common["Authorization"];
      window.location.href = "/signin";
    }
    return Promise.reject(error);
  }
);

// ── Auth ──────────────────────────────────────────────────
export const authApi = {
  register: (email: string, password: string, name?: string) =>
    api.post("/auth/register", { email, password, name }),
  login: (email: string, password: string) =>
    api.post("/auth/login", { email, password }),
  me: () => api.get("/auth/me"),
};

// ── Meetings ──────────────────────────────────────────────
export const meetingsApi = {
  list: (skip = 0, limit = 20): Promise<{ data: MeetingListResponse }> =>
    api.get("/meetings", { params: { skip, limit } }),

  create: (title: string): Promise<{ data: Meeting }> =>
    api.post("/meetings", { title }),

  get: (id: number): Promise<{ data: Meeting }> =>
    api.get(`/meetings/${id}`),

  delete: (id: number) =>
    api.delete(`/meetings/${id}`),

  uploadAudio: (id: number, file: File, onProgress?: (pct: number) => void) => {
    const form = new FormData();
    form.append("file", file);
    return api.post(`/meetings/${id}/upload`, form, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: (e) => {
        if (onProgress && e.total) onProgress(Math.round((e.loaded * 100) / e.total));
      },
    });
  },

  getStatus: (id: number): Promise<{ data: MeetingStatusResponse }> =>
    api.get(`/meetings/${id}/status`),

  getMarkdown: (id: number): Promise<{ data: { markdown: string } }> =>
    api.get(`/meetings/${id}/markdown`),

  updateMarkdown: (id: number, markdown: string): Promise<{ data: Meeting }> =>
    api.put(`/meetings/${id}/markdown`, { markdown }),

  saveVersion: (id: number, markdown: string) =>
    api.post(`/meetings/${id}/versions`, { markdown }),

  pdfUrl: (id: number) => `/meetings/${id}/pdf`,
};

// ── Versions ──────────────────────────────────────────────
export const versionsApi = {
  list: (meetingId: number): Promise<{ data: VersionListItem[] }> =>
    api.get(`/meetings/${meetingId}/versions`),

  get: (meetingId: number, versionNumber: number): Promise<{ data: Version }> =>
    api.get(`/meetings/${meetingId}/versions/${versionNumber}`),

  pdfUrl: (meetingId: number, versionNumber: number) =>
    `/meetings/${meetingId}/versions/${versionNumber}/pdf`,

  diff: (meetingId: number, v1: number, v2: number) =>
    api.get(`/meetings/${meetingId}/diff`, { params: { v1, v2 } }),
};

export default api;