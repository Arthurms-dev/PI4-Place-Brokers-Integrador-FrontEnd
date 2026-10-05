import Icon from "@/components/ui/Icon";

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

export default function AgendamentosToolbar({ filtros, onFiltrosChange, corretores, onNovoAgendamento, viewMode, onViewModeChange }) {
  function atualizar(campo, valor) {
    onFiltrosChange({ ...filtros, [campo]: valor });
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap gap-2">
        <select
          value={filtros.status}
          onChange={(e) => atualizar("status", e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700"
        >
          {STATUS_OPCOES.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>

        <select
          value={filtros.tipo}
          onChange={(e) => atualizar("tipo", e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700"
        >
          {TIPO_OPCOES.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>

        <select
          value={filtros.corretorId}
          onChange={(e) => atualizar("corretorId", e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700"
        >
          <option value="">Todos os corretores</option>
          {corretores.map((c) => (
            <option key={c.id} value={c.id}>{c.nome}</option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex rounded-lg border border-slate-300 p-0.5">
          <button
            type="button"
            onClick={() => onViewModeChange("calendario")}
            className={`rounded-md px-3 py-1.5 text-sm font-medium ${
              viewMode === "calendario" ? "bg-slate-900 text-white" : "text-slate-600"
            }`}
          >
            Calendário
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange("tabela")}
            className={`rounded-md px-3 py-1.5 text-sm font-medium ${
              viewMode === "tabela" ? "bg-slate-900 text-white" : "text-slate-600"
            }`}
          >
            Tabela
          </button>
        </div>

        <button
          type="button"
          onClick={onNovoAgendamento}
          className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white"
        >
          <Icon name="plus" className="h-4 w-4" />
          Novo agendamento
        </button>
      </div>
    </div>
  );
}