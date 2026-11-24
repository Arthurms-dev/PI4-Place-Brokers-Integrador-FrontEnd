import { useId, useMemo, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import Reveal from "../Reveal";
import { Foto } from "./pecas";

const EM_DESTAQUE = 6;

const plural = (n) => `${n} ${n === 1 ? "empreendimento" : "empreendimentos"}`;

/** Cidades com mais empreendimentos primeiro (empate: ordem alfabética). */
export function agruparCidades(itens) {
  const m = new Map();
  for (const p of itens) {
    if (!p.cidade) continue;
    const g = m.get(p.cidade) ?? { cidade: p.cidade, uf: p.uf, total: 0, exemplo: null };
    g.total += 1;
    if (!g.exemplo && p.image) g.exemplo = p;
    m.set(p.cidade, g);
  }
  return [...m.values()].sort((a, b) => b.total - a.total || a.cidade.localeCompare(b.cidade, "pt-BR"));
}

/** As 6 cidades com mais empreendimentos em destaque; as outras ficam num cartão "Outras cidades". */
export function separarCidades(grupos, limite = EM_DESTAQUE) {
  // Com só uma cidade sobrando, não vale um cartão a mais: mostra todas.
  if (grupos.length <= limite + 1) return { destaque: grupos, outras: [] };
  return { destaque: grupos.slice(0, limite), outras: grupos.slice(limite) };
}

export default function Cidades({ itens, ativa, onEscolher }) {
  const grupos = useMemo(() => agruparCidades(itens), [itens]);
  const { destaque, outras } = useMemo(() => separarCidades(grupos), [grupos]);
  const ativaEmOutras = outras.some((g) => g.cidade === ativa);
  const [abertas, setAbertas] = useState(false);
  const idLista = useId();
  if (grupos.length < 2) return null;

  const mostrarOutras = abertas || ativaEmOutras;
  const totalOutras = outras.reduce((soma, g) => soma + g.total, 0);
  const escolher = (cidade) => onEscolher(ativa === cidade ? "" : cidade);

  return (
    <section id="cidades" aria-labelledby="titulo-cidades" className="mx-auto max-w-7xl scroll-mt-20 px-4 pt-16 sm:px-6">
      <Reveal className="mb-5">
        <h2 id="titulo-cidades" className="text-2xl font-semibold sm:text-3xl">Explore por cidade</h2>
        <p className="mt-1 text-[14px] text-ink-2">Do litoral sul à Região Metropolitana.</p>
      </Reveal>
      <div className={`grid grid-cols-2 gap-3 sm:gap-4 ${outras.length ? "md:grid-cols-4" : "md:grid-cols-3 lg:grid-cols-5"}`}>
        {destaque.map((g, i) => {
          // Com "Outras cidades", a maior cidade ocupa 2 colunas em todas as telas e a grade fecha certinho.
          const larga = i === 0;
          const larguraPc = outras.length ? "md:col-span-2" : "md:col-span-1";
          return (
            <Reveal key={g.cidade} atraso={i * 60} className={larga ? `col-span-2 ${larguraPc} md:h-full` : ""}>
              <button type="button" onClick={() => escolher(g.cidade)} aria-pressed={ativa === g.cidade}
                className={`group relative block aspect-5/4 w-full overflow-hidden rounded-2xl border text-left transition duration-300 hover:-translate-y-1 md:aspect-4/5 ${larga && outras.length ? "md:aspect-auto md:h-full" : ""} ${ativa === g.cidade ? "border-gold ring-2 ring-gold/40" : "border-line hover:border-gold/60"}`}>
                {g.exemplo ? <Foto p={g.exemplo} className="absolute inset-0 size-full object-cover transition duration-700 group-hover:scale-110" /> : <div className="absolute inset-0 bg-card-2" />}
                <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <p className="text-lg font-semibold leading-tight">{g.cidade}</p>
                  <p className="text-[12px] text-ink-2">{plural(g.total)}</p>
                </div>
              </button>
            </Reveal>
          );
        })}

        {outras.length > 0 && (
          <Reveal atraso={destaque.length * 60}>
            <button
              type="button"
              onClick={() => setAbertas((v) => !v)}
              aria-expanded={mostrarOutras}
              aria-controls={idLista}
              className={`group relative flex aspect-5/4 w-full flex-col justify-between overflow-hidden rounded-2xl border p-4 text-left transition duration-300 hover:-translate-y-1 md:aspect-4/5 ${mostrarOutras ? "border-gold ring-2 ring-gold/40" : "border-[#0b203b] hover:border-gold/60"} bg-[#0b203b] bg-linear-to-br from-[#13315a] to-[#0b203b]`}
            >
              <span className="grid size-11 place-items-center rounded-xl bg-[#e9ad5a]/20">
                <Icon name="mapPin" className="size-5 text-[#f3c47a]" />
              </span>
              <span>
                <span className="block text-lg font-semibold leading-tight">Outras cidades</span>
                <span className="block text-[12px] text-ink-2">
                  {outras.length} cidades · {plural(totalOutras)}
                </span>
                <span className="mt-2 inline-flex min-h-6 items-center gap-1 text-[13px] font-semibold">
                  {mostrarOutras ? "Fechar" : "Ver todas"}
                  <Icon name="arrowRight" className={`size-4 text-[#f3c47a] transition-transform ${mostrarOutras ? "-rotate-90" : "rotate-90"}`} />
                </span>
              </span>
            </button>
          </Reveal>
        )}
      </div>

      {outras.length > 0 && (
        <ul id={idLista} hidden={!mostrarOutras} aria-label="Outras cidades" className="mt-3 flex flex-wrap gap-2">
          {outras.map((g) => (
            <li key={g.cidade}>
              <button
                type="button"
                onClick={() => escolher(g.cidade)}
                aria-pressed={ativa === g.cidade}
                className={`inline-flex min-h-11 items-center gap-2 rounded-full border bg-[#0b203b] px-4 text-[14px] font-semibold text-white transition hover:bg-[#13315a] ${ativa === g.cidade ? "border-[#e9ad5a] ring-2 ring-[#e9ad5a]/40" : "border-[#0b203b]"}`}
              >
                {g.cidade}
                <span className="text-[12px] font-normal opacity-70">{g.total}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
