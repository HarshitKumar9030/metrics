import * as React from "react";
import { cn } from "@/lib/utils";

export function Input({ className, type = "text", ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-md border border-[color:var(--border)] bg-[color:var(--surface-2)] px-3 py-2 text-sm text-[color:var(--text)] placeholder:text-[color:var(--text-faint)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ring)]",
        className,
      )}
      {...props}
    />
  );
}
