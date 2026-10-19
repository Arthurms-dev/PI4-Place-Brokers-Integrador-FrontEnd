import { useEffect, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { Meter } from "@/components/admin/dashboard/charts";
import { Selo, Vazio } from "@/components/admin/equipe/ui";
import Contagem from "@/components/ui/Contagem";
import { usePageTitle } from "@/hooks/usePageTitle";
import { MSG_SEM_CONSTRUTORA, ROTULO_PENDENCIA, getOportunidades } from "@/services/viabilizador";

const brl = (n) => Number(n).toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

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

export default function ViabilizadorInicioPage() {
  usePageTitle("Início");
  const { user } = useOutletContext();
  const [dados, setDados] = useState(null);
  const [erro, setErro] = useState("");

  useEffect(() => {
    getOportunidades(30).then(setDados).catch((e) => setErro(e.message));
  }, []);

  if (!dados && !erro) {
    return (
      <div className="space-y-4" aria-busy="true" aria-label="Carregando">
        <div className="h-9 w-64 animate-pulse rounded-xl bg-card" />
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">{[0, 1, 2, 3].map((i) => <div key={i} className="h-24 animate-pulse rounded-2xl bg-card" />)}</div>
        <div className="h-64 animate-pulse rounded-2xl bg-card" />
      </div>
    );
  }

  const produtos = dados?.produtos ?? [];
  const pendentes = produtos.filter((p) => p.pendencias.length > 0);
  const top = produtos.slice(0, 3);
  const maior = Math.max(...top.map((p) => p.pontuacao), 1);
  const r = dados?.resumo;

  return (
    <div className="space-y-5">
      <div className="animate-fade-up">
        <p className="pb-eyebrow">Área do viabilizador</p>
        <h1 className="text-2xl font-semibold">Olá, {(user.name ?? "").split(" ")[0]}!</h1>
        <p className="text-[13px] text-ink-2">{dados?.construtora ? `${dados.construtora.nome} — ` : ""}mantenha os produtos atualizados e veja onde há procura (últimos 30 dias).</p>
      </div>

      {erro && <p role="alert" className="rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">{erro}</p>}

      {dados && produtos.length === 0 ? (
        <Vazio>{dados.construtora ? `Nenhum empreendimento da ${dados.construtora.nome} cadastrado ainda.` : MSG_SEM_CONSTRUTORA}</Vazio>
      ) : dados && (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[
              ["Meus produtos", r.produtos, (n) => Math.round(n), false],
              ["Visualizações", r.visualizacoes, (n) => Math.round(n), false],
              ["Leads", r.leads, (n) => Math.round(n), false],
              ["VGV confirmado", r.vgv, (n) => brl(n), true],
            ].map(([rotulo, valor, formato, destaque], i) => (
              <div key={rotulo} style={{ animationDelay: `${i * 60}ms` }} className="animate-fade-up rounded-2xl border border-line bg-card p-4">
                <p className="text-[12px] text-ink-3">{rotulo}</p>
                <p className={`mt-1 text-2xl font-semibold ${destaque ? "text-gold" : ""}`}><Contagem valor={valor} formato={formato} /></p>
              </div>
            ))}
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Bloco titulo={pendentes.length ? `Para atualizar (${pendentes.length})` : "Tudo em dia"} atraso={140} acao={pendentes.length > 0 && <Link to="/viabilizador/books" className="text-[13px] text-gold hover:underline">Atualizar</Link>}>
              {pendentes.length === 0 ? (
                <p className="py-6 text-center text-sm text-ink-3">Nenhuma pendência nos seus produtos. Bom trabalho!</p>
              ) : (
                <ul className="divide-y divide-line-soft">
                  {pendentes.map((p) => (
                    <li key={p.id} className="space-y-2 py-3 first:pt-0 last:pb-0">
                      <p className="truncate text-sm font-medium">{p.nome}</p>
                      <div className="flex flex-wrap gap-1.5">{p.pendencias.map((k) => <Selo key={k} tom="alerta">{ROTULO_PENDENCIA[k]}</Selo>)}</div>
                    </li>
                  ))}
                </ul>
              )}
            </Bloco>

            <Bloco titulo="Mais procurados" atraso={200} acao={<Link to="/viabilizador/oportunidades" className="text-[13px] text-gold hover:underline">Ver todos</Link>}>
              <ul className="space-y-4">
                {top.map((p, i) => (
                  <li key={p.id}>
                    <div className="flex items-baseline justify-between gap-3 text-sm">
                      <span className="truncate">{p.nome}</span>
                      <span className="shrink-0 text-[12px] text-ink-3">{p.visualizacoes} visualizações · {p.leads} leads · {p.visitas} visitas</span>
                    </div>
                    <Meter pct={(p.pontuacao / maior) * 100} atraso={i * 80} className="mt-1.5" />
                  </li>
                ))}
              </ul>
            </Bloco>
          </div>
        </>
      )}
    </div>
  );
}