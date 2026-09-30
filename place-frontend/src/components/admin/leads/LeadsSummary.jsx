import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/cn";
import { STATUS_BY_VALUE } from "@/lib/leads";

const LABELS = {
  novo: "Novos",
  em_atendimento: "Em atendimento",
  convertido: "Convertidos",
  perdido: "Perdidos",
};

export function LeadsSummary({ leads }) {
  const count = (status) => leads.filter((l) => l.status === status).length;
  const total = leads.length;
  const rate = total ? Math.round((count("convertido") / total) * 100) : 0;

  const items = [
    { key: "total", label: "Total de leads", value: total, note: "recebidos pelo site", dot: "bg-ink-3" },
    ...Object.keys(LABELS).map((status) => ({
      key: status,
      label: LABELS[status],
      value: count(status),
      note: status === "convertido" ? `${rate}% de conversão` : "",
      dot: STATUS_BY_VALUE[status].dot,
    })),
  ];

  return (
    <section aria-label="Resumo dos leads" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {items.map((item) => (
        <Card key={item.key} className="px-5 py-4">
          <div className="flex items-center gap-2 text-[13px] text-ink-2">
            <span className={cn("size-2 rounded-full", item.dot)} />
            {item.label}
          </div>
          <div className="mt-1.5 text-2xl font-bold tracking-tight">{item.value}</div>
          <div className="mt-0.5 min-h-4 text-xs text-ink-2">{item.note}</div>
        </Card>
      ))}
    </section>
  );
}