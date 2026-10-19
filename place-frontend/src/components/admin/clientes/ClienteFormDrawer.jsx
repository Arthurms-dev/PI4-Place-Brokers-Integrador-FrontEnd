import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/Icon";

const CLIENTE_VAZIO = {
  nome: "",
  email: "",
  telefone: "",
  corretorId: "",
  observacoes: "",
};

export function ClienteFormDrawer({
  aberto,
  onFechar,
  onSalvar,
  cliente = null, 
  corretores = [],
  usuarioLogado, 
}) {
  const [form, setForm] = useState(CLIENTE_VAZIO);
  const [erros, setErros] = useState({});
  const [salvando, setSalvando] = useState(false);

  const ehEdicao = Boolean(cliente?.id);
  const ehAdmin = usuarioLogado?.cargo === "admin";

  useEffect(() => {
    if (cliente) {
      setForm({
        nome: cliente.nome ?? "",
        email: cliente.email ?? "",
        telefone: cliente.telefone ?? "",
        corretorId: cliente.corretor?.id ?? "",
        observacoes: cliente.observacoes ?? "",
      });
    } else {
      setForm(CLIENTE_VAZIO);
    }
    setErros({});
  }, [cliente, aberto]);

  if (!aberto) return null;

  function atualizarCampo(campo, valor) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSalvando(true);
    setErros({});
    try {
      const payload = {
        nome: form.nome.trim(),
        email: form.email.trim() || undefined,
        telefone: form.telefone.replace(/\D/g, ""),
        observacoes: form.observacoes.trim() || undefined,
        ...(ehAdmin ? { corretorId: form.corretorId || undefined } : {}),
      };
      await onSalvar(payload, cliente?.id);
      onFechar();
    } catch (err) {
      setErros(err.fieldErrors || { geral: err.message });
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40">
      <div className="h-full w-full max-w-md overflow-y-auto bg-card border-l border-line p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-ink">
            {ehEdicao ? "Editar cliente" : "Novo cliente"}
          </h2>
          <button onClick={onFechar} className="text-ink-2 hover:text-ink">
            <Icon name="x" size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {erros.geral && (
            <p className="text-sm text-red-400">{erros.geral}</p>
          )}

          <div>
            <label className="block text-xs text-ink-2 mb-1">Nome *</label>
            <input
              type="text"
              value={form.nome}
              onChange={(e) => atualizarCampo("nome", e.target.value)}
              className="w-full rounded-lg border border-line bg-bg py-2 px-3 text-sm text-ink focus:border-gold focus:outline-none"
            />
            {erros.nome && <p className="text-xs text-red-400 mt-1">{erros.nome}</p>}
          </div>

          <div>
            <label className="block text-xs text-ink-2 mb-1">E-mail</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => atualizarCampo("email", e.target.value)}
              className="w-full rounded-lg border border-line bg-bg py-2 px-3 text-sm text-ink focus:border-gold focus:outline-none"
            />
            {erros.email && <p className="text-xs text-red-400 mt-1">{erros.email}</p>}
          </div>

          <div>
            <label className="block text-xs text-ink-2 mb-1">Telefone *</label>
            <input
              type="text"
              value={form.telefone}
              onChange={(e) => atualizarCampo("telefone", e.target.value)}
              placeholder="(81) 99999-9999"
              className="w-full rounded-lg border border-line bg-bg py-2 px-3 text-sm text-ink focus:border-gold focus:outline-none"
            />
            {erros.telefone && <p className="text-xs text-red-400 mt-1">{erros.telefone}</p>}
          </div>

          {ehAdmin && (
            <div>
              <label className="block text-xs text-ink-2 mb-1">Corretor responsável *</label>
              <select
                value={form.corretorId}
                onChange={(e) => atualizarCampo("corretorId", e.target.value)}
                className="w-full rounded-lg border border-line bg-bg py-2 px-3 text-sm text-ink focus:border-gold focus:outline-none"
              >
                <option value="">Selecione...</option>
                {corretores.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome}
                  </option>
                ))}
              </select>
              {erros.corretorId && (
                <p className="text-xs text-red-400 mt-1">{erros.corretorId}</p>
              )}
            </div>
          )}

          <div>
            <label className="block text-xs text-ink-2 mb-1">Observações</label>
            <textarea
              value={form.observacoes}
              onChange={(e) => atualizarCampo("observacoes", e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-line bg-bg py-2 px-3 text-sm text-ink focus:border-gold focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onFechar}
              className="rounded-lg border border-line px-4 py-2 text-sm text-ink-2 hover:text-ink"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={salvando}
              className="rounded-lg bg-gold px-4 py-2 text-sm font-medium text-ink-inverse hover:opacity-90 disabled:opacity-50"
            >
              {salvando ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}