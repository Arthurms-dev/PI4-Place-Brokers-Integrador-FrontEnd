import { cn } from "@/lib/cn";
import { Icon } from "./Icon";

export function Delta({ value, className }) {
  if (value === 0) {
    return <span className={cn("text-xs font-medium text-ink-3", className)}>0%</span>;
  }
  const up = value > 0;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-xs font-medium",
        up ? "text-ok" : "text-danger",
        className,
      )}
    >
      <Icon name={up ? "arrowUp" : "arrowDown"} className="size-3.5" strokeWidth={2.2} />
      {Math.abs(value)}%
    </span>
  );
}