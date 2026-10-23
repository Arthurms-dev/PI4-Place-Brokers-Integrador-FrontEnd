import { Card } from "@/components/ui/Card";
import { ContadorKpi } from "./ContadorKpi";
import { Delta } from "@/components/ui/Delta";
import { Icon } from "@/components/ui/Icon";

const ICONS = {
  vgv: "chart",
  visits: "users",
  topProperties: "home",
  bookings: "calendar",
  rating: "star",
};

export function KpiCards({ kpis }) {
  return (
    <section aria-label="Indicadores principais" className="pb-kpi-grid grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
      {kpis.map((kpi) => (
        <Card key={kpi.id} className={`pb-kpi-card relative min-w-0 px-5 py-5 sm:px-6 sm:py-6 ${kpi.id === "vgv" ? "pb-kpi-feature sm:col-span-2 xl:col-span-2" : "xl:col-span-1"}`}>
          <div className="flex items-center justify-between gap-3"><span className="text-[11px] font-semibold uppercase tracking-[0.055em] text-ink-2">{kpi.label}</span>
          <span className={`grid size-9 shrink-0 place-items-center rounded-xl border border-gold/15 text-gold ${kpi.id === "vgv" ? "bg-gold/15" : "bg-gold/8"}`}>
            <Icon name={ICONS[kpi.id]} className="size-[18px]" />
          </span></div>
          <div className={`pb-kpi-value mb-4 mt-4 break-words text-[clamp(1.5rem,1.95vw,2rem)] font-bold tracking-[-0.045em] tabular-nums ${kpi.id === "vgv" ? "text-gold" : "text-ink"}`}><ContadorKpi id={kpi.id} valor={kpi.value} /></div>
          <div className="pb-kpi-bottom flex flex-wrap items-center gap-x-2 gap-y-1 border-t border-line-soft pt-3"><Delta value={kpi.delta} /><span className="text-[11px] text-ink-3">{kpi.footnote}</span></div>
        </Card>
      ))}
    </section>
  );
}