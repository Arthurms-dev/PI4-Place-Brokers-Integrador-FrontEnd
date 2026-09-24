import { Icon } from "@/components/ui/Icon";
import { formatDate } from "@/lib/format";

export function DashboardHeader({ firstName, period }) {
  return (
    <section className="mb-1.5 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-[22px] font-medium tracking-tight sm:text-[26px]">Olá, {firstName}! 👋</h1>
        <p className="mt-0.5 text-sm text-ink-2">
          Confira o desempenho da sua plataforma e acompanhe os principais indicadores.
        </p>
      </div>

      <button
        type="button"
        aria-label="Alterar período"
        className="flex h-9.5 items-center gap-3 rounded-lg border border-line bg-card-2 px-3.5 text-xs text-ink-2 hover:border-gold"
      >
        <Icon name="calendar" className="size-3.5" />
        <span>
          {formatDate(period.start)} - {formatDate(period.end)}
        </span>
        <span className="mx-0.5 h-full w-px bg-line" />
        <Icon name="chevronDown" className="size-3.5" />
      </button>
    </section>
  );
}
