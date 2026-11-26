import * as React from "react";
import { cn } from "@/lib/utils";

type StuworkButtonVariant =
  | "primary"
  | "default"
  | "accent"
  | "outline"
  | "secondary"
  | "ghost"
  | "danger"
  | "destructive";

type StuworkButtonSize = "sm" | "md" | "default" | "lg" | "icon";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: StuworkButtonVariant;
  size?: StuworkButtonSize;
}

const variantClasses: Record<StuworkButtonVariant, string> = {
  primary:
    "bg-[#00b14f] text-white shadow-sm hover:bg-[#009b45] active:bg-emerald-800",
  default:
    "bg-[#00b14f] text-white shadow-sm hover:bg-[#009b45] active:bg-emerald-800",
  accent:
    "bg-gradient-to-r from-[#00b14f] via-emerald-500 to-teal-500 text-white shadow-sm hover:from-[#009b45] hover:to-emerald-600",
  outline:
    "border border-slate-200 bg-white text-slate-800 hover:bg-emerald-50/50 hover:border-emerald-300 hover:text-emerald-800",
  secondary:
    "bg-emerald-50 text-emerald-800 hover:bg-emerald-100/80 border border-emerald-200/80",
  ghost: "text-slate-700 hover:bg-emerald-50 hover:text-emerald-800",
  danger: "bg-rose-600 text-white shadow-sm hover:bg-rose-700",
  destructive: "bg-rose-600 text-white shadow-sm hover:bg-rose-700",
};

const sizeClasses: Record<StuworkButtonSize, string> = {
  sm: "h-8 px-3 text-xs rounded-lg gap-1.5",
  md: "h-10 px-4 text-sm rounded-xl gap-2",
  default: "h-10 px-4 text-sm rounded-xl gap-2",
  lg: "h-12 px-6 text-base rounded-xl gap-2.5",
  icon: "h-9 w-9 rounded-xl justify-center",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", type = "button", ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          "inline-flex items-center justify-center font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 disabled:pointer-events-none disabled:opacity-55",
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "StuworkButton";
