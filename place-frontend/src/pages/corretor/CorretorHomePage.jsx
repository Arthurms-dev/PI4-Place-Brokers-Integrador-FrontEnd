import { useMemo, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import { useAsyncData } from "@/hooks/useAsyncData";
import { useAgora } from "@/components/leads/AtendimentoLead";
import { AvisoNotificacoes } from "@/components/leads/AvisoNotificacoes";
import { listarEmpreendimentos, STATUS } from "@/services/empreendimentos";
import { listarAgendamentos } from "@/services/agenda";
import { compromissosDeHoje, localDoCompromisso } from "@/lib/agendaCalendario";
import { leadsEsperando, resumirInicio, ultimosAcessos } from "@/lib/inicioCorretor";
import { atualizarStatusLead, listarMeusLeads } from "@/services/meusLeads";
import { listarVendas } from "@/services/vendas";
import { listarMeusAcessos } from "@/services/eventos";
import { listarRetornos, registrarAtividade } from "@/services/leadAtividades";
import { chegadaDoLead, linkLigar, linkWhatsApp, tempoDesde, urgencia } from "@/lib/atendimento";
import { minhaRoleta } from "@/services/roleta";
import { situacaoDoCorretor } from "@/lib/roleta";

const local = (e) => [e.bairro, e.cidade && `${e.cidade}/${e.uf}`].filter(Boolean).join(" · ");
const hora = (iso) => new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
const brl = (n) => Number(n).toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
const plural = (n, um, varios) => `${n} ${n === 1 ? um : varios}`;
const hojePorExtenso = () => new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });

const COR_ESPERA = { ok: "text-emerald-300", atencao: "text-amber-300", atrasado: "text-danger" };

/**
 * O mais urgente do dia: lead novo esperando o primeiro contato, com ligar e WhatsApp à mão.
 * Quem retorna primeiro leva o cliente.
 */
function LeadsEsperando({ leads }) {
  const agora = useAgora();
  const [atendidos, setAtendidos] = useState(() => new Set());
  const lista = leadsEsperando(leads, atendidos);
  if (lista.length === 0) return null;

  function contato(lead, tipo) {
    registrarAtividade(lead.id, {
      tipo,
      descricao: tipo === "ligacao" ? "Ligou para o cliente pelo app." : "Abriu a conversa no WhatsApp pelo app.",
    }).catch(() => {});
    atualizarStatusLead(lead.id, "em_atendimento").catch(() => {});
    setAtendidos((s) => new Set(s).add(lead.id));
  }

  const pior = urgencia(chegadaDoLead(lista[0]), agora);
  return (
    <section className={cn("rounded-xl border p-4", pior === "atrasado" ? "border-danger/50 bg-danger/10" : "border-gold/50 bg-gold/10")}>
      <div className="flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-[15px] font-semibold">
          <Icon name="userPlus" className={cn("size-4.5", pior === "atrasado" ? "text-danger" : "text-gold")} />
          {lista.length === 1 ? "1 lead esperando contato" : `${lista.length} leads esperando contato`}
        </h2>
        <Link to="/corretor/leads" className="inline-flex shrink-0 items-center gap-1 text-[12px] text-gold hover:underline">
          Meus leads <Icon name="arrowRight" className="size-3.5" />
        </Link>
      </div>
      <ul className="mt-3 space-y-2">
        {lista.slice(0, 3).map((l) => (
          <li key={l.id} className="flex items-center gap-2.5 rounded-lg bg-card px-3 py-2.5">
            <span className="min-w-0 flex-1">
              <b className="block truncate text-[14px] font-medium">{l.nome}</b>
              <small className="block truncate text-[12px] text-ink-3">
                <span className={COR_ESPERA[urgencia(chegadaDoLead(l), agora)]}>{tempoDesde(chegadaDoLead(l), agora)}</span>
                {l.empreendimento?.nome ? ` · ${l.empreendimento.nome}` : ""}
              </small>
            </span>
            {l.telefone && (
              <>
                <a href={linkWhatsApp(l.telefone)} target="_blank" rel="noreferrer" onClick={() => contato(l, "whatsapp")}
                  aria-label={`WhatsApp de ${l.nome}`} className="grid size-10 shrink-0 place-items-center rounded-full bg-[#25D366] text-[#06210f]">
                  <Icon name="messageCircle" className="size-4.5" />
                </a>
                <a href={linkLigar(l.telefone)} onClick={() => contato(l, "ligacao")}
                  aria-label={`Ligar para ${l.nome}`} className="grid size-10 shrink-0 place-items-center rounded-full bg-gold-gradient text-[#1a1408]">
                  <Icon name="phone" className="size-4.5" />
                </a>
              </>
            )}
          </li>
        ))}
      </ul>
      {lista.length > 3 && <p className="mt-2 text-[12px] text-ink-2">e mais {lista.length - 3} em Meus leads.</p>}
    </section>
  );
}

/** Números da semana numa linha só; cada um leva para a tela certa. */
function NumerosRapidos({ resumo, carregando }) {
  const cards = [
    {
      to: "/corretor/leads", rotulo: "Em atendimento", valor: resumo.leadsEmAtendimento,
      rodape: resumo.leadsNovos ? plural(resumo.leadsNovos, "novo esperando", "novos esperando") : "Nenhum novo esperando",
    },
    {
      to: "/corretor/agenda", rotulo: "Visitas na semana", valor: resumo.visitasSemana,
      rodape: resumo.visitasPendentes ? `${plural(resumo.visitasPendentes, "ainda vai acontecer", "ainda vão acontecer")}` : "Segunda a domingo",
    },
    {
      to: "/corretor/vendas", rotulo: "VGV confirmado", valor: brl(resumo.vgvConfirmado), destaque: true,
      rodape: resumo.vendasPendentes ? `${plural(resumo.vendasPendentes, "venda aguardando", "vendas aguardando")} · ${brl(resumo.valorPendente)}` : plural(resumo.vendasConfirmadas, "venda confirmada", "vendas confirmadas"),
    },
  ];
  return (
    <section aria-label="Seus números" className="grid grid-cols-3 gap-2 sm:gap-3">
      {cards.map((c) => (
        <Link key={c.to} to={c.to} className="min-w-0 rounded-xl border border-line bg-card px-3 py-2.5 transition-colors hover:border-gold sm:p-4">
          <span className="block text-[11px] leading-tight text-ink-3 sm:truncate sm:text-[12px]">{c.rotulo}</span>
          <strong className={cn("mt-0.5 block truncate text-lg font-semibold sm:text-2xl", c.destaque && "text-gold")}>{carregando ? "…" : c.valor}</strong>
          <small className="mt-0.5 hidden truncate text-[12px] text-ink-3 sm:block">{carregando ? "\u00a0" : c.rodape}</small>
        </Link>
      ))}
    </section>
  );
}

/** Aviso dentro do site quando o corretor entra no dia de uma visita/reunião. */
function AvisoDoDia({ agendamentos }) {
  const hoje = compromissosDeHoje(agendamentos);
  if (hoje.length === 0) return null;

  return (
    <section role="status" className="rounded-xl border border-gold/40 bg-gold/10 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-[15px] font-medium">
          <Icon name="bell" className="size-4.5 text-gold" />
          {hoje.length === 1 ? "Você tem 1 compromisso hoje" : `Você tem ${hoje.length} compromissos hoje`}
        </h2>
        <Link to="/corretor/agenda" className="inline-flex items-center gap-1.5 text-[12px] text-gold hover:underline">
          Ver agenda <Icon name="arrowRight" className="size-3.5" />
        </Link>
      </div>
      <ul className="mt-3 space-y-2">
        {hoje.slice(0, 3).map((a) => (
          <li key={a.id}>
            <Link to="/corretor/agenda" className="flex items-center gap-3 rounded-lg bg-card px-3 py-2.5 hover:bg-card-2">
              <span className="w-12 shrink-0 text-[15px] font-semibold text-gold">{hora(a.dataHora)}</span>
              <span className="min-w-0 flex-1">
                <b className="block truncate text-[13px] font-medium">{a.cliente?.nome ?? "Cliente"}</b>
                <small className="flex items-center gap-1 truncate text-[11px] text-ink-3">
                  <Icon name={a.tipo === "visita_imovel" ? "mapPin" : "home"} className="size-3 shrink-0" />
                  {localDoCompromisso(a)}
                </small>
              </span>
            </Link>
          </li>
        ))}
      </ul>
      {hoje.length > 3 && <p className="mt-2 text-[12px] text-ink-2">e mais {hoje.length - 3} na agenda.</p>}
    </section>
  );
}

/** Posição do corretor na roleta de leads de hoje (lista de chegada da recepção). */
function RoletaDeHoje({ minha }) {
  const s = situacaoDoCorretor(minha);
  if (!s) return null;
  return (
    <section
      className={cn(
        "flex items-start gap-3 rounded-xl border p-4",
        s.tom === "ok" ? "border-ok/40 bg-ok/10" : s.tom === "aviso" ? "border-gold/40 bg-gold/10" : "border-line bg-card",
      )}
    >
      <Icon name="refresh" className={cn("mt-0.5 size-4.5 shrink-0", s.tom === "ok" ? "text-ok" : s.tom === "aviso" ? "text-gold" : "text-ink-3")} />
      <div className="min-w-0">
        <h2 className="text-[15px] font-medium">{s.titulo}</h2>
        <p className="mt-0.5 text-[12px] text-ink-2">{s.detalhe}</p>
      </div>
    </section>
  );
}

/** Lembretes de retorno atrasados ou de hoje (marcados em "Lembrete" no lead). */
function RetornosDeHoje({ retornos }) {
  const fimDoDia = new Date();
  fimDoDia.setHours(23, 59, 59, 999);
  const lista = (retornos ?? []).filter((r) => new Date(r.proximoContatoEm) <= fimDoDia);
  if (lista.length === 0) return null;
  const atrasados = lista.filter((r) => r.atrasado).length;

  return (
    <section className={cn("rounded-xl border p-4", atrasados ? "border-danger/40 bg-danger/10" : "border-gold/40 bg-gold/10")}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-[15px] font-medium">
          <Icon name="phone" className={cn("size-4.5", atrasados ? "text-danger" : "text-gold")} />
          {lista.length === 1 ? "1 retorno para fazer" : `${lista.length} retornos para fazer`}
          {atrasados > 0 && <span className="text-[12px] font-normal text-danger">· {atrasados} atrasado{atrasados > 1 ? "s" : ""}</span>}
        </h2>
        <Link to="/corretor/leads" className="inline-flex items-center gap-1.5 text-[12px] text-gold hover:underline">
          Ver leads <Icon name="arrowRight" className="size-3.5" />
        </Link>
      </div>
      <ul className="mt-3 space-y-2">
        {lista.slice(0, 4).map((r) => (
          <li key={r.atividadeId} className="flex items-center gap-3 rounded-lg bg-card px-3 py-2.5">
            <span className={cn("w-12 shrink-0 text-[15px] font-semibold", r.atrasado ? "text-danger" : "text-gold")}>{hora(r.proximoContatoEm)}</span>
            <span className="min-w-0 flex-1">
              <b className="block truncate text-[13px] font-medium">{r.nome}</b>
              <small className="block truncate text-[11px] text-ink-3">{[r.empreendimento?.nome, r.nota].filter(Boolean).join(" · ")}</small>
            </span>
            {r.telefone && (
              <a href={linkLigar(r.telefone)} aria-label={`Ligar para ${r.nome}`} className="grid size-10 shrink-0 place-items-center rounded-full bg-gold-gradient text-[#1a1408]">
                <Icon name="phone" className="size-4.5" />
              </a>
            )}
          </li>
        ))}
      </ul>
      {lista.length > 4 && <p className="mt-2 text-[12px] text-ink-2">e mais {lista.length - 4} em Meus leads.</p>}
    </section>
  );
}

function Thumb({ e, className }) {
  return (
    <div
      className={cn("shrink-0 rounded-lg bg-card-2 bg-cover bg-center", className)}
      style={e.capa_url ? { backgroundImage: `url(${e.capa_url})` } : undefined}
    />
  );
}

function Row({ e, mostrarFase, className }) {
  const fase = STATUS[e.status];
  return (
    <Link to={`/corretor/empreendimentos/${e.id}`} className={cn("flex items-center gap-3 py-2.5", className)}>
      <Thumb e={e} className="h-12 w-16" />
      <div className="min-w-0 flex-1">
        <b className="block truncate text-[13px] font-medium">{e.nome}</b>
        <small className="flex items-center gap-1.5 truncate text-[11px] text-ink-3">
          {mostrarFase && fase && <span className="size-2 shrink-0 rounded-full" style={{ background: fase.color }} aria-hidden="true" />}
          {mostrarFase && fase ? `${fase.label} · ` : ""}{local(e)}
        </small>
      </div>
      <Icon name="arrowRight" className="size-4 shrink-0 text-ink-3" />
    </Link>
  );
}

export default function CorretorHomePage() {
  const { user } = useOutletContext();

  const { data: empreendimentos } = useAsyncData(listarEmpreendimentos);
  const lista = useMemo(() => empreendimentos ?? [], [empreendimentos]);
  const agenda = useAsyncData(listarAgendamentos);
  const leads = useAsyncData(listarMeusLeads);
  const vendas = useAsyncData(listarVendas);
  const acessos = useAsyncData(listarMeusAcessos);
  const retornos = useAsyncData(listarRetornos);
  const roleta = useAsyncData(minhaRoleta);
  const resumo = useMemo(
    () => resumirInicio({ leads: leads.data ?? [], agendamentos: agenda.data ?? [], vendas: vendas.data ?? [] }),
    [leads.data, agenda.data, vendas.data],
  );
  const vistos = useMemo(() => ultimosAcessos(acessos.data ?? [], lista), [acessos.data, lista]);
  const recentes = useMemo(
    () => [...lista].sort((a, b) => (b.atualizado_em ?? "").localeCompare(a.atualizado_em ?? "")).slice(0, 3),
    [lista],
  );

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-[24px] font-semibold sm:text-[28px]">Olá, {user.name.split(" ")[0]}!</h1>
        <p className="text-[13px] text-ink-3 first-letter:uppercase">{hojePorExtenso()}</p>
      </header>

      <LeadsEsperando leads={leads.data ?? []} />

      <AvisoNotificacoes />

      <RoletaDeHoje minha={roleta.data} />

      <RetornosDeHoje retornos={retornos.data} />

      <AvisoDoDia agendamentos={agenda.data} />

      <NumerosRapidos resumo={resumo} carregando={leads.loading || agenda.loading || vendas.loading} />

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border border-line bg-card p-4">
          <h2 className="mb-1 flex items-center gap-2 text-[15px] font-medium">
            <Icon name="clock" className="size-4" /> Seus últimos acessos
          </h2>
          {vistos.length > 0 ? (
            vistos.map((e) => <Row key={e.id} e={e} className="border-t border-line-soft" />)
          ) : (
            <p className="border-t border-line-soft pt-3 text-[12px] text-ink-3">
              {acessos.loading ? "Carregando…" : "Os empreendimentos que você abrir aparecem aqui."}
            </p>
          )}
        </section>

        <section className="rounded-xl border border-line bg-card p-4">
          <div className="mb-1 flex items-center justify-between gap-2">
            <h2 className="flex items-center gap-2 text-[15px] font-medium">
              <Icon name="building" className="size-4" /> Atualizados recentemente
            </h2>
            <Link to="/corretor/empreendimentos" className="text-[12px] text-gold hover:underline">Ver todos</Link>
          </div>
          {recentes.length > 0 ? (
            recentes.map((e) => <Row key={e.id} e={e} mostrarFase className="border-t border-line-soft" />)
          ) : (
            <p className="border-t border-line-soft pt-3 text-[12px] text-ink-3">Nenhum empreendimento cadastrado ainda.</p>
          )}
        </section>
      </div>
    </div>
  );
}
