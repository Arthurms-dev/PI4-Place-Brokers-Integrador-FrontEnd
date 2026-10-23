import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Icon } from "@/components/ui/Icon";

const campo = "h-12 w-full min-w-0 rounded-xl border border-[#d5dce6] bg-[#fff] px-3.5 text-[13px] text-[#102843] shadow-sm outline-none transition-[border-color,box-shadow] focus:border-[#c99041] focus:shadow-[0_0_0_3px_rgba(233,173,90,.15)]";

export default function HeroB({ itens, filtros, onFiltros, tags, sugestoes, cidades, onBuscar }) {
  const [comErro, setComErro] = useState([]);
  const fotos = itens.filter((p) => p.image && !comErro.includes(p.id)).slice(0, 5);
  const [indice, setIndice] = useState(0);
  const destaque = fotos[indice % Math.max(fotos.length, 1)];
  const atualizar = (chave) => (e) => onFiltros({ ...filtros, [chave]: e.target.value });

  useEffect(() => {
    if (fotos.length < 2 || window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches) return undefined;
    const interval = window.setInterval(() => setIndice((i) => (i + 1) % fotos.length), 8500);
    return () => window.clearInterval(interval);
  }, [fotos.length]);

  return (
    <section className="pb-c-hero relative isolate overflow-hidden" aria-labelledby="pb-home-hero-title">
      <div className="mx-auto max-w-7xl px-4 pb-10 pt-8 sm:px-6 lg:pb-16 lg:pt-12">
        <div className="grid items-center gap-8 lg:grid-cols-[.85fr_1.15fr] lg:gap-12">
          <div className="pb-c-hero-copy relative z-10 py-4 lg:py-12">
            <p className="pb-c-overline"><span className="inline-block h-[2px] w-6 bg-[#bf8c47]" /> IMÓVEIS QUE FAZEM SENTIDO PARA VOCÊ</p>
            <h1 id="pb-home-hero-title" className="mt-6 max-w-[570px] font-sans text-[clamp(2.65rem,4.35vw,4.25rem)] font-extrabold leading-[1.065] tracking-[-.055em] text-[#0b203b]">
              Encontre seu <span className="text-[#bd8741]">próximo lugar.</span>
            </h1>
            <p className="mt-5 max-w-[470px] text-[15px] leading-7 text-[#526780] sm:text-[17px]">
              Descubra empreendimentos, explore regiões e escolha com o apoio de quem conhece cada detalhe.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <button onClick={() => onBuscar()} type="button" className="pb-c-primary inline-flex min-h-12 items-center gap-2 rounded-full bg-[#0c2846] px-6 text-[13px] font-bold text-white shadow-lg transition-colors hover:bg-[#163c61]">
                Explorar imóveis <Icon name="arrowRight" className="size-4" />
              </button>
              <p className="text-[12px] font-medium text-[#708399]">Fotos reais do catálogo Place Brokers</p>
            </div>
          </div>

          <div className="pb-c-hero-visual relative min-w-0">
            <div className="pb-c-photo relative h-[370px] overflow-hidden rounded-[26px] bg-[#1a334f] shadow-[0_25px_65px_-30px_rgba(8,21,43,.46)] sm:h-[450px] lg:h-[510px]">
              {destaque ? <img key={destaque.id} src={destaque.image} alt={`Perspectiva do empreendimento ${destaque.title}`} loading="eager" fetchPriority="high" decoding="async" onError={() => setComErro((v) => v.includes(destaque.id) ? v : [...v, destaque.id])} className="pb-c-photo-image absolute inset-0 h-full w-full object-cover" /> : <div className="grid h-full place-items-center"><Icon name="building" className="size-20 text-[#e9ad5a]/70" /></div>}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#06162a]/85 via-[#06162a]/10 to-transparent" />
              {destaque && <div className="absolute bottom-5 left-5 right-5 flex flex-wrap items-end justify-between gap-3 text-white sm:bottom-7 sm:left-7 sm:right-7">
                <div><p className="text-[10px] font-bold uppercase tracking-[.19em] text-[#eec37e]">EM DESTAQUE</p><h2 className="mt-1 text-lg font-extrabold sm:text-xl">{destaque.title}</h2><p className="mt-1 text-xs text-white/80">{destaque.city}</p></div>
                <Link to={`/imoveis/${destaque.id}`} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/45 bg-white/20 px-5 text-xs font-bold text-white backdrop-blur-md hover:bg-white/30">Conhecer <Icon name="arrowRight" className="size-4" /></Link>
              </div>}
            </div>
            {fotos.length > 1 && <div className="absolute right-5 top-5 flex gap-1.5 rounded-full bg-[#08152b]/70 p-2 backdrop-blur">
              {fotos.map((f, i) => <button key={f.id} type="button" aria-label={`Mostrar ${f.title}`} aria-current={i === indice % fotos.length ? "true" : undefined} onClick={() => setIndice(i)} className={`h-1.5 rounded-full transition-[width,background] duration-300 ${i === indice % fotos.length ? "w-6 bg-[#e9ad5a]" : "w-1.5 bg-white/55 hover:bg-white"}`} />)}
            </div>}
          </div>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); onBuscar(); }} aria-label="Encontrar empreendimentos" className="pb-c-search mt-7 rounded-[22px] border border-[#d8e1e9] bg-white p-4 shadow-[0_15px_55px_-30px_rgba(13,37,62,.28)] sm:p-5 lg:mt-0 lg:-translate-y-5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2"><h2 className="text-[15px] font-bold text-[#102843]">Encontre o imóvel certo</h2><p className="text-xs text-[#6c8096]">Você pode combinar os filtros</p></div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1.55fr_1fr_.85fr_1fr_auto] lg:items-end">
            <label className="block min-w-0"><span className="mb-1 block text-[11px] font-semibold text-[#51657d]">Cidade, bairro ou imóvel</span><input list="pb-c-sugestoes" type="search" autoComplete="off" value={filtros.texto} onChange={atualizar("texto")} placeholder="Onde você quer morar?" className={campo}/><datalist id="pb-c-sugestoes">{sugestoes.map((s) => <option key={s} value={s}/>)}</datalist></label>
            <label className="block min-w-0"><span className="mb-1 block text-[11px] font-semibold text-[#51657d]">Etapa</span><select value={filtros.tag} onChange={atualizar("tag")} className={campo}><option value="">Todas</option>{tags.map((t) => <option key={t} value={t}>{t}</option>)}</select></label>
            <label className="block min-w-0"><span className="mb-1 block text-[11px] font-semibold text-[#51657d]">Quartos</span><select value={filtros.quartos} onChange={atualizar("quartos")} className={campo}><option value="">Qualquer</option><option value="1">1 ou mais</option><option value="2">2 ou mais</option><option value="3">3 ou mais</option></select></label>
            <label className="block min-w-0"><span className="mb-1 block text-[11px] font-semibold text-[#51657d]">Até</span><select value={filtros.precoAte ?? ""} onChange={atualizar("precoAte")} className={campo}><option value="">Sem limite</option><option value="350000">R$ 350 mil</option><option value="500000">R$ 500 mil</option><option value="750000">R$ 750 mil</option><option value="1000000">R$ 1 milhão</option></select></label>
            <button type="submit" className="pb-c-primary inline-flex h-12 min-w-28 items-center justify-center gap-2 rounded-xl bg-[#e9ad5a] px-5 text-sm font-bold text-[#08152b] transition-colors hover:bg-[#f3c47a]"><Icon name="search" className="size-4" /> Buscar</button>
          </div>
        </form>
        {cidades.length > 0 && <div className="pb-c-cities mt-1 flex flex-wrap items-center gap-2 text-[#536881]"><span className="text-xs">Populares:</span>{cidades.slice(0, 4).map((c) => <button key={c} type="button" onClick={() => onBuscar({ ...filtros, texto: c })} className="rounded-full border border-[#cdd8e3] bg-white/80 px-3 py-1.5 text-[12px] hover:border-[#be8b43] hover:text-[#986827]">{c}</button>)}</div>}
      </div>
    </section>
  );
}
