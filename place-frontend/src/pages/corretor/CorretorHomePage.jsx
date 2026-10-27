import { useMemo, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { MapContainer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapTiles } from "@/components/map/MapTiles";
import { FitBounds } from "@/components/map/FitBounds";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import { useAsyncData } from "@/hooks/useAsyncData";
import { listarEmpreendimentos, STATUS, formatarFaixa } from "@/services/empreendimentos";
import { listarAgendamentos } from "@/services/agenda";
import { compromissosDeHoje, localDoCompromisso } from "@/lib/agendaCalendario";
import { resumirInicio, ultimosAcessos } from "@/lib/inicioCorretor";
import { listarMeusLeads } from "@/services/meusLeads";
import { listarVendas } from "@/services/vendas";
import { listarMeusAcessos } from "@/services/eventos";

const SHORTCUTS = [
  { icon: "book", title: "Ver Book e Tabelas", desc: "Acesse as tabelas atualizadas e materiais dos empreendimentos.", to: "/corretor/books" },
  { icon: "building", title: "Empreendimentos", desc: "Veja todos os lançamentos e em andamento.", to: "/corretor/empreendimentos" },
  { icon: "mapPin", title: "Mapa Geral", desc: "Localize todos os empreendimentos no mapa e filtre por região.", to: "/corretor/mapa" },
  { icon: "userPlus", title: "Cadastrar Cliente", desc: "Adicione um novo cliente e acompanhe o histórico.", to: "/corretor/clientes/novo" },
];

const pin = (color) =>
  L.divIcon({
    className: "",
    html: `<span style="display:block;width:22px;height:22px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.5);background:${color}"></span>`,
    iconSize: [22, 22], iconAnchor: [11, 22], popupAnchor: [0, -22],
  });
const PIN_ICONS = Object.fromEntries(Object.entries(STATUS).map(([k, v]) => [k, pin(v.color)]));

const norm = (s) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
const uniq = (a) => [...new Set(a)].sort();
const local = (e) => `${e.bairro} · ${e.cidade}/${e.uf}`;

const hora = (iso) => new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
const brl = (n) => Number(n).toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
const plural = (n, um, varios) => `${n} ${n === 1 ? um : varios}`;

/** Leads novos, visitas da semana e VGV confirmado, cada um levando para a tela certa. */
function NumerosRapidos({ resumo, carregando }) {
  const cards = [
    {
      to: "/corretor/leads", icone: "userPlus", rotulo: "Leads novos", valor: resumo.leadsNovos,
      rodape: resumo.leadsEmAtendimento ? plural(resumo.leadsEmAtendimento, "em atendimento", "em atendimento") : "Responda rápido: lead novo esfria",
    },
    {
      to: "/corretor/agenda", icone: "calendar", rotulo: "Visitas nesta semana", valor: resumo.visitasSemana,
      rodape: resumo.visitasPendentes ? `${plural(resumo.visitasPendentes, "ainda vai acontecer", "ainda vão acontecer")}` : "Segunda a domingo",
    },
    {
      to: "/corretor/vendas", icone: "chart", rotulo: "VGV confirmado", valor: brl(resumo.vgvConfirmado), destaque: true,
      rodape: resumo.vendasPendentes ? `${plural(resumo.vendasPendentes, "venda", "vendas")} aguardando gerente · ${brl(resumo.valorPendente)}` : plural(resumo.vendasConfirmadas, "venda confirmada", "vendas confirmadas"),
    },
  ];
  return (
    <section aria-label="Seus números" className="grid gap-3 sm:grid-cols-3">
      {cards.map((c) => (
        <Link key={c.to} to={c.to} className="group rounded-xl border border-line bg-card p-4 transition-colors hover:border-gold">
          <span className="flex items-center justify-between text-[12px] text-ink-3">
            <span className="inline-flex items-center gap-1.5"><Icon name={c.icone} className="size-4 text-gold" /> {c.rotulo}</span>
            <Icon name="arrowRight" className="size-4 transition-transform group-hover:translate-x-0.5" />
          </span>
          <strong className={cn("mt-1.5 block text-2xl font-semibold", c.destaque && "text-gold")}>{carregando ? "…" : c.valor}</strong>
          <small className="mt-0.5 block truncate text-[12px] text-ink-3">{carregando ? "\u00a0" : c.rodape}</small>
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

function Thumb({ e, tag, className }) {
  return (
    <div
      className={cn("relative shrink-0 rounded-lg bg-card-2 bg-cover bg-center", className)}
      style={e.capa_url ? { backgroundImage: `url(${e.capa_url})` } : undefined}
    >
      {tag && (
        <span
          className="absolute left-2 top-2 rounded-md px-2 py-0.5 text-[11px] font-semibold text-page"
          style={{ background: STATUS[e.status]?.color }}
        >
          {STATUS[e.status]?.label ?? e.status}
        </span>
      )}
    </div>
  );
}

function Row({ e, tag, className }) {
  return (
    <Link to={`/corretor/empreendimentos/${e.id}`} className={cn("flex items-center gap-3 py-2.5", className)}>
      <Thumb e={e} tag={tag} className="h-12 w-16" />
      <div className="min-w-0 flex-1">
        <b className="block truncate text-[13px] font-medium">{e.nome}</b>
        <small className="text-[11px] text-ink-3">{local(e)}</small>
      </div>
      {!tag && <Icon name="arrowRight" className="size-4 text-ink-3" />}
    </Link>
  );
}

export default function CorretorHomePage() {
  const { user } = useOutletContext();

  const { data: empreendimentos, loading } = useAsyncData(listarEmpreendimentos);
  const lista = empreendimentos ?? [];
  const agenda = useAsyncData(listarAgendamentos);
  const leads = useAsyncData(listarMeusLeads);
  const vendas = useAsyncData(listarVendas);
  const acessos = useAsyncData(listarMeusAcessos);
  const resumo = useMemo(
    () => resumirInicio({ leads: leads.data ?? [], agendamentos: agenda.data ?? [], vendas: vendas.data ?? [] }),
    [leads.data, agenda.data, vendas.data],
  );
  const vistos = useMemo(() => ultimosAcessos(acessos.data ?? [], lista), [acessos.data, lista]);

  const [f, setF] = useState({ uf: "", cidade: "", bairro: "", busca: "" });
  const [ocultos, setOcultos] = useState([]);

  const set = (k, v) =>
    setF((s) => ({ ...s, [k]: v, ...(k === "uf" && { cidade: "", bairro: "" }), ...(k === "cidade" && { bairro: "" }) }));
  const limpar = () => { setF({ uf: "", cidade: "", bairro: "", busca: "" }); setOcultos([]); };
  const alternar = (s) => setOcultos((o) => (o.includes(s) ? o.filter((x) => x !== s) : [...o, s]));

  const ufs = uniq(lista.map((e) => e.uf));
  const cidades = uniq(lista.filter((e) => !f.uf || e.uf === f.uf).map((e) => e.cidade));
  const bairros = uniq(lista.filter((e) => (!f.uf || e.uf === f.uf) && (!f.cidade || e.cidade === f.cidade)).map((e) => e.bairro));

  const filtrados = useMemo(() => {
    const q = norm(f.busca.trim());
    return lista.filter(
      (e) =>
        (!f.uf || e.uf === f.uf) && (!f.cidade || e.cidade === f.cidade) && (!f.bairro || e.bairro === f.bairro) &&
        !ocultos.includes(e.status) && (!q || norm(`${e.nome} ${e.bairro} ${e.cidade}`).includes(q)) &&
        e.latitude != null && e.longitude != null,
    );
  }, [lista, f, ocultos]);

  const destaque = filtrados.find((e) => e.status === "lancamento") ?? filtrados[0];
  const recentes = [...lista].sort((a, b) => (b.atualizado_em ?? "").localeCompare(a.atualizado_em ?? "")).slice(0, 3);

  if (loading) {
    return <div className="grid min-h-[50vh] place-items-center text-ink-2">Carregando empreendimentos…</div>;
  }

  return (
    <div className="space-y-4.5">
      <header>
        <p className="pb-eyebrow">Área do corretor</p>
        <h1 className="text-[28px] font-semibold">Olá, {user.name.split(" ")[0]}!</h1>
        <p className="mt-1.5 max-w-lg text-[13px] text-ink-2">
          Encontre os empreendimentos certos para cada cliente, com tudo o que você precisa em um só lugar.
        </p>
      </header>

      <NumerosRapidos resumo={resumo} carregando={leads.loading || agenda.loading || vendas.loading} />

      <AvisoDoDia agendamentos={agenda.data} />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {SHORTCUTS.map((s) => (
          <Link
            key={s.to}
            to={s.to}
            className="group relative flex flex-col gap-1.5 rounded-xl border border-line bg-card p-4 transition-colors hover:border-gold"
          >
            <span className="mb-1 grid size-11 place-items-center rounded-full bg-gold/15 text-gold">
              <Icon name={s.icon} className="size-5.5" />
            </span>
            <h3 className="text-[15px] font-medium">{s.title}</h3>
            <p className="pr-6 text-[12px] text-ink-3">{s.desc}</p>
            <Icon name="arrowRight" className="absolute bottom-4 right-4 size-4.5 text-ink-3 transition-transform group-hover:translate-x-0.5" />
          </Link>
        ))}
      </section>

      {lista.length === 0 ? (
        <section className="rounded-xl border border-line bg-card p-8 text-center text-[13px] text-ink-2">
          Nenhum empreendimento cadastrado ainda. Assim que o admin cadastrar o primeiro, ele aparece aqui.
        </section>
      ) : (
        <div className="grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
          <section className="rounded-xl border border-line bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-[15px] font-medium">Mapa de Empreendimentos</h2>
                <p className="mt-0.5 text-[12px] text-ink-3">Encontre o empreendimento ideal na região desejada.</p>
              </div>
              <button type="button" onClick={limpar} className="inline-flex items-center gap-1.5 text-[12px] text-gold hover:underline">
                Limpar filtros <Icon name="refresh" className="size-3.5" />
              </button>
            </div>

            <label className="mt-3 flex h-9.5 items-center gap-2.5 rounded-lg border border-line bg-card-2 px-3.5 text-ink-3 focus-within:border-gold">
              <Icon name="search" className="size-4.5" />
              <input
                value={f.busca}
                onChange={(e) => set("busca", e.target.value)}
                placeholder="Digite a cidade, bairro ou região..."
                className="flex-1 bg-transparent text-[13px] text-ink outline-none placeholder:text-ink-3"
              />
            </label>

            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              {[["Estado", "uf", ufs, "Todos"], ["Cidade", "cidade", cidades, "Todas"], ["Bairro", "bairro", bairros, "Todos"]].map(
                ([rotulo, k, ops, todos]) => (
                  <label key={k} className="flex flex-col gap-0.5 rounded-lg border border-line bg-card-2 px-3 py-2 text-[11px] text-ink-3">
                    {rotulo}
                    <select
                      value={f[k]}
                      onChange={(e) => set(k, e.target.value)}
                      className="cursor-pointer bg-transparent text-[13px] text-ink outline-none"
                    >
                      <option value="" className="bg-card">{todos}</option>
                      {ops.map((o) => <option key={o} value={o} className="bg-card">{o}</option>)}
                    </select>
                  </label>
                ),
              )}
            </div>

            <div className="my-3 flex flex-wrap gap-x-5 gap-y-2">
              {Object.entries(STATUS).map(([k, s]) => (
                <button
                  key={k}
                  type="button"
                  aria-pressed={!ocultos.includes(k)}
                  onClick={() => alternar(k)}
                  className={cn("inline-flex items-center gap-2 text-[12px] text-ink-2", ocultos.includes(k) && "opacity-40")}
                >
                  <span className="size-3 rounded-full" style={{ background: s.color }} />
                  {s.label}
                </button>
              ))}
            </div>

            <div className="relative h-105 overflow-hidden rounded-lg border border-line">
              <MapContainer center={[-8.05, -34.9]} zoom={11} scrollWheelZoom className="h-full w-full bg-card-2">
                <MapTiles />
                <FitBounds pontos={filtrados} />
                {filtrados.map((e) => (
                  <Marker key={e.id} position={[e.latitude, e.longitude]} icon={PIN_ICONS[e.status]}>
                    <Popup>
                      <b>{e.nome}</b><br />{local(e)}<br />
                      <Link to={`/corretor/empreendimentos/${e.id}`}>Ver detalhes</Link>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
              <Link
                to="/corretor/empreendimentos"
                className="absolute bottom-3 left-3 z-[1000] inline-flex items-center gap-2 rounded-lg border border-line bg-card px-3.5 py-2 text-[12px]"
              >
                <Icon name="list" className="size-4" /> Ver lista de empreendimentos ({filtrados.length})
              </Link>
            </div>
          </section>

          <div className="flex flex-col gap-4">
            {destaque && (
              <section className="rounded-xl border border-line bg-card p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-[15px] font-medium">Destaque da região</h2>
                  <Link to={`/corretor/empreendimentos/${destaque.id}`} aria-label="Abrir destaque">
                    <Icon name="arrowRight" className="size-4.5" />
                  </Link>
                </div>
                <Thumb e={destaque} tag className="h-48 w-full" />
                <h3 className="mt-3 text-[17px] font-semibold">{destaque.nome}</h3>
                <small className="text-[12px] text-ink-3">{local(destaque)}</small>
                <div className="my-3 flex flex-wrap gap-x-3.5 gap-y-2 text-[12px] text-ink-2">
                  <span className="inline-flex items-center gap-1.5">
                    <Icon name="bedDouble" className="size-4" />
                    {formatarFaixa(destaque.quartos_min, destaque.quartos_max, "quarto", "quartos") || "—"}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Icon name="car" className="size-4" />
                    {formatarFaixa(destaque.vagas_min, destaque.vagas_max, "vaga", "vagas") || "—"}
                  </span>
                  {destaque.lazer?.length > 0 && (
                    <span className="inline-flex items-center gap-1.5">
                      <Icon name="building" className="size-4" />
                      {destaque.lazer.slice(0, 2).join(", ")}
                    </span>
                  )}
                </div>
                <Link
                  to={`/corretor/empreendimentos/${destaque.id}`}
                  className="flex items-center justify-center gap-2 rounded-lg bg-gold-gradient py-3 text-[13px] font-medium text-[#1a1408]"
                >
                  Ver detalhes <Icon name="arrowRight" className="size-4" />
                </Link>
              </section>
            )}

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
          </div>
        </div>
      )}

      {lista.length > 0 && (
        <section className="rounded-xl border border-line bg-card p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-[15px] font-medium">
              <Icon name="building" className="size-4" /> Últimos empreendimentos atualizados
            </h2>
            <Link to="/corretor/empreendimentos" className="text-[12px] text-gold hover:underline">Ver todos</Link>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {recentes.map((e) => <Row key={e.id} e={e} tag className="rounded-lg border border-line-soft px-2.5" />)}
          </div>
        </section>
      )}
    </div>
  );
}