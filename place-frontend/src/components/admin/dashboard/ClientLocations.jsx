import { Link } from "react-router-dom";
import { Card, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";

export function ClientLocations({ locations }) {
  return (
    <Card>
      <CardHeader
        title="Localidade dos Clientes"
        description="Cidades com mais acessos no site"
        action={
          <Link to="/admin/relatorios" className="inline-flex items-center gap-1.5 whitespace-nowrap text-[10px] text-gold hover:underline">
            Ver todos <Icon name="arrowRight" className="size-3" />
          </Link>
        }
      />

      <div className="grid items-center gap-2.5 sm:grid-cols-2">
        <BrazilMap />

        {locations.length === 0 ? (
          <EmptyState>Sem acessos registrados no período.</EmptyState>
        ) : (
          <ul className="flex flex-col gap-2.75">
            {locations.map((l, i) => (
              <li key={`${l.city}-${l.state}`} className="flex items-center gap-2.5 text-[11px] text-ink-2">
                <span className={cn("size-2.5 shrink-0 rounded-full", i === 1 ? "bg-gold" : "bg-[#7d8fae]")} />
                {l.city} - {l.state}
                <span className="ml-auto font-medium text-ink">{l.percent}%</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Card>
  );
}

/** Mapa estilizado (placeholder). Troque por um SVG real do Brasil quando tiver. */
function BrazilMap() {
  return (
    <svg viewBox="0 0 120 130" role="img" aria-label="Mapa do Brasil" className="h-auto max-h-37.5 w-full">
      <path
        d="M44 4 60 6 72 14 90 20 104 34 114 46 108 60 98 72 88 82 82 96 74 112 68 124 62 116 60 102 52 92 40 86 28 78 16 66 8 52 6 40 16 32 28 26 34 14Z"
        fill="#2a4a7d"
        stroke="#0d2040"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <path
        d="M28 26 34 44 22 58M60 6 58 30 44 46 40 86M72 14 76 44 96 50M58 30 88 40M44 46 74 62 98 72"
        fill="none"
        stroke="#0d2040"
        strokeWidth="1"
        opacity=".8"
      />
    </svg>
  );
}