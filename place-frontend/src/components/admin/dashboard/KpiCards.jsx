import { Card } from "@/components/ui/Card";
import { Delta } from "@/components/ui/Delta";
import { Icon } from "@/components/ui/Icon";
import { formatNumber } from "@/lib/format";

const ICONS = {
  vgv: "chart",
  visits: "users",
  topProperties: "home",
  bookings: "calendar",
  rating: "star",
};

function formatValue(kpi) {
  if (kpi.id === "vgv") {
    return kpi.value.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
  }
  return formatNumber(kpi.value, kpi.id === "rating" ? 1 : 0);
}

export function KpiCards({ kpis }) {
  return (
    <section aria-label="Indicadores principais" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
      {kpis.map((kpi) => (
        <Card key={kpi.id} className="flex gap-4.5 px-5 py-5.5">
          <span className="grid size-12 shrink-0 place-items-center rounded-full border border-gold/25 bg-gold/20 text-[#f3d3a0]">
            <Icon name={ICONS[kpi.id]} className="size-5.5" />
          </span>
          <div className="min-w-0">
            <div className="mt-1.5 text-[13px] text-ink-2">{kpi.label}</div>
            <div className="mb-2 mt-1 truncate text-[26px] font-bold tracking-tight">{formatValue(kpi)}</div>
            <Delta value={kpi.delta} />
            <div className="mt-0.5 text-xs text-ink-2">{kpi.footnote}</div>
          </div>
        </Card>
      ))}
    </section>
  );
}