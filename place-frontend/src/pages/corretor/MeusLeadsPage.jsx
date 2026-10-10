import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "@/components/ui/Icon";
import { usePageTitle } from "@/hooks/usePageTitle";
import { atualizarStatusLead, criarCliente, listarClientes, listarMeusLeads } from "@/services/meusLeads";

const STATUS = {
  novo: { label: "Novo", cls: "bg-gold/15 text-gold" },
  em_atendimento: { label: "Em atendimento", cls: "bg-sky-500/15 text-sky-300" },
  convertido: { label: "Convertido", cls: "bg-emerald-500/15 text-emerald-300" },
  perdido: { label: "Perdido", cls: "bg-white/10 text-ink-3" },
};
const OPCOES_CORRETOR = ["novo", "em_atendimento", "perdido"];

const digitos = (v = "") => v.replace(/\D/g, "");
const zap = (tel, nome) => `https://wa.me/55${digitos(tel)}?text=${encodeURIComponent(`Olá, ${nome}! Aqui é da Place Brokers.`)}`;
function mascarar(v) {
  const d = digitos(v).slice(0, 11);
  if (d.length <= 2) return d ? `(${d}` : "";
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}
const dataCurta = (iso) => new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });

const CAMPO = "h-12 w-full rounded-xl border bg-card-2 px-3.5 text-sm text-ink outline-none transition-colors placeholder:text-ink-3 scheme-dark";

function Badge({ status }) {
  const s = STATUS[status] ?? STATUS.novo;
  return <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${s.cls}`}>{s.label}</span>;
}

function BotaoZap({ telefone, nome }) {
  return (
    <a
      href={zap(telefone, nome)}
      target="_blank"
      rel="noreferrer"
      className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 text-sm font-semibold text-[#06210f] transition hover:brightness-105"
    >
      <Icon name="messageCircle" className="size-4.5" /> WhatsApp
    </a>
  );
}

function CadastrarClienteModal({ onClose, onCriado }) {
  const [f, setF] = useState({ nome: "", telefone: "", email: "", observacoes: "" });
  const [erros, setErros] = useState({});
  const [erroGeral, setErroGeral] = useState("");
  const [enviando, setEnviando] = useState(false);
  const set = (campo) => (e) => setF((s) => ({ ...s, [campo]: campo === "telefone" ? mascarar(e.target.value) : e.target.value }));

  useEffect(() => {
    const aoTeclar = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", aoTeclar);
    return () => document.removeEventListener("keydown", aoTeclar);
  }, [onClose]);

  async function enviar(ev) {
    ev.preventDefault();
    const e = {};
    if (!f.nome.trim()) e.nome = "Informe o nome.";
    if (digitos(f.telefone).length < 10) e.telefone = "Informe o telefone com DDD.";
    if (f.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) e.email = "E-mail inválido.";
    setErros(e);
    setErroGeral("");
    if (Object.keys(e).length) return;

    setEnviando(true);
    try {
      onCriado(await criarCliente(f));
    } catch (err) {
      setErros(err.fieldErrors ?? {});
      setErroGeral(err.message);
    } finally {
      setEnviando(false);
    }
  }

  const borda = (campo) => (erros[campo] ? "border-danger" : "border-line focus:border-gold");

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/65 sm:items-center sm:p-4" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <form
        onSubmit={enviar}
        noValidate
        className="animate-fade-up max-h-[94dvh] w-full space-y-3.5 overflow-y-auto rounded-t-3xl border border-line bg-card p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:max-w-md sm:rounded-3xl sm:p-7"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Cadastrar cliente</h2>
            <p className="mt-1 text-[13px] text-ink-2">O cliente fica na sua carteira e já pode receber agendamentos.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Fechar" className="grid size-11 shrink-0 place-items-center rounded-full border border-line text-ink-2 hover:border-gold hover:text-ink">
            <Icon name="x" className="size-5" />
          </button>
        </div>

        {[
          ["nome", "Nome", "text", "name"],
          ["telefone", "WhatsApp (com DDD)", "tel", "tel"],
          ["email", "E-mail (opcional)", "email", "email"],
        ].map(([campo, rotulo, tipo, auto]) => (
          <label key={campo} className="block text-xs text-ink-2">
            {rotulo}
            <input type={tipo} autoComplete={auto} value={f[campo]} onChange={set(campo)} placeholder={campo === "telefone" ? "(81) 99999-9999" : undefined} className={`${CAMPO} mt-1.5 ${borda(campo)}`} />
            {erros[campo] && <span className="mt-1 block text-[11px] text-danger">{erros[campo]}</span>}
          </label>
        ))}
        <label className="block text-xs text-ink-2">
          Observações (opcional)
          <textarea value={f.observacoes} onChange={set("observacoes")} rows={3} className="mt-1.5 w-full rounded-xl border border-line bg-card-2 px-3.5 py-3 text-sm text-ink outline-none focus:border-gold scheme-dark" />
        </label>

        {erroGeral && <p role="alert" className="text-xs text-danger">{erroGeral}</p>}
        <button type="submit" disabled={enviando} className="h-12 w-full rounded-xl bg-gold-gradient text-sm font-semibold text-[#1a1408] transition hover:brightness-110 disabled:opacity-60">
          {enviando ? "Salvando..." : "Salvar cliente"}
        </button>
      </form>
    </div>
  );
}

export default function MeusLeadsPage({ abrirCadastro = false }) {
  usePageTitle("Meus leads");
  const [aba, setAba] = useState("leads");
  const [leads, setLeads] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const navigate = useNavigate();
  const [modal, setModal] = useState(abrirCadastro);
  useEffect(() => {
    if (abrirCadastro) setModal(true);
  }, [abrirCadastro]);
  const fecharModal = useCallback(() => {
    setModal(false);
    if (abrirCadastro) navigate("/corretor/leads", { replace: true });
  }, [abrirCadastro, navigate]);
  const [salvando, setSalvando] = useState(null);

  useEffect(() => {
    let ativo = true;
    Promise.all([listarMeusLeads(), listarClientes()])
      .then(([l, c]) => ativo && (setLeads(l), setClientes(c)))
      .catch((e) => ativo && setErro(e.message))
      .finally(() => ativo && setCarregando(false));
    return () => {
      ativo = false;
    };
  }, []);

  const mudarStatus = useCallback(async (id, status) => {
    setErro("");
    setSalvando(id);
    try {
      const atualizado = await atualizarStatusLead(id, status);
      setLeads((lista) => lista.map((l) => (l.id === id ? atualizado : l)));
    } catch (e) {
      setErro(e.message);
    } finally {
      setSalvando(null);
    }
  }, []);

  const visiveis = useMemo(() => leads.filter((l) => !filtro || l.status === filtro), [leads, filtro]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Meus leads</h1>
          <p className="text-[13px] text-ink-2">Contatos que o admin passou para você e a sua carteira de clientes.</p>
        </div>
        <button type="button" onClick={() => setModal(true)} className="inline-flex h-11 items-center gap-2 rounded-xl bg-gold-gradient px-5 text-sm font-semibold text-[#1a1408] transition hover:brightness-110">
          <Icon name="userPlus" className="size-4.5" /> Cadastrar cliente
        </button>
      </div>

      <div className="flex gap-2" role="tablist">
        {[["leads", `Leads (${leads.length})`], ["clientes", `Clientes (${clientes.length})`]].map(([id, rotulo]) => (
          <button key={id} type="button" role="tab" aria-selected={aba === id} onClick={() => setAba(id)}
            className={`h-11 flex-1 rounded-xl border text-sm transition-colors sm:flex-none sm:px-6 ${aba === id ? "border-gold bg-gold/15 text-gold" : "border-line text-ink-2 hover:text-ink"}`}>
            {rotulo}
          </button>
        ))}
      </div>

      {erro && <p role="alert" className="rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">{erro}</p>}
      {carregando && <p className="py-8 text-center text-sm text-ink-2">Carregando...</p>}

      {!carregando && aba === "leads" && (
        <>
          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden">
            {[["", "Todos"], ...Object.entries(STATUS).map(([k, v]) => [k, v.label])].map(([k, rotulo]) => (
              <button key={k} type="button" onClick={() => setFiltro(k)} aria-pressed={filtro === k}
                className={`shrink-0 rounded-full border px-4 py-2 text-[13px] ${filtro === k ? "border-gold bg-gold/15 text-gold" : "border-line text-ink-2 hover:text-ink"}`}>
                {rotulo}
              </button>
            ))}
          </div>

          {visiveis.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-line p-8 text-center text-sm text-ink-2">
              {leads.length === 0 ? "Você ainda não tem leads. Quando o admin atribuir um contato a você, ele aparece aqui." : "Nenhum lead com esse status."}
            </div>
          ) : (
            <ul className="grid gap-3 lg:grid-cols-2">
              {visiveis.map((l) => (
                <li key={l.id} className="space-y-3 rounded-2xl border border-line bg-card p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate font-semibold">{l.nome}</h3>
                      <p className="truncate text-[13px] text-ink-2">{l.empreendimento?.nome ?? "Interesse geral"} · {dataCurta(l.criadoEm)}</p>
                    </div>
                    <Badge status={l.status} />
                  </div>
                  <p className="text-[13px] text-ink-2">{l.telefone} · {l.email}</p>
                  {l.mensagem && <p className="rounded-xl bg-card-2 px-3 py-2 text-[13px] text-ink-2">{l.mensagem}</p>}
                  <div className="flex flex-wrap gap-2">
                    <BotaoZap telefone={l.telefone} nome={l.nome} />
                    {l.status === "convertido" ? (
                      <span className="inline-flex h-11 items-center px-2 text-[13px] text-ink-3">Convertido pelo admin</span>
                    ) : (
                      <select value={l.status} disabled={salvando === l.id} onChange={(e) => mudarStatus(l.id, e.target.value)} aria-label={`Status de ${l.nome}`}
                        className="h-11 rounded-xl border border-line bg-card-2 px-3 text-sm outline-none focus:border-gold scheme-dark">
                        {OPCOES_CORRETOR.map((s) => <option key={s} value={s}>{STATUS[s].label}</option>)}
                      </select>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      {!carregando && aba === "clientes" && (
        clientes.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-line p-8 text-center text-sm text-ink-2">
            Sua carteira está vazia.
            <button type="button" onClick={() => setModal(true)} className="ml-1 text-gold hover:underline">Cadastrar o primeiro cliente</button>
          </div>
        ) : (
          <ul className="grid gap-3 lg:grid-cols-2">
            {clientes.map((c) => (
              <li key={c.id} className="space-y-3 rounded-2xl border border-line bg-card p-4">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="truncate font-semibold">{c.nome}</h3>
                  <span className="shrink-0 text-[12px] text-ink-3">desde {dataCurta(c.criadoEm)}</span>
                </div>
                <p className="text-[13px] text-ink-2">{mascarar(c.telefone ?? "")}{c.email ? ` · ${c.email}` : ""}</p>
                {c.observacoes && <p className="rounded-xl bg-card-2 px-3 py-2 text-[13px] text-ink-2">{c.observacoes}</p>}
                {c.telefone && <BotaoZap telefone={c.telefone} nome={c.nome} />}
              </li>
            ))}
          </ul>
        )
      )}

      {modal && (
        <CadastrarClienteModal
          onClose={fecharModal}
          onCriado={(cliente) => {
            setClientes((lista) => [cliente, ...lista]);
            setAba("clientes");
            fecharModal();
          }}
        />
      )}
    </div>
  );
}