import { cn } from "@/lib/cn";

export function EmptyState({ children, className }) {
  return <p className={cn("px-2 py-6 text-center text-xs text-ink-3", className)}>{children}</p>;
}
