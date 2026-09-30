import { useState } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { EmptyState } from "@/components/ui/EmptyState";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import { formatPhone } from "@/lib/contact";
import { formatDateTime } from "@/lib/format";
import { formatLocation, needsAttention } from "@/lib/leads";
import { LeadStatusBadge } from "./LeadStatusBadge";

const PAGE_SIZE = 10;
const HEAD = "border-y border-line-soft px-3 py-2.5 text-[11px] font-normal text-ink-2";

export function LeadsTable({ leads, selectedId, onSelect, emptyMessage }) {
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(leads.length / PAGE_SIZE));
  const current = Math.min(page, totalPages);
  const start = (current - 1) * PAGE_SIZE;
  const rows = leads.slice(start, start + PAGE_SIZE);

  if (leads.length === 0) return <EmptyState className="py-12">{emptyMessage}</EmptyState>;

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full min-w-208 border-collapse text-left">
          <thead>
            <tr className="bg-white/3">
              <th className={cn(HEAD, "pl-5")}>Nome</th>
              <th className={HEAD}>Contato</th>
              <th className={HEAD}>Empreendimento</th>
              <th className={HEAD}>Recebido em</th>
              <th className={HEAD}>Corretor</th>
              <th className={HEAD}>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((lead) => (
              <tr
                key={lead.id}
                onClick={() => onSelect(lead.id)}
                className={cn(
                  "cursor-pointer border-b border-line-soft text-xs text-ink-2 transition-colors hover:bg-white/4",
                  selectedId === lead.id && "bg-white/6",
                )}
              >
                <td className="whitespace-nowrap py-2.5 pl-5 pr-3">
                  <button type="button" className="flex cursor-pointer items-center gap-2.5 text-left text-ink">
                    <Avatar name={lead.nome} className="size-7 text-[10px]" />
                    <span className="font-medium">{lead.nome}</span>
                    {needsAttention(lead) && (
                      <span title="Novo e sem corretor" className="size-1.5 rounded-full bg-gold">
                        <span className="sr-only">Novo e sem corretor</span>
                      </span>
                    )}
                  </button>
                </td>
                <td className="whitespace-nowrap px-3">
                  <div>{formatPhone(lead.telefone) || "—"}</div>
                  <div className="text-[11px] text-ink-3">{lead.email || "—"}</div>
                </td>
                <td className="max-w-64 px-3">
                  {lead.empreendimento ? (
                    <>
                      <div className="truncate text-ink">{lead.empreendimento.nome}</div>
                      <div className="truncate text-[11px] text-ink-3">{formatLocation(lead.empreendimento)}</div>
                    </>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="whitespace-nowrap px-3">{formatDateTime(lead.criadoEm)}</td>
                <td className="whitespace-nowrap px-3">
                  {lead.corretor ? lead.corretor.nome : <span className="text-gold">Sem corretor</span>}
                </td>
                <td className="whitespace-nowrap px-3">
                  <LeadStatusBadge status={lead.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between gap-3 px-5 py-3 text-xs text-ink-2">
        <span>
          Mostrando {start + 1}–{start + rows.length} de {leads.length}
        </span>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            aria-label="Página anterior"
            disabled={current === 1}
            onClick={() => setPage(current - 1)}
            className="grid size-7 cursor-pointer place-items-center rounded-md border border-line hover:border-gold disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Icon name="chevronLeft" className="size-3.5" />
          </button>
          <span className="px-1">
            {current} / {totalPages}
          </span>
          <button
            type="button"
            aria-label="Próxima página"
            disabled={current === totalPages}
            onClick={() => setPage(current + 1)}
            className="grid size-7 cursor-pointer place-items-center rounded-md border border-line hover:border-gold disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Icon name="chevronRight" className="size-3.5" />
          </button>
        </div>
      </div>
    </>
  );
}