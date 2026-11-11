import { useState } from "react";
import AgendamentoDrawer from "./AgendamentoDrawer";

const TIPOS = [
  { value: "visita_imovel", label: "Visita ao imóvel" },
  { value: "reuniao_escritorio", label: "Reunião no escritório" },
];

const VAZIO = { tipo: "visita_imovel", dataHora: "", clienteId: "", corretorId: "", empreendimentoId: "", local: "", observacoes: "" };
const CAMPO = "h-12 w-full rounded-xl border bg-card-2 px-3.5 text-sm text-ink outline-none transition-colors placeholder:text-ink-3 scheme-dark";

function Campo({ rotulo, erro, children }) {
  return (
    <label className="block text-xs text-ink-2">
      {rotulo}
      <div className="mt-1.5">{children}</div>
      {erro && <span className="mt-1 block text-[11px] text-danger">{erro}</span>}
    </label>
  );
}

export default function AgendamentoFormDrawer({ aberto, onFechar, onSalvar, clientes = [], corretores = [], empreendimentos = [] }) {
  const [form, setForm] = useState(VAZIO);
  const [erros, setErros] = useState({});
  const [enviando, setEnviando] = useState(false);
  const [erroGeral, setErroGeral] = useState("");

  if (!aberto) return null;

  const visita = form.tipo === "visita_imovel";
  const atualizar = (campo) => (e) => setForm((f) => ({ ...f, [campo]: e.target.value }));
  const borda = (c) => (erros[c] ? "border-danger" : "border-line focus:border-gold");

  const doCorretor = form.corretorId ? clientes.filter((c) => c.corretorId === form.corretorId) : [];
  const outros = clientes.filter((c) => !doCorretor.includes(c));

  async function handleSubmit(e) {
    e.preventDefault();
    setErros({});
    setErroGeral("");
    setEnviando(true);
    try {
      await onSalvar({
        tipo: form.tipo,
        dataHora: form.dataHora ? new Date(form.dataHora).toISOString() : "",
        clienteId: form.clienteId,
        corretorId: form.corretorId,
        empreendimentoId: visita ? form.empreendimentoId : null,
        local: visita ? null : form.local.trim() || null,
        observacoes: form.observacoes.trim() || null,
      });
      setForm(VAZIO);
    } catch (err) {
      if (err.fieldErrors && Object.keys(err.fieldErrors).length) setErros(err.fieldErrors);
      setErroGeral(err.message ?? "Não foi possível salvar o agendamento.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <AgendamentoDrawer titulo="Novo agendamento" onFechar={onFechar}>
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {erroGeral && <p role="alert" className="rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">{erroGeral}</p>}

        <div className="grid grid-cols-2 gap-2">
          {TIPOS.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setForm((f) => ({ ...f, tipo: t.value }))}
              aria-pressed={form.tipo === t.value}
              className={`h-12 rounded-xl border text-[13px] font-medium transition-colors ${form.tipo === t.value ? "border-gold bg-gold/15 text-gold" : "border-line text-ink-2 hover:text-ink"}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <Campo rotulo="Data e hora" erro={erros.dataHora}>
          <input type="datetime-local" value={form.dataHora} onChange={atualizar("dataHora")} className={`${CAMPO} ${borda("dataHora")}`} />
        </Campo>

        <Campo rotulo="Corretor responsável" erro={erros.corretorId}>
          <select value={form.corretorId} onChange={atualizar("corretorId")} className={`${CAMPO} ${borda("corretorId")}`}>
            <option value="">Selecione o corretor</option>
            {corretores.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>
        </Campo>

        <Campo rotulo="Cliente" erro={erros.clienteId}>
          <select value={form.clienteId} onChange={atualizar("clienteId")} className={`${CAMPO} ${borda("clienteId")}`}>
            <option value="">Selecione o cliente</option>
            {doCorretor.length > 0 ? (
              <>
                <optgroup label="Clientes do corretor">
                  {doCorretor.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
                </optgroup>
                <optgroup label="Outros clientes">
                  {outros.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
                </optgroup>
              </>
            ) : (
              clientes.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)
            )}
          </select>
        </Campo>

        {visita ? (
          <Campo rotulo="Imóvel" erro={erros.empreendimentoId}>
            <select value={form.empreendimentoId} onChange={atualizar("empreendimentoId")} className={`${CAMPO} ${borda("empreendimentoId")}`}>
              <option value="">Selecione o imóvel</option>
              {empreendimentos.map((e) => (
                <option key={e.id} value={e.id}>{[e.nome ?? e.title, e.bairro].filter(Boolean).join(" — ")}</option>
              ))}
            </select>
          </Campo>
        ) : (
          <Campo rotulo="Local (sala ou endereço do escritório)">
            <input value={form.local} onChange={atualizar("local")} placeholder="Ex.: Sala 2 - Matriz" className={`${CAMPO} border-line focus:border-gold`} />
          </Campo>
        )}

        <Campo rotulo="Observações (opcional)">
          <textarea value={form.observacoes} onChange={atualizar("observacoes")} rows={3} className="w-full rounded-xl border border-line bg-card-2 px-3.5 py-3 text-sm text-ink outline-none focus:border-gold scheme-dark" />
        </Campo>

        <button type="submit" disabled={enviando} className="h-12 w-full rounded-xl bg-gold-gradient text-sm font-semibold text-[#1a1408] transition hover:brightness-110 disabled:opacity-60">
          {enviando ? "Salvando..." : "Criar agendamento"}
        </button>
      </form>
    </AgendamentoDrawer>
  );
}