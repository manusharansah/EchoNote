import { jsxs, jsx } from "react/jsx-runtime";
import { useNavigate, Link } from "@tanstack/react-router";
import { L as Logo, B as Button } from "./button-DRiz9d0t.js";
import { G as GoogleButton } from "./GoogleButton-DszDW80x.js";
import { I as Input } from "./input-BfG4f_p9.js";
import { L as Label } from "./label-8OFGJuPk.js";
import { useState } from "react";
import { h as useLogin } from "./use-api-BoBrtaux.js";
import { toast } from "sonner";
import { a as api } from "./router-ikPISU9n.js";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "clsx";
import "tailwind-merge";
import "@radix-ui/react-label";
import "@tanstack/react-query";
function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const loginMutation = useLogin();
  const onGoogle = async () => {
    try {
      const {
        url
      } = await api.auth.getGoogleUrl();
      window.location.href = url;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Google sign-in failed";
      toast.error(message);
    }
  };
  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      await loginMutation.mutateAsync({
        email,
        password
      });
      toast.success("Signed in successfully!");
      navigate({
        to: "/meetings"
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Login failed";
      toast.error(message);
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "flex min-h-screen flex-col bg-surface", children: [
    /* @__PURE__ */ jsx("header", { className: "flex items-center justify-between px-6 py-5", children: /* @__PURE__ */ jsx(Logo, { to: "/login" }) }),
    /* @__PURE__ */ jsx("div", { className: "flex flex-1 items-center justify-center px-4 pb-16", children: /* @__PURE__ */ jsxs("div", { className: "w-full max-w-md", children: [
      /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-border bg-card p-8 shadow-card", children: [
        /* @__PURE__ */ jsxs("div", { className: "mb-6 space-y-1", children: [
          /* @__PURE__ */ jsx("h1", { className: "text-2xl font-semibold tracking-tight", children: "Welcome back" }),
          /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Sign in to manage your meetings, transcripts, and minutes." })
        ] }),
        /* @__PURE__ */ jsx(GoogleButton, { label: "Continue with Google", onClick: onGoogle }),
        /* @__PURE__ */ jsxs("div", { className: "my-6 flex items-center gap-3 text-xs uppercase tracking-wide text-muted-foreground", children: [
          /* @__PURE__ */ jsx("div", { className: "h-px flex-1 bg-border" }),
          "or",
          /* @__PURE__ */ jsx("div", { className: "h-px flex-1 bg-border" })
        ] }),
        /* @__PURE__ */ jsxs("form", { onSubmit, className: "space-y-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsx(Label, { htmlFor: "email", children: "Email" }),
            /* @__PURE__ */ jsx(Input, { id: "email", type: "email", placeholder: "you@company.com", value: email, onChange: (e) => setEmail(e.target.value), required: true, disabled: loginMutation.isPending })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
              /* @__PURE__ */ jsx(Label, { htmlFor: "password", children: "Password" }),
              /* @__PURE__ */ jsx("a", { href: "#", className: "text-xs font-medium text-primary hover:underline", children: "Forgot password?" })
            ] }),
            /* @__PURE__ */ jsx(Input, { id: "password", type: "password", placeholder: "••••••••", value: password, onChange: (e) => setPassword(e.target.value), required: true, disabled: loginMutation.isPending })
          ] }),
          /* @__PURE__ */ jsx(Button, { type: "submit", className: "h-11 w-full", disabled: loginMutation.isPending, children: loginMutation.isPending ? "Signing in..." : "Sign In" })
        ] }),
        /* @__PURE__ */ jsxs("p", { className: "mt-6 text-center text-sm text-muted-foreground", children: [
          "New to MeetingIQ?",
          " ",
          /* @__PURE__ */ jsx(Link, { to: "/signup", className: "font-medium text-primary hover:underline", children: "Create account" })
        ] })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "mt-6 px-2 text-center text-xs leading-relaxed text-muted-foreground", children: "By using MeetingIQ, you agree to process only meetings where participants have provided consent." })
    ] }) })
  ] });
}
export {
  LoginPage as component
};
