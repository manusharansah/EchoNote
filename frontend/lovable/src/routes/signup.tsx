import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Logo } from "@/components/Logo";
import { GoogleButton } from "@/components/GoogleButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import { useRegister } from "@/hooks/use-api";
import { toast } from "sonner";
import { api } from "@/lib/api";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Create account — MeetingIQ" },
      {
        name: "description",
        content: "Create your MeetingIQ account to generate AI-powered meeting minutes.",
      },
    ],
  }),
  component: SignupPage,
});

function SignupPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [consent, setConsent] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalConsent, setModalConsent] = useState(false);
  const [authMode, setAuthMode] = useState<"email" | "google">("email");
  const registerMutation = useRegister();

  const onSubmit = (e: React.FormEvent) => {
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
        const { url } = await api.auth.getGoogleUrl();
        window.location.href = url;
        return;
      }

      await registerMutation.mutateAsync({
        email,
        password,
        full_name: name,
      });
      toast.success("Account created successfully!");
      setShowModal(false);
      navigate({ to: "/meetings" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Registration failed";
      toast.error(message);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <header className="flex items-center justify-between px-6 py-5">
        <Logo to="/login" />
      </header>
      <div className="flex flex-1 items-center justify-center px-4 pb-16">
        <div className="w-full max-w-md">
          <div className="rounded-2xl border border-border bg-card p-8 shadow-card">
            <div className="mb-6 space-y-1">
              <h1 className="text-2xl font-semibold tracking-tight">Create your account</h1>
              <p className="text-sm text-muted-foreground">
                Start generating AI-powered meeting minutes from recordings.
              </p>
            </div>

            <GoogleButton label="Sign up with Google" onClick={onGoogle} />

            <div className="my-6 flex items-center gap-3 text-xs uppercase tracking-wide text-muted-foreground">
              <div className="h-px flex-1 bg-border" />
              or
              <div className="h-px flex-1 bg-border" />
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="name">Full name</Label>
                <Input
                  id="name"
                  placeholder="Jane Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <label className="flex gap-3 rounded-lg border border-border bg-surface p-3 text-xs leading-relaxed text-muted-foreground">
                <Checkbox
                  checked={consent}
                  onCheckedChange={(v) => setConsent(Boolean(v))}
                  className="mt-0.5"
                />
                <span>
                  I understand that this platform processes meeting recordings using AI, and I am
                  responsible for ensuring all meeting participants have consented before recording
                  or uploading meetings.
                </span>
              </label>

              <Button type="submit" disabled={!consent} className="h-11 w-full">
                Create Account
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="font-medium text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm consent responsibility</DialogTitle>
            <DialogDescription className="pt-2">
              Before creating your account, please confirm that you understand MeetingIQ processes
              meeting recordings using AI and that you are responsible for ensuring meeting
              participants have consented.
            </DialogDescription>
          </DialogHeader>
          <label className="flex gap-3 rounded-lg border border-border bg-surface p-3 text-sm">
            <Checkbox
              checked={modalConsent}
              onCheckedChange={(v) => setModalConsent(Boolean(v))}
              className="mt-0.5"
            />
            <span>I understand and agree.</span>
          </label>
          <DialogFooter>
            <Button
              onClick={confirm}
              disabled={!modalConsent || registerMutation.isPending}
              className="w-full sm:w-auto"
            >
              {registerMutation.isPending ? "Creating..." : "Continue"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
