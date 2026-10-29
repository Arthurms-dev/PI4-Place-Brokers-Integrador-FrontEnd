import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Icon } from "@/components/ui/Icon";
import { usePageTitle } from "@/hooks/usePageTitle";
import { LeadAtividadesToggle } from "@/components/leads/LeadAtividades";
import { AtendimentoLead } from "@/components/leads/AtendimentoLead";
import { formatarTelefone, linkWhatsApp } from "@/lib/atendimento";
import { listarRetornos } from "@/services/leadAtividades";
import { atualizarStatusLead, criarCliente, levarLeadParaCarteira, listarClientes, listarMeusLeads } from "@/services/meusLeads";
import { listarVendas } from "@/services/vendas";

const STATUS = {
  novo: { label: "Novo", cls: "bg-gold/15 text-gold" },
  em_atendimento: { label: "Em atendimento", cls: "bg-sky-500/15 text-sky-300" },
  convertido: { label: "Convertido", cls: "bg-emerald-500/15 text-emerald-300" },
  perdido: { label: "Perdido", cls: "bg-white/10 text-ink-3" },
};
const OPCOES_CORRETOR = ["novo", "em_atendimento", "perdido"];
const ATIVOS = ["novo", "em_atendimento"];

const digitos = (v = "") => v.replace(/\D/g, "");
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

function BotaoZap({ telefone }) {
  return (
    <a
      href={linkWhatsApp(telefone)}
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

const brl = (n) => Number(n).toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
const VENDA = {
  confirmada: ["bg-emerald-500/15 text-emerald-300", "Venda confirmada"],
  pendente: ["bg-amber-500/15 text-amber-300", "Venda aguardando"],
  recusada: ["bg-danger/15 text-danger", "Venda recusada"],
};

function VendasDoCliente({ vendas = [] }) {
  if (!vendas.length) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {vendas.map((v) => {
        const [cls, rotulo] = VENDA[v.status] ?? VENDA.pendente;
        return (
          <span key={v.id} className={`rounded-full px-3 py-1 text-[12px] font-medium ${cls}`}>
            {rotulo} · {brl(v.valor)}{v.empreendimento?.nome ? ` · ${v.empreendimento.nome}` : ""}
          </span>
        );
      })}
    </div>
  );
}

export default function MeusLeadsPage({ abrirCadastro = false }) {
  usePageTitle("Meus leads");
  const [aba, setAba] = useState("leads");
  const [leads, setLeads] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [vendas, setVendas] = useState([]);
  const [retornos, setRetornos] = useState({});
  const [filtro, setFiltro] = useState("ativos");
  const [aberto, setAberto] = useState(null);
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
  const [agendando, setAgendando] = useState(null);

  // Lead → visita: garante o cliente na carteira e abre a Agenda já preenchida.
  const agendarVisita = useCallback(async (lead) => {
    setErro("");
    setAgendando(lead.id);
    try {
      const cliente = await levarLeadParaCarteira(lead.id);
      setClientes((lista) => (lista.some((c) => c.id === cliente.id) ? lista : [cliente, ...lista]));
      if (lead.status === "novo") setLeads((lista) => lista.map((l) => (l.id === lead.id ? { ...l, status: "em_atendimento" } : l)));
      const q = new URLSearchParams({ novo: "1", cliente: cliente.id });
      if (lead.empreendimento?.id) q.set("empreendimento", lead.empreendimento.id);
      if (cliente.leadOrigem?.id === lead.id) q.set("lead", lead.id);
      navigate(`/corretor/agenda?${q}`);
    } catch (e) {
      setErro(e.message);
    } finally {
      setAgendando(null);
    }
  }, [navigate]);

  useEffect(() => {
    let ativo = true;
    Promise.all([listarMeusLeads(), listarClientes(), listarVendas().catch(() => []), listarRetornos().catch(() => [])])
      .then(([l, c, v, r]) => ativo && (setLeads(l), setClientes(c), setVendas(v), setRetornos(Object.fromEntries(r.map((x) => [x.leadId, x])))))
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

  const vendasPorCliente = useMemo(() => {
    const mapa = new Map();
    for (const v of vendas) if (v.cliente_id) mapa.set(v.cliente_id, [...(mapa.get(v.cliente_id) ?? []), v]);
    return mapa;
  }, [vendas]);

  // Leads novos primeiro (o que espera há mais tempo no topo): quem retorna primeiro leva o cliente.
  const visiveis = useMemo(() => {
    const lista = leads.filter((l) => (filtro === "ativos" ? ATIVOS.includes(l.status) : !filtro || l.status === filtro));
    const novos = lista.filter((l) => l.status === "novo").sort((a, b) => new Date(a.criadoEm) - new Date(b.criadoEm));
    return [...novos, ...lista.filter((l) => l.status !== "novo")];
  }, [leads, filtro]);

  const contagem = (k) => (k === "ativos" ? leads.filter((l) => ATIVOS.includes(l.status)).length : k ? leads.filter((l) => l.status === k).length : leads.length);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="pb-eyebrow">Relacionamento</p>
          <h1 className="text-xl font-semibold">Meus leads</h1>
          <p className="text-[13px] text-ink-2">Leads que chegaram para você e a sua carteira de clientes.</p>
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
            {[["ativos", "Ativos"], ...Object.entries(STATUS).map(([k, v]) => [k, v.label]), ["", "Todos"]].map(([k, rotulo]) => (
              <button key={k} type="button" onClick={() => setFiltro(k)} aria-pressed={filtro === k}
                className={`shrink-0 rounded-full border px-4 py-2 text-[13px] ${filtro === k ? "border-gold bg-gold/15 text-gold" : "border-line text-ink-2 hover:text-ink"}`}>
                {rotulo} <span className="text-ink-3">{contagem(k)}</span>
              </button>
            ))}
          </div>

          {visiveis.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-line p-8 text-center text-sm text-ink-2">
              {leads.length === 0 ? "Você ainda não tem leads. Quando a roleta ou o gerente te passar um contato, ele aparece aqui." : filtro === "ativos" ? "Nenhum lead em aberto agora." : "Nenhum lead com esse status."}
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
                  {l.status !== "convertido" && l.status !== "perdido" ? (
                    <AtendimentoLead
                      lead={l}
                      retorno={retornos[l.id]}
                      onIniciarAtendimento={(lead) => mudarStatus(lead.id, "em_atendimento")}
                      onRetorno={(lead, r) => setRetornos((m) => ({ ...m, [lead.id]: r }))}
                    />
                  ) : (
                    l.telefone && <p className="select-all font-mono text-[14px] text-ink-2">{formatarTelefone(l.telefone)}</p>
                  )}
                  {l.mensagem && <p className="rounded-xl bg-card-2 px-3 py-2 text-[13px] text-ink-2">{l.mensagem}</p>}
                  <div className="flex flex-wrap gap-2">
                    {ATIVOS.includes(l.status) && (
                      <button type="button" onClick={() => agendarVisita(l)} disabled={agendando === l.id}
                        className="inline-flex h-10 items-center gap-2 rounded-xl border border-gold/40 px-3.5 text-[13px] font-medium text-gold transition-colors hover:bg-gold/10 disabled:opacity-60">
                        <Icon name="calendar" className="size-4" /> {agendando === l.id ? "Abrindo agenda..." : "Agendar visita"}
                      </button>
                    )}
                    <button type="button" onClick={() => setAberto((v) => (v === l.id ? null : l.id))} aria-expanded={aberto === l.id}
                      className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-line px-3.5 text-[13px] text-ink-2 transition-colors hover:border-gold hover:text-ink">
                      Mais <Icon name="chevronDown" className={`size-4 transition-transform ${aberto === l.id ? "rotate-180" : ""}`} />
                    </button>
                  </div>
                  {aberto === l.id && (
                    <div className="space-y-3 border-t border-line-soft pt-3">
                      {l.email && <p className="truncate text-[13px] text-ink-3">{l.email}</p>}
                      {l.status === "convertido" ? (
                        <p className="text-[13px] text-ink-3">Convertido em cliente</p>
                      ) : (
                        <label className="flex items-center gap-2 text-[13px] text-ink-2">
                          Status
                          <select value={l.status} disabled={salvando === l.id} onChange={(e) => mudarStatus(l.id, e.target.value)} aria-label={`Status de ${l.nome}`}
                            className="h-10 rounded-xl border border-line bg-card-2 px-3 text-sm text-ink outline-none focus:border-gold scheme-dark">
                            {OPCOES_CORRETOR.map((st) => <option key={st} value={st}>{STATUS[st].label}</option>)}
                          </select>
                        </label>
                      )}
                      <LeadAtividadesToggle leadId={l.id} />
                    </div>
                  )}
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
                <VendasDoCliente vendas={vendasPorCliente.get(c.id)} />
                <div className="flex flex-wrap gap-2">
                  {c.telefone && <BotaoZap telefone={c.telefone} />}
                  <Link to={`/corretor/vendas?cliente=${c.id}`} className="inline-flex h-11 items-center rounded-xl border border-line px-4 text-sm text-ink-2 transition-colors hover:border-gold hover:text-ink">
                    Lançar venda
                  </Link>
                </div>
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
