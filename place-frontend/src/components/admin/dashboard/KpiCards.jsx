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

// Colunas no desktop: o VGV ocupa 2, os demais 1 cada, tudo numa linha só (sem buraco no fim).
const COLUNAS_XL = { 2: "xl:grid-cols-3", 3: "xl:grid-cols-4", 4: "xl:grid-cols-5", 5: "xl:grid-cols-6" };

export function KpiCards({ kpis }) {
  // Abaixo de 1280 px são 2 colunas: se sobrar um card sozinho na última linha, ele ocupa a linha toda.
  const sobraUm = kpis.filter((k) => k.id !== "vgv").length % 2 === 1;
  return (
    <section aria-label="Indicadores principais" className={`pb-kpi-grid grid grid-cols-2 gap-3 sm:gap-4 ${COLUNAS_XL[kpis.length] ?? "xl:grid-cols-3"}`}>
      {kpis.map((kpi, i) => (
        <Card key={kpi.id} className={`pb-kpi-card relative min-w-0 px-4 py-4 sm:px-6 sm:py-6 ${kpi.id === "vgv" ? "pb-kpi-feature col-span-2" : `xl:col-span-1 ${sobraUm && i === kpis.length - 1 ? "max-xl:col-span-2" : ""}`}`}>
          {/* Rótulo quebra só entre palavras; no celular o ícone sai para caber "VISUALIZAÇÕES". */}
          <div className="flex items-center justify-between gap-3"><span className="min-w-0 text-xs font-semibold uppercase tracking-[0.055em] text-ink-2 [overflow-wrap:normal] [word-break:normal] hyphens-auto">{kpi.label}</span>
          <span className={`grid size-9 shrink-0 place-items-center rounded-xl border border-gold/15 text-gold max-[479px]:hidden ${kpi.id === "vgv" ? "bg-gold/15" : "bg-gold/8"}`}>
            <Icon name={ICONS[kpi.id]} className="size-[18px]" />
          </span></div>
          <div className={`pb-kpi-value mb-4 mt-4 break-words text-[clamp(1.5rem,1.95vw,2rem)] font-bold tracking-[-0.045em] tabular-nums ${kpi.id === "vgv" ? "text-gold" : "text-ink"}`}><ContadorKpi id={kpi.id} valor={kpi.value} /></div>
          <div className="pb-kpi-bottom flex flex-wrap items-center gap-x-2 gap-y-1 border-t border-line-soft pt-3"><Delta value={kpi.delta} /><span className="text-xs text-ink-3">{kpi.footnote}</span></div>
        </Card>
      ))}
    </section>
  );
}
