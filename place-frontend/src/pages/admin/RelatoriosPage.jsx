import { useEffect, useMemo, useRef, useState } from "react";
import { Meter } from "@/components/admin/dashboard/charts";
import { Vazio } from "@/components/admin/equipe/ui";
import { usePageTitle } from "@/hooks/usePageTitle";
import { getAgendamentos } from "@/services/admin/agendamentos";
import { getToken } from "@/lib/authToken";
import { listarVendas } from "@/services/vendas";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3333";
const brl = (n) => Number(n).toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
const PERIODOS = [[7, "7 dias"], [30, "30 dias"], [90, "90 dias"], [0, "Tudo"]];
const FUNIL = [["novo", "Novos"], ["em_atendimento", "Em atendimento"], ["convertido", "Convertidos"], ["perdido", "Perdidos"]];
const AGENDA = [["agendado", "Agendados"], ["confirmado", "Confirmados"], ["realizado", "Realizados"], ["nao_compareceu", "Não compareceram"], ["cancelado", "Cancelados"]];

async function listarLeadsAdmin() {
  const res = await fetch(`${BASE_URL}/leads`, { headers: { Authorization: `Bearer ${getToken()}` } });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error?.message ?? data.message ?? "Falha ao carregar leads");
  return data.leads ?? data;
}

function Contagem({ valor, formato = (n) => Math.round(n) }) {
  const [v, setV] = useState(0);
  const de = useRef(0);
  useEffect(() => {
    const inicio = performance.now();
    const origem = de.current;
    let raf;
    const passo = (t) => {
      const p = Math.min(1, (t - inicio) / 900);
      setV(origem + (valor - origem) * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(passo);
      else de.current = valor;
    };
    raf = requestAnimationFrame(passo);
    return () => cancelAnimationFrame(raf);
  }, [valor]);
  return <>{formato(v)}</>;
}

function Bloco({ titulo, atraso = 0, className = "", children }) {
  return (
    <section style={{ animationDelay: `${atraso}ms` }} className={`animate-fade-up rounded-2xl border border-line bg-card p-5 ${className}`}>
      <h2 className="mb-4 text-[15px] font-semibold">{titulo}</h2>
      {children}
    </section>
  );
}

function Barras({ itens, vazio, formato = (n) => n }) {
  if (!itens.some((i) => i.valor > 0) && !itens.length) return <p className="py-6 text-center text-sm text-ink-3">{vazio}</p>;
  const max = Math.max(...itens.map((i) => i.valor), 1);
  return (
    <ul className="space-y-4">
      {itens.map((i, k) => (
        <li key={i.rotulo}>
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span className="truncate">{i.rotulo}</span>
            <span className="shrink-0 text-ink-2">{formato(i.valor)}{i.extra ? <span className="ml-2 text-[12px] text-ink-3">{i.extra}</span> : null}</span>
          </div>
          <Meter pct={(i.valor / max) * 100} atraso={k * 70} className="mt-1.5" />
        </li>
      ))}
    </ul>
  );
}

export default function RelatoriosPage() {
  usePageTitle("Relatórios");
  const [dias, setDias] = useState(30);
  const [dados, setDados] = useState({ vendas: [], leads: [], agenda: [] });
  const [falhas, setFalhas] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let ativo = true;
    Promise.allSettled([listarVendas(), listarLeadsAdmin(), getAgendamentos()]).then(([v, l, a]) => {
      if (!ativo) return;
      setDados({ vendas: v.value ?? [], leads: l.value ?? [], agenda: a.value ?? [] });
      setFalhas([["vendas", v], ["leads", l], ["agendamentos", a]].filter(([, r]) => r.status === "rejected").map(([n]) => n));
      setCarregando(false);
    });
    return () => {
      ativo = false;
    };
  }, []);

  const r = useMemo(() => {
    const desde = dias ? Date.now() - dias * 86400000 : 0;
    const noPeriodo = (iso) => !dias || new Date(iso).getTime() >= desde;
    const vendas = dados.vendas.filter((v) => noPeriodo(v.confirmado_em ?? v.criado_em));
    const confirmadas = vendas.filter((v) => v.status === "confirmada");
    const leads = dados.leads.filter((l) => noPeriodo(l.criadoEm));
    const agenda = dados.agenda.filter((a) => noPeriodo(a.dataHora));

    const soma = (l) => l.reduce((t, v) => t + Number(v.valor), 0);
    const agrupar = (lista, chave) => {
      const m = new Map();
      for (const v of lista) {
        const k = chave(v);
        const atual = m.get(k) ?? { rotulo: k, valor: 0, qtd: 0 };
        atual.valor += Number(v.valor);
        atual.qtd += 1;
        m.set(k, atual);
      }
      return [...m.values()].sort((a, b) => b.valor - a.valor).map((i) => ({ ...i, extra: `${i.qtd} ${i.qtd === 1 ? "venda" : "vendas"}` }));
    };
    const conta = (lista, campo, chaves) => chaves.map(([k, rotulo]) => ({ rotulo, valor: lista.filter((x) => x[campo] === k).length }));

    const convertidos = leads.filter((l) => l.status === "convertido").length;
    const realizados = agenda.filter((a) => a.status === "realizado").length;
    const faltas = agenda.filter((a) => a.status === "nao_compareceu").length;
    return {
      confirmadas,
      vgv: soma(confirmadas),
      ticket: confirmadas.length ? soma(confirmadas) / confirmadas.length : 0,
      conversao: leads.length ? (convertidos / leads.length) * 100 : 0,
      comparecimento: realizados + faltas ? (realizados / (realizados + faltas)) * 100 : 0,
      totalLeads: leads.length,
      porCorretor: agrupar(confirmadas, (v) => v.corretor?.nome ?? "Sem corretor"),
      porEmpreendimento: agrupar(confirmadas, (v) => v.empreendimento?.nome ?? "Sem empreendimento"),
      funil: conta(leads, "status", FUNIL),
      agenda: conta(agenda, "status", AGENDA),
    };
  }, [dados, dias]);

  function exportar() {
    const linhas = [["Data", "Corretor", "Cliente", "Empreendimento", "Valor (R$)"]];
    for (const v of r.confirmadas) {
      linhas.push([new Date(v.confirmado_em ?? v.criado_em).toLocaleDateString("pt-BR"), v.corretor?.nome ?? "", v.cliente?.nome ?? "", v.empreendimento?.nome ?? "", Number(v.valor).toFixed(2).replace(".", ",")]);
    }
    const csv = "\uFEFF" + linhas.map((l) => l.map((x) => `"${String(x).replaceAll('"', '""')}"`).join(";")).join("\r\n");
    const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" })), download: "vendas-confirmadas.csv" });
    a.click();
    URL.revokeObjectURL(a.href);
  }

  const indicadores = [
    ["VGV confirmado", <Contagem key="v" valor={r.vgv} formato={(n) => brl(n)} />, true],
    ["Vendas confirmadas", <Contagem key="q" valor={r.confirmadas.length} />],
    ["Ticket médio", <Contagem key="t" valor={r.ticket} formato={(n) => brl(n)} />],
    ["Leads que viraram venda", <Contagem key="c" valor={r.conversao} formato={(n) => `${n.toFixed(0)}%`} />],
    ["Comparecimento nas visitas", <Contagem key="p" valor={r.comparecimento} formato={(n) => `${n.toFixed(0)}%`} />],
  ];

  return (
    <div className="space-y-5">
      <div className="animate-fade-up flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Relatórios</h1>
          <p className="text-[13px] text-ink-2">Desempenho de vendas, leads e visitas no período.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="flex rounded-xl border border-line p-0.5" role="group" aria-label="Período">
            {PERIODOS.map(([d, rotulo]) => (
              <button key={d} type="button" onClick={() => setDias(d)} aria-pressed={dias === d} className={`h-10 rounded-lg px-4 text-sm font-medium transition-colors ${dias === d ? "bg-gold/15 text-gold" : "text-ink-2 hover:text-ink"}`}>{rotulo}</button>
            ))}
          </div>
          <button type="button" onClick={exportar} disabled={!r.confirmadas.length} className="h-11 rounded-xl border border-line px-4 text-sm text-ink-2 transition-colors hover:border-gold hover:text-ink disabled:opacity-40">Exportar vendas (CSV)</button>
        </div>
      </div>

      {falhas.length > 0 && <p role="alert" className="rounded-xl border border-amber-400/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">Não foi possível carregar: {falhas.join(", ")}. Os números dessas partes aparecem zerados.</p>}

      {carregando ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5" aria-busy="true">{[0, 1, 2, 3, 4].map((i) => <div key={i} className="h-24 animate-pulse rounded-2xl bg-card" />)}</div>
      ) : (
        <div key={dias} className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            {indicadores.map(([rotulo, valor, destaque], i) => (
              <div key={rotulo} style={{ animationDelay: `${i * 60}ms` }} className="animate-fade-up rounded-2xl border border-line bg-card p-4">
                <p className="text-[12px] text-ink-3">{rotulo}</p>
                <p className={`mt-1 text-2xl font-semibold ${destaque ? "text-gold" : ""}`}>{valor}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Bloco titulo="Ranking de corretores (VGV confirmado)" atraso={120}>
              {r.porCorretor.length ? <Barras itens={r.porCorretor} formato={(n) => brl(n)} /> : <Vazio>Nenhuma venda confirmada no período.</Vazio>}
            </Bloco>
            <Bloco titulo="VGV por empreendimento" atraso={180}>
              {r.porEmpreendimento.length ? <Barras itens={r.porEmpreendimento} formato={(n) => brl(n)} /> : <Vazio>Nenhuma venda confirmada no período.</Vazio>}
            </Bloco>
            <Bloco titulo={`Funil de leads (${r.totalLeads})`} atraso={240}>
              <Barras itens={r.funil} vazio="Sem leads no período." />
            </Bloco>
            <Bloco titulo="Visitas e reuniões por status" atraso={300}>
              <Barras itens={r.agenda} vazio="Sem agendamentos no período." />
            </Bloco>
          </div>
        </div>
      )}
    </div>
  );
}