import { Link } from "react-router-dom";
import { Card, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Icon } from "@/components/ui/Icon";
import { formatNumber } from "@/lib/format";

export function TopProperties({ properties }) {
  return (
    <Card>
      <CardHeader
        title="Imóveis mais procurados"
        description="Top 5 imóveis com mais visualizações"
        action={
          <Link to="/admin/imoveis" className="inline-flex items-center gap-1.5 whitespace-nowrap text-xs text-gold hover:underline">
            Ver todos <Icon name="arrowRight" className="size-3.5" />
          </Link>
        }
      />

      {properties.length === 0 ? (
        <EmptyState>Nenhum imóvel visualizado no período.</EmptyState>
      ) : (
        <ul>
          {properties.map((p, i) => (
            <li
              key={p.id}
              className="grid grid-cols-[22px_54px_1fr_auto] items-center gap-3 border-b border-line-soft py-2 last:border-0"
            >
              <span className="text-center text-[13px] text-ink-2">{i + 1}</span>
              <span className="grid h-9 w-13.5 place-items-center overflow-hidden rounded border border-line bg-linear-to-br from-[#2b4a78] to-[#14294a] text-white/55">
                {p.imageUrl ? (
                  <img src={p.imageUrl} alt="" className="size-full object-cover" />
                ) : (
                  <Icon name="building" className="size-5" strokeWidth={1.4} />
                )}
              </span>
              <div className="min-w-0">
                <div className="truncate text-xs font-medium">{p.title}</div>
                <div className="text-[11px] text-ink-3">
                  {p.city} - {p.state}
                </div>
              </div>
              <div className="whitespace-nowrap text-xs">
                {formatNumber(p.views)} <span className="text-[11px] text-ink-2">visualizações</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}