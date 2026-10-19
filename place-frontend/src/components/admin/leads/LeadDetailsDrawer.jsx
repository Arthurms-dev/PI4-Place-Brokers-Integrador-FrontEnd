import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { formatPhone, whatsappUrl } from "@/lib/contact";
import { formatDateTime } from "@/lib/format";
import { LEAD_STATUSES, formatLocation } from "@/lib/leads";
import { LeadStatusBadge } from "./LeadStatusBadge";

const selectClass =
  "h-9 w-full rounded-lg border border-line bg-card-2 px-3 text-xs text-ink outline-none scheme-dark focus:border-gold";
const linkButton =
  "inline-flex h-8 items-center gap-2 rounded-md border border-line px-3 text-xs text-ink-2 transition-colors hover:border-gold hover:text-ink";

function Section({ title, children }) {
  return (
    <section className="border-t border-line-soft px-5 py-4">
      <h3 className="mb-2.5 text-[11px] uppercase tracking-wide text-ink-3">{title}</h3>
      {children}
    </section>
  );
}

export function LeadDetailsDrawer({ lead, corretores, onClose, onStatusChange, onAssign, onConvert }) {
  const closeRef = useRef(null);

  useEffect(() => {
    closeRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const whatsapp = whatsappUrl(lead.telefone);

  return (
    <>
      <button
        type="button"
        aria-label="Fechar detalhes"
        onClick={onClose}
        className="fixed inset-0 z-40 cursor-default bg-black/55"
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label={`Detalhes do lead ${lead.nome}`}
        className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col overflow-y-auto border-l border-line bg-side shadow-2xl"
      >
        <header className="flex items-start gap-3 px-5 py-5">
          <Avatar name={lead.nome} className="size-10 text-sm" />
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-base font-medium">{lead.nome}</h2>
            <div className="mt-1">
              <LeadStatusBadge status={lead.status} />
            </div>
          </div>
          <button
            ref={closeRef}
            type="button"
            aria-label="Fechar"
            onClick={onClose}
            className="grid size-8 cursor-pointer place-items-center rounded-md border border-line text-ink-2 hover:border-gold hover:text-ink"
          >
            <Icon name="x" className="size-4" />
          </button>
        </header>

        <Section title="Contato">
          <dl className="space-y-1 text-xs">
            <div className="flex gap-2">
              <dt className="w-16 text-ink-3">Telefone</dt>
              <dd>{formatPhone(lead.telefone) || "—"}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="w-16 text-ink-3">E-mail</dt>
              <dd className="break-all">{lead.email || "—"}</dd>
            </div>
          </dl>
          <div className="mt-3 flex flex-wrap gap-2">
            {whatsapp && (
              <a href={whatsapp} target="_blank" rel="noreferrer" className={linkButton}>
                <Icon name="messageCircle" className="size-3.5" /> WhatsApp
              </a>
            )}
            {lead.telefone && (
              <a href={`tel:${lead.telefone}`} className={linkButton}>
                <Icon name="phone" className="size-3.5" /> Ligar
              </a>
            )}
            {lead.email && (
              <a href={`mailto:${lead.email}`} className={linkButton}>
                <Icon name="mail" className="size-3.5" /> E-mail
              </a>
            )}
          </div>
        </Section>

        <Section title="Interesse">
          {lead.empreendimento ? (
            <div className="flex items-start gap-2 text-xs">
              <Icon name="mapPin" className="mt-0.5 size-3.5 text-gold" />
              <div>
                <div className="font-medium">{lead.empreendimento.nome}</div>
                <div className="text-ink-3">{formatLocation(lead.empreendimento)}</div>
              </div>
            </div>
          ) : (
            <p className="text-xs text-ink-3">Nenhum empreendimento associado.</p>
          )}
          <p className="mt-2 text-[11px] text-ink-3">
            Recebido em {formatDateTime(lead.criadoEm)} · origem: {lead.origem}
          </p>
        </Section>

        <Section title="Mensagem do cliente">
          <p className="whitespace-pre-wrap text-xs leading-relaxed text-ink-2">
            {lead.mensagem || "O cliente não deixou mensagem."}
          </p>
        </Section>

        <Section title="Gerenciar">
          <div className="space-y-3">
            <label className="block text-xs text-ink-2">
              Status
              <select
                value={lead.status}
                onChange={(e) => onStatusChange(lead.id, e.target.value)}
                className={`${selectClass} mt-1.5`}
              >
                {LEAD_STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-xs text-ink-2">
              Corretor responsável
              <select
                value={lead.corretor?.id ?? ""}
                onChange={(e) => onAssign(lead.id, e.target.value || null)}
                className={`${selectClass} mt-1.5`}
              >
                <option value="">Sem corretor</option>
                {corretores.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome}
                  </option>
                ))}
              </select>
              {corretores.length === 0 && (
                <span className="mt-1 block text-[11px] text-ink-3">Nenhum corretor cadastrado ainda.</span>
              )}
            </label>
          </div>
        </Section>

        <footer className="mt-auto flex flex-wrap gap-2.5 border-t border-line-soft px-5 py-4">
          {lead.status !== "convertido" && (
            <Button onClick={() => onConvert(lead.id)}>Converter em cliente</Button>
          )}
          <Link to={`/admin/agendamentos?lead=${lead.id}`} className={`${linkButton} h-8`}>
            <Icon name="calendar" className="size-3.5" /> Agendar visita
          </Link>
        </footer>
      </aside>
    </>
  );
}