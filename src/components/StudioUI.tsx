import type { ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";

export function Panel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-white/5 bg-card p-6 shadow-[0_18px_48px_-24px_rgba(0,0,0,0.9)]",
        className,
      )}
    >
      {children}
    </section>
  );
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost";
};

export function ActionButton({ variant = "primary", className, ...props }: ButtonProps) {
  return (
    <button
      {...props}
      className={cn(
        "inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-medium transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50",
        variant === "primary"
          ? "bg-primary text-primary-foreground hover:-translate-y-[2px] hover:bg-primary-hover"
          : "border border-white/10 text-body-text hover:border-primary hover:text-primary",
        className,
      )}
    />
  );
}

export function Notice({ tone, children }: { tone: "error" | "info"; children: ReactNode }) {
  return (
    <p
      className={cn(
        "mt-4 rounded-xl border px-4 py-3 text-sm",
        tone === "error"
          ? "border-destructive/40 bg-destructive/10 text-destructive"
          : "border-primary/30 bg-primary/10 text-body-text",
      )}
    >
      {children}
    </p>
  );
}

export function LoadingBar({ label }: { label: string }) {
  return (
    <div className="mt-4">
      <p className="mb-2 text-sm text-body-text">{label}</p>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-deep">
        <div className="h-full w-1/3 animate-[loading_1.4s_ease-in-out_infinite] rounded-full bg-primary" />
      </div>
    </div>
  );
}

export function PreviewFrame({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-[260px] items-center justify-center overflow-hidden rounded-xl border border-dashed border-white/10 bg-surface-deep p-2 text-sm text-footer-text">
      {children}
    </div>
  );
}
