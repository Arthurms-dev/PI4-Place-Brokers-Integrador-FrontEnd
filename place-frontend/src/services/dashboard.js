import { getToken } from "@/lib/authToken";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3333";
const NOTA = "em relação ao período anterior";

const STATUS_DO_LEAD = { novo: "novo", em_atendimento: "atendimento", convertido: "convertido" };

/**
 * @param {{ de?: string, ate?: string, equipeId?: string, diretoriaId?: string }} [filtros] datas em AAAA-MM-DD
 * @returns {Promise<import("@/types/dashboard").DashboardData>}
 */
export async function getDashboardData(filtros = {}) {
  const query = new URLSearchParams(Object.entries(filtros).filter(([, v]) => v)).toString();
  const token = getToken();

  const res = await fetch(`${BASE_URL}/metricas/dashboard${query ? `?${query}` : ""}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) {
    const e = await res.json().catch(() => ({}));
    throw new Error(e.message ?? "Falha ao carregar o dashboard");
  }
  const d = await res.json();
  if (!d?.vgv || !d?.acessos || !d?.imoveis || !d?.agendamentos || !d?.leads || !d?.avaliacoes) {
    throw new Error(
      `A API respondeu num formato inesperado (campos recebidos: ${Object.keys(d ?? {}).join(", ") || "nenhum"}). ` +
        "Atualize o back-end com o metricasService e o metricasController desta versão.",
    );
  }

  return {
    period: { start: d.periodo.de, end: d.periodo.ate },
    kpis: [
      { id: "vgv", label: "VGV", value: d.vgv.total, delta: d.vgv.variacao, footnote: `${d.vgv.quantidade} vendas confirmadas` },
      { id: "visits", label: "Acessos no site", value: d.acessos.total, delta: d.acessos.variacao, footnote: NOTA },
      { id: "topProperties", label: "Imóveis mais procurados", value: d.imoveis.visualizacoes.total, delta: d.imoveis.visualizacoes.variacao, footnote: NOTA },
      { id: "bookings", label: "Agendamentos de visitas", value: d.agendamentos.total, delta: d.agendamentos.variacao, footnote: NOTA },
      { id: "rating", label: "Avaliações de clientes", value: d.avaliacoes.media, delta: 0, footnote: `com base em ${d.avaliacoes.total} avaliações` },
    ],
    visits: d.acessos.porDia.map(({ dia, acessos }) => ({ date: dia, value: acessos })),
    topProperties: d.imoveis.maisProcurados.map((i) => ({
      id: i.id,
      title: i.nome,
      city: i.cidade,
      state: i.uf,
      views: i.visualizacoes,
      imageUrl: i.capaUrl ?? undefined,
    })),
    bookings: d.agendamentos.porDia.map(({ dia, total }) => ({ date: dia, value: total })),
    bookingsTotal: d.agendamentos.total,
    rating: {
      average: d.avaliacoes.media,
      total: d.avaliacoes.total,
      distribution: d.avaliacoes.distribuicao.map(({ estrelas, percentual }) => ({ stars: estrelas, percent: percentual })),
    },
    locations: [], // ainda não guardamos a cidade do cliente
    recentLeads: d.leads.recentes.map((l) => ({
      id: l.id,
      name: l.nome,
      property: l.empreendimento ?? "—",
      createdAt: l.criadoEm,
      status: STATUS_DO_LEAD[l.status] ?? "novo",
    })),
    platform: [
      { id: "visits", label: "Acessos no site", delta: d.acessos.variacao },
      { id: "propertyViews", label: "Imóveis visualizados", delta: d.imoveis.visualizacoes.variacao },
      { id: "bookings", label: "Agendamentos", delta: d.agendamentos.variacao },
      { id: "leads", label: "Leads captados", delta: d.leads.variacao },
      { id: "conversion", label: "Conversão de leads", delta: d.leads.conversao.variacao },
    ],
  };
}