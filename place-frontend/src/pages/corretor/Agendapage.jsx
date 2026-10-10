import { useCallback, useEffect, useMemo, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { usePageTitle } from "@/hooks/usePageTitle";
import { atualizarStatusAgendamento, criarAgendamento, listarAgendamentos, remarcarAgendamento } from "@/services/agenda";
import { listarEmpreendimentos } from "@/services/empreendimentos";
import { listarClientes } from "@/services/meusLeads";

const STATUS = {
  agendado: { label: "Agendado", cls: "bg-white/10 text-ink-2" },
  confirmado: { label: "Confirmado", cls: "bg-sky-500/15 text-sky-300" },
  realizado: { label: "Realizado", cls: "bg-emerald-500/15 text-emerald-300" },
  cancelado: { label: "Cancelado", cls: "bg-danger/15 text-danger" },
  nao_compareceu: { label: "Não compareceu", cls: "bg-amber-500/15 text-amber-300" },
};
const ENCERRADOS = ["realizado", "cancelado", "nao_compareceu"];

const inicioDoDia = (d) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};
const mesmoDia = (a, b) => inicioDoDia(a).getTime() === inicioDoDia(b).getTime();
const hora = (iso) => new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
function rotuloDia(d) {
  const hoje = new Date();
  const amanha = new Date(hoje.getTime() + 86400000);
  if (mesmoDia(d, hoje)) return "Hoje";
  if (mesmoDia(d, amanha)) return "Amanhã";
  return d.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "short" });
}
const paraInput = (d) => {
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
};
const zap = (tel, nome) => `https://wa.me/55${(tel ?? "").replace(/\D/g, "")}?text=${encodeURIComponent(`Olá, ${nome}! Aqui é da Place Brokers.`)}`;
const CAMPO = "h-12 w-full rounded-xl border bg-card-2 px-3.5 text-sm text-ink outline-none transition-colors placeholder:text-ink-3 scheme-dark";

function Folha({ titulo, onClose, children }) {
  useEffect(() => {
    const aoTeclar = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", aoTeclar);
    return () => document.removeEventListener("keydown", aoTeclar);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/65 sm:items-center sm:p-4" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="animate-fade-up max-h-[94dvh] w-full space-y-3.5 overflow-y-auto rounded-t-3xl border border-line bg-card p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:max-w-md sm:rounded-3xl sm:p-7">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">{titulo}</h2>
          <button type="button" onClick={onClose} aria-label="Fechar" className="grid size-11 place-items-center rounded-full border border-line text-ink-2 hover:border-gold hover:text-ink">
            <Icon name="x" className="size-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Rotulo({ texto, erro, children }) {
  return (
    <label className="block text-xs text-ink-2">
      {texto}
      <div className="mt-1.5">{children}</div>
      {erro && <span className="mt-1 block text-[11px] text-danger">{erro}</span>}
    </label>
  );
}

function NovoAgendamento({ clientes, empreendimentos, onClose, onCriado }) {
  const [f, setF] = useState({ tipo: "visita_imovel", clienteId: "", empreendimentoId: "", local: "", dataHora: "", observacoes: "" });
  const [erros, setErros] = useState({});
  const [erroGeral, setErroGeral] = useState("");
  const [enviando, setEnviando] = useState(false);
  const set = (campo) => (e) => setF((s) => ({ ...s, [campo]: e.target.value }));
  const visita = f.tipo === "visita_imovel";
  const borda = (c) => (erros[c] ? "border-danger" : "border-line focus:border-gold");

  async function enviar(ev) {
    ev.preventDefault();
    const e = {};
    if (!f.clienteId) e.clienteId = "Escolha o cliente.";
    if (!f.dataHora) e.dataHora = "Informe data e hora.";
    if (visita && !f.empreendimentoId) e.empreendimentoId = "Escolha o imóvel da visita.";
    setErros(e);
    setErroGeral("");
    if (Object.keys(e).length) return;

    setEnviando(true);
    try {
      onCriado(
        await criarAgendamento({
          tipo: f.tipo,
          clienteId: f.clienteId,
          dataHora: new Date(f.dataHora).toISOString(),
          empreendimentoId: visita ? f.empreendimentoId : undefined,
          local: visita ? undefined : f.local.trim() || undefined,
          observacoes: f.observacoes.trim() || undefined,
        }),
      );
    } catch (err) {
      setErros(err.fieldErrors ?? {});
      setErroGeral(err.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Folha titulo="Novo agendamento" onClose={onClose}>
      <form onSubmit={enviar} noValidate className="space-y-3.5">
        <div className="grid grid-cols-2 gap-2">
          {[["visita_imovel", "Visita ao imóvel"], ["reuniao_escritorio", "Reunião no escritório"]].map(([v, r]) => (
            <button key={v} type="button" onClick={() => setF((s) => ({ ...s, tipo: v }))} aria-pressed={f.tipo === v}
              className={`h-12 rounded-xl border text-[13px] ${f.tipo === v ? "border-gold bg-gold/15 text-gold" : "border-line text-ink-2"}`}>
              {r}
            </button>
          ))}
        </div>

        <Rotulo texto="Cliente" erro={erros.clienteId}>
          <select value={f.clienteId} onChange={set("clienteId")} className={`${CAMPO} ${borda("clienteId")}`}>
            <option value="" disabled>{clientes.length ? "Escolha o cliente..." : "Nenhum cliente cadastrado"}</option>
            {clientes.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>
        </Rotulo>
        {clientes.length === 0 && <p className="text-[12px] text-ink-3">Cadastre o cliente em Meus leads para poder agendar.</p>}

        {visita ? (
          <Rotulo texto="Imóvel" erro={erros.empreendimentoId}>
            <select value={f.empreendimentoId} onChange={set("empreendimentoId")} className={`${CAMPO} ${borda("empreendimentoId")}`}>
              <option value="" disabled>Escolha o empreendimento...</option>
              {empreendimentos.map((e) => <option key={e.id} value={e.id}>{e.nome ?? e.title}</option>)}
            </select>
          </Rotulo>
        ) : (
          <Rotulo texto="Local (opcional)">
            <input value={f.local} onChange={set("local")} placeholder="Ex.: Sala 2 do escritório" className={`${CAMPO} border-line focus:border-gold`} />
          </Rotulo>
        )}

        <Rotulo texto="Data e hora" erro={erros.dataHora}>
          <input type="datetime-local" value={f.dataHora} min={paraInput(new Date())} onChange={set("dataHora")} className={`${CAMPO} ${borda("dataHora")}`} />
        </Rotulo>
        <Rotulo texto="Observações (opcional)">
          <textarea value={f.observacoes} onChange={set("observacoes")} rows={2} className="w-full rounded-xl border border-line bg-card-2 px-3.5 py-3 text-sm outline-none focus:border-gold scheme-dark" />
        </Rotulo>

        {erroGeral && <p role="alert" className="text-xs text-danger">{erroGeral}</p>}
        <button type="submit" disabled={enviando} className="h-12 w-full rounded-xl bg-gold-gradient text-sm font-semibold text-[#1a1408] hover:brightness-110 disabled:opacity-60">
          {enviando ? "Salvando..." : "Agendar"}
        </button>
      </form>
    </Folha>
  );
}

function Remarcar({ ag, onClose, onRemarcado }) {
  const [dataHora, setDataHora] = useState(paraInput(new Date(ag.dataHora)));
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);
  async function enviar(ev) {
    ev.preventDefault();
    setEnviando(true);
    setErro("");
    try {
      onRemarcado(await remarcarAgendamento(ag.id, new Date(dataHora).toISOString()));
    } catch (e) {
      setErro(e.message);
    } finally {
      setEnviando(false);
    }
  }
  return (
    <Folha titulo="Remarcar" onClose={onClose}>
      <form onSubmit={enviar} className="space-y-3.5">
        <Rotulo texto={`Nova data e hora — ${ag.cliente?.nome ?? ""}`}>
          <input type="datetime-local" value={dataHora} min={paraInput(new Date())} onChange={(e) => setDataHora(e.target.value)} className={`${CAMPO} border-line focus:border-gold`} />
        </Rotulo>
        {erro && <p role="alert" className="text-xs text-danger">{erro}</p>}
        <button type="submit" disabled={enviando || !dataHora} className="h-12 w-full rounded-xl bg-gold-gradient text-sm font-semibold text-[#1a1408] disabled:opacity-60">
          {enviando ? "Salvando..." : "Confirmar novo horário"}
        </button>
      </form>
    </Folha>
  );
}

function Compromisso({ ag, aberto, onAbrir, onStatus, onRemarcar, ocupado }) {
  const [cancelando, setCancelando] = useState(false);
  const [motivo, setMotivo] = useState("");
  const st = STATUS[ag.status] ?? STATUS.agendado;
  const encerrado = ENCERRADOS.includes(ag.status);
  const passou = new Date(ag.dataHora) <= new Date();
  const onde = ag.tipo === "visita_imovel" ? ag.empreendimento?.nome ?? "Imóvel" : ag.local ?? "Escritório";
  const botao = "h-11 rounded-xl border px-4 text-[13px] font-medium transition-colors disabled:opacity-50";

  return (
    <li className="rounded-2xl border border-line bg-card">
      <button type="button" onClick={onAbrir} aria-expanded={aberto} className="flex w-full items-center gap-4 p-4 text-left">
        <div className="w-14 shrink-0 text-center">
          <div className="text-xl font-semibold text-gold">{hora(ag.dataHora)}</div>
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate font-semibold">{ag.cliente?.nome ?? "—"}</div>
          <div className="flex items-center gap-1.5 truncate text-[13px] text-ink-2">
            <Icon name={ag.tipo === "visita_imovel" ? "mapPin" : "home"} className="size-3.5 shrink-0" /> {onde}
          </div>
        </div>
        <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium ${st.cls}`}>{st.label}</span>
      </button>

      {aberto && (
        <div className="space-y-3 border-t border-line-soft p-4">
          {ag.observacoes && <p className="rounded-xl bg-card-2 px-3 py-2 text-[13px] text-ink-2">{ag.observacoes}</p>}
          {ag.motivoCancelamento && <p className="text-[13px] text-ink-2">Motivo do cancelamento: {ag.motivoCancelamento}</p>}

          <div className="flex flex-wrap gap-2">
            {ag.cliente?.telefone && (
              <a href={zap(ag.cliente.telefone, ag.cliente.nome)} target="_blank" rel="noreferrer" className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#25D366] px-4 text-[13px] font-semibold text-[#06210f]">
                <Icon name="messageCircle" className="size-4.5" /> WhatsApp
              </a>
            )}
            {!encerrado && (
              <>
                {ag.status === "agendado" && (
                  <button type="button" disabled={ocupado} onClick={() => onStatus(ag.id, "confirmado")} className={`${botao} border-sky-400/40 text-sky-300 hover:bg-sky-500/10`}>Confirmar</button>
                )}
                {passou && (
                  <>
                    <button type="button" disabled={ocupado} onClick={() => onStatus(ag.id, "realizado")} className={`${botao} border-emerald-400/40 text-emerald-300 hover:bg-emerald-500/10`}>Realizado</button>
                    <button type="button" disabled={ocupado} onClick={() => onStatus(ag.id, "nao_compareceu")} className={`${botao} border-amber-400/40 text-amber-300 hover:bg-amber-500/10`}>Não compareceu</button>
                  </>
                )}
                <button type="button" disabled={ocupado} onClick={onRemarcar} className={`${botao} border-line text-ink-2 hover:border-gold hover:text-ink`}>Remarcar</button>
                <button type="button" onClick={() => setCancelando((v) => !v)} className={`${botao} border-danger/40 text-danger hover:bg-danger/10`}>Cancelar</button>
              </>
            )}
          </div>

          {cancelando && (
            <div className="space-y-2 rounded-xl border border-danger/30 p-3">
              <textarea value={motivo} onChange={(e) => setMotivo(e.target.value)} rows={2} placeholder="Motivo do cancelamento" className="w-full rounded-xl border border-line bg-card-2 px-3 py-2 text-sm outline-none focus:border-gold scheme-dark" />
              <button type="button" disabled={ocupado || !motivo.trim()} onClick={() => onStatus(ag.id, "cancelado", { motivoCancelamento: motivo.trim() })} className="h-11 w-full rounded-xl bg-danger text-sm font-semibold text-white disabled:opacity-50">
                Confirmar cancelamento
              </button>
            </div>
          )}
        </div>
      )}
    </li>
  );
}

export default function AgendaPage() {
  usePageTitle("Agenda");
  const [itens, setItens] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [empreendimentos, setEmpreendimentos] = useState([]);
  const [filtro, setFiltro] = useState("proximos");
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [novo, setNovo] = useState(false);
  const [remarcando, setRemarcando] = useState(null);
  const [aberto, setAberto] = useState(null);
  const [ocupado, setOcupado] = useState(false);

  useEffect(() => {
    let ativo = true;
    Promise.all([listarAgendamentos(), listarClientes().catch(() => []), listarEmpreendimentos().catch(() => [])])
      .then(([a, c, e]) => ativo && (setItens(a), setClientes(c), setEmpreendimentos(e)))
      .catch((e) => ativo && setErro(e.message))
      .finally(() => ativo && setCarregando(false));
    return () => {
      ativo = false;
    };
  }, []);

  const trocar = useCallback((atualizado) => setItens((l) => l.map((a) => (a.id === atualizado.id ? atualizado : a))), []);

  const mudarStatus = useCallback(
    async (id, status, extra) => {
      setErro("");
      setOcupado(true);
      try {
        trocar(await atualizarStatusAgendamento(id, status, extra));
      } catch (e) {
        setErro(e.message);
      } finally {
        setOcupado(false);
      }
    },
    [trocar],
  );

  const grupos = useMemo(() => {
    const hoje0 = inicioDoDia(new Date());
    const historico = (a) => new Date(a.dataHora) < hoje0 || ENCERRADOS.includes(a.status);
    const lista = itens.filter((a) => {
      if (filtro === "historico") return historico(a);
      if (historico(a)) return false;
      return filtro === "hoje" ? mesmoDia(a.dataHora, new Date()) : true;
    });
    lista.sort((a, b) => (filtro === "historico" ? new Date(b.dataHora) - new Date(a.dataHora) : new Date(a.dataHora) - new Date(b.dataHora)));
    const porDia = new Map();
    for (const a of lista) {
      const chave = inicioDoDia(a.dataHora).getTime();
      porDia.set(chave, [...(porDia.get(chave) ?? []), a]);
    }
    return [...porDia.entries()];
  }, [itens, filtro]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Agenda</h1>
          <p className="text-[13px] text-ink-2">Suas visitas e reuniões com clientes.</p>
        </div>
        <button type="button" onClick={() => setNovo(true)} className="inline-flex h-11 items-center gap-2 rounded-xl bg-gold-gradient px-5 text-sm font-semibold text-[#1a1408] hover:brightness-110">
          <Icon name="calendar" className="size-4.5" /> Novo agendamento
        </button>
      </div>

      <div className="flex gap-2">
        {[["hoje", "Hoje"], ["proximos", "Próximos"], ["historico", "Histórico"]].map(([k, r]) => (
          <button key={k} type="button" onClick={() => setFiltro(k)} aria-pressed={filtro === k}
            className={`h-11 flex-1 rounded-xl border text-sm sm:flex-none sm:px-6 ${filtro === k ? "border-gold bg-gold/15 text-gold" : "border-line text-ink-2 hover:text-ink"}`}>
            {r}
          </button>
        ))}
      </div>

      {erro && <p role="alert" className="rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">{erro}</p>}
      {carregando && <p className="py-8 text-center text-sm text-ink-2">Carregando agenda...</p>}

      {!carregando && grupos.length === 0 && (
        <div className="rounded-2xl border border-dashed border-line p-8 text-center text-sm text-ink-2">
          {filtro === "historico" ? "Nada no histórico ainda." : "Nenhum compromisso por aqui."}
          {filtro !== "historico" && <button type="button" onClick={() => setNovo(true)} className="ml-1 text-gold hover:underline">Agendar agora</button>}
        </div>
      )}

      {grupos.map(([dia, lista]) => (
        <section key={dia} className="space-y-2">
          <h2 className="text-[13px] font-medium capitalize text-ink-2">{rotuloDia(new Date(dia))}</h2>
          <ul className="space-y-2">
            {lista.map((a) => (
              <Compromisso key={a.id} ag={a} aberto={aberto === a.id} ocupado={ocupado}
                onAbrir={() => setAberto((v) => (v === a.id ? null : a.id))}
                onStatus={mudarStatus} onRemarcar={() => setRemarcando(a)} />
            ))}
          </ul>
        </section>
      ))}

      {novo && (
        <NovoAgendamento clientes={clientes} empreendimentos={empreendimentos} onClose={() => setNovo(false)}
          onCriado={(a) => { setItens((l) => [...l, a]); setFiltro("proximos"); setAberto(a.id); setNovo(false); }} />
      )}
      {remarcando && (
        <Remarcar ag={remarcando} onClose={() => setRemarcando(null)} onRemarcado={(a) => { trocar(a); setRemarcando(null); }} />
      )}
    </div>
  );
}