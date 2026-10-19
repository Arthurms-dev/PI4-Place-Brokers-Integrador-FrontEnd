import { cn } from "@/lib/cn";
import { STATUS_BY_VALUE } from "@/lib/leads";

export function LeadStatusBadge({ status }) {
  const info = STATUS_BY_VALUE[status];
  return (
    <span
      className={cn(
        "inline-block whitespace-nowrap rounded-full border px-3 py-px text-[10px]",
        info?.badge,
      )}
    >
      {info?.label ?? status}
    </span>
  );
}