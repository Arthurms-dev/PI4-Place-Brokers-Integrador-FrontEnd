import { Icon } from "@/components/ui/Icon";
import { LEAD_STATUSES } from "@/lib/leads";

const selectClass =
  "h-9 rounded-lg border border-line bg-card-2 px-3 text-xs text-ink outline-none scheme-dark focus:border-gold";

export function LeadsToolbar({ filters, onChange, empreendimentos, corretores, total }) {
  const set = (key) => (e) => onChange({ ...filters, [key]: e.target.value });

  return (
    <div className="flex flex-wrap items-center gap-3">
      <label className="flex h-9 min-w-56 flex-1 items-center gap-2.5 rounded-lg border border-line bg-card-2 px-3 text-ink-3 focus-within:border-gold">
        <Icon name="search" className="size-4" />
        <input
          type="search"
          value={filters.search}
          onChange={set("search")}
          placeholder="Buscar por nome, telefone ou e-mail"
          aria-label="Buscar leads"
          className="w-full bg-transparent text-xs text-ink outline-none placeholder:text-ink-3"
        />
      </label>

      <select value={filters.status} onChange={set("status")} aria-label="Filtrar por status" className={selectClass}>
        <option value="todos">Todos os status</option>
        {LEAD_STATUSES.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>

      <select
        value={filters.empreendimento}
        onChange={set("empreendimento")}
        aria-label="Filtrar por empreendimento"
        className={selectClass}
      >
        <option value="todos">Todos os empreendimentos</option>
        {empreendimentos.map((e) => (
          <option key={e.id} value={e.id}>
            {e.nome}
          </option>
        ))}
      </select>

      <select value={filters.corretor} onChange={set("corretor")} aria-label="Filtrar por corretor" className={selectClass}>
        <option value="todos">Todos os corretores</option>
        <option value="sem">Sem corretor</option>
        {corretores.map((c) => (
          <option key={c.id} value={c.id}>
            {c.nome}
          </option>
        ))}
      </select>

      <select value={filters.periodo} onChange={set("periodo")} aria-label="Filtrar por período" className={selectClass}>
        <option value="todos">Todo o período</option>
        <option value="7d">Últimos 7 dias</option>
        <option value="30d">Últimos 30 dias</option>
      </select>

      <span className="ml-auto text-xs text-ink-2">
        {total} {total === 1 ? "lead" : "leads"}
      </span>
    </div>
  );
}