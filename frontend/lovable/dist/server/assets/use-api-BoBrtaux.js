import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { u as useAuth, U as USER_KEY, a as api } from "./router-ikPISU9n.js";
function useRegister() {
  const { setUser, setToken } = useAuth();
  return useMutation({
    mutationFn: (data) => api.auth.register(data),
    onSuccess: (response) => {
      setToken(response.access_token);
      setUser(response.user);
      localStorage.setItem(USER_KEY, JSON.stringify(response.user));
    }
  });
}
function useLogin() {
  const { setUser, setToken } = useAuth();
  return useMutation({
    mutationFn: (data) => api.auth.login(data),
    onSuccess: (response) => {
      setToken(response.access_token);
      setUser(response.user);
      localStorage.setItem(USER_KEY, JSON.stringify(response.user));
    }
  });
}
function useGoogleCallback() {
  const { setUser, setToken } = useAuth();
  return useMutation({
    mutationFn: (code) => api.auth.googleCallback({ code }),
    onSuccess: (response) => {
      setToken(response.access_token);
      setUser(response.user);
      localStorage.setItem(USER_KEY, JSON.stringify(response.user));
    }
  });
}
function useCreateMeeting() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => api.meetings.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meetings"] });
    }
  });
}
function useMeetings() {
  return useQuery({
    queryKey: ["meetings"],
    queryFn: () => api.meetings.list()
  });
}
function useMeeting(id, enabled = true) {
  return useQuery({
    queryKey: ["meetings", id],
    queryFn: () => api.meetings.get(id),
    enabled
  });
}
function useMeetingStatus(id, enabled = true) {
  return useQuery({
    queryKey: ["meeting-status", id],
    queryFn: () => api.meetings.getStatus(id),
    refetchInterval: 2e3,
    // Poll every 2 seconds
    enabled
  });
}
function useDeleteMeeting() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.meetings.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meetings"] });
    }
  });
}
function useUploadAudio() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ meetingId, audioBlob }) => api.audio.upload(meetingId, audioBlob),
    onSuccess: (_, { meetingId }) => {
      queryClient.invalidateQueries({ queryKey: ["meetings", meetingId] });
      queryClient.invalidateQueries({ queryKey: ["meeting-status", meetingId] });
    }
  });
}
function useGetMarkdown(meetingId) {
  return useQuery({
    queryKey: ["markdown", meetingId],
    queryFn: () => api.minutes.getMarkdown(meetingId)
  });
}
function useUpdateMarkdown() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ meetingId, data }) => api.minutes.updateMarkdown(meetingId, data),
    onSuccess: (_, { meetingId }) => {
      queryClient.invalidateQueries({ queryKey: ["markdown", meetingId] });
      queryClient.invalidateQueries({ queryKey: ["meetings", meetingId] });
    }
  });
}
function useDownloadPDF() {
  return useMutation({
    mutationFn: (meetingId) => api.minutes.downloadPDF(meetingId),
    onSuccess: (blob, meetingId) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `minutes-${meetingId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    }
  });
}
export {
  useMeetingStatus as a,
  useMeeting as b,
  useCreateMeeting as c,
  useUploadAudio as d,
  useMeetings as e,
  useDownloadPDF as f,
  useDeleteMeeting as g,
  useLogin as h,
  useGetMarkdown as i,
  useUpdateMarkdown as j,
  useGoogleCallback as k,
  useRegister as u
};
