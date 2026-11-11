import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Icon } from "@/components/ui/Icon";
import { tempoDesde } from "@/lib/atendimento";
import { chegaramAgora, leadsAguardando } from "@/lib/sinoLeads";
import { listarMeusLeads } from "@/services/meusLeads";

const INTERVALO_MS = 30 * 1000;

/**
 * Notificação dentro do site para o corretor: sino com os leads aguardando retorno
 * e um aviso na tela quando chega um lead novo com o site aberto.
 * (O aviso no celular e o e-mail saem da API, mesmo com o site fechado.)
 */
export function SinoLeads() {
  const [aguardando, setAguardando] = useState([]);
  const [aberto, setAberto] = useState(false);
  const [avisos, setAvisos] = useState([]);
  const anteriores = useRef(null);

  useEffect(() => {
    let vivo = true;
    async function consultar() {
      if (document.visibilityState === "hidden") return;
      try {
        const lista = leadsAguardando(await listarMeusLeads());
        if (!vivo) return;
        const novos = chegaramAgora(anteriores.current, lista);
        anteriores.current = lista;
        setAguardando(lista);
        if (novos.length) setAvisos((a) => [...novos.slice(0, 3), ...a].slice(0, 3));
      } catch {
        /* sem rede: tenta de novo na próxima volta */
      }
    }
    consultar();
    const t = setInterval(consultar, INTERVALO_MS);
    document.addEventListener("visibilitychange", consultar);
    return () => {
      vivo = false;
      clearInterval(t);
      document.removeEventListener("visibilitychange", consultar);
    };
  }, []);

  useEffect(() => {
    if (!avisos.length) return undefined;
    const t = setTimeout(() => setAvisos((a) => a.slice(0, -1)), 12000);
    return () => clearTimeout(t);
  }, [avisos]);

  const total = aguardando.length;
  const fechar = () => setAberto(false);

  return (
    <div className="relative">
      <button type="button" onClick={() => setAberto((v) => !v)} aria-haspopup="dialog" aria-expanded={aberto}
        aria-label={total ? `${total} ${total === 1 ? "lead aguardando" : "leads aguardando"} retorno` : "Sem leads aguardando"}
        className="relative grid size-11 place-items-center rounded-xl border border-line text-ink-2 transition-colors hover:border-gold/50 hover:text-gold">
        <Icon name="bell" className={`size-5 ${avisos.length ? "animate-pulse text-gold" : ""}`} />
        {total > 0 && (
          <span className="absolute -right-1.5 -top-1.5 grid min-w-5 place-items-center rounded-full bg-danger px-1 text-[11px] font-bold leading-5 text-white">
            {total > 9 ? "9+" : total}
          </span>
        )}
      </button>

      {aberto && (
        <>
          <button type="button" aria-label="Fechar avisos" onClick={fechar} className="fixed inset-0 z-20" />
          <div role="dialog" aria-label="Leads aguardando retorno" className="absolute right-0 top-full z-30 mt-2 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-line bg-card shadow-xl">
            <p className="border-b border-line-soft px-4 py-3 text-[13px] font-semibold">
              {total ? `${total} ${total === 1 ? "lead aguardando" : "leads aguardando"} retorno` : "Nenhum lead aguardando"}
            </p>
            <ul className="max-h-80 overflow-auto">
              {aguardando.slice(0, 6).map((l) => (
                <li key={l.id}>
                  <Link to="/corretor/leads" onClick={fechar} className="flex min-h-14 items-center gap-3 px-4 py-2.5 transition-colors hover:bg-white/5">
                    <span className="grid size-9 shrink-0 place-items-center rounded-full bg-gold/15 text-gold"><Icon name="user" className="size-4" /></span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] font-medium text-ink">{l.nome}</span>
                      <span className="block truncate text-[11px] text-ink-3">{l.empreendimento?.nome ?? "Sem empreendimento"} · {tempoDesde(l.atribuidoEm ?? l.criadoEm)}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
            <Link to="/corretor/leads" onClick={fechar} className="block border-t border-line-soft px-4 py-3 text-center text-[13px] font-semibold text-gold hover:bg-white/5">Ver meus leads</Link>
          </div>
        </>
      )}

      <div aria-live="assertive" className="pointer-events-none fixed bottom-4 right-4 z-[70] flex w-80 max-w-[calc(100vw-2rem)] flex-col gap-2">
        {avisos.map((l) => (
          <Link key={l.id} to="/corretor/leads" onClick={() => setAvisos((a) => a.filter((x) => x.id !== l.id))}
            className="animate-slide-up pointer-events-auto flex items-center gap-3 rounded-2xl border border-gold/50 bg-card p-3.5 shadow-2xl">
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-gold-gradient text-[#1a1408]"><Icon name="bell" className="size-5" /></span>
            <span className="min-w-0 flex-1">
              <span className="block text-[13px] font-semibold text-ink">Lead novo: {l.nome}</span>
              <span className="block truncate text-[12px] text-ink-2">{l.empreendimento?.nome ? `${l.empreendimento.nome} · ` : ""}Ligue agora</span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
