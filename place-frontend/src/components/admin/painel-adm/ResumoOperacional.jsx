import { Link } from "react-router-dom";
import { Card } from "@/components/ui/Card";
import { useAsyncData } from "@/hooks/useAsyncData";
import { formatDate, formatNumber } from "@/lib/format";
import { getDashboardData } from "@/services/dashboard";

const moeda = (valor) => Number.isFinite(Number(valor))
  ? Number(valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })
  : "—";
const inteiro = (valor) => valor == null ? "—" : formatNumber(valor);
const percentual = (valor) => valor == null || !Number.isFinite(Number(valor)) ? "—" : `${formatNumber(valor, 1)}%`;

export function ResumoOperacional() {
  const { data, loading, error } = useAsyncData(getDashboardData);
  const kpis = data?.kpis ?? [];
  const obter = (id) => kpis.find((item) => item.id === id)?.value;
  const periodo = data?.period?.start && data?.period?.end
    ? `${formatDate(data.period.start)} a ${formatDate(data.period.end)}`
    : "Período não informado";

  const indicadores = data ? [
    { id: "leads", titulo: "Leads captados", valor: inteiro(data.leadsTotal), link: "/admin/leads" },
    { id: "conv", titulo: "Conversão de leads", valor: percentual(data.leadsConversionRate), link: "/admin/relatorios" },
    { id: "visits", titulo: "Acessos no site", valor: inteiro(obter("visits")), link: "/admin/dashboard" },
    { id: "bookings", titulo: "Agendamentos", valor: inteiro(obter("bookings")), link: "/admin/agendamentos" },
    { id: "vgv", titulo: "VGV confirmado", valor: moeda(obter("vgv")), link: "/admin/vendas" },
  ] : [];

  return (
    <section aria-labelledby="painel-resumo-title" className="space-y-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="painel-resumo-title" className="text-base font-semibold">Resumo operacional</h2>
        <p className="text-xs text-ink-3">{data ? periodo : "Indicadores consultados na API"}</p>
      </div>
      {loading && !data && (
        <Card role="status" aria-live="polite" className="text-sm text-ink-2">
          Carregando indicadores reais…
        </Card>
      )}
      {error && (
        <Card role="alert" className="border-danger/40 text-sm text-danger">
          Não foi possível consultar os indicadores. Verifique a API, as permissões do administrador e as consultas do banco. Nenhum número estimado foi exibido.
        </Card>
      )}
      {data && (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
          {indicadores.map((item) => (
            <Link key={item.id} to={item.link} className="block min-w-0 rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold">
              <Card className="h-full min-w-0 transition-colors hover:border-gold">
                <p className="text-[12px] text-ink-2">{item.titulo}</p>
                <p className="mt-2 break-words text-[clamp(1.4rem,2vw,1.85rem)] font-bold tracking-tight tabular-nums text-ink">{item.valor}</p>
                <p className="mt-3 text-[11px] text-gold">Ver detalhes →</p>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
