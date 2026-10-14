import { Icon } from "@/components/ui/Icon";
import { formatarTelefone, formatarData } from "@/lib/clienteFilters";

export function ClientesTable({ clientes = [], onVerDetalhes }) {
  if (clientes.length === 0) {
    return (
      <div className="rounded-xl border border-line bg-card p-10 text-center text-sm text-ink-2">
        Nenhum cliente encontrado.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-line bg-card">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-line text-left text-xs uppercase text-ink-2">
            <th className="px-4 py-3 font-medium">Nome</th>
            <th className="px-4 py-3 font-medium">Contato</th>
            <th className="px-4 py-3 font-medium">Corretor responsável</th>
            <th className="px-4 py-3 font-medium">Origem</th>
            <th className="px-4 py-3 font-medium">Cadastrado em</th>
            <th className="px-4 py-3 font-medium"></th>
          </tr>
        </thead>
        <tbody>
          {clientes.map((cliente) => (
            <tr
              key={cliente.id}
              className="border-b border-line last:border-0 hover:bg-line/30"
            >
              <td className="px-4 py-3 text-ink font-medium">{cliente.nome}</td>
              <td className="px-4 py-3 text-ink-2">
                <div>{cliente.email || "—"}</div>
                <div>{formatarTelefone(cliente.telefone)}</div>
              </td>
              <td className="px-4 py-3 text-ink-2">
                {cliente.corretor?.nome || "—"}
              </td>
              <td className="px-4 py-3 text-ink-2">
                {cliente.leadOrigem ? (
                  <span className="inline-flex items-center gap-1 text-gold">
                    <Icon name="git-branch" size={14} />
                    Lead
                  </span>
                ) : (
                  "Direto"
                )}
              </td>
              <td className="px-4 py-3 text-ink-2">
                {formatarData(cliente.criadoEm)}
              </td>
              <td className="px-4 py-3 text-right">
                <button
                  onClick={() => onVerDetalhes(cliente)}
                  className="text-ink-2 hover:text-gold"
                  title="Ver detalhes"
                >
                  <Icon name="chevron-right" size={18} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}