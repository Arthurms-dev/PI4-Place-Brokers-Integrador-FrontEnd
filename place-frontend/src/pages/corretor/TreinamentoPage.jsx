import { useMemo, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { usePageTitle } from "@/hooks/usePageTitle";
import { OBJECOES, TEMAS } from "@/data/objecoes";

const norm = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

function Objecao({ o, aberta, onAlternar }) {
  return (
    <li className="rounded-2xl border border-line bg-card">
      <button type="button" onClick={onAlternar} aria-expanded={aberta} className="flex w-full items-start gap-3 p-4 text-left">
        <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full bg-gold/15 text-gold">
          <Icon name="messageCircle" className="size-4" />
        </span>
        <span className="min-w-0 flex-1">
          <b className="block text-[15px] font-semibold leading-snug">“{o.frase}”</b>
          <small className="mt-0.5 block text-[12px] text-ink-3">{TEMAS[o.tema]}</small>
        </span>
        <Icon name="chevronDown" className={`mt-1 size-5 shrink-0 text-ink-3 transition-transform ${aberta ? "rotate-180" : ""}`} />
      </button>
      {aberta && (
        <div className="space-y-3 border-t border-line-soft p-4 text-[14px] leading-relaxed">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-gold">O que costuma estar por trás</p>
            <p className="mt-1 text-ink-2">{o.porTras}</p>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-gold">Caminho</p>
            <ol className="mt-1 list-decimal space-y-1 pl-5 text-ink-2">
              {o.caminho.map((passo) => <li key={passo}>{passo}</li>)}
            </ol>
          </div>
          <div className="rounded-xl border-l-2 border-gold bg-card-2 px-3.5 py-2.5">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-3">Exemplo de fala</p>
            <p className="mt-1 italic text-ink">“{o.exemplo}”</p>
          </div>
        </div>
      )}
    </li>
  );
}

/** Material de estudo: objeções comuns e caminhos para conduzir a conversa. */
export default function TreinamentoPage() {
  usePageTitle("Treinamento");
  const [tema, setTema] = useState("");
  const [busca, setBusca] = useState("");
  const [aberta, setAberta] = useState(null);

  const lista = useMemo(() => {
    const q = norm(busca.trim());
    return OBJECOES.filter((o) => (!tema || o.tema === tema) && (!q || norm(`${o.frase} ${o.porTras} ${o.caminho.join(" ")}`).includes(q)));
  }, [tema, busca]);

  return (
    <div className="space-y-5">
      <header>
        <p className="pb-eyebrow">Treinamento</p>
        <h1 className="text-xl font-semibold">Quebra de objeções</h1>
        <p className="mt-1 max-w-2xl text-[13px] text-ink-2">
          Material de estudo para quem está começando. São caminhos, não scripts: adapte ao seu jeito de falar.
          A regra de ouro vale para todas: o cliente só cede quando enxerga a vantagem para ele.
        </p>
      </header>

      <label className="relative block">
        <Icon name="search" className="pointer-events-none absolute left-3.5 top-1/2 size-4.5 -translate-y-1/2 text-ink-3" />
        <input type="search" value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar: documento, entrada, WhatsApp..."
          className="h-12 w-full rounded-xl border border-line bg-card-2 pl-10 pr-3.5 text-base text-ink outline-none focus:border-gold scheme-dark sm:text-sm" />
      </label>

      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0 [&::-webkit-scrollbar]:hidden">
        {[["", "Todas"], ...Object.entries(TEMAS)].map(([k, rotulo]) => (
          <button key={k} type="button" onClick={() => setTema(k)} aria-pressed={tema === k}
            className={`shrink-0 rounded-full border px-4 py-2 text-[13px] ${tema === k ? "border-gold bg-gold/15 text-gold" : "border-line text-ink-2 hover:text-ink"}`}>
            {rotulo}
          </button>
        ))}
      </div>

      {lista.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-line p-8 text-center text-sm text-ink-2">Nenhuma objeção encontrada.</p>
      ) : (
        <ul className="grid gap-3 lg:grid-cols-2 lg:items-start">
          {lista.map((o) => (
            <Objecao key={o.id} o={o} aberta={aberta === o.id} onAlternar={() => setAberta((v) => (v === o.id ? null : o.id))} />
          ))}
        </ul>
      )}

      <p className="text-[12px] text-ink-3">Conteúdo de exemplo para a gerência revisar e completar com o jeito Place de atender.</p>
    </div>
  );
}
