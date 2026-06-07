import { jsxs, jsx } from "react/jsx-runtime";
import { useNavigate, useRouterState, Link } from "@tanstack/react-router";
import { LogOut } from "lucide-react";
import { L as Logo, c as cn, B as Button } from "./button-DRiz9d0t.js";
import { u as useAuth } from "./router-ikPISU9n.js";
function AppShell({ children }) {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { logout } = useAuth();
  const navItems = [
    { to: "/meetings", label: "Meetings" },
    { to: "/new-meeting", label: "New Meeting" }
  ];
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-background", children: [
    /* @__PURE__ */ jsxs("header", { className: "sticky top-0 z-30 border-b border-border bg-card/80 backdrop-blur", children: [
      /* @__PURE__ */ jsxs("div", { className: "mx-auto flex h-16 max-w-6xl items-center justify-between px-6", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-8", children: [
          /* @__PURE__ */ jsx(Logo, { to: "/meetings" }),
          /* @__PURE__ */ jsx("nav", { className: "hidden gap-1 md:flex", children: navItems.map((item) => {
            const active = pathname.startsWith(item.to);
            return /* @__PURE__ */ jsx(
              Link,
              {
                to: item.to,
                className: cn(
                  "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  active ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground"
                ),
                children: item.label
              },
              item.to
            );
          }) })
        ] }),
        /* @__PURE__ */ jsxs(
          Button,
          {
            variant: "ghost",
            size: "sm",
            onClick: () => {
              logout();
              navigate({ to: "/login" });
            },
            className: "text-muted-foreground",
            children: [
              /* @__PURE__ */ jsx(LogOut, { className: "h-4 w-4" }),
              "Sign Out"
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsx("nav", { className: "flex gap-1 border-t border-border px-6 py-2 md:hidden", children: navItems.map((item) => {
        const active = pathname.startsWith(item.to);
        return /* @__PURE__ */ jsx(
          Link,
          {
            to: item.to,
            className: cn(
              "rounded-md px-3 py-1.5 text-sm font-medium",
              active ? "bg-accent text-accent-foreground" : "text-muted-foreground"
            ),
            children: item.label
          },
          item.to
        );
      }) })
    ] }),
    /* @__PURE__ */ jsx("main", { className: "mx-auto max-w-6xl px-6 py-10", children })
  ] });
}
export {
  AppShell as A
};
