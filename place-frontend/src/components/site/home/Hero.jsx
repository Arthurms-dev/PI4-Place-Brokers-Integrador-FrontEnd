import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Icon } from "@/components/ui/Icon";

const TROCA_MS = 6500;

function Campo({ rotulo, icone, className = "", children }) {
  return (
    <label className={`flex min-w-0 items-center gap-3 rounded-xl px-4 py-2.5 transition-colors hover:bg-white/5 focus-within:bg-white/5 md:rounded-full md:px-5 ${className}`}>
      {icone && <Icon name={icone} className="size-5 shrink-0 text-gold" />}
      <span className="min-w-0 flex-1">
        <span className="block text-[11px] font-medium uppercase tracking-wide text-ink-3">{rotulo}</span>
        {children}
      </span>
    </label>
  );
}

const ENTRADA = "w-full min-w-0 bg-transparent text-[15px] text-ink outline-none placeholder:text-ink-3 scheme-dark";

export default function Hero({ itens, filtros, onFiltros, tags, sugestoes, cidades, onBuscar }) {
  const fotos = itens.filter((i) => i.image).slice(0, 4);
  const [atual, setAtual] = useState(0);

  useEffect(() => {
    if (fotos.length < 2) return undefined;
    const id = setInterval(() => setAtual((a) => (a + 1) % fotos.length), TROCA_MS);
    return () => clearInterval(id);
  }, [fotos.length]);

  const foco = fotos[atual];
  const set = (campo) => (e) => onFiltros({ ...filtros, [campo]: e.target.value });

  return (
    <section className="relative isolate overflow-hidden">
      <div className="absolute inset-0 -z-20 bg-card-2">
        {fotos.map((f, i) => (
          <img
            key={f.id}
            src={f.image}
            alt=""
            fetchPriority={i === 0 ? "high" : "auto"}
            loading={i === 0 ? "eager" : "lazy"}
            className={`absolute inset-0 size-full object-cover transition-opacity duration-[1400ms] ease-in-out ${i === atual ? "animate-kenburns opacity-100" : "opacity-0"}`}
          />
        ))}
      </div>
      <div className="absolute inset-0 -z-10 bg-linear-to-b from-page/80 via-page/45 to-page" />

      <div className="mx-auto max-w-6xl px-4 pb-10 pt-12 sm:px-6 sm:pb-16 sm:pt-20 lg:pt-24">
        <p className="animate-fade-up text-[12px] font-medium uppercase tracking-[0.22em] text-gold">Lançamentos em Pernambuco</p>
        <h1 className="animate-fade-up mt-3 max-w-3xl text-4xl font-semibold leading-[1.08] tracking-tight sm:text-6xl" style={{ animationDelay: "80ms" }}>
          O lugar certo para <span className="text-gold-gradient">começar a sua história</span>
        </h1>
        <p className="animate-fade-up mt-4 max-w-xl text-[15px] text-ink-2 sm:text-lg" style={{ animationDelay: "160ms" }}>
          Escolha o lançamento e fale com um especialista para conhecer valores, plantas e condições exclusivas.
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onBuscar();
          }}
          className="animate-fade-up mt-8 rounded-3xl border-2 border-gold/70 bg-page/85 p-1.5 shadow-2xl shadow-black/50 backdrop-blur-md md:flex md:items-stretch md:rounded-full"
          style={{ animationDelay: "240ms" }}
        >
          <Campo rotulo="Onde" icone="mapPin" className="md:flex-[1.5]">
            <input list="sugestoes-busca" value={filtros.texto} onChange={set("texto")} placeholder="Cidade, bairro ou nome" className={ENTRADA} autoComplete="off" />
            <datalist id="sugestoes-busca">{sugestoes.map((s) => <option key={s} value={s} />)}</datalist>
          </Campo>
          <span className="mx-3 block h-px bg-line md:my-3 md:h-auto md:w-px" aria-hidden="true" />
          <Campo rotulo="Fase" icone="building" className="md:flex-1">
            <select value={filtros.tag} onChange={set("tag")} className={ENTRADA}>
              <option value="">Todas</option>
              {tags.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </Campo>
          <span className="mx-3 block h-px bg-line md:my-3 md:h-auto md:w-px" aria-hidden="true" />
          <Campo rotulo="Quartos" icone="bedDouble" className="md:flex-1">
            <select value={filtros.quartos} onChange={set("quartos")} className={ENTRADA}>
              <option value="">Qualquer</option>
              <option value="1">1 ou mais</option>
              <option value="2">2 ou mais</option>
              <option value="3">3 ou mais</option>
            </select>
          </Campo>
          <button type="submit" className="mt-1.5 h-14 w-full rounded-2xl bg-gold-gradient px-9 text-[15px] font-semibold text-[#1a1408] transition hover:brightness-110 md:mt-0 md:w-auto md:rounded-full">
            Buscar
          </button>
        </form>

        {cidades.length > 0 && (
          <div className="animate-fade-up mt-5 flex flex-wrap items-center gap-2" style={{ animationDelay: "320ms" }}>
            <span className="text-[13px] text-ink-3">Em alta:</span>
            {cidades.slice(0, 5).map((c) => (
              <button key={c} type="button" onClick={() => onBuscar({ ...filtros, texto: c })} className="h-9 rounded-full border border-line bg-page/50 px-4 text-[13px] text-ink-2 backdrop-blur transition-colors hover:border-gold hover:text-ink">
                {c}
              </button>
            ))}
          </div>
        )}

        {foco && (
          <div className="mt-8 flex items-center justify-between gap-4 text-[13px] text-ink-2">
            <Link to={`/imoveis/${foco.id}`} className="group inline-flex min-w-0 items-center gap-2 transition-colors hover:text-ink">
              <Icon name="mapPin" className="size-4 shrink-0 text-gold" />
              <span className="truncate">Na foto: <strong className="font-medium text-ink">{foco.title}</strong> · {foco.city}</span>
              <span className="shrink-0 text-gold transition-transform group-hover:translate-x-0.5">Ver →</span>
            </Link>
            <div className="flex shrink-0 gap-1.5" aria-hidden="true">
              {fotos.map((f, i) => <span key={f.id} className={`h-1.5 rounded-full transition-all duration-500 ${i === atual ? "w-6 bg-gold" : "w-1.5 bg-white/30"}`} />)}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
