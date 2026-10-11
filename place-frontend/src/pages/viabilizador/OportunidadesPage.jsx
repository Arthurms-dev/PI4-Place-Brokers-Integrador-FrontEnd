import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Meter } from "@/components/admin/dashboard/charts";
import { Selo, Vazio } from "@/components/admin/equipe/ui";
import Contagem from "@/components/ui/Contagem";
import { usePageTitle } from "@/hooks/usePageTitle";
import { MSG_SEM_CONSTRUTORA, getOportunidades } from "@/services/viabilizador";

const brl = (n) => Number(n).toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
const PERIODOS = [[7, "7 dias"], [30, "30 dias"], [90, "90 dias"]];

export default function OportunidadesPage() {
  usePageTitle("Oportunidades");
  const [dias, setDias] = useState(30);
  const [dados, setDados] = useState(null);
  const [erro, setErro] = useState("");

  useEffect(() => {
    let ativo = true;
    setErro("");
    getOportunidades(dias).then((d) => ativo && setDados(d)).catch((e) => ativo && setErro(e.message));
    return () => {
      ativo = false;
    };
  }, [dias]);

  const produtos = dados?.produtos ?? [];
  const maior = Math.max(...produtos.map((p) => p.pontuacao), 1);
  const r = dados?.resumo;

  return (
    <div className="space-y-5">
      <div className="animate-fade-up flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Oportunidades</h1>
          <p className="text-[13px] text-ink-2">A procura pelos seus produtos: visualização vale 1 ponto, lead 5 e visita marcada 8.</p>
        </div>
        <div className="flex rounded-xl border border-line p-0.5" role="group" aria-label="Período">
          {PERIODOS.map(([d, rotulo]) => (
            <button key={d} type="button" onClick={() => setDias(d)} aria-pressed={dias === d} className={`h-10 rounded-lg px-4 text-sm font-medium transition-colors ${dias === d ? "bg-gold/15 text-gold" : "text-ink-2 hover:text-ink"}`}>{rotulo}</button>
          ))}
        </div>
      </div>

      {erro && <p role="alert" className="rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">{erro}</p>}

      {!dados && !erro ? (
        <div className="space-y-3" aria-busy="true">{[0, 1, 2].map((i) => <div key={i} className="h-28 animate-pulse rounded-2xl bg-card" />)}</div>
      ) : dados && produtos.length === 0 ? (
        <Vazio>{dados.construtora ? `Nenhum empreendimento da ${dados.construtora.nome} cadastrado ainda.` : MSG_SEM_CONSTRUTORA}</Vazio>
      ) : dados && (
        <div key={dias} className="space-y-4">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[["Visualizações", r.visualizacoes, (n) => Math.round(n)], ["Leads", r.leads, (n) => Math.round(n)], ["Visitas marcadas", r.visitas, (n) => Math.round(n)], ["VGV confirmado", r.vgv, (n) => brl(n)]].map(([rotulo, valor, formato], i) => (
              <div key={rotulo} style={{ animationDelay: `${i * 60}ms` }} className="animate-fade-up rounded-2xl border border-line bg-card p-4">
                <p className="text-[12px] text-ink-3">{rotulo}</p>
                <p className="mt-1 text-2xl font-semibold"><Contagem valor={valor} formato={formato} /></p>
              </div>
            ))}
          </div>

          <ul className="space-y-3">
            {produtos.map((p, i) => (
              <li key={p.id} style={{ animationDelay: `${Math.min(i, 6) * 55}ms` }} className="animate-fade-up space-y-3 rounded-2xl border border-line bg-card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate font-semibold"><span className="mr-2 text-ink-3">{i + 1}.</span>{p.nome}</h3>
                    <p className="truncate text-[13px] text-ink-2">{p.bairro} · {p.cidade}/{p.uf}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-xl font-semibold text-gold">{p.pontuacao}</p>
                    <p className="text-[11px] text-ink-3">pontos</p>
                  </div>
                </div>
                <Meter pct={(p.pontuacao / maior) * 100} atraso={i * 70} />
                <dl className="grid grid-cols-2 gap-2 text-center sm:grid-cols-5">
                  {[["Visualizações", p.visualizacoes], ["Leads", p.leads], ["Visitas", p.visitas], ["Vendas", p.vendas.confirmadas], ["VGV", brl(p.vendas.vgv)]].map(([rotulo, valor]) => (
                    <div key={rotulo} className="rounded-xl bg-card-2 py-2">
                      <dd className="text-[15px] font-semibold">{valor}</dd>
                      <dt className="text-[11px] text-ink-3">{rotulo}</dt>
                    </div>
                  ))}
                </dl>
                {!p.disponivel && (p.leads > 0 || p.visitas > 0) && (
                  <p className="flex flex-wrap items-center gap-2 text-[13px] text-amber-300">
                    <Selo tom="alerta">Atenção</Selo> Há procura, mas o produto está marcado como indisponível.
                    <Link to="/viabilizador/produtos" className="text-gold hover:underline">Revisar</Link>
                  </p>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}