import { useState } from "react";
import { Icon } from "@/components/ui/Icon";

const TIPOS = [
  { value: "visita_imovel", label: "Visita ao imóvel" },
  { value: "reuniao_escritorio", label: "Reunião no escritório" },
];

export default function AgendamentoFormDrawer({ aberto, onFechar, onSalvar, clientes, corretores, empreendimentos }) {
  const [form, setForm] = useState({
    tipo: "visita_imovel",
    dataHora: "",
    clienteId: "",
    corretorId: "",
    empreendimentoId: "",
    local: "",
    observacoes: "",
  });
  const [erros, setErros] = useState({});
  const [enviando, setEnviando] = useState(false);
  const [erroGeral, setErroGeral] = useState("");

  if (!aberto) return null;

  function atualizar(campo, valor) {
    setForm((f) => ({ ...f, [campo]: valor }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErros({});
    setErroGeral("");
    setEnviando(true);
    try {
      await onSalvar({
        ...form,
        empreendimentoId: form.tipo === "visita_imovel" ? form.empreendimentoId : null,
      });
      setForm({ tipo: "visita_imovel", dataHora: "", clienteId: "", corretorId: "", empreendimentoId: "", local: "", observacoes: "" });
    } catch (err) {
      if (err.code === "CONFLITO_HORARIO") {
        setErroGeral(err.message);
      } else if (err.fieldErrors) {
        setErros(err.fieldErrors);
      } else {
        setErroGeral(err.message ?? "Não foi possível salvar o agendamento.");
      }
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30">
      <div className="h-full w-full max-w-md overflow-y-auto bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Novo agendamento</h2>
          <button type="button" onClick={onFechar} className="rounded-md p-1 hover:bg-slate-100">
            <Icon name="x" className="h-5 w-5" />
          </button>
        </div>

        {erroGeral && (
          <div className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{erroGeral}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Tipo</label>
            <div className="flex gap-2">
              {TIPOS.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => atualizar("tipo", t.value)}
                  className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium ${
                    form.tipo === t.value ? "border-slate-900 bg-slate-900 text-white" : "border-slate-300 text-slate-600"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
            {erros.tipo && <p className="mt-1 text-xs text-red-600">{erros.tipo}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Data e hora</label>
            <input
              type="datetime-local"
              value={form.dataHora}
              onChange={(e) => atualizar("dataHora", e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            {erros.dataHora && <p className="mt-1 text-xs text-red-600">{erros.dataHora}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Cliente</label>
            <select
              value={form.clienteId}
              onChange={(e) => atualizar("clienteId", e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="">Selecione o cliente</option>
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>{c.nome}</option>
              ))}
            </select>
            {erros.clienteId && <p className="mt-1 text-xs text-red-600">{erros.clienteId}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Corretor responsável</label>
            <select
              value={form.corretorId}
              onChange={(e) => atualizar("corretorId", e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="">Selecione o corretor</option>
              {corretores.map((c) => (
                <option key={c.id} value={c.id}>{c.nome}</option>
              ))}
            </select>
            {erros.corretorId && <p className="mt-1 text-xs text-red-600">{erros.corretorId}</p>}
          </div>

          {form.tipo === "visita_imovel" ? (
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Imóvel</label>
              <select
                value={form.empreendimentoId}
                onChange={(e) => atualizar("empreendimentoId", e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="">Selecione o imóvel</option>
                {empreendimentos.map((e) => (
                  <option key={e.id} value={e.id}>{e.nome} — {e.bairro}</option>
                ))}
              </select>
              {erros.empreendimentoId && <p className="mt-1 text-xs text-red-600">{erros.empreendimentoId}</p>}
            </div>
          ) : (
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Local (sala/endereço do escritório)</label>
              <input
                type="text"
                value={form.local}
                onChange={(e) => atualizar("local", e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                placeholder="Ex: Sala 2 - Matriz"
              />
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Observações</label>
            <textarea
              value={form.observacoes}
              onChange={(e) => atualizar("observacoes", e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={enviando}
            className="w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-60"
          >
            {enviando ? "Salvando..." : "Criar agendamento"}
          </button>
        </form>
      </div>
    </div>
  );
}