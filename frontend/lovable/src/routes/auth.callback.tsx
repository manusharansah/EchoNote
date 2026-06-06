import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";
import { useGoogleCallback } from "@/hooks/use-api";

export const Route = createFileRoute("/auth/callback")({
  validateSearch: (search: Record<string, unknown>) => ({
    code: typeof search.code === "string" ? search.code : undefined,
    error: typeof search.error === "string" ? search.error : undefined,
  }),
  component: GoogleCallbackPage,
});

function GoogleCallbackPage() {
  const navigate = useNavigate();
  const { code, error } = Route.useSearch();
  const googleCallback = useGoogleCallback();

  useEffect(() => {
    const finishSignIn = async () => {
      if (error) {
        toast.error("Google sign-in was cancelled");
        navigate({ to: "/login" });
        return;
      }

      if (!code) {
        toast.error("Google did not return an authorization code");
        navigate({ to: "/login" });
        return;
      }

      try {
        await googleCallback.mutateAsync(code);
        toast.success("Signed in with Google");
        navigate({ to: "/meetings" });
      } catch (caughtError) {
        toast.error(caughtError instanceof Error ? caughtError.message : "Google sign-in failed");
        navigate({ to: "/login" });
      }
    };

    finishSignIn();
  }, [code, error]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4">
      <div className="text-center">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
        <h1 className="mt-4 text-lg font-semibold">Signing you in</h1>
        <p className="mt-1 text-sm text-muted-foreground">Finishing Google authentication...</p>
      </div>
    </div>
  );
}