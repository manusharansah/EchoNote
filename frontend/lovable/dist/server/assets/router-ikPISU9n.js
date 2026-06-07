import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext, useRouter, Link, Outlet, HeadContent, Scripts, createFileRoute, lazyRouteComponent, redirect, createRouter } from "@tanstack/react-router";
import { jsx, jsxs } from "react/jsx-runtime";
import { useState, useEffect, createContext, useContext } from "react";
import { Toaster as Toaster$1 } from "sonner";
const appCss = "/assets/styles-DBLmR2Vl.css";
function reportLovableError(error, context = {}) {
  if (typeof window === "undefined") return;
  window.__lovableEvents?.captureException?.(
    error,
    {
      source: "react_error_boundary",
      route: window.location.pathname,
      ...context
    },
    {
      mechanism: "react_error_boundary",
      handled: false,
      severity: "error"
    }
  );
}
const Toaster = ({ ...props }) => {
  return /* @__PURE__ */ jsx(
    Toaster$1,
    {
      className: "toaster group",
      toastOptions: {
        classNames: {
          toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground"
        }
      },
      ...props
    }
  );
};
const API_BASE_URL = "http://localhost:8000";
const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";
const ENDPOINTS = {
  // Auth
  AUTH: {
    REGISTER: "/api/auth/register",
    LOGIN: "/api/auth/login",
    GOOGLE: "/api/auth/google",
    GOOGLE_CALLBACK: "/api/auth/google/callback",
    ME: "/api/auth/me"
  },
  // Meetings
  MEETINGS: {
    LIST: "/api/meetings",
    CREATE: "/api/meetings",
    GET: (id) => `/api/meetings/${id}`,
    UPDATE_TITLE: (id) => `/api/meetings/${id}/title`,
    DELETE: (id) => `/api/meetings/${id}`,
    STATUS: (id) => `/api/meetings/${id}/status`
  },
  // Audio
  AUDIO: {
    UPLOAD: (id) => `/api/audio/upload/${id}`
  },
  // Minutes
  MINUTES: {
    GET_MARKDOWN: (id) => `/api/minutes/${id}/markdown`,
    UPDATE_MARKDOWN: (id) => `/api/minutes/${id}/markdown`,
    DOWNLOAD_PDF: (id) => `/api/minutes/${id}/pdf/download`
  }
};
function getAuthHeader() {
  const token = localStorage.getItem(TOKEN_KEY);
  return {
    Authorization: token ? `Bearer ${token}` : "",
    "Content-Type": "application/json"
  };
}
async function handleResponse(response) {
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    const message = error.detail || error.message || "API Error";
    throw new Error(message);
  }
  return response.json();
}
const api = {
  // Auth endpoints
  auth: {
    register: async (data) => {
      const response = await fetch(`${API_BASE_URL}${ENDPOINTS.AUTH.REGISTER}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      return handleResponse(response);
    },
    login: async (data) => {
      const response = await fetch(`${API_BASE_URL}${ENDPOINTS.AUTH.LOGIN}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      return handleResponse(response);
    },
    getGoogleUrl: async () => {
      const response = await fetch(`${API_BASE_URL}${ENDPOINTS.AUTH.GOOGLE}`);
      return handleResponse(response);
    },
    googleCallback: async (data) => {
      const response = await fetch(`${API_BASE_URL}${ENDPOINTS.AUTH.GOOGLE_CALLBACK}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      return handleResponse(response);
    },
    getCurrentUser: async () => {
      const response = await fetch(`${API_BASE_URL}${ENDPOINTS.AUTH.ME}`, {
        headers: getAuthHeader()
      });
      return handleResponse(response);
    }
  },
  // Meeting endpoints
  meetings: {
    create: async (data) => {
      const response = await fetch(`${API_BASE_URL}${ENDPOINTS.MEETINGS.CREATE}`, {
        method: "POST",
        headers: getAuthHeader(),
        body: JSON.stringify(data)
      });
      return handleResponse(response);
    },
    list: async () => {
      const response = await fetch(`${API_BASE_URL}${ENDPOINTS.MEETINGS.LIST}`, {
        headers: getAuthHeader()
      });
      return handleResponse(response);
    },
    get: async (id) => {
      const response = await fetch(`${API_BASE_URL}${ENDPOINTS.MEETINGS.GET(id)}`, {
        headers: getAuthHeader()
      });
      return handleResponse(response);
    },
    getStatus: async (id) => {
      const response = await fetch(`${API_BASE_URL}${ENDPOINTS.MEETINGS.STATUS(id)}`, {
        headers: getAuthHeader()
      });
      return handleResponse(response);
    },
    updateTitle: async (id, data) => {
      const response = await fetch(`${API_BASE_URL}${ENDPOINTS.MEETINGS.UPDATE_TITLE(id)}`, {
        method: "PATCH",
        headers: getAuthHeader(),
        body: JSON.stringify(data)
      });
      return handleResponse(response);
    },
    delete: async (id) => {
      const response = await fetch(`${API_BASE_URL}${ENDPOINTS.MEETINGS.DELETE(id)}`, {
        method: "DELETE",
        headers: getAuthHeader()
      });
      if (!response.ok) throw new Error("Failed to delete meeting");
    }
  },
  // Audio upload
  audio: {
    upload: async (meetingId, audioBlob) => {
      const formData = new FormData();
      formData.append("file", audioBlob, "recording.webm");
      const token = localStorage.getItem(TOKEN_KEY);
      const response = await fetch(`${API_BASE_URL}${ENDPOINTS.AUDIO.UPLOAD(meetingId)}`, {
        method: "POST",
        headers: {
          Authorization: token ? `Bearer ${token}` : ""
        },
        body: formData
      });
      return handleResponse(response);
    }
  },
  // Minutes endpoints
  minutes: {
    getMarkdown: async (meetingId) => {
      const response = await fetch(`${API_BASE_URL}${ENDPOINTS.MINUTES.GET_MARKDOWN(meetingId)}`, {
        headers: getAuthHeader()
      });
      return handleResponse(response);
    },
    updateMarkdown: async (meetingId, data) => {
      const response = await fetch(
        `${API_BASE_URL}${ENDPOINTS.MINUTES.UPDATE_MARKDOWN(meetingId)}`,
        {
          method: "PUT",
          headers: getAuthHeader(),
          body: JSON.stringify(data)
        }
      );
      return handleResponse(response);
    },
    downloadPDF: async (meetingId) => {
      const response = await fetch(`${API_BASE_URL}${ENDPOINTS.MINUTES.DOWNLOAD_PDF(meetingId)}`, {
        headers: getAuthHeader()
      });
      if (!response.ok) throw new Error("Failed to download PDF");
      return response.blob();
    }
  }
};
const AuthContext = createContext(void 0);
function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const restoreUser = async () => {
      try {
        const token = localStorage.getItem(TOKEN_KEY);
        const storedUser = localStorage.getItem(USER_KEY);
        if (token && storedUser) {
          const freshUser = await api.auth.getCurrentUser();
          setUser(freshUser);
          localStorage.setItem(USER_KEY, JSON.stringify(freshUser));
        } else if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    restoreUser();
  }, []);
  const setToken = (token) => {
    localStorage.setItem(TOKEN_KEY, token);
  };
  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
  };
  const refreshUser = async () => {
    try {
      const freshUser = await api.auth.getCurrentUser();
      setUser(freshUser);
      localStorage.setItem(USER_KEY, JSON.stringify(freshUser));
    } catch (error) {
      logout();
      throw error;
    }
  };
  return /* @__PURE__ */ jsx(
    AuthContext.Provider,
    {
      value: {
        user,
        isLoading,
        isAuthenticated: !!user,
        setUser,
        setToken,
        logout,
        refreshUser
      },
      children
    }
  );
}
function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
function NotFoundComponent() {
  return /* @__PURE__ */ jsx("div", { className: "flex min-h-screen items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxs("div", { className: "max-w-md text-center", children: [
    /* @__PURE__ */ jsx("h1", { className: "text-7xl font-bold text-foreground", children: "404" }),
    /* @__PURE__ */ jsx("h2", { className: "mt-4 text-xl font-semibold text-foreground", children: "Page not found" }),
    /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "The page you're looking for doesn't exist or has been moved." }),
    /* @__PURE__ */ jsx("div", { className: "mt-6", children: /* @__PURE__ */ jsx(
      Link,
      {
        to: "/",
        className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
        children: "Go home"
      }
    ) })
  ] }) });
}
function ErrorComponent({ error, reset }) {
  console.error(error);
  const router2 = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);
  return /* @__PURE__ */ jsx("div", { className: "flex min-h-screen items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxs("div", { className: "max-w-md text-center", children: [
    /* @__PURE__ */ jsx("h1", { className: "text-xl font-semibold tracking-tight text-foreground", children: "This page didn't load" }),
    /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "Something went wrong on our end. You can try refreshing or head back home." }),
    /* @__PURE__ */ jsxs("div", { className: "mt-6 flex flex-wrap justify-center gap-2", children: [
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => {
            router2.invalidate();
            reset();
          },
          className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
          children: "Try again"
        }
      ),
      /* @__PURE__ */ jsx(
        "a",
        {
          href: "/",
          className: "inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent",
          children: "Go home"
        }
      )
    ] })
  ] }) });
}
const Route$8 = createRootRouteWithContext()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Lovable App" },
      { name: "description", content: "Lovable Generated Project" },
      { name: "author", content: "Lovable" },
      { property: "og:title", content: "Lovable App" },
      { property: "og:description", content: "Lovable Generated Project" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@Lovable" }
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss
      }
    ]
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent
});
function RootShell({ children }) {
  return /* @__PURE__ */ jsxs("html", { lang: "en", children: [
    /* @__PURE__ */ jsx("head", { children: /* @__PURE__ */ jsx(HeadContent, {}) }),
    /* @__PURE__ */ jsxs("body", { children: [
      children,
      /* @__PURE__ */ jsx(Scripts, {})
    ] })
  ] });
}
function RootComponent() {
  const { queryClient } = Route$8.useRouteContext();
  return /* @__PURE__ */ jsx(QueryClientProvider, { client: queryClient, children: /* @__PURE__ */ jsxs(AuthProvider, { children: [
    /* @__PURE__ */ jsx(Outlet, {}),
    /* @__PURE__ */ jsx(Toaster, { position: "top-right" })
  ] }) });
}
const $$splitComponentImporter$6 = () => import("./signup-xJE2kCqK.js");
const Route$7 = createFileRoute("/signup")({
  head: () => ({
    meta: [{
      title: "Create account — MeetingIQ"
    }, {
      name: "description",
      content: "Create your MeetingIQ account to generate AI-powered meeting minutes."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$6, "component")
});
const $$splitComponentImporter$5 = () => import("./processing-BAl8uN6y.js");
const Route$6 = createFileRoute("/processing")({
  validateSearch: (search) => ({
    meetingId: Number(search.meetingId) || void 0
  }),
  head: () => ({
    meta: [{
      title: "Processing Meeting - MeetingIQ"
    }, {
      name: "description",
      content: "Your meeting is being transcribed and minutes are being generated."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
const $$splitComponentImporter$4 = () => import("./new-meeting-6pKf8CUw.js");
const Route$5 = createFileRoute("/new-meeting")({
  head: () => ({
    meta: [{
      title: "New Meeting — MeetingIQ"
    }, {
      name: "description",
      content: "Record a physical meeting or upload a recording to transcribe."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
const $$splitComponentImporter$3 = () => import("./meetings-BHuSAvh5.js");
const Route$4 = createFileRoute("/meetings")({
  head: () => ({
    meta: [{
      title: "Meetings - MeetingIQ"
    }, {
      name: "description",
      content: "View, transcribe and generate minutes for your meetings."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
const $$splitComponentImporter$2 = () => import("./login-2euNeEGK.js");
const Route$3 = createFileRoute("/login")({
  head: () => ({
    meta: [{
      title: "Sign in — MeetingIQ"
    }, {
      name: "description",
      content: "Sign in to MeetingIQ to manage your meetings, transcripts and minutes."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
const Route$2 = createFileRoute("/")({
  beforeLoad: () => {
    throw redirect({ to: "/login" });
  }
});
const $$splitComponentImporter$1 = () => import("./meetings._meetingId-npiX5jOb.js");
const Route$1 = createFileRoute("/meetings/$meetingId")({
  head: () => ({
    meta: [{
      title: "Review Minutes - MeetingIQ"
    }, {
      name: "description",
      content: "Review and edit generated meeting minutes."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
const $$splitComponentImporter = () => import("./auth.callback-B7j2kWo3.js");
const Route = createFileRoute("/auth/callback")({
  validateSearch: (search) => ({
    code: typeof search.code === "string" ? search.code : void 0,
    error: typeof search.error === "string" ? search.error : void 0
  }),
  component: lazyRouteComponent($$splitComponentImporter, "component")
});
const SignupRoute = Route$7.update({
  id: "/signup",
  path: "/signup",
  getParentRoute: () => Route$8
});
const ProcessingRoute = Route$6.update({
  id: "/processing",
  path: "/processing",
  getParentRoute: () => Route$8
});
const NewMeetingRoute = Route$5.update({
  id: "/new-meeting",
  path: "/new-meeting",
  getParentRoute: () => Route$8
});
const MeetingsRoute = Route$4.update({
  id: "/meetings",
  path: "/meetings",
  getParentRoute: () => Route$8
});
const LoginRoute = Route$3.update({
  id: "/login",
  path: "/login",
  getParentRoute: () => Route$8
});
const IndexRoute = Route$2.update({
  id: "/",
  path: "/",
  getParentRoute: () => Route$8
});
const MeetingsMeetingIdRoute = Route$1.update({
  id: "/$meetingId",
  path: "/$meetingId",
  getParentRoute: () => MeetingsRoute
});
const AuthCallbackRoute = Route.update({
  id: "/auth/callback",
  path: "/auth/callback",
  getParentRoute: () => Route$8
});
const MeetingsRouteChildren = {
  MeetingsMeetingIdRoute
};
const MeetingsRouteWithChildren = MeetingsRoute._addFileChildren(
  MeetingsRouteChildren
);
const rootRouteChildren = {
  IndexRoute,
  LoginRoute,
  MeetingsRoute: MeetingsRouteWithChildren,
  NewMeetingRoute,
  ProcessingRoute,
  SignupRoute,
  AuthCallbackRoute
};
const routeTree = Route$8._addFileChildren(rootRouteChildren)._addFileTypes();
const getRouter = () => {
  const queryClient = new QueryClient();
  const router2 = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0
  });
  return router2;
};
const router = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  getRouter
}, Symbol.toStringTag, { value: "Module" }));
export {
  Route$6 as R,
  USER_KEY as U,
  api as a,
  Route$1 as b,
  Route as c,
  router as r,
  useAuth as u
};
