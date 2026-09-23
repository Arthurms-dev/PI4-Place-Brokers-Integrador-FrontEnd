import { Card } from "@/components/ui/Card";
import { Delta } from "@/components/ui/Delta";
import { Icon } from "@/components/ui/Icon";
import { formatNumber } from "@/lib/format";

const ICONS = {
  visits: "users",
  topProperties: "home",
  bookings: "calendar",
  rating: "star",
};

export function KpiCards({ kpis }) {
  return (
    <section aria-label="Indicadores principais" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {kpis.map((kpi) => (
        <Card key={kpi.id} className="flex gap-4.5 px-5 py-5.5">
          <span className="grid size-12 shrink-0 place-items-center rounded-full border border-gold/25 bg-gold/20 text-[#f3d3a0]">
            <Icon name={ICONS[kpi.id]} className="size-5.5" />
          </span>
          <div>
            <div className="mt-1.5 text-[13px] text-ink-2">{kpi.label}</div>
            <div className="mb-2 mt-1 text-[26px] font-bold tracking-tight">
              {formatNumber(kpi.value, kpi.id === "rating" ? 1 : 0)}
            </div>
            <Delta value={kpi.delta} />
            <div className="mt-0.5 text-xs text-ink-2">{kpi.footnote}</div>
          </div>
        </Card>
      ))}
    </section>
  );
}