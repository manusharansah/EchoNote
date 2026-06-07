import { Sparkles } from "lucide-react";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showWordmark?: boolean;
}

const sizeMap = {
  sm: { box: "h-7 w-7 rounded-lg", icon: 14, text: "text-sm" },
  md: { box: "h-9 w-9 rounded-xl", icon: 18, text: "text-base" },
  lg: { box: "h-12 w-12 rounded-2xl", icon: 24, text: "text-lg" },
};

export function Logo({ size = "md", showWordmark = true }: LogoProps) {
  const s = sizeMap[size];
  return (
    <div className="inline-flex items-center gap-2.5">
      <div
        className={`${s.box} grid place-items-center text-white shadow-glow`}
        style={{
          background:
            "linear-gradient(135deg, #4f5ae8 0%, #3b41c4 50%, #5b48d6 100%)",
        }}
      >
        <Sparkles size={s.icon} strokeWidth={2.4} />
      </div>
      {showWordmark && (
        <span className={`font-display font-bold tracking-tight text-slate-900 ${s.text}`}>
          MeetingIQ
        </span>
      )}
    </div>
  );
}
