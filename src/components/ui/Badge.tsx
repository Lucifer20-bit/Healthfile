import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | "default"
    | "primary"
    | "success"
    | "warning"
    | "danger"
    | "purple"
    | "info";
  size?: "sm" | "md";
  dot?: boolean;
}

export function Badge({
  className,
  children,
  variant = "default",
  size = "md",
  dot = false,
  ...props
}: BadgeProps) {
  const variants = {
    default: "bg-slate-800 text-slate-300 border-slate-700",
    primary: "bg-medical-500/15 text-medical-300 border-medical-500/30",
    success: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    warning: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    danger: "bg-rose-500/15 text-rose-300 border-rose-500/30",
    purple: "bg-purple-500/15 text-purple-300 border-purple-500/30",
    info: "bg-blue-500/15 text-blue-300 border-blue-500/30",
  };

  const dotColors = {
    default: "bg-slate-400",
    primary: "bg-medical-400 animate-pulse",
    success: "bg-emerald-400",
    warning: "bg-amber-400",
    danger: "bg-rose-400 animate-ping",
    purple: "bg-purple-400",
    info: "bg-blue-400",
  };

  const sizes = {
    sm: "text-[10px] px-2 py-0.5 gap-1 font-medium",
    md: "text-xs px-2.5 py-1 gap-1.5 font-medium",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border tracking-wide select-none",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn("w-1.5 h-1.5 rounded-full shrink-0", dotColors[variant])}
        />
      )}
      {children}
    </span>
  );
}
