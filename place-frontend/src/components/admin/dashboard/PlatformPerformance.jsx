import { Card, CardHeader } from "@/components/ui/Card";
import { Delta } from "@/components/ui/Delta";
import { Icon } from "@/components/ui/Icon";

const ICONS = {
  visits: "users",
  propertyViews: "home",
  bookings: "calendar",
  leads: "users",
  conversion: "activity",
};

export function PlatformPerformance({ metrics }) {
  return (
    <Card>
      <CardHeader title="Desempenho da Plataforma" description="Comparativo com o mês anterior" className="mb-2" />
      <ul>
        {metrics.map((m) => (
          <li key={m.id} className="flex items-center gap-3 py-1.75 text-[11px] text-ink-2">
            <span className="grid size-7.5 shrink-0 place-items-center rounded-full bg-gold/20 text-[#f3d3a0]">
              <Icon name={ICONS[m.id]} className="size-3.75" />
            </span>
            {m.label}
            <Delta value={m.delta} className="ml-auto text-[11px]" />
          </li>
        ))}
      </ul>
    </Card>
  );
}