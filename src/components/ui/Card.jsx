import { cn } from "@/lib/cn";

export function Card({ className, ...props }) {
  return (
    <article
      className={cn("pb-panel min-w-0 rounded-2xl border border-line bg-card p-5", className)}
      {...props}
    />
  );
}

export function CardHeader({ title, description, action, className }) {
  return (
    <div className={cn("mb-5 flex items-start justify-between gap-3", className)}>
      <div>
        <h3 className="text-[15px] font-semibold tracking-tight">{title}</h3>
        {description && <p className="mt-0.5 text-xs text-ink-2">{description}</p>}
      </div>
      {action}
    </div>
  );
}
