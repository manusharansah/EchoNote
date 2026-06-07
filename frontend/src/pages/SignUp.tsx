import { useState, FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, AlertCircle, ArrowRight, Check } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../api/client";
import { AuthShell, GoogleIcon } from "../components/AuthShell";

export default function SignUp() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [workspace, setWorkspace] = useState("");
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!consent) return;
    setError("");
    setLoading(true);
    try {
      await api.post("/auth/register", { email, password, name });
      const res = await api.post("/auth/login", { email, password });
      await login(res.data.access_token);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Sign up failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = () => {
    window.location.href = "/auth/google";
  };

  const passwordOk = password.length >= 8;

  return (
    <AuthShell
      heading="Create your account"
      subheading="Start generating AI-powered meeting minutes from any recording."
    >
      <button onClick={handleGoogle} className="btn-secondary w-full">
        <GoogleIcon />
        <span>Sign up with Google</span>
      </button>

      <div className="divider-or my-6">or</div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
            <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label className="label" htmlFor="name">Full name</label>
          <input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Jane Doe"
            className="input"
          />
        </div>

        <div>
          <label className="label" htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            placeholder="you@company.com"
            className="input"
          />
        </div>

        <div>
          <label className="label" htmlFor="password">Password</label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
              placeholder="At least 8 characters"
              className="input pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 grid place-items-center h-7 w-7 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          {password.length > 0 && (
            <p
              className={`mt-1.5 flex items-center gap-1.5 text-xs ${
                passwordOk ? "text-emerald-600" : "text-slate-400"
              }`}
            >
              <Check size={12} />
              At least 8 characters
            </p>
          )}
        </div>

        <div>
          <label className="label" htmlFor="workspace">Workspace name</label>
          <input
            id="workspace"
            value={workspace}
            onChange={(e) => setWorkspace(e.target.value)}
            placeholder="e.g. Project Alpha"
            className="input"
          />
          <p className="mt-1.5 text-xs text-slate-400">
            Create a workspace for your team, project, or meeting group.
          </p>
        </div>

        <label className="flex items-start gap-2.5 rounded-lg border border-slate-200 bg-slate-50/60 px-3.5 py-3 cursor-pointer hover:bg-slate-50">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500/40"
          />
          <span className="text-xs leading-relaxed text-slate-600">
            I understand that this platform processes meeting recordings using AI,
            and I am responsible for ensuring all meeting participants have
            consented before recording or uploading meetings.
          </span>
        </label>

        <button
          type="submit"
          disabled={loading || !consent}
          className="btn-primary w-full mt-2"
        >
          {loading ? (
            <>
              <div className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
              Creating account…
            </>
          ) : (
            <>
              Create account
              <ArrowRight size={16} />
            </>
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link to="/signin" className="font-semibold text-brand-600 hover:text-brand-700">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
