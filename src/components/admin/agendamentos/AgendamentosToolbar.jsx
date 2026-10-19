import { Icon } from "@/components/ui/Icon";

const STATUS_OPCOES = [
  { value: "", label: "Todos os status" },
  { value: "agendado", label: "Agendado" },
  { value: "confirmado", label: "Confirmado" },
  { value: "realizado", label: "Realizado" },
  { value: "cancelado", label: "Cancelado" },
  { value: "nao_compareceu", label: "Não compareceu" },
];

const TIPO_OPCOES = [
  { value: "", label: "Todos os tipos" },
  { value: "visita_imovel", label: "Visita ao imóvel" },
  { value: "reuniao_escritorio", label: "Reunião no escritório" },
];

const SELECT =
  "h-11 w-full rounded-xl border border-line bg-card px-3 text-sm text-ink-2 outline-none transition-colors focus:border-gold scheme-dark";

export default function AgendamentosToolbar({ filtros, onFiltrosChange, corretores = [], onNovoAgendamento, viewMode, onViewModeChange }) {
  const atualizar = (campo, valor) => onFiltrosChange({ ...filtros, [campo]: valor });

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="grid flex-1 grid-cols-1 gap-2 sm:grid-cols-3 lg:max-w-3xl">
        <select value={filtros.status} onChange={(e) => atualizar("status", e.target.value)} aria-label="Filtrar por status" className={SELECT}>
          {STATUS_OPCOES.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <select value={filtros.tipo} onChange={(e) => atualizar("tipo", e.target.value)} aria-label="Filtrar por tipo" className={SELECT}>
          {TIPO_OPCOES.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <select value={filtros.corretorId} onChange={(e) => atualizar("corretorId", e.target.value)} aria-label="Filtrar por corretor" className={SELECT}>
          <option value="">Todos os corretores</option>
          {corretores.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
        </select>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex flex-1 rounded-xl border border-line p-0.5 lg:flex-none" role="group" aria-label="Modo de visualização">
          {[["calendario", "Calendário"], ["tabela", "Lista"]].map(([valor, rotulo]) => (
            <button
              key={valor}
              type="button"
              onClick={() => onViewModeChange(valor)}
              aria-pressed={viewMode === valor}
              className={`h-10 flex-1 rounded-lg px-4 text-sm font-medium transition-colors lg:flex-none ${
                viewMode === valor ? "bg-gold/15 text-gold" : "text-ink-2 hover:text-ink"
              }`}
            >
              {rotulo}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={onNovoAgendamento}
          className="inline-flex h-11 items-center gap-2 rounded-xl bg-gold-gradient px-4 text-sm font-semibold text-[#1a1408] transition hover:brightness-110"
        >
          <Icon name="calendar" className="size-4.5" />
          <span className="hidden sm:inline">Novo agendamento</span>
          <span className="sm:hidden">Novo</span>
        </button>
      </div>
    </div>
  );
}