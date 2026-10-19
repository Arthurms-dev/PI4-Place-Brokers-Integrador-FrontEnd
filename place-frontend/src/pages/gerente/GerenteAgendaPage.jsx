import { useMemo, useState } from "react";
import { CAMPO, Selo, Vazio } from "@/components/admin/equipe/ui";
import { usePageTitle } from "@/hooks/usePageTitle";
import { useDadosEquipe } from "./useDadosEquipe";

const STATUS = {
  agendado: ["neutro", "Agendado"],
  confirmado: ["azul", "Confirmado"],
  realizado: ["ok", "Realizado"],
  cancelado: ["perigo", "Cancelado"],
  nao_compareceu: ["alerta", "Não compareceu"],
};
const ENCERRADOS = ["realizado", "cancelado", "nao_compareceu"];
const inicioDoDia = (d) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};
const hora = (iso) => new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
function rotuloDia(d) {
  const hoje = inicioDoDia(new Date()).getTime();
  const t = inicioDoDia(d).getTime();
  if (t === hoje) return "Hoje";
  if (t === hoje + 86400000) return "Amanhã";
  return new Date(d).toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "short" });
}

export default function GerenteAgendaPage() {
  usePageTitle("Agenda da equipe");
  const { membros, agenda, carregando, erro } = useDadosEquipe();
  const [filtro, setFiltro] = useState("proximos");
  const [corretorId, setCorretorId] = useState("");

  const grupos = useMemo(() => {
    const hoje0 = inicioDoDia(new Date());
    const historico = (a) => new Date(a.dataHora) < hoje0 || ENCERRADOS.includes(a.status);
    const lista = agenda
      .filter((a) => !corretorId || a.corretor?.id === corretorId)
      .filter((a) => (filtro === "historico" ? historico(a) : !historico(a) && (filtro !== "hoje" || inicioDoDia(a.dataHora).getTime() === hoje0.getTime())))
      .sort((a, b) => (filtro === "historico" ? new Date(b.dataHora) - new Date(a.dataHora) : new Date(a.dataHora) - new Date(b.dataHora)));
    const porDia = new Map();
    for (const a of lista) {
      const k = inicioDoDia(a.dataHora).getTime();
      porDia.set(k, [...(porDia.get(k) ?? []), a]);
    }
    return [...porDia.entries()];
  }, [agenda, filtro, corretorId]);

  return (
    <div className="space-y-5">
      <div className="animate-fade-up">
        <p className="pb-eyebrow">Programação</p>
        <h1 className="text-xl font-semibold">Agenda da equipe</h1>
        <p className="text-[13px] text-ink-2">Visitas e reuniões dos seus corretores.</p>
      </div>
      {erro && <p role="alert" className="rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">{erro}</p>}

      <div className="grid gap-2 sm:grid-cols-[1fr_16rem]">
        <div className="flex gap-2">
          {[["hoje", "Hoje"], ["proximos", "Próximos"], ["historico", "Histórico"]].map(([k, r]) => (
            <button key={k} type="button" onClick={() => setFiltro(k)} aria-pressed={filtro === k}
              className={`h-11 flex-1 rounded-xl border text-sm transition-colors sm:flex-none sm:px-6 ${filtro === k ? "border-gold bg-gold/15 text-gold" : "border-line text-ink-2 hover:text-ink"}`}>{r}</button>
          ))}
        </div>
        <select value={corretorId} onChange={(e) => setCorretorId(e.target.value)} aria-label="Corretor" className={`${CAMPO} border-line`}>
          <option value="">Todos os corretores</option>
          {membros.map((m) => <option key={m.id} value={m.id}>{m.nome}</option>)}
        </select>
      </div>

      {carregando ? (
        <div className="space-y-2" aria-busy="true">{[0, 1, 2].map((i) => <div key={i} className="h-20 animate-pulse rounded-2xl bg-card" />)}</div>
      ) : grupos.length === 0 ? (
        <Vazio>{filtro === "historico" ? "Nada no histórico ainda." : "Nenhum compromisso por aqui."}</Vazio>
      ) : (
        grupos.map(([d, lista]) => (
          <section key={d} className="animate-fade-up space-y-2">
            <h2 className="text-[13px] font-medium capitalize text-ink-2">{rotuloDia(d)}</h2>
            <ul className="space-y-2">
              {lista.map((a) => {
                const [tom, rotulo] = STATUS[a.status] ?? STATUS.agendado;
                return (
                  <li key={a.id} className="flex items-center gap-4 rounded-2xl border border-line bg-card p-4">
                    <div className="w-14 shrink-0 text-center text-xl font-semibold text-gold">{hora(a.dataHora)}</div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold">{a.cliente?.nome ?? "—"}</p>
                      <p className="truncate text-[13px] text-ink-2">{a.tipo === "visita_imovel" ? a.empreendimento?.nome ?? "Imóvel" : a.local ?? "Escritório"}</p>
                      <p className="truncate text-[12px] text-ink-3">Corretor: {a.corretor?.nome}</p>
                    </div>
                    <Selo tom={tom}>{rotulo}</Selo>
                  </li>
                );
              })}
            </ul>
          </section>
        ))
      )}
    </div>
  );
}