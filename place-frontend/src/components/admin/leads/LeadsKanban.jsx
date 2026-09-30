import { useState } from "react";
import { cn } from "@/lib/cn";
import { formatDateTime } from "@/lib/format";
import { LEAD_STATUSES, formatLocation, needsAttention } from "@/lib/leads";

export function LeadsKanban({ leads, onSelect, onStatusChange }) {
  const [draggingId, setDraggingId] = useState(null);
  const [overStatus, setOverStatus] = useState(null);

  function handleDrop(e, status) {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain");
    const lead = leads.find((l) => l.id === id);
    setOverStatus(null);
    setDraggingId(null);
    if (lead && lead.status !== status) onStatusChange(id, status);
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {LEAD_STATUSES.map((status) => {
        const items = leads.filter((l) => l.status === status.value);
        return (
          <section
            key={status.value}
            aria-label={`Coluna ${status.label}`}
            onDragOver={(e) => {
              e.preventDefault();
              setOverStatus(status.value);
            }}
            onDragLeave={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget)) setOverStatus(null);
            }}
            onDrop={(e) => handleDrop(e, status.value)}
            className={cn(
              "flex min-h-64 flex-col rounded-xl border bg-card-2/60 p-3 transition-colors",
              overStatus === status.value ? "border-gold bg-gold/5" : "border-line",
            )}
          >
            <header className="mb-3 flex items-center gap-2 px-1 text-[13px] font-medium">
              <span className={cn("size-2 rounded-full", status.dot)} />
              {status.label}
              <span className="ml-auto rounded-full bg-white/8 px-2 py-px text-[11px] text-ink-2">{items.length}</span>
            </header>

            <div className="flex max-h-[62vh] flex-col gap-2.5 overflow-y-auto">
              {items.length === 0 && <p className="px-1 py-6 text-center text-xs text-ink-3">Nenhum lead</p>}

              {items.map((lead) => (
                <article
                  key={lead.id}
                  draggable
                  role="button"
                  tabIndex={0}
                  onClick={() => onSelect(lead.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onSelect(lead.id);
                    }
                  }}
                  onDragStart={(e) => {
                    e.dataTransfer.setData("text/plain", lead.id);
                    e.dataTransfer.effectAllowed = "move";
                    setDraggingId(lead.id);
                  }}
                  onDragEnd={() => {
                    setDraggingId(null);
                    setOverStatus(null);
                  }}
                  className={cn(
                    "cursor-grab rounded-lg border border-line bg-card p-3 text-left transition-opacity hover:border-gold/50 active:cursor-grabbing",
                    draggingId === lead.id && "opacity-40",
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[13px] font-medium">{lead.nome}</span>
                    {needsAttention(lead) && <span title="Novo e sem corretor" className="mt-1 size-1.5 shrink-0 rounded-full bg-gold" />}
                  </div>
                  {lead.empreendimento && (
                    <>
                      <div className="mt-1.5 truncate text-xs text-ink-2">{lead.empreendimento.nome}</div>
                      <div className="truncate text-[11px] text-ink-3">{formatLocation(lead.empreendimento)}</div>
                    </>
                  )}
                  <div className="mt-2.5 flex items-center justify-between gap-2 text-[11px] text-ink-3">
                    <span>{formatDateTime(lead.criadoEm)}</span>
                    <span className={lead.corretor ? "text-ink-2" : "text-gold"}>
                      {lead.corretor ? lead.corretor.nome : "Sem corretor"}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}