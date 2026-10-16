import { useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import { Icon } from "@/components/ui/Icon";
import { BotaoFavorito } from "../favoritos";
import Reveal from "../Reveal";
import { Etiquetas, Ficha, Foto } from "./pecas";

export default function Destaques({ itens, onFalar }) {
  const trilho = useRef(null);
  const lista = useMemo(() => [...itens].sort((a, b) => Number(b.destaque) - Number(a.destaque)).slice(0, 6), [itens]);
  const rolar = (dir) => trilho.current?.scrollBy({ left: dir * trilho.current.clientWidth * 0.8, behavior: "smooth" });
  if (lista.length === 0) return null;

  return (
    <section aria-labelledby="titulo-destaques" className="mx-auto max-w-6xl px-4 pt-14 sm:px-6">
      <Reveal className="mb-5 flex items-end justify-between gap-4">
        <div>
          <h2 id="titulo-destaques" className="text-2xl font-semibold sm:text-3xl">Lançamentos em alta</h2>
          <p className="mt-1 text-[14px] text-ink-2">Os mais procurados do momento.</p>
        </div>
        <div className="hidden gap-2 sm:flex">
          {[-1, 1].map((d) => (
            <button key={d} type="button" onClick={() => rolar(d)} aria-label={d < 0 ? "Anteriores" : "Próximos"} className="grid size-11 place-items-center rounded-full border border-line transition-colors hover:border-gold hover:text-gold">
              <Icon name={d < 0 ? "chevronLeft" : "chevronRight"} className="size-5" />
            </button>
          ))}
        </div>
      </Reveal>

      <div ref={trilho} className="-mx-4 flex scroll-smooth snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-3 [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden">
        {lista.map((p, i) => (
          <Reveal key={p.id} atraso={i * 70} className="w-[84%] shrink-0 snap-start sm:w-[calc((100%-2rem)/3)]">
            <article className="group rounded-2xl border border-line bg-card transition-[transform,box-shadow,border-color] duration-500 ease-[cubic-bezier(.22,1,.36,1)] hover:-translate-y-1.5 hover:border-gold/60 hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.45)]">
              <Link to={`/imoveis/${p.id}`} className="relative block aspect-4/3 overflow-hidden" aria-label={`Ver ${p.title}`}>
                <Foto p={p} className="size-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.08]" />
                <div className="absolute left-3 top-3"><Etiquetas p={p} /></div>
                <BotaoFavorito id={p.id} titulo={p.title} className="absolute right-3 top-3" />
                <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/85 to-transparent px-4 pb-3 pt-14">
                  <p className="text-[11px] uppercase tracking-wide text-ink-2">{p.preco.startsWith("A partir") ? "A partir de" : "Valores"}</p>
                  <p className="text-xl font-semibold text-gold">{p.preco.replace("A partir de ", "")}</p>
                </div>
              </Link>
              <div className="flex flex-1 flex-col gap-1 p-4">
                <h3 className="truncate text-base font-semibold">{p.title}</h3>
                <p className="flex items-center gap-1.5 text-[13px] text-ink-3"><Icon name="mapPin" className="size-3.5 shrink-0" /> {p.bairro ? `${p.bairro} · ` : ""}{p.city}</p>
                <Ficha p={p} className="mt-1" />
                <button type="button" onClick={() => onFalar(p)} className="mt-3 h-11 w-full rounded-xl border border-gold/60 text-[13px] font-semibold text-gold transition-colors hover:bg-gold hover:text-[#1a1408]">
                  Falar com especialista
                </button>
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
