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
const HEAD = "border-b border-line px-3 py-3.5 text-xs font-semibold uppercase tracking-[0.09em] text-ink-3";

export function LeadsTable({ leads, selectedId, onSelect, emptyMessage }) {
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(leads.length / PAGE_SIZE));
  const current = Math.min(page, totalPages);
  const start = (current - 1) * PAGE_SIZE;
  const rows = leads.slice(start, start + PAGE_SIZE);

  if (leads.length === 0) return <EmptyState className="py-12">{emptyMessage}</EmptyState>;

  return (
    <>
      {/* Celular: cartões (a tabela só mostrava Nome e Contato). */}
      <ul className="divide-y divide-line-soft md:hidden">
        {rows.map((lead) => (
          <li key={lead.id}>
            <button type="button" onClick={() => onSelect(lead.id)} aria-label={`Ver detalhes de ${lead.nome}`}
              className={cn("flex w-full flex-col gap-1.5 px-4 py-3.5 text-left text-[13px] text-ink-2 hover:bg-white/4", selectedId === lead.id && "bg-white/6")}>
              <span className="flex w-full items-center justify-between gap-3">
                <span className="flex min-w-0 items-center gap-2 font-medium text-ink">
                  <span className="truncate">{lead.nome}</span>
                  {needsAttention(lead) && <span title="Novo e sem corretor" className="size-1.5 shrink-0 rounded-full bg-gold" />}
                </span>
                <LeadStatusBadge status={lead.status} />
              </span>
              <span className="truncate">{lead.empreendimento?.nome ?? "Sem empreendimento"} · {formatDateTime(lead.criadoEm)}</span>
              <span className="truncate text-xs text-ink-3">
                {formatPhone(lead.telefone) || "Sem telefone"} · {lead.corretor ? lead.corretor.nome : <span className="text-gold">Sem corretor</span>}
              </span>
            </button>
          </li>
        ))}
      </ul>

      <div className="hidden overflow-x-auto md:block">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="bg-card-2/80">
              <th className={cn(HEAD, "pl-5")}>Nome</th>
              <th className={HEAD}>Status</th>
              <th className={HEAD}>Contato</th>
              <th className={HEAD}>Empreendimento</th>
              <th className={HEAD}>Corretor</th>
              <th className={HEAD}>Recebido em</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((lead) => (
              <tr
                key={lead.id}
                onClick={() => onSelect(lead.id)}
                className={cn(
                  "cursor-pointer border-b border-line-soft text-[13px] text-ink-2 transition-colors hover:bg-white/4",
                  selectedId === lead.id && "bg-white/6",
                )}
              >
                <td className="whitespace-nowrap py-3.5 pl-5 pr-3">
                  <button type="button" onClick={() => onSelect(lead.id)} aria-label={`Ver detalhes de ${lead.nome}`} className="flex min-h-11 cursor-pointer items-center gap-2.5 text-left text-ink hover:text-gold">
                    <Avatar name={lead.nome} className="size-7 text-xs" />
                    <span className="font-medium">{lead.nome}</span>
                    {needsAttention(lead) && (
                      <span title="Novo e sem corretor" className="size-1.5 rounded-full bg-gold">
                        <span className="sr-only">Novo e sem corretor</span>
                      </span>
                    )}
                  </button>
                </td>
                <td className="whitespace-nowrap px-3">
                  <LeadStatusBadge status={lead.status} />
                </td>
                <td className="max-w-52 px-3">
                  <div className="whitespace-nowrap">{formatPhone(lead.telefone) || "—"}</div>
                  <div className="truncate text-xs text-ink-3" title={lead.email || undefined}>{lead.email || "—"}</div>
                </td>
                <td className="max-w-56 px-3">
                  {lead.empreendimento ? (
                    <>
                      <div className="truncate text-ink">{lead.empreendimento.nome}</div>
                      <div className="truncate text-xs text-ink-3">{formatLocation(lead.empreendimento)}</div>
                    </>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="max-w-40 truncate px-3">
                  {lead.corretor ? lead.corretor.nome : <span className="text-gold">Sem corretor</span>}
                </td>
                <td className="whitespace-nowrap px-3">{formatDateTime(lead.criadoEm)}</td>
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
            className="grid size-11 cursor-pointer place-items-center rounded-md border border-line hover:border-gold disabled:cursor-not-allowed disabled:opacity-40"
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
            className="grid size-11 cursor-pointer place-items-center rounded-md border border-line hover:border-gold disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Icon name="chevronRight" className="size-3.5" />
          </button>
        </div>
      </div>
    </>
  );
}