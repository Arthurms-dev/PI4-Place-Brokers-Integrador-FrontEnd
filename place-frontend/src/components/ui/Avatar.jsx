import { cn } from "@/lib/cn";
import { initials } from "@/lib/format";

export function Avatar({ name, src, className }) {
  const base = "grid size-8.5 shrink-0 place-items-center overflow-hidden rounded-full border border-white/15 text-xs font-bold text-[#1a1408]";
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={name} className={cn(base, "object-cover", className)} />;
  }
  return (
    <span className={cn(base, "bg-linear-to-br from-[#f1c583] to-gold-2", className)} aria-hidden="true">
      {initials(name)}
    </span>
  );
}
