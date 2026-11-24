import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Card } from "@/components/ui/Card";
import "@/styles/placeDashboardMotion.css";
import { Delta } from "@/components/ui/Delta";
import { Icon } from "@/components/ui/Icon";
import { KpiCards } from "@/components/admin/dashboard/KpiCards";
import { AreaChart, BarChart, Meter } from "@/components/admin/dashboard/charts";
import { usePageTitle } from "@/hooks/usePageTitle";
import { formatNumber } from "@/lib/format";
import { getDashboardData } from "@/services/dashboard";
import { intervaloDoFiltro, rotuloDoIntervalo } from "@/lib/periodoDashboard";
import { listarEmpreendimentos } from "@/services/empreendimentos";
import { SeletorPeriodo } from "@/components/admin/periodo/SeletorPeriodo";
import { getDiretoria } from "@/services/diretor";

const DashMapa = lazy(() => import("@/components/admin/dashboard/DashMapa"));

const STATUS_LEAD = {
  novo: { label: "Novo", cls: "bg-gold/15 text-gold" },
  atendimento: { label: "Em atendimento", cls: "bg-sky-500/15 text-sky-300" },
  convertido: { label: "Convertido", cls: "bg-emerald-500/15 text-emerald-300" },
};


function quando(iso) {
  const min = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (min < 1) return "agora";
  if (min < 60) return `há ${min} min`;
  if (min < 1440) return `há ${Math.round(min / 60)} h`;
  if (min < 10080) return `há ${Math.round(min / 1440)} d`;
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

function Painel({ titulo, subtitulo, atraso = 0, className = "", children }) {
  return (
    <Card className={`pb-data-panel animate-fade-up p-5 sm:p-6 ${className}`} style={{ animationDelay: `${atraso}ms` }}>
      <div className="mb-6 border-b border-line-soft pb-4">
        <h2 className="text-[15px] font-semibold tracking-tight">{titulo}</h2>
        {subtitulo && <p className="mt-1 text-xs text-ink-3">{subtitulo}</p>}
      </div>
      {children}
    </Card>
  );
}

const Vazio = ({ children }) => <p className="py-8 text-center text-sm text-ink-3">{children}</p>;

function Esqueleto() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Carregando dashboard">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {[0, 1, 2, 3, 4].map((i) => <div key={i} className={`h-32 animate-pulse rounded-xl bg-card ${i === 0 ? "sm:col-span-2 xl:col-span-2" : "xl:col-span-1"}`} />)}
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="h-80 animate-pulse rounded-2xl bg-card lg:col-span-2" />
        <div className="h-80 animate-pulse rounded-2xl bg-card" />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  // Diretor: a API já devolve só a diretoria dele e sem os leads de clientes.
  const ehDiretor = useOutletContext()?.user?.cargo === "diretor";
  usePageTitle("Indicadores");
  // 90 dias por padrão: no ambiente de teste, 30 dias compara o histórico de demonstração com o uso real e mostra tudo caindo.
  const [filtro, setFiltro] = useState({ tipo: "dias", dias: 90 });
  const intervalo = useMemo(() => {
    const r = intervaloDoFiltro(filtro);
    return { de: r.de, ate: r.ate };
  }, [filtro]);
  const [dados, setDados] = useState(null);
  const [empreendimentos, setEmpreendimentos] = useState([]);
  // Diretor: mostra de qual diretoria são os números (ou avisa que a conta ainda não tem uma).
  const [diretoria, setDiretoria] = useState(undefined);
  useEffect(() => {
    if (!ehDiretor) return;
    getDiretoria().then((d) => setDiretoria(d.diretoria ?? null)).catch(() => setDiretoria(undefined));
  }, [ehDiretor]);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(true);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro("");
    try {
      setDados(await getDashboardData(intervalo));
    } catch (e) {
      setErro(e.message ?? "Falha ao carregar o dashboard");
    } finally {
      setCarregando(false);
    }
  }, [intervalo]);

  useEffect(() => {
    carregar();
  }, [carregar]);
  useEffect(() => {
    listarEmpreendimentos().then(setEmpreendimentos).catch(() => setEmpreendimentos([]));
  }, []);

  const pontos = useMemo(() => {
    const vistas = new Map((dados?.topProperties ?? []).map((t) => [t.id, t.views]));
    return empreendimentos
      .filter((e) => e.latitude != null && e.longitude != null)
      .map((e) => ({ id: e.id, title: e.nome ?? e.title, city: e.cidade, state: e.uf, latitude: e.latitude, longitude: e.longitude, views: vistas.get(e.id) ?? 0 }));
  }, [empreendimentos, dados]);

  const maxViews = Math.max(...(dados?.topProperties ?? []).map((t) => t.views), 1);

  return (
    <div className="pb-dashboard-motion space-y-5">
      <div className="pb-page-header animate-fade-up flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="pb-eyebrow">{ehDiretor && diretoria ? diretoria.nome : "Visão executiva"}</p>
          <h1 className="pb-page-title">Indicadores</h1>
          <p className="mt-1 text-[12px] text-ink-3">Período: {rotuloDoIntervalo(intervalo)}</p>
          <p className="mt-2 text-[13px] text-ink-2">{ehDiretor ? "VGV e vendas das equipes da sua diretoria; acessos e agendamentos são da Place toda." : "Acompanhe a performance dos seus imóveis, contatos e agendamentos."}</p>
        </div>
        <SeletorPeriodo filtro={filtro} onMudar={setFiltro} />
      </div>

      {ehDiretor && diretoria === null && (
        <p role="status" className="rounded-xl border border-gold/40 bg-gold/10 px-4 py-3 text-sm text-gold">
          Sua conta ainda não está ligada a uma diretoria, por isso o VGV aparece zerado. Peça ao admin para escolher a diretoria em Equipe › Acessos internos.
        </p>
      )}

      {erro && (
        <div role="alert" className="rounded-2xl border border-danger/40 bg-danger/10 p-4 text-sm">
          <p className="text-danger">{erro}</p>
          <p className="mt-1 text-xs text-ink-2">Verifique a conexão com a API, suas permissões e as tabelas necessárias no banco de dados.</p>
          <button type="button" onClick={carregar} className="mt-3 inline-flex h-11 items-center gap-2 rounded-xl border border-line px-4 text-sm hover:border-gold">
            <Icon name="refresh" className="size-4" /> Tentar de novo
          </button>
        </div>
      )}

      {carregando && !dados && <Esqueleto />}

      {dados && (
        <div key={`${intervalo.de}-${intervalo.ate}`} className={`space-y-4 transition-opacity duration-300 ${carregando ? "opacity-60" : "opacity-100"}`}>
          {/* Diretor: o VGV é da diretoria e o resto é da Place toda; o rótulo deixa isso claro em cada card. */}
          <KpiCards kpis={ehDiretor ? dados.kpis.map((k) => ({ ...k, label: k.id === "vgv" ? "VGV da sua diretoria" : `${k.label} · Place toda` })) : dados.kpis} />

          <div className="grid gap-4 lg:grid-cols-3">
            <Painel titulo="Acessos no site" subtitulo="Visitantes por dia no período" atraso={80} className={dados.rating.total ? "lg:col-span-2" : "lg:col-span-3"}>
              <AreaChart dados={dados.visits} rotulo="acessos" />
            </Painel>

            {dados.rating.total > 0 && <Painel titulo="Avaliações de clientes" subtitulo={dados.rating.total ? `${dados.rating.total} avaliações` : undefined} atraso={140}>
              {(
                <div>
                  <div className="mb-4 flex items-end gap-2">
                    <span className="text-4xl font-bold">{formatNumber(dados.rating.average, 1)}</span>
                    <span className="mb-1.5 text-sm text-ink-3">de 5</span>
                  </div>
                  <ul className="space-y-2.5">
                    {dados.rating.distribution.map((d, i) => (
                      <li key={d.stars} className="flex items-center gap-3 text-xs text-ink-2">
                        <span className="w-8 shrink-0">{d.stars} ★</span>
                        <Meter pct={d.percent} atraso={i * 80} className="flex-1" />
                        <span className="w-9 shrink-0 text-right">{d.percent}%</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </Painel>}
          </div>

          <div className="grid gap-4 lg:grid-cols-5">
            <Painel titulo="Imóveis mais procurados" subtitulo="Por visualizações" atraso={180} className="lg:col-span-2">
              {dados.topProperties.length === 0 ? (
                <Vazio>Nenhuma visualização de empreendimento no período.</Vazio>
              ) : (
                <ol className="space-y-4">
                  {dados.topProperties.map((t, i) => (
                    <li key={t.id} className="flex items-center gap-3">
                      <span className="w-4 shrink-0 text-xs font-semibold text-ink-3">{i + 1}</span>
                      {t.imageUrl ? (
                        <img src={t.imageUrl} alt="" loading="lazy" className="size-12 shrink-0 rounded-xl object-cover" />
                      ) : (
                        <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-gold/15 text-gold"><Icon name="home" className="size-5" /></span>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="truncate text-sm font-medium">{t.title}</span>
                          <span className="shrink-0 text-xs text-ink-2">{formatNumber(t.views)}</span>
                        </div>
                        <div className="truncate text-xs text-ink-3">{t.city}/{t.state}</div>
                        <Meter pct={(t.views / maxViews) * 100} atraso={i * 90} className="mt-1.5" />
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </Painel>

            <Painel titulo="Onde o interesse está" subtitulo="Empreendimentos no mapa; a bolha cresce com as visualizações" atraso={220} className="lg:col-span-3">
              <div className="h-72 overflow-hidden rounded-xl border border-line-soft sm:h-80">
                {pontos.length === 0 ? (
                  <Vazio>Cadastre empreendimentos com latitude e longitude para vê-los no mapa.</Vazio>
                ) : (
                  <Suspense fallback={<div className="grid size-full place-items-center text-sm text-ink-3">Carregando mapa…</div>}>
                    <DashMapa pontos={pontos} />
                  </Suspense>
                )}
              </div>
            </Painel>
          </div>

          <div className={`grid gap-4 ${ehDiretor ? "lg:grid-cols-2" : "lg:grid-cols-3"}`}>
            <Painel titulo="Agendamentos de visitas" subtitulo={`${dados.bookingsTotal} no período`} atraso={260}>
              <BarChart dados={dados.bookings} rotulo="agendamentos" />
            </Painel>

            {!ehDiretor && <Painel titulo="Leads recentes" atraso={300}>
              {dados.recentLeads.length === 0 ? (
                <Vazio>Nenhum lead ainda.</Vazio>
              ) : (
                <ul className="divide-y divide-line-soft">
                  {dados.recentLeads.map((l) => {
                    const st = STATUS_LEAD[l.status] ?? STATUS_LEAD.novo;
                    return (
                      <li key={l.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                        <div className="min-w-0">
                          <div className="truncate text-sm font-medium">{l.name}</div>
                          <div className="truncate text-xs text-ink-3">{l.property} · {quando(l.createdAt)}</div>
                        </div>
                        <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${st.cls}`}>{st.label}</span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </Painel>}

            <Painel titulo="Desempenho da plataforma" subtitulo="Comparado ao período anterior" atraso={340}>
              <ul className="divide-y divide-line-soft">
                {dados.platform.map((p) => (
                  <li key={p.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0 text-sm">
                    <span className="text-ink-2">{p.label}</span>
                    <Delta value={p.delta} />
                  </li>
                ))}
              </ul>
            </Painel>
          </div>
        </div>
      )}
    </div>
  );
}