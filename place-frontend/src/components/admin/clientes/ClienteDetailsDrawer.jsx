import { Icon } from "@/components/ui/Icon";
import { formatarTelefone, formatarData } from "@/lib/clienteFilters";

export function ClienteDetailsDrawer({ cliente, aberto, onFechar, onEditar }) {
  if (!aberto || !cliente) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40">
      <div className="h-full w-full max-w-md overflow-y-auto bg-card border-l border-line p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-ink">{cliente.nome}</h2>
          <button onClick={onFechar} className="text-ink-2 hover:text-ink">
            <Icon name="x" size={20} />
          </button>
        </div>

        <div className="space-y-4 text-sm">
          <div>
            <p className="text-xs text-ink-2">E-mail</p>
            <p className="text-ink">{cliente.email || "—"}</p>
          </div>
          <div>
            <p className="text-xs text-ink-2">Telefone</p>
            <p className="text-ink">{formatarTelefone(cliente.telefone)}</p>
          </div>
          <div>
            <p className="text-xs text-ink-2">Corretor responsável</p>
            <p className="text-ink">{cliente.corretor?.nome || "—"}</p>
          </div>
          <div>
            <p className="text-xs text-ink-2">Origem</p>
            <p className="text-ink">
              {cliente.leadOrigem ? `Lead: ${cliente.leadOrigem.nome}` : "Cadastro direto"}
            </p>
          </div>
          <div>
            <p className="text-xs text-ink-2">Cadastrado em</p>
            <p className="text-ink">{formatarData(cliente.criadoEm)}</p>
          </div>
          <div>
            <p className="text-xs text-ink-2">Observações</p>
            <p className="text-ink whitespace-pre-wrap">
              {cliente.observacoes || "Nenhuma observação."}
            </p>
          </div>
        </div>

        <button
          onClick={() => onEditar(cliente)}
          className="mt-6 inline-flex items-center gap-2 rounded-lg border border-line px-4 py-2 text-sm text-ink hover:border-gold hover:text-gold"
        >
          <Icon name="pencil" size={16} />
          Editar cliente
        </button>
      </div>
    </div>
  );
}