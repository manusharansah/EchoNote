import { Link } from "@tanstack/react-router";

export function Logo({ to = "/" as string }: { to?: string }) {
  return (
    <Link to={to} className="inline-flex items-center gap-2">
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground text-sm font-semibold shadow-soft">
        M
      </span>
      <span className="text-base font-semibold tracking-tight text-foreground">
        MeetingIQ
      </span>
    </Link>
  );
}
