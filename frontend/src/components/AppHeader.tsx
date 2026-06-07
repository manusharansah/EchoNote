import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { Logo } from "./Logo";
import { useAuth } from "../context/AuthContext";

interface Crumb {
  label: string;
  to?: string;
}

interface AppHeaderProps {
  back?: { to: string; label?: string };
  crumbs?: Crumb[];
  title?: string;
  badge?: React.ReactNode;
  right?: React.ReactNode;
}

export function AppHeader({ back, crumbs, title, badge, right }: AppHeaderProps) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : user?.email?.[0]?.toUpperCase() ?? "?";

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-6">
        <div className="flex min-w-0 items-center gap-3">
          {back ? (
            <button
              onClick={() => navigate(back.to)}
              className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            >
              <ArrowLeft size={15} />
              <span className="hidden sm:inline">{back.label ?? "Back"}</span>
            </button>
          ) : (
            <Link to="/dashboard" className="flex items-center">
              <Logo size="sm" />
            </Link>
          )}

          {(crumbs || title) && (
            <>
              <span className="hidden h-5 w-px bg-slate-200 sm:block" />
              <div className="flex min-w-0 items-center gap-1.5 text-sm">
                {crumbs?.map((c, i) => (
                  <span key={i} className="flex min-w-0 items-center gap-1.5">
                    {i > 0 && <ChevronRight size={13} className="text-slate-300" />}
                    {c.to ? (
                      <Link to={c.to} className="text-slate-500 hover:text-slate-900 truncate">
                        {c.label}
                      </Link>
                    ) : (
                      <span className="truncate font-medium text-slate-900">{c.label}</span>
                    )}
                  </span>
                ))}
                {title && (
                  <span className="truncate font-medium text-slate-900">{title}</span>
                )}
                {badge}
              </div>
            </>
          )}
        </div>

        <div className="flex flex-shrink-0 items-center gap-2.5">
          {right}
          <div className="group relative">
            <button
              className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-white text-sm font-semibold ring-2 ring-white shadow-soft"
              title={user?.email}
            >
              {initials}
            </button>
            <div className="invisible absolute right-0 top-11 z-30 w-52 origin-top-right scale-95 rounded-xl border border-slate-200 bg-white p-2 opacity-0 shadow-card transition-all duration-150 group-hover:visible group-hover:scale-100 group-hover:opacity-100">
              <div className="px-2.5 py-2 border-b border-slate-100 mb-1">
                <p className="text-sm font-medium text-slate-900 truncate">
                  {user?.name || "Account"}
                </p>
                <p className="text-xs text-slate-500 truncate">{user?.email}</p>
              </div>
              <button
                onClick={logout}
                className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-sm text-slate-700 hover:bg-slate-100"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
