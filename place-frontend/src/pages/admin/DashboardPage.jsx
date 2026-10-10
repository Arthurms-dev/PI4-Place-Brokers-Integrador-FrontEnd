import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Delta } from "@/components/ui/Delta";
import { Icon } from "@/components/ui/Icon";
import { KpiCards } from "@/components/admin/dashboard/KpiCards";
import { AreaChart, BarChart, Meter } from "@/components/admin/dashboard/charts";
import { usePageTitle } from "@/hooks/usePageTitle";
import { formatNumber } from "@/lib/format";
import { getDashboardData } from "@/services/dashboard";
import { listarEmpreendimentos } from "@/services/empreendimentos";

const DashMapa = lazy(() => import("@/components/admin/dashboard/DashMapa"));

const PERIODOS = [[7, "7 dias"], [30, "30 dias"], [90, "90 dias"]];
const STATUS_LEAD = {
  novo: { label: "Novo", cls: "bg-gold/15 text-gold" },
  atendimento: { label: "Em atendimento", cls: "bg-sky-500/15 text-sky-300" },
  convertido: { label: "Convertido", cls: "bg-emerald-500/15 text-emerald-300" },
};
const isoLocal = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

function periodo(dias) {
  const ate = new Date();
  const de = new Date();
  de.setDate(de.getDate() - (dias - 1));
  return { de: isoLocal(de), ate: isoLocal(ate) };
}

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
    <Card className={`animate-fade-up p-5 ${className}`} style={{ animationDelay: `${atraso}ms` }}>
      <div className="mb-4">
        <h2 className="text-[15px] font-semibold">{titulo}</h2>
        {subtitulo && <p className="text-xs text-ink-3">{subtitulo}</p>}
      </div>
      {children}
    </Card>
  );
}

const Vazio = ({ children }) => <p className="py-8 text-center text-sm text-ink-3">{children}</p>;

function Esqueleto() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Carregando dashboard">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {[0, 1, 2, 3, 4].map((i) => <div key={i} className="h-32 animate-pulse rounded-2xl bg-card" />)}
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="h-80 animate-pulse rounded-2xl bg-card lg:col-span-2" />
        <div className="h-80 animate-pulse rounded-2xl bg-card" />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  usePageTitle("Dashboard");
  const [dias, setDias] = useState(30);
  const [dados, setDados] = useState(null);
  const [empreendimentos, setEmpreendimentos] = useState([]);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(true);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro("");
    try {
      setDados(await getDashboardData(periodo(dias)));
    } catch (e) {
      setErro(e.message ?? "Falha ao carregar o dashboard");
    } finally {
      setCarregando(false);
    }
  }, [dias]);

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
    <div className="space-y-5">
      <div className="animate-fade-up flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Dashboard</h1>
          <p className="text-[13px] text-ink-2">Visão geral da plataforma no período selecionado.</p>
        </div>
        <div className="flex rounded-xl border border-line p-0.5" role="group" aria-label="Período">
          {PERIODOS.map(([d, r]) => (
            <button key={d} type="button" onClick={() => setDias(d)} aria-pressed={dias === d}
              className={`h-10 rounded-lg px-4 text-sm font-medium transition-colors ${dias === d ? "bg-gold/15 text-gold" : "text-ink-2 hover:text-ink"}`}>
              {r}
            </button>
          ))}
        </div>
      </div>

      {erro && (
        <div role="alert" className="rounded-2xl border border-danger/40 bg-danger/10 p-4 text-sm">
          <p className="text-danger">{erro}</p>
          <p className="mt-1 text-xs text-ink-2">Confira se a API está no ar e se as migrations 010 e 011 foram executadas no Supabase.</p>
          <button type="button" onClick={carregar} className="mt-3 inline-flex h-10 items-center gap-2 rounded-xl border border-line px-4 text-sm hover:border-gold">
            <Icon name="refresh" className="size-4" /> Tentar de novo
          </button>
        </div>
      )}

      {carregando && !dados && <Esqueleto />}

      {dados && (
        <div key={dias} className={`space-y-4 transition-opacity duration-300 ${carregando ? "opacity-60" : "opacity-100"}`}>
          <KpiCards kpis={dados.kpis} />

          <div className="grid gap-4 lg:grid-cols-3">
            <Painel titulo="Acessos no site" subtitulo="Visitantes por dia" atraso={80} className="lg:col-span-2">
              <AreaChart dados={dados.visits} rotulo="acessos" />
            </Painel>

            <Painel titulo="Avaliações de clientes" subtitulo={dados.rating.total ? `${dados.rating.total} avaliações` : undefined} atraso={140}>
              {dados.rating.total === 0 ? (
                <Vazio>Ainda não há avaliações. Elas aparecem aqui quando o fluxo de avaliação do cliente for criado.</Vazio>
              ) : (
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
            </Painel>
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
                        <div className="truncate text-[11px] text-ink-3">{t.city}/{t.state}</div>
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

          <div className="grid gap-4 lg:grid-cols-3">
            <Painel titulo="Agendamentos de visitas" subtitulo={`${dados.bookingsTotal} no período`} atraso={260}>
              <BarChart dados={dados.bookings} rotulo="agendamentos" />
            </Painel>

            <Painel titulo="Leads recentes" atraso={300}>
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
                          <div className="truncate text-[11px] text-ink-3">{l.property} · {quando(l.createdAt)}</div>
                        </div>
                        <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium ${st.cls}`}>{st.label}</span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </Painel>

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