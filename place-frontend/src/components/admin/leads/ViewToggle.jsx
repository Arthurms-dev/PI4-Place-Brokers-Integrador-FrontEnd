import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";

const OPTIONS = [
  { value: "table", label: "Tabela", icon: "list" },
  { value: "kanban", label: "Kanban", icon: "columns" },
];

export function ViewToggle({ value, onChange }) {
  return (
    <div role="group" aria-label="Alternar visualização" className="inline-flex rounded-lg border border-line bg-card-2 p-0.5">
      {OPTIONS.map((option) => {
        const active = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.value)}
            className={cn(
              "flex h-8 cursor-pointer items-center gap-2 rounded-md px-3 text-xs transition-colors",
              active ? "bg-gold-gradient font-medium text-[#1a1408]" : "text-ink-2 hover:text-ink",
            )}
          >
            <Icon name={option.icon} className="size-3.5" />
            {option.label}
          </button>
        );
      })}
    </div>
  );
}