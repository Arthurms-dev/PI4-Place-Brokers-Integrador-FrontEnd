const pad = (n) => String(n).padStart(2, "0");
const toISO = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/** Últimos `n` dias (inclui hoje), do mais antigo ao mais recente. */
function lastDays(n) {
  const today = new Date();
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (n - 1 - i));
    return toISO(d);
  });
}

/**
 * Busca os dados do dashboard.
 * @returns {Promise<import("@/types/dashboard").DashboardData>}
 *
 * Por enquanto NÃO há backend: devolve tudo zerado.
 * Quando a API existir, troque o corpo por:
 *
 *   const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/dashboard`, { cache: "no-store" });
 *   if (!res.ok) throw new Error("Falha ao carregar o dashboard");
 *   return res.json();
 */
export async function getDashboardData() {
  const days30 = lastDays(30);
  const days7 = days30.slice(-7);
  const monthNote = "em relação ao mês anterior";

  return {
    period: { start: days30[0], end: days30[days30.length - 1] },
    kpis: [
      { id: "visits", label: "Acessos no site", value: 0, delta: 0, footnote: monthNote },
      { id: "topProperties", label: "Imóveis mais procurados", value: 0, delta: 0, footnote: monthNote },
      { id: "bookings", label: "Agendamentos de visitas", value: 0, delta: 0, footnote: monthNote },
      { id: "rating", label: "Avaliações de clientes", value: 0, delta: 0, footnote: "com base em 0 avaliações" },
    ],
    visits: days7.map((date) => ({ date, value: 0 })),
    topProperties: [],
    bookings: days30.map((date) => ({ date, value: 0 })),
    bookingsTotal: 0,
    rating: {
      average: 0,
      total: 0,
      distribution: [
        { stars: 5, percent: 0 },
        { stars: 4, percent: 0 },
        { stars: 3, percent: 0 },
        { stars: 2, percent: 0 },
        { stars: 1, percent: 0 },
      ],
    },
    locations: [],
    recentLeads: [],
    platform: [
      { id: "visits", label: "Acessos no site", delta: 0 },
      { id: "propertyViews", label: "Imóveis visualizados", delta: 0 },
      { id: "bookings", label: "Agendamentos", delta: 0 },
      { id: "leads", label: "Leads captados", delta: 0 },
      { id: "conversion", label: "Conversão de leads", delta: 0 },
    ],
  };
}
