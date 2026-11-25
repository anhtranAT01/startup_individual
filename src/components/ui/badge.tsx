import * as React from "react";
import { cn } from "@/lib/utils";

type BadgeTone =
  | "default"
  | "verified"
  | "warning"
  | "danger"
  | "neutral"
  | "cyan"
  | "demo";

const toneStyles: Record<BadgeTone, string> = {
  default: "bg-blue-50 text-blue-700 border-blue-200",
  verified: "bg-emerald-50 text-emerald-700 border-emerald-200",
  warning: "bg-amber-50 text-amber-700 border-amber-200",
  danger: "bg-rose-50 text-rose-700 border-rose-200",
  neutral: "bg-slate-100 text-slate-700 border-slate-200",
  cyan: "bg-cyan-50 text-cyan-700 border-cyan-200",
  demo: "bg-indigo-50/90 text-indigo-700 border-indigo-200/80",
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
}

export function Badge({ className, tone = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium leading-5",
        toneStyles[tone],
        className
      )}
      {...props}
    />
  );
}
