import { useCallback, useEffect, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import { getDesempenho, reatribuirLead } from "@/services/gerente";
import { duracao } from "@/lib/duracao";

const ATUALIZAR_A_CADA = 60 * 1000;

function LeadParado({ lead, membros, onRepassado }) {
  const [destino, setDestino] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const opcoes = membros.filter((m) => m.ativo !== false && m.id !== lead.corretor.id);

  async function repassar() {
    if (!destino) return;
    setEnviando(true);
    setErro("");
    try {
      await reatribuirLead(lead.id, destino);
      onRepassado(lead.id, opcoes.find((m) => m.id === destino)?.nome);
    } catch (e) {
      setErro(e.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <li className="space-y-2 rounded-xl bg-card px-3 py-2.5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <b className="block truncate text-[14px] font-medium">{lead.nome}</b>
          <small className="block truncate text-[12px] text-ink-3">
            com {lead.corretor.nome}{lead.empreendimento ? ` · ${lead.empreendimento}` : ""}
          </small>
        </div>
        <span className={cn("shrink-0 text-[13px] font-semibold", lead.minutos >= 60 ? "text-danger" : "text-amber-300")}>
          há {duracao(lead.minutos)}
        </span>
      </div>
      {opcoes.length > 0 && (
        <div className="flex gap-2 sm:max-w-md">
          <select value={destino} onChange={(e) => setDestino(e.target.value)} aria-label={`Repassar ${lead.nome} para`}
            className="h-10 min-w-0 flex-1 rounded-lg border border-line bg-card-2 px-2.5 text-[13px] text-ink outline-none focus:border-gold scheme-dark">
            <option value="">Repassar para…</option>
            {opcoes.map((m) => <option key={m.id} value={m.id}>{m.nome}</option>)}
          </select>
          <button type="button" onClick={repassar} disabled={!destino || enviando}
            className="h-10 shrink-0 rounded-lg bg-gold-gradient px-3.5 text-[13px] font-semibold text-[#1a1408] disabled:opacity-50">
            {enviando ? "..." : "Repassar"}
          </button>
        </div>
      )}
      {erro && <p role="alert" className="text-[12px] text-danger">{erro}</p>}
    </li>
  );
}

/**
 * Início do gerente: leads parados (sem ligação nem WhatsApp há 15 min ou mais), com repasse
 * manual, e o tempo de resposta de cada corretor nos últimos 30 dias.
 */
export function AtendimentoEquipe({ membros }) {
  const [dados, setDados] = useState(null);
  const [erro, setErro] = useState("");
  const [aviso, setAviso] = useState("");

  const carregar = useCallback(() => {
    getDesempenho().then((d) => { setDados(d); setErro(""); }).catch((e) => setErro(e.message));
  }, []);

  useEffect(() => {
    carregar();
    const id = setInterval(carregar, ATUALIZAR_A_CADA);
    return () => clearInterval(id);
  }, [carregar]);

  if (erro && !dados) return <p className="rounded-xl border border-line bg-card px-4 py-3 text-[13px] text-ink-3">Não foi possível carregar o atendimento da equipe agora.</p>;
  if (!dados) return <div className="h-32 animate-pulse rounded-2xl bg-card" aria-busy="true" />;

  const { semAtendimento, corretores, equipe, limiteMin, dias } = dados;
  const pct = (a, b) => (b ? `${Math.round((a / b) * 100)}%` : "—");

  return (
    <>
      {semAtendimento.length > 0 ? (
        <section className="rounded-2xl border border-danger/50 bg-danger/10 p-4">
          <h2 className="flex items-center gap-2 text-[15px] font-semibold">
            <Icon name="clock" className="size-4.5 text-danger" />
            {semAtendimento.length === 1 ? "1 lead sem atendimento" : `${semAtendimento.length} leads sem atendimento`}
          </h2>
          <p className="mt-0.5 text-[12px] text-ink-2">Sem ligação nem WhatsApp há {limiteMin} min ou mais. Cobre o corretor ou repasse.</p>
          {aviso && <p role="status" className="mt-2 text-[12px] text-ok">{aviso}</p>}
          <ul className="mt-3 space-y-2">
            {semAtendimento.map((l) => (
              <LeadParado key={l.id} lead={l} membros={membros}
                onRepassado={(id, nome) => {
                  setDados((d) => ({ ...d, semAtendimento: d.semAtendimento.filter((x) => x.id !== id) }));
                  setAviso(`Lead repassado${nome ? ` para ${nome}` : ""}.`);
                }} />
            ))}
          </ul>
        </section>
      ) : (
        <p className="flex items-center gap-2 rounded-2xl border border-ok/40 bg-ok/10 px-4 py-3 text-[13px]">
          <Icon name="clock" className="size-4 text-ok" /> Nenhum lead parado: todos os leads novos da equipe já tiveram contato.
        </p>
      )}

      <section className="rounded-2xl border border-line bg-card p-5">
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-[15px] font-semibold">Atendimento nos últimos {dias} dias</h2>
          <p className="text-[12px] text-ink-3">
            Equipe: {equipe.recebidos} leads · {pct(equipe.atendidos, equipe.recebidos)} atendidos · 1º contato em {duracao(equipe.tempoRespostaMin)}
          </p>
        </div>
        {corretores.length === 0 ? (
          <p className="py-6 text-center text-sm text-ink-3">Nenhum corretor na equipe ainda.</p>
        ) : (
          <>
          <ul className="divide-y divide-line-soft sm:hidden">
            {corretores.map((c) => (
              <li key={c.id} className="py-2.5">
                <div className="flex items-baseline justify-between gap-2">
                  <b className="truncate text-[14px] font-medium">{c.nome}</b>
                  <span className={cn("shrink-0 text-[13px] tabular-nums", c.tempoRespostaMin != null && c.tempoRespostaMin > limiteMin ? "text-amber-300" : c.tempoRespostaMin != null ? "text-ok" : "text-ink-3")}>
                    1º contato {duracao(c.tempoRespostaMin)}
                  </span>
                </div>
                <p className="text-[12px] text-ink-3">
                  {c.recebidos} leads · {pct(c.atendidos, c.recebidos)} atendidos · {c.visitas} {c.visitas === 1 ? "visita" : "visitas"} · {c.vendas} {c.vendas === 1 ? "venda" : "vendas"}
                </p>
              </li>
            ))}
          </ul>
          <div className="hidden sm:block">
            <table className="w-full text-left text-[13px]">
              <thead className="text-[11px] uppercase tracking-wide text-ink-3">
                <tr>
                  <th className="pb-2 font-medium">Corretor</th>
                  <th className="pb-2 text-right font-medium">Leads</th>
                  <th className="pb-2 text-right font-medium">Atendidos</th>
                  <th className="pb-2 text-right font-medium" title="Mediana do tempo entre receber o lead e ligar ou chamar no WhatsApp">1º contato</th>
                  <th className="pb-2 text-right font-medium">Visitas</th>
                  <th className="pb-2 text-right font-medium">Vendas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line-soft">
                {corretores.map((c) => (
                  <tr key={c.id}>
                    <td className="py-2.5 pr-3">{c.nome}</td>
                    <td className="py-2.5 text-right tabular-nums">{c.recebidos}</td>
                    <td className="py-2.5 text-right tabular-nums">{pct(c.atendidos, c.recebidos)}</td>
                    <td className={cn("py-2.5 text-right tabular-nums", c.tempoRespostaMin != null && c.tempoRespostaMin > limiteMin ? "text-amber-300" : c.tempoRespostaMin != null ? "text-ok" : "text-ink-3")}>
                      {duracao(c.tempoRespostaMin)}
                    </td>
                    <td className="py-2.5 text-right tabular-nums">{c.visitas}</td>
                    <td className="py-2.5 text-right tabular-nums">{c.vendas}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </>
        )}
        <p className="mt-3 text-[11px] text-ink-3">O 1º contato conta quando o corretor liga ou chama no WhatsApp pelo botão do app.</p>
      </section>
    </>
  );
}
