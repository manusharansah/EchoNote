import { jsx, jsxs } from "react/jsx-runtime";
import { useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";
import { k as useGoogleCallback } from "./use-api-BoBrtaux.js";
import { c as Route } from "./router-ikPISU9n.js";
import "@tanstack/react-query";
function GoogleCallbackPage() {
  const navigate = useNavigate();
  const {
    code,
    error
  } = Route.useSearch();
  const googleCallback = useGoogleCallback();
  useEffect(() => {
    const finishSignIn = async () => {
      if (error) {
        toast.error("Google sign-in was cancelled");
        navigate({
          to: "/login"
        });
        return;
      }
      if (!code) {
        toast.error("Google did not return an authorization code");
        navigate({
          to: "/login"
        });
        return;
      }
      try {
        await googleCallback.mutateAsync(code);
        toast.success("Signed in with Google");
        navigate({
          to: "/meetings"
        });
      } catch (caughtError) {
        toast.error(caughtError instanceof Error ? caughtError.message : "Google sign-in failed");
        navigate({
          to: "/login"
        });
      }
    };
    finishSignIn();
  }, [code, error, googleCallback, navigate]);
  return /* @__PURE__ */ jsx("div", { className: "flex min-h-screen items-center justify-center bg-surface px-4", children: /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
    /* @__PURE__ */ jsx(Loader2, { className: "mx-auto h-8 w-8 animate-spin text-primary" }),
    /* @__PURE__ */ jsx("h1", { className: "mt-4 text-lg font-semibold", children: "Signing you in" }),
    /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-muted-foreground", children: "Finishing Google authentication..." })
  ] }) });
}
export {
  GoogleCallbackPage as component
};
