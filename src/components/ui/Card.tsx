import React from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glow?: boolean;
  hoverEffect?: boolean;
}

export function Card({
  className,
  children,
  glow = false,
  hoverEffect = false,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl bg-slate-900/80 border border-slate-800/90 backdrop-blur-xl p-6 transition-all duration-200",
        glow && "glass-card-glow border-medical-500/20 shadow-lg shadow-medical-950/40",
        hoverEffect && "glass-panel-hover hover:border-slate-700",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex items-center justify-between gap-4 mb-4", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardTitle({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn("text-lg font-bold text-white tracking-tight flex items-center gap-2", className)}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardDescription({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("text-xs text-slate-400 leading-relaxed", className)}
      {...props}
    >
      {children}
    </p>
  );
}
