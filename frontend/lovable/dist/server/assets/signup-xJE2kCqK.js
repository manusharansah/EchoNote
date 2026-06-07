import { jsxs, jsx } from "react/jsx-runtime";
import { useNavigate, Link } from "@tanstack/react-router";
import { c as cn, L as Logo, B as Button } from "./button-DRiz9d0t.js";
import { G as GoogleButton } from "./GoogleButton-DszDW80x.js";
import { I as Input } from "./input-BfG4f_p9.js";
import { L as Label } from "./label-8OFGJuPk.js";
import { C as Checkbox } from "./checkbox-CAs_BWmM.js";
import * as React from "react";
import { useState } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { u as useRegister } from "./use-api-BoBrtaux.js";
import { toast } from "sonner";
import { a as api } from "./router-ikPISU9n.js";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "clsx";
import "tailwind-merge";
import "@radix-ui/react-label";
import "@radix-ui/react-checkbox";
import "@tanstack/react-query";
const Dialog = DialogPrimitive.Root;
const DialogPortal = DialogPrimitive.Portal;
const DialogOverlay = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  DialogPrimitive.Overlay,
  {
    ref,
    className: cn(
      "fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    ),
    ...props
  }
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;
const DialogContent = React.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxs(DialogPortal, { children: [
  /* @__PURE__ */ jsx(DialogOverlay, {}),
  /* @__PURE__ */ jsxs(
    DialogPrimitive.Content,
    {
      ref,
      className: cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:rounded-lg",
        className
      ),
      ...props,
      children: [
        children,
        /* @__PURE__ */ jsxs(DialogPrimitive.Close, { className: "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background cursor-pointer transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground", children: [
          /* @__PURE__ */ jsx(X, { className: "h-4 w-4" }),
          /* @__PURE__ */ jsx("span", { className: "sr-only", children: "Close" })
        ] })
      ]
    }
  )
] }));
DialogContent.displayName = DialogPrimitive.Content.displayName;
const DialogHeader = ({ className, ...props }) => /* @__PURE__ */ jsx("div", { className: cn("flex flex-col space-y-1.5 text-center sm:text-left", className), ...props });
DialogHeader.displayName = "DialogHeader";
const DialogFooter = ({ className, ...props }) => /* @__PURE__ */ jsx(
  "div",
  {
    className: cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className),
    ...props
  }
);
DialogFooter.displayName = "DialogFooter";
const DialogTitle = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  DialogPrimitive.Title,
  {
    ref,
    className: cn("text-lg font-semibold leading-none tracking-tight", className),
    ...props
  }
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;
const DialogDescription = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  DialogPrimitive.Description,
  {
    ref,
    className: cn("text-sm text-muted-foreground", className),
    ...props
  }
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;
function SignupPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [consent, setConsent] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalConsent, setModalConsent] = useState(false);
  const [authMode, setAuthMode] = useState("email");
  const registerMutation = useRegister();
  const onSubmit = (e) => {
    e.preventDefault();
    if (!consent) return;
    setAuthMode("email");
    setShowModal(true);
  };
  const onGoogle = () => {
    setAuthMode("google");
    setShowModal(true);
  };
  const confirm = async () => {
    if (!modalConsent) return;
    try {
      if (authMode === "google") {
        const {
          url
        } = await api.auth.getGoogleUrl();
        window.location.href = url;
        return;
      }
      await registerMutation.mutateAsync({
        email,
        password,
        full_name: name
      });
      toast.success("Account created successfully!");
      setShowModal(false);
      navigate({
        to: "/meetings"
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Registration failed";
      toast.error(message);
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "flex min-h-screen flex-col bg-surface", children: [
    /* @__PURE__ */ jsx("header", { className: "flex items-center justify-between px-6 py-5", children: /* @__PURE__ */ jsx(Logo, { to: "/login" }) }),
    /* @__PURE__ */ jsx("div", { className: "flex flex-1 items-center justify-center px-4 pb-16", children: /* @__PURE__ */ jsx("div", { className: "w-full max-w-md", children: /* @__PURE__ */ jsxs("div", { className: "rounded-2xl border border-border bg-card p-8 shadow-card", children: [
      /* @__PURE__ */ jsxs("div", { className: "mb-6 space-y-1", children: [
        /* @__PURE__ */ jsx("h1", { className: "text-2xl font-semibold tracking-tight", children: "Create your account" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Start generating AI-powered meeting minutes from recordings." })
      ] }),
      /* @__PURE__ */ jsx(GoogleButton, { label: "Sign up with Google", onClick: onGoogle }),
      /* @__PURE__ */ jsxs("div", { className: "my-6 flex items-center gap-3 text-xs uppercase tracking-wide text-muted-foreground", children: [
        /* @__PURE__ */ jsx("div", { className: "h-px flex-1 bg-border" }),
        "or",
        /* @__PURE__ */ jsx("div", { className: "h-px flex-1 bg-border" })
      ] }),
      /* @__PURE__ */ jsxs("form", { onSubmit, className: "space-y-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "name", children: "Full name" }),
          /* @__PURE__ */ jsx(Input, { id: "name", placeholder: "Jane Doe", value: name, onChange: (e) => setName(e.target.value), required: true })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "email", children: "Email" }),
          /* @__PURE__ */ jsx(Input, { id: "email", type: "email", placeholder: "you@company.com", value: email, onChange: (e) => setEmail(e.target.value), required: true })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsx(Label, { htmlFor: "password", children: "Password" }),
          /* @__PURE__ */ jsx(Input, { id: "password", type: "password", placeholder: "At least 8 characters", value: password, onChange: (e) => setPassword(e.target.value), required: true })
        ] }),
        /* @__PURE__ */ jsxs("label", { className: "flex gap-3 rounded-lg border border-border bg-surface p-3 text-xs leading-relaxed text-muted-foreground", children: [
          /* @__PURE__ */ jsx(Checkbox, { checked: consent, onCheckedChange: (v) => setConsent(Boolean(v)), className: "mt-0.5" }),
          /* @__PURE__ */ jsx("span", { children: "I understand that this platform processes meeting recordings using AI, and I am responsible for ensuring all meeting participants have consented before recording or uploading meetings." })
        ] }),
        /* @__PURE__ */ jsx(Button, { type: "submit", disabled: !consent, className: "h-11 w-full", children: "Create Account" })
      ] }),
      /* @__PURE__ */ jsxs("p", { className: "mt-6 text-center text-sm text-muted-foreground", children: [
        "Already have an account?",
        " ",
        /* @__PURE__ */ jsx(Link, { to: "/login", className: "font-medium text-primary hover:underline", children: "Sign in" })
      ] })
    ] }) }) }),
    /* @__PURE__ */ jsx(Dialog, { open: showModal, onOpenChange: setShowModal, children: /* @__PURE__ */ jsxs(DialogContent, { children: [
      /* @__PURE__ */ jsxs(DialogHeader, { children: [
        /* @__PURE__ */ jsx(DialogTitle, { children: "Confirm consent responsibility" }),
        /* @__PURE__ */ jsx(DialogDescription, { className: "pt-2", children: "Before creating your account, please confirm that you understand MeetingIQ processes meeting recordings using AI and that you are responsible for ensuring meeting participants have consented." })
      ] }),
      /* @__PURE__ */ jsxs("label", { className: "flex gap-3 rounded-lg border border-border bg-surface p-3 text-sm", children: [
        /* @__PURE__ */ jsx(Checkbox, { checked: modalConsent, onCheckedChange: (v) => setModalConsent(Boolean(v)), className: "mt-0.5" }),
        /* @__PURE__ */ jsx("span", { children: "I understand and agree." })
      ] }),
      /* @__PURE__ */ jsx(DialogFooter, { children: /* @__PURE__ */ jsx(Button, { onClick: confirm, disabled: !modalConsent || registerMutation.isPending, className: "w-full sm:w-auto", children: registerMutation.isPending ? "Creating..." : "Continue" }) })
    ] }) })
  ] });
}
export {
  SignupPage as component
};
