import { api } from "@/lib/apiClient";

const NOTA = "em relação ao período anterior";
/** Sem base no período anterior a API manda variação nula: o texto explica em vez de mostrar "100%". */
const nota = (variacao) => (variacao == null ? "novo: sem dados no período anterior" : NOTA);
const STATUS_DO_LEAD = { novo: "novo", em_atendimento: "atendimento", convertido: "convertido" };

/** @param {{ de?: string, ate?: string, equipeId?: string, diretoriaId?: string }} [filtros]
 * @returns {Promise<import("@/types/dashboard").DashboardData>} */
export async function getDashboardData(filtros = {}) {
  const query = new URLSearchParams(Object.entries(filtros).filter(([, v]) => v)).toString();
  const d = await api.get(`/metricas/dashboard${query ? `?${query}` : ""}`);
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
      { id: "visits", label: "Acessos no site", value: d.acessos.total, delta: d.acessos.variacao, footnote: nota(d.acessos.variacao) },
      { id: "topProperties", label: "Visualizações de imóveis", value: d.imoveis.visualizacoes.total, delta: d.imoveis.visualizacoes.variacao, footnote: nota(d.imoveis.visualizacoes.variacao) },
      { id: "bookings", label: "Agendamentos de visitas", value: d.agendamentos.total, delta: d.agendamentos.variacao, footnote: nota(d.agendamentos.variacao) },
      // Avaliações só aparecem quando existirem (antes era um card vazio "entra na próxima etapa").
      ...(d.avaliacoes.total ? [{ id: "rating", label: "Avaliações de clientes", value: d.avaliacoes.media, delta: 0, footnote: `com base em ${d.avaliacoes.total} avaliações` }] : []),
    ],
    visits: d.acessos.porDia.map(({ dia, acessos }) => ({ date: dia, value: acessos })),
    topProperties: d.imoveis.maisProcurados.map((i) => ({
      id: i.id, title: i.nome, city: i.cidade, state: i.uf,
      views: i.visualizacoes, imageUrl: i.capaUrl ?? undefined,
    })),
    bookings: d.agendamentos.porDia.map(({ dia, total }) => ({ date: dia, value: total })),
    bookingsTotal: d.agendamentos.total,
    leadsTotal: d.leads.total,
    leadsConversionRate: d.leads.conversao.taxa,
    rating: {
      average: d.avaliacoes.media,
      total: d.avaliacoes.total,
      distribution: d.avaliacoes.distribuicao.map(({ estrelas, percentual }) => ({ stars: estrelas, percent: percentual })),
    },
    locations: [],
    recentLeads: d.leads.recentes.map((l) => ({
      id: l.id, name: l.nome, property: l.empreendimento ?? "—",
      createdAt: l.criadoEm, status: STATUS_DO_LEAD[l.status] ?? "novo",
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
