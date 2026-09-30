import { useEffect, useMemo, useState } from "react";
import { LeadDetailsDrawer } from "@/components/admin/leads/LeadDetailsDrawer";
import { LeadsKanban } from "@/components/admin/leads/LeadsKanban";
import { LeadsSummary } from "@/components/admin/leads/LeadsSummary";
import { LeadsTable } from "@/components/admin/leads/LeadsTable";
import { LeadsToolbar } from "@/components/admin/leads/LeadsToolbar";
import { ViewToggle } from "@/components/admin/leads/ViewToggle";
import { Card } from "@/components/ui/Card";
import { useAsyncData } from "@/hooks/useAsyncData";
import { usePageTitle } from "@/hooks/usePageTitle";
import { DEFAULT_FILTERS, filterLeads } from "@/lib/leadFilters";
import { getLeads, getCorretores, updateLeadStatus, assignLead, convertLeadToCliente } from "@/services/admin/leads";

const loadLeadsPage = () => Promise.all([getLeads(), getCorretores()]);

export default function LeadsPage() {
  usePageTitle("Leads");

  const { data, loading, error } = useAsyncData(loadLeadsPage);
  const [leads, setLeads] = useState([]);
  const [view, setView] = useState("table");
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [selectedId, setSelectedId] = useState(null);
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    if (data) setLeads(data[0]);
  }, [data]);

  const corretores = data?.[1] ?? [];

  const empreendimentos = useMemo(() => {
    const byId = new Map();
    leads.forEach((l) => l.empreendimento && byId.set(l.empreendimento.id, l.empreendimento));
    return [...byId.values()].sort((a, b) => a.nome.localeCompare(b.nome));
  }, [leads]);

  const filtered = useMemo(() => filterLeads(leads, filters), [leads, filters]);
  const selected = leads.find((l) => l.id === selectedId) ?? null;

  /** Atualiza a tela na hora e desfaz se a chamada à API falhar. */
  async function mutate(id, patch, request) {
    const previous = leads;
    setActionError("");
    setLeads((current) => current.map((l) => (l.id === id ? { ...l, ...patch } : l)));
    try {
      await request();
    } catch {
      setLeads(previous);
      setActionError("Não foi possível salvar a alteração. Tente novamente.");
    }
  }

  const handleStatusChange = (id, status) => mutate(id, { status }, () => updateLeadStatus(id, status));
  const handleAssign = (id, corretorId) =>
    mutate(id, { corretor: corretores.find((c) => c.id === corretorId) ?? null }, () => assignLead(id, corretorId));
  const handleConvert = (id) => mutate(id, { status: "convertido" }, () => convertLeadToCliente(id));

  if (loading) return <p className="py-10 text-center text-sm text-ink-2">Carregando leads…</p>;
  if (error) {
    return (
      <p role="alert" className="py-10 text-center text-sm text-danger">
        Não foi possível carregar os leads. Tente novamente em instantes.
      </p>
    );
  }

  const emptyMessage =
    leads.length === 0
      ? "Nenhum lead recebido ainda. Os contatos enviados pelo formulário do site aparecerão aqui."
      : "Nenhum lead encontrado com esses filtros.";

  return (
    <>
      <section className="mb-1.5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-medium tracking-tight sm:text-[26px]">Leads</h1>
          <p className="mt-0.5 text-sm text-ink-2">
            Contatos recebidos pelo formulário do site, do mais recente para o mais antigo.
          </p>
        </div>
        <ViewToggle value={view} onChange={setView} />
      </section>

      <LeadsSummary leads={leads} />

      <LeadsToolbar
        filters={filters}
        onChange={setFilters}
        empreendimentos={empreendimentos}
        corretores={corretores}
        total={filtered.length}
      />

      {actionError && (
        <p role="alert" className="rounded-lg border border-danger/40 bg-danger/10 px-4 py-2 text-xs text-danger">
          {actionError}
        </p>
      )}

      {view === "table" ? (
        <Card className="overflow-hidden p-0">
          <LeadsTable leads={filtered} selectedId={selectedId} onSelect={setSelectedId} emptyMessage={emptyMessage} />
        </Card>
      ) : (
        <LeadsKanban leads={filtered} onSelect={setSelectedId} onStatusChange={handleStatusChange} />
      )}

      {selected && (
        <LeadDetailsDrawer
          lead={selected}
          corretores={corretores}
          onClose={() => setSelectedId(null)}
          onStatusChange={handleStatusChange}
          onAssign={handleAssign}
          onConvert={handleConvert}
        />
      )}
    </>
  );
}