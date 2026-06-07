import { Logo } from "./Logo";

const features = [
  "Automatic transcription with speaker detection",
  "AI-generated summaries and action items",
  "Version history with diff view and PDF export",
];

export function AuthShell({
  children,
  heading,
  subheading,
}: {
  children: React.ReactNode;
  heading: string;
  subheading: string;
}) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-[var(--bg)]">
      {/* Left brand panel */}
      <div className="relative hidden lg:flex flex-col justify-between p-12 overflow-hidden text-white"
        style={{
          background:
            "linear-gradient(160deg, #1c1f57 0%, #3b41c4 55%, #4f5ae8 100%)",
        }}
      >
        {/* soft orbs */}
        <div className="absolute -top-40 -left-40 h-[460px] w-[460px] rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-40 -right-32 h-[420px] w-[420px] rounded-full bg-indigo-300/20 blur-3xl" />
        <div className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.9) 1px, transparent 0)",
            backgroundSize: "22px 22px",
          }}
        />

        <div className="relative">
          <Logo size="md" />
        </div>

        <div className="relative space-y-8 max-w-md">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-200/90">
            AI-powered meeting minutes
          </p>
          <h2 className="font-display text-4xl font-bold leading-[1.1] tracking-tight">
            From raw recordings to{" "}
            <span className="text-indigo-200">polished minutes</span>{" "}
            — in minutes.
          </h2>
          <p className="text-indigo-100/80 text-[15px] leading-relaxed">
            Upload your audio and MeetingIQ handles the rest: transcription,
            speaker labels, structured summaries, action items and exportable
            PDFs.
          </p>

          <ul className="space-y-3 pt-2">
            {features.map((f) => (
              <li key={f} className="flex items-start gap-3 text-sm text-indigo-50/90">
                <span className="mt-1 grid h-5 w-5 flex-shrink-0 place-items-center rounded-full bg-white/15 ring-1 ring-white/25">
                  <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.8"
                      strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                {f}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-indigo-200/60">
          © {new Date().getFullYear()} MeetingIQ. Built for teams that ship.
        </p>
      </div>

      {/* Right form panel */}
      <div className="relative flex items-center justify-center px-6 py-12 sm:px-10">
        <div className="bg-grid pointer-events-none absolute inset-0 opacity-40 lg:hidden" />
        <div className="relative w-full max-w-[420px] animate-fade-up">
          {/* Mobile logo */}
          <div className="lg:hidden mb-10">
            <Logo size="md" />
          </div>

          <div className="mb-7">
            <h1 className="font-display text-[28px] leading-tight font-bold tracking-tight text-slate-900">
              {heading}
            </h1>
            <p className="mt-2 text-[15px] text-slate-500">{subheading}</p>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}

export function GoogleIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}
