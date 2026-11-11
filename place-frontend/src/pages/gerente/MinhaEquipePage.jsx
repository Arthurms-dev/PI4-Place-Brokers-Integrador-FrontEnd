import { Selo, Vazio } from "@/components/admin/equipe/ui";
import { Icon } from "@/components/ui/Icon";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useDadosEquipe } from "./useDadosEquipe";

const brl = (n) => Number(n).toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
const zap = (tel, nome) => `https://wa.me/55${tel.replace(/\D/g, "")}?text=${encodeURIComponent(`Olá, ${nome}!`)}`;
const iniciais = (n) => n.trim().split(/\s+/).slice(0, 2).map((p) => p[0]).join("").toUpperCase();

export default function MinhaEquipePage() {
  usePageTitle("Minha equipe");
  const { equipes, membros, leads, vendas, agenda, carregando, erro } = useDadosEquipe();
  const agora = new Date();

  if (carregando) {
    return <div className="grid gap-3 lg:grid-cols-2" aria-busy="true">{[0, 1, 2, 3].map((i) => <div key={i} className="h-40 animate-pulse rounded-2xl bg-card" />)}</div>;
  }

  return (
    <div className="space-y-5">
      <div className="animate-fade-up">
        <p className="pb-eyebrow">Pessoas e desempenho</p>
        <h1 className="text-xl font-semibold">Minha equipe</h1>
        <p className="text-[13px] text-ink-2">Os corretores que respondem a você e como cada um está.</p>
      </div>
      {erro && <p role="alert" className="rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">{erro}</p>}

      {!equipes.length ? (
        <Vazio>Você ainda não tem uma equipe. Peça ao admin para atribuir você como gerente em Equipe → Equipes da Place.</Vazio>
      ) : (
        equipes.map((eq) => {
          const doTime = membros.filter((m) => m.equipeId === eq.id);
          return (
            <section key={eq.id} className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-[15px] font-semibold">{eq.nome}</h2>
                {eq.sede && <Selo tom="ouro">{eq.sede}</Selo>}
                {eq.diretoria && <Selo tom="azul">{eq.diretoria}</Selo>}
                <span className="text-[12px] text-ink-3">{doTime.length} {doTime.length === 1 ? "corretor" : "corretores"}</span>
              </div>
              {doTime.length === 0 ? (
                <Vazio>Nenhum corretor nesta equipe ainda. O admin move os corretores em Equipe.</Vazio>
              ) : (
                <ul className="grid gap-3 lg:grid-cols-2">
                  {doTime.map((m, i) => {
                    const meusLeads = leads.filter((l) => l.corretor?.id === m.id);
                    const confirmadas = vendas.filter((v) => v.corretor_id === m.id && v.status === "confirmada");
                    const visitas = agenda.filter((a) => a.corretor?.id === m.id && new Date(a.dataHora) >= agora && ["agendado", "confirmado"].includes(a.status)).length;
                    const dados = [
                      ["Leads", meusLeads.length],
                      ["Novos", meusLeads.filter((l) => l.status === "novo").length],
                      ["Vendas", confirmadas.length],
                      ["Visitas", visitas],
                    ];
                    return (
                      <li key={m.id} style={{ animationDelay: `${Math.min(i, 6) * 55}ms` }} className="animate-fade-up space-y-3 rounded-2xl border border-line bg-card p-4">
                        <div className="flex items-center gap-3">
                          <span className="grid size-11 shrink-0 place-items-center rounded-full bg-gold/15 text-sm font-semibold text-gold">{iniciais(m.nome)}</span>
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-medium">{m.nome}</p>
                            <p className="truncate text-[12px] text-ink-3">{m.email}</p>
                          </div>
                          {!m.ativo && <Selo tom="perigo">Inativo</Selo>}
                        </div>
                        <dl className="grid grid-cols-4 gap-2 text-center">
                          {dados.map(([r, n]) => (
                            <div key={r} className="rounded-xl bg-card-2 py-2">
                              <dd className="text-lg font-semibold">{n}</dd>
                              <dt className="text-[11px] text-ink-3">{r}</dt>
                            </div>
                          ))}
                        </dl>
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm"><span className="text-ink-3">VGV: </span><strong className="text-gold">{brl(confirmadas.reduce((t, v) => t + Number(v.valor), 0))}</strong></p>
                          {m.telefone && (
                            <a href={zap(m.telefone, m.nome)} target="_blank" rel="noreferrer" className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#25D366] px-4 text-sm font-semibold text-[#06210f] transition hover:brightness-105">
                              <Icon name="messageCircle" className="size-4.5" /> WhatsApp
                            </a>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          );
        })
      )}
    </div>
  );
}