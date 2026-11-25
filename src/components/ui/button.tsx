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
    "bg-blue-700 text-white shadow-sm hover:bg-blue-800 active:bg-blue-900",
  default:
    "bg-blue-700 text-white shadow-sm hover:bg-blue-800 active:bg-blue-900",
  accent:
    "bg-gradient-to-r from-cyan-500 to-teal-500 text-white shadow-sm hover:from-cyan-600 hover:to-teal-600",
  outline:
    "border border-slate-200 bg-white text-slate-800 hover:bg-slate-50 hover:border-slate-300",
  secondary:
    "bg-blue-50 text-blue-800 hover:bg-blue-100/80 border border-blue-100",
  ghost: "text-slate-700 hover:bg-slate-100 hover:text-slate-900",
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
          "inline-flex items-center justify-center font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 disabled:pointer-events-none disabled:opacity-55",
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
