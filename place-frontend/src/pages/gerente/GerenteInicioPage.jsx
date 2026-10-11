import { Link, useOutletContext } from "react-router-dom";
import { Meter } from "@/components/admin/dashboard/charts";
import { Selo, Vazio } from "@/components/admin/equipe/ui";
import Contagem from "@/components/ui/Contagem";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useDadosEquipe } from "./useDadosEquipe";

const brl = (n) => Number(n).toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
const mesmoDia = (a, b) => new Date(a).toDateString() === new Date(b).toDateString();
const hora = (iso) => new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
const dia = (iso) => new Date(iso).toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "short" });

function Bloco({ titulo, acao, atraso = 0, children }) {
  return (
    <section style={{ animationDelay: `${atraso}ms` }} className="animate-fade-up rounded-2xl border border-line bg-card p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-[15px] font-semibold">{titulo}</h2>
        {acao}
      </div>
      {children}
    </section>
  );
}

export default function GerenteInicioPage() {
  usePageTitle("Início");
  const { user } = useOutletContext();
  const { equipes, membros, leads, vendas, agenda, carregando, erro } = useDadosEquipe();

  if (carregando) {
    return (
      <div className="space-y-4" aria-busy="true" aria-label="Carregando">
        <div className="h-9 w-64 animate-pulse rounded-xl bg-card" />
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{[0, 1, 2, 3].map((i) => <div key={i} className="h-24 animate-pulse rounded-2xl bg-card" />)}</div>
        <div className="h-64 animate-pulse rounded-2xl bg-card" />
      </div>
    );
  }

  const primeiroNome = (user.name ?? "").split(" ")[0];
  const confirmadas = vendas.filter((v) => v.status === "confirmada");
  const pendentes = vendas.filter((v) => v.status === "pendente");
  const vgv = confirmadas.reduce((t, v) => t + Number(v.valor), 0);
  const agora = new Date();
  const visitasHoje = agenda.filter((a) => mesmoDia(a.dataHora, agora) && a.status !== "cancelado").length;
  const proximas = agenda.filter((a) => new Date(a.dataHora) >= agora && ["agendado", "confirmado"].includes(a.status)).sort((a, b) => new Date(a.dataHora) - new Date(b.dataHora)).slice(0, 5);

  const ranking = membros
    .map((m) => {
      const dele = confirmadas.filter((v) => v.corretor_id === m.id);
      return { id: m.id, nome: m.nome, vgv: dele.reduce((t, v) => t + Number(v.valor), 0), vendas: dele.length, leads: leads.filter((l) => l.corretor?.id === m.id).length };
    })
    .sort((a, b) => b.vgv - a.vgv);
  const maior = Math.max(...ranking.map((r) => r.vgv), 1);

  const indicadores = [
    ["VGV confirmado da equipe", <Contagem key="a" valor={vgv} formato={(n) => brl(n)} />, true],
    ["Vendas aguardando você", <Contagem key="b" valor={pendentes.length} />],
    ["Leads novos", <Contagem key="c" valor={leads.filter((l) => l.status === "novo").length} />],
    ["Visitas hoje", <Contagem key="d" valor={visitasHoje} />],
  ];

  return (
    <div className="space-y-5">
      <div className="animate-fade-up">
        <h1 className="text-2xl font-semibold">Olá, {primeiroNome}!</h1>
        <p className="text-[13px] text-ink-2">{equipes.length ? `${equipes.map((e) => e.nome).join(" · ")} — ${membros.length} ${membros.length === 1 ? "corretor" : "corretores"}` : "Acompanhe a sua equipe."}</p>
      </div>

      {erro && <p role="alert" className="rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">{erro}</p>}

      {!equipes.length ? (
        <Vazio>Você ainda não tem uma equipe. Peça ao admin para atribuir você como gerente de uma equipe em Equipe → Equipes da Place.</Vazio>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {indicadores.map(([rotulo, valor, destaque], i) => (
              <div key={rotulo} style={{ animationDelay: `${i * 60}ms` }} className="animate-fade-up rounded-2xl border border-line bg-card p-4">
                <p className="text-[12px] text-ink-3">{rotulo}</p>
                <p className={`mt-1 text-2xl font-semibold ${destaque ? "text-gold" : ""}`}>{valor}</p>
              </div>
            ))}
          </div>

          {pendentes.length > 0 && (
            <Bloco titulo={`Vendas esperando a sua confirmação (${pendentes.length})`} atraso={120} acao={<Link to="/gerente/vendas" className="text-[13px] text-gold hover:underline">Decidir</Link>}>
              <ul className="divide-y divide-line-soft">
                {pendentes.slice(0, 3).map((v) => (
                  <li key={v.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{v.empreendimento?.nome ?? "Empreendimento"}</p>
                      <p className="truncate text-[12px] text-ink-3">{v.corretor?.nome} · {v.cliente?.nome}</p>
                    </div>
                    <span className="shrink-0 font-semibold text-gold">{brl(v.valor)}</span>
                  </li>
                ))}
              </ul>
            </Bloco>
          )}

          <div className="grid gap-4 lg:grid-cols-2">
            <Bloco titulo="Desempenho da equipe (VGV confirmado)" atraso={180} acao={<Link to="/gerente/equipe" className="text-[13px] text-gold hover:underline">Ver equipe</Link>}>
              {ranking.length === 0 ? (
                <p className="py-6 text-center text-sm text-ink-3">Nenhum corretor na equipe ainda.</p>
              ) : (
                <ul className="space-y-4">
                  {ranking.map((r, i) => (
                    <li key={r.id}>
                      <div className="flex items-baseline justify-between gap-3 text-sm">
                        <span className="truncate">{r.nome}</span>
                        <span className="shrink-0 text-ink-2">{brl(r.vgv)} <span className="ml-1 text-[12px] text-ink-3">{r.vendas} {r.vendas === 1 ? "venda" : "vendas"} · {r.leads} leads</span></span>
                      </div>
                      <Meter pct={(r.vgv / maior) * 100} atraso={i * 70} className="mt-1.5" />
                    </li>
                  ))}
                </ul>
              )}
            </Bloco>

            <Bloco titulo="Próximas visitas" atraso={240} acao={<Link to="/gerente/agendamentos" className="text-[13px] text-gold hover:underline">Ver agenda</Link>}>
              {proximas.length === 0 ? (
                <p className="py-6 text-center text-sm text-ink-3">Nenhuma visita marcada para os próximos dias.</p>
              ) : (
                <ul className="divide-y divide-line-soft">
                  {proximas.map((a) => (
                    <li key={a.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                      <div className="w-16 shrink-0 text-center">
                        <p className="font-semibold text-gold">{hora(a.dataHora)}</p>
                        <p className="text-[11px] capitalize text-ink-3">{dia(a.dataHora)}</p>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{a.cliente?.nome ?? "—"}</p>
                        <p className="truncate text-[12px] text-ink-3">{a.corretor?.nome} · {a.tipo === "visita_imovel" ? a.empreendimento?.nome ?? "Imóvel" : a.local ?? "Escritório"}</p>
                      </div>
                      <Selo tom={a.status === "confirmado" ? "azul" : "neutro"}>{a.status === "confirmado" ? "Confirmado" : "Agendado"}</Selo>
                    </li>
                  ))}
                </ul>
              )}
            </Bloco>
          </div>
        </>
      )}
    </div>
  );
}