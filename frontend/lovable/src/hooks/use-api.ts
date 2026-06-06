import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { USER_KEY } from "@/lib/config";
import { useAuth } from "@/lib/auth-context";
import type {
  UserRegister,
  UserLogin,
  MeetingCreate,
  UpdateTitleRequest,
  UpdateMarkdownRequest,
  Meeting,
  MeetingStatusUpdate,
} from "@/types";

// Auth hooks
export function useRegister() {
  const { setUser, setToken } = useAuth();
  return useMutation({
    mutationFn: (data: UserRegister) => api.auth.register(data),
    onSuccess: (response) => {
      setToken(response.access_token);
      setUser(response.user);
      localStorage.setItem(USER_KEY, JSON.stringify(response.user));
    },
  });
}

export function useLogin() {
  const { setUser, setToken } = useAuth();
  return useMutation({
    mutationFn: (data: UserLogin) => api.auth.login(data),
    onSuccess: (response) => {
      setToken(response.access_token);
      setUser(response.user);
      localStorage.setItem(USER_KEY, JSON.stringify(response.user));
    },
  });
}

export function useGoogleCallback() {
  const { setUser, setToken } = useAuth();
  return useMutation({
    mutationFn: (code: string) => api.auth.googleCallback({ code }),
    onSuccess: (response) => {
      setToken(response.access_token);
      setUser(response.user);
      localStorage.setItem(USER_KEY, JSON.stringify(response.user));
    },
  });
}

// Meeting hooks
export function useCreateMeeting() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: MeetingCreate) => api.meetings.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meetings"] });
    },
  });
}

export function useMeetings() {
  return useQuery({
    queryKey: ["meetings"],
    queryFn: () => api.meetings.list(),
  });
}

export function useMeeting(id: number, enabled = true) {
  return useQuery({
    queryKey: ["meetings", id],
    queryFn: () => api.meetings.get(id),
    enabled,
  });
}

export function useMeetingStatus(id: number, enabled = true) {
  return useQuery<MeetingStatusUpdate>({
    queryKey: ["meeting-status", id],
    queryFn: () => api.meetings.getStatus(id),
    refetchInterval: 2000, // Poll every 2 seconds
    enabled,
  });
}

export function useUpdateMeetingTitle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateTitleRequest }) =>
      api.meetings.updateTitle(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["meetings", id] });
      queryClient.invalidateQueries({ queryKey: ["meetings"] });
    },
  });
}

export function useDeleteMeeting() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.meetings.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meetings"] });
    },
  });
}

// Audio upload
export function useUploadAudio() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ meetingId, audioBlob }: { meetingId: number; audioBlob: Blob }) =>
      api.audio.upload(meetingId, audioBlob),
    onSuccess: (_, { meetingId }) => {
      queryClient.invalidateQueries({ queryKey: ["meetings", meetingId] });
      queryClient.invalidateQueries({ queryKey: ["meeting-status", meetingId] });
    },
  });
}

// Minutes hooks
export function useGetMarkdown(meetingId: number) {
  return useQuery({
    queryKey: ["markdown", meetingId],
    queryFn: () => api.minutes.getMarkdown(meetingId),
  });
}

export function useUpdateMarkdown() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ meetingId, data }: { meetingId: number; data: UpdateMarkdownRequest }) =>
      api.minutes.updateMarkdown(meetingId, data),
    onSuccess: (_, { meetingId }) => {
      queryClient.invalidateQueries({ queryKey: ["markdown", meetingId] });
      queryClient.invalidateQueries({ queryKey: ["meetings", meetingId] });
    },
  });
}

export function useDownloadPDF() {
  return useMutation({
    mutationFn: (meetingId: number) => api.minutes.downloadPDF(meetingId),
    onSuccess: (blob, meetingId) => {
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `minutes-${meetingId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    },
  });
}
