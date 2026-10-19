import { Icon } from "@/components/ui/Icon";

export function ClientesToolbar({
  busca,
  onBuscaChange,
  corretorId,
  onCorretorChange,
  corretores,
  onNovoCliente,
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Icon
            name="search"
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-2"
          />
          <input
            type="text"
            value={busca}
            onChange={(e) => onBuscaChange(e.target.value)}
            placeholder="Buscar por nome, e-mail ou telefone..."
            className="w-full rounded-lg border border-line bg-card py-2 pl-9 pr-3 text-sm text-ink placeholder:text-ink-2 focus:border-gold focus:outline-none"
          />
        </div>

        <select
          value={corretorId}
          onChange={(e) => onCorretorChange(e.target.value)}
          className="rounded-lg border border-line bg-card py-2 px-3 text-sm text-ink focus:border-gold focus:outline-none"
        >
          <option value="">Todos os corretores</option>
          {corretores.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nome}
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={onNovoCliente}
        className="inline-flex items-center gap-2 rounded-lg bg-gold px-4 py-2 text-sm font-medium text-ink-inverse hover:opacity-90"
      >
        <Icon name="plus" size={16} />
        Novo cliente
      </button>
    </div>
  );
}