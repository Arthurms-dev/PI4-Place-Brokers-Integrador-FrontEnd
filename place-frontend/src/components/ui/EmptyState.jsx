import { cn } from "@/lib/cn";

export function EmptyState({ children, className }) {
  return <p className={cn("rounded-xl border border-dashed border-line/70 bg-card-2/40 px-6 py-10 text-center text-[13px] leading-6 text-ink-2", className)}>{children}</p>;
}
