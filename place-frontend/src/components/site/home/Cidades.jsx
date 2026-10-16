import { useMemo } from "react";
import Reveal from "../Reveal";
import { Foto } from "./pecas";

export default function Cidades({ itens, ativa, onEscolher }) {
  const grupos = useMemo(() => {
    const m = new Map();
    for (const p of itens) {
      const g = m.get(p.cidade) ?? { cidade: p.cidade, uf: p.uf, total: 0, exemplo: null };
      g.total += 1;
      if (!g.exemplo && p.image) g.exemplo = p;
      m.set(p.cidade, g);
    }
    return [...m.values()].sort((a, b) => b.total - a.total);
  }, [itens]);
  if (grupos.length < 2) return null;

  return (
    <section id="cidades" aria-labelledby="titulo-cidades" className="mx-auto max-w-6xl scroll-mt-20 px-4 pt-16 sm:px-6">
      <Reveal className="mb-5">
        <h2 id="titulo-cidades" className="text-2xl font-semibold sm:text-3xl">Explore por cidade</h2>
        <p className="mt-1 text-[14px] text-ink-2">Do litoral sul à Região Metropolitana.</p>
      </Reveal>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-5">
        {grupos.map((g, i) => (
          <Reveal key={g.cidade} atraso={i * 60} className={i === 0 ? "col-span-2 md:col-span-1" : ""}>
            <button type="button" onClick={() => onEscolher(ativa === g.cidade ? "" : g.cidade)} aria-pressed={ativa === g.cidade}
              className={`group relative block aspect-5/4 w-full overflow-hidden rounded-2xl border text-left transition duration-300 hover:-translate-y-1 md:aspect-4/5 ${ativa === g.cidade ? "border-gold ring-2 ring-gold/40" : "border-line hover:border-gold/60"}`}>
              {g.exemplo ? <Foto p={g.exemplo} className="absolute inset-0 size-full object-cover transition duration-700 group-hover:scale-110" /> : <div className="absolute inset-0 bg-card-2" />}
              <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4">
                <p className="text-lg font-semibold leading-tight">{g.cidade}</p>
                <p className="text-[12px] text-ink-2">{g.total} {g.total === 1 ? "empreendimento" : "empreendimentos"}</p>
              </div>
            </button>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
