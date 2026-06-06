import { API_BASE_URL, ENDPOINTS, TOKEN_KEY } from "./config";
import type {
  User,
  TokenResponse,
  UserRegister,
  UserLogin,
  GoogleCallbackRequest,
  Meeting,
  MeetingCreate,
  MeetingStatusUpdate,
  UpdateTitleRequest,
  UpdateMarkdownRequest,
} from "@/types";

// Helper to get auth header
function getAuthHeader(): HeadersInit {
  const token = localStorage.getItem(TOKEN_KEY);
  return {
    Authorization: token ? `Bearer ${token}` : "",
    "Content-Type": "application/json",
  };
}

// Error handler
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    const message = error.detail || error.message || "API Error";
    throw new Error(message);
  }
  return response.json();
}

// API client
export const api = {
  // Auth endpoints
  auth: {
    register: async (data: UserRegister): Promise<TokenResponse> => {
      const response = await fetch(`${API_BASE_URL}${ENDPOINTS.AUTH.REGISTER}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return handleResponse(response);
    },

    login: async (data: UserLogin): Promise<TokenResponse> => {
      const response = await fetch(`${API_BASE_URL}${ENDPOINTS.AUTH.LOGIN}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return handleResponse(response);
    },

    getGoogleUrl: async (): Promise<{ url: string }> => {
      const response = await fetch(`${API_BASE_URL}${ENDPOINTS.AUTH.GOOGLE}`);
      return handleResponse(response);
    },

    googleCallback: async (data: GoogleCallbackRequest): Promise<TokenResponse> => {
      const response = await fetch(`${API_BASE_URL}${ENDPOINTS.AUTH.GOOGLE_CALLBACK}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return handleResponse(response);
    },

    getCurrentUser: async (): Promise<User> => {
      const response = await fetch(`${API_BASE_URL}${ENDPOINTS.AUTH.ME}`, {
        headers: getAuthHeader(),
      });
      return handleResponse(response);
    },
  },

  // Meeting endpoints
  meetings: {
    create: async (data: MeetingCreate): Promise<Meeting> => {
      const response = await fetch(`${API_BASE_URL}${ENDPOINTS.MEETINGS.CREATE}`, {
        method: "POST",
        headers: getAuthHeader(),
        body: JSON.stringify(data),
      });
      return handleResponse(response);
    },

    list: async (): Promise<Meeting[]> => {
      const response = await fetch(`${API_BASE_URL}${ENDPOINTS.MEETINGS.LIST}`, {
        headers: getAuthHeader(),
      });
      return handleResponse(response);
    },

    get: async (id: number): Promise<Meeting> => {
      const response = await fetch(`${API_BASE_URL}${ENDPOINTS.MEETINGS.GET(id)}`, {
        headers: getAuthHeader(),
      });
      return handleResponse(response);
    },

    getStatus: async (id: number): Promise<MeetingStatusUpdate> => {
      const response = await fetch(`${API_BASE_URL}${ENDPOINTS.MEETINGS.STATUS(id)}`, {
        headers: getAuthHeader(),
      });
      return handleResponse(response);
    },

    updateTitle: async (id: number, data: UpdateTitleRequest): Promise<Meeting> => {
      const response = await fetch(`${API_BASE_URL}${ENDPOINTS.MEETINGS.UPDATE_TITLE(id)}`, {
        method: "PATCH",
        headers: getAuthHeader(),
        body: JSON.stringify(data),
      });
      return handleResponse(response);
    },

    delete: async (id: number): Promise<void> => {
      const response = await fetch(`${API_BASE_URL}${ENDPOINTS.MEETINGS.DELETE(id)}`, {
        method: "DELETE",
        headers: getAuthHeader(),
      });
      if (!response.ok) throw new Error("Failed to delete meeting");
    },
  },

  // Audio upload
  audio: {
    upload: async (meetingId: number, audioBlob: Blob): Promise<Meeting> => {
      const formData = new FormData();
      formData.append("file", audioBlob, "recording.webm");

      const token = localStorage.getItem(TOKEN_KEY);
      const response = await fetch(`${API_BASE_URL}${ENDPOINTS.AUDIO.UPLOAD(meetingId)}`, {
        method: "POST",
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: formData,
      });
      return handleResponse(response);
    },
  },

  // Minutes endpoints
  minutes: {
    getMarkdown: async (meetingId: number): Promise<{ meeting_id: number; markdown: string }> => {
      const response = await fetch(`${API_BASE_URL}${ENDPOINTS.MINUTES.GET_MARKDOWN(meetingId)}`, {
        headers: getAuthHeader(),
      });
      return handleResponse(response);
    },

    updateMarkdown: async (meetingId: number, data: UpdateMarkdownRequest): Promise<Meeting> => {
      const response = await fetch(
        `${API_BASE_URL}${ENDPOINTS.MINUTES.UPDATE_MARKDOWN(meetingId)}`,
        {
          method: "PUT",
          headers: getAuthHeader(),
          body: JSON.stringify(data),
        },
      );
      return handleResponse(response);
    },

    downloadPDF: async (meetingId: number): Promise<Blob> => {
      const response = await fetch(`${API_BASE_URL}${ENDPOINTS.MINUTES.DOWNLOAD_PDF(meetingId)}`, {
        headers: getAuthHeader(),
      });
      if (!response.ok) throw new Error("Failed to download PDF");
      return response.blob();
    },
  },
};
