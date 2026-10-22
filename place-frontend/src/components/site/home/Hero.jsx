import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Icon } from "@/components/ui/Icon";

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
    if (fotos.length < 2 || window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches) return undefined;
    const id = setInterval(() => setAtual(a => (a + 1) % fotos.length), 9000);
    return () => clearInterval(id);
  }, [fotos.length]);

  const foco = fotos[atual];
  const set = (campo) => (e) => onFiltros({ ...filtros, [campo]: e.target.value });

  return (
    <section className="pb-hero relative isolate overflow-hidden">
      <style>{`
        @keyframes heroDrift {
          0%   { transform: translate(0, 0) scale(1); }
          50%  { transform: translate(3%, -4%) scale(1.08); }
          100% { transform: translate(0, 0) scale(1); }
        }
        .hero-drift { animation: heroDrift 22s ease-in-out infinite; }
        .hero-drift-slow { animation: heroDrift 30s ease-in-out infinite reverse; }
        @media (prefers-reduced-motion: reduce) {
          .hero-drift, .hero-drift-slow { animation: none; }
        }
      `}</style>

      <div className="absolute inset-0 -z-20 bg-card-2">
        {fotos.length > 0 ? (
          fotos.map((f, i) => (
            <img
              key={f.id}
              src={f.image}
              alt=""
              fetchPriority={i === 0 ? "high" : "auto"}
              loading={i === 0 ? "eager" : "lazy"}
              className={`absolute inset-0 size-full object-cover transition-opacity duration-[1800ms] ease-in-out ${
                i === atual ? "animate-kenburns opacity-100 z-10" : "opacity-0 z-0"
              }`}
              style={{ willChange: "opacity, transform" }}
            />
          ))
        ) : (
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(1100px 560px at 85% -10%, rgb(233 173 90 / 0.16), transparent 60%), radial-gradient(900px 520px at 0% 110%, rgb(77 163 255 / 0.08), transparent 55%)",
            }}
          />
        )}
      </div>
      <div className="pb-hero-overlay absolute inset-0 -z-10 bg-linear-to-b from-page/80 via-page/45 to-page" />

      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div
          className="hero-drift absolute -top-24 -right-24 size-[36rem] rounded-full blur-3xl opacity-20"
          style={{ background: "radial-gradient(circle, rgb(233 173 90 / 0.55), transparent 70%)" }}
        />
        <div
          className="hero-drift-slow absolute -bottom-32 -left-20 size-[30rem] rounded-full blur-3xl opacity-15"
          style={{ background: "radial-gradient(circle, rgb(77 163 255 / 0.5), transparent 70%)" }}
        />
      </div>

      <div className="pb-hero-inner relative mx-auto max-w-7xl px-4 pb-14 pt-16 sm:px-6 sm:pb-20 sm:pt-24 lg:pt-28">
        <p className="animate-fade-up text-[11px] font-bold uppercase tracking-[0.24em] text-gold">Lançamentos em Pernambuco</p>
        <h1 className="pb-hero-title animate-fade-up mt-5 max-w-4xl text-[clamp(2.8rem,6.1vw,5.6rem)] font-semibold leading-[1.04] tracking-tight" style={{ animationDelay: "80ms" }}>
          O lugar certo para <span className="text-gold-gradient">começar a sua história</span>
        </h1>
        <p className="animate-fade-up mt-6 max-w-[35rem] text-[15px] leading-[1.8] text-ink-2 sm:text-[17px]" style={{ animationDelay: "160ms" }}>
          Escolha o lançamento e fale com um especialista para conhecer valores, plantas e condições exclusivas.
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onBuscar();
          }}
          className="pb-hero-search animate-fade-up mt-10 rounded-2xl border border-line bg-page/95 p-2 shadow-2xl shadow-black/30 backdrop-blur-xl md:flex md:items-stretch"
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
          <button type="submit" className="pb-primary-button mt-1.5 h-14 w-full rounded-xl bg-gold-gradient px-9 text-[15px] font-bold text-[#1a1408] transition hover:brightness-110 md:mt-0 md:w-auto">
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