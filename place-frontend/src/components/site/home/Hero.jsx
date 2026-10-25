import { useState } from "react";
import { Link } from "react-router-dom";
import { Icon } from "@/components/ui/Icon";

const campo = "h-12 w-full min-w-0 rounded-xl border border-[#d5dce6] bg-white px-3.5 text-[13px] text-[#102843] outline-none focus:border-[#956e47]";

export default function Hero({ itens, filtros, onFiltros, tags, sugestoes, cidades, onBuscar, onFalar, carregando }) {
  const [comErro, setComErro] = useState([]);
  const [indice, setIndice] = useState(0);
  const [objetivo, setObjetivo] = useState("morar");
  const fotos = itens.filter((item) => item.image && item.disponivel !== false && !comErro.includes(item.id)).slice(0, 5);
  const indiceAtual = indice % Math.max(fotos.length, 1);
  const destaque = fotos[indiceAtual];
  const investir = objetivo === "investir";
  const atualizar = (chave) => (evento) => onFiltros({ ...filtros, [chave]: evento.target.value });

  return (
    <section className="pb-home-hero" aria-labelledby="pb-home-hero-title">
      <div className="pb-home-container">
        <div className="pb-home-intro">
          <p className="pb-home-kicker"><span /> Place Brokers · Lançamentos em Pernambuco</p>
          <span className="pb-home-intro-note">Um lugar para cada novo capítulo.</span>
        </div>
        <div className="pb-home-stage">
          <div className="pb-home-story">
            <div className="pb-home-intent" role="group" aria-label="O que você procura?">
              <button type="button" aria-pressed={!investir} onClick={() => setObjetivo("morar")}><Icon name="home" /> Quero morar</button>
              <button type="button" aria-pressed={investir} onClick={() => setObjetivo("investir")}><Icon name="chart" /> Quero investir</button>
            </div>
            <h1 id="pb-home-hero-title">
              {investir ? <>Pernambuco no seu radar.<br /><em>Seu próximo investimento.</em></> : <>Da cidade ao mar.<br /><em>Seu lugar em Pernambuco.</em></>}
            </h1>
            <p className="pb-home-description">
              {investir ? "Conheça os lançamentos de Pernambuco e converse sobre localização, valores e possibilidades para o seu patrimônio." : "Da vida na cidade aos dias perto do mar. Explore os lançamentos de Pernambuco e descubra onde começa a sua próxima conquista."}
            </p>
            <button type="button" className="pb-home-action" onClick={() => investir ? onFalar(null, "investimento na home") : onBuscar()}>
              {investir ? "Conversar sobre investimento" : "Descobrir os empreendimentos"}<Icon name="arrowRight" />
            </button>
            <p className="pb-home-guidance">Sua escolha, com acompanhamento da Place.</p>
          </div>
          <div className="pb-home-showcase" aria-label="Empreendimentos em destaque" aria-busy={carregando}>
            {destaque ? <>
              <img key={destaque.id} src={destaque.image} alt={`Conheça ${destaque.title}`} fetchPriority="high" loading="eager" decoding="async" onError={() => setComErro((atual) => [...atual, destaque.id])} className="pb-home-showcase-image" />
              <div className="pb-home-showcase-shade" />
              <span className="pb-home-feature-label">{destaque.destaque ? "Destaque Place" : "Conheça de perto"}</span>
              <div className="pb-home-feature-info">
                <p><Icon name="mapPin" className="size-4" />{[destaque.bairro, destaque.city].filter(Boolean).join(" · ")}</p>
                <h2>{destaque.title}</h2>
                <p>{[destaque.quartosTexto, destaque.area].filter(Boolean).join(" · ")}</p>
                <div className="pb-home-feature-bottom">
                  <strong>{destaque.preco}</strong>
                  <Link to={`/imoveis/${destaque.id}`}>Explorar imóvel <Icon name="arrowRight" /></Link>
                </div>
              </div>
            </> : <div className="pb-home-photo-empty"><Icon name="building" className="size-16" /><p>{carregando ? "Preparando sua próxima descoberta…" : "Novas histórias começam por uma conversa."}</p><button type="button" onClick={() => onFalar(null, "home sem fotos")}>Fale com a Place <Icon name="arrowRight" /></button></div>}
          </div>
        </div>
        {fotos.length > 1 && <div className="pb-home-selections" aria-label="Escolher empreendimento em destaque">
          <span>Seu próximo lugar<br /><strong>pode estar aqui.</strong></span>
          <div className="pb-home-selection-track">{fotos.map((foto, posicao) => <button key={foto.id} type="button" aria-label={`Mostrar ${foto.title}`} aria-pressed={posicao === indiceAtual} onClick={() => setIndice(posicao)}>
            <img src={foto.image} alt="" width="64" height="56" loading="lazy" />
            <span><strong>{foto.title}</strong><small>{foto.cidade}</small></span><Icon name="arrowRight" className="size-4" />
          </button>)}</div>
        </div>}
        <form
          onSubmit={(evento) => {
            evento.preventDefault();
            onBuscar();
          }}
          aria-label="Encontrar empreendimentos"
          className="pb-home-search"
        >
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-[15px] font-bold text-[#102843]">
              Encontre o imóvel certo
            </h2>
            <p className="text-xs text-[#6c8096]">Localização, espaço e valor. Do seu jeito.</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1.55fr_1fr_.85fr_1fr_auto] lg:items-end">
            <label className="block min-w-0">
              <span className="mb-1 block text-[11px] font-semibold text-[#51657d]">
                Cidade, bairro ou imóvel
              </span>
              <input
                list="pb-c-sugestoes"
                type="search"
                autoComplete="off"
                value={filtros.texto}
                onChange={atualizar("texto")}
                placeholder="Cidade, bairro ou empreendimento"
                className={campo}
              />
              <datalist id="pb-c-sugestoes">
                {sugestoes.map((sugestao) => (
                  <option key={sugestao} value={sugestao} />
                ))}
              </datalist>
            </label>

            <label className="block min-w-0">
              <span className="mb-1 block text-[11px] font-semibold text-[#51657d]">
                Etapa
              </span>
              <select value={filtros.tag} onChange={atualizar("tag")} className={campo}>
                <option value="">Todas</option>
                {tags.map((tag) => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
              </select>
            </label>

            <label className="block min-w-0">
              <span className="mb-1 block text-[11px] font-semibold text-[#51657d]">
                Quartos
              </span>
              <select value={filtros.quartos} onChange={atualizar("quartos")} className={campo}>
                <option value="">Qualquer</option>
                <option value="1">1 ou mais</option>
                <option value="2">2 ou mais</option>
                <option value="3">3 ou mais</option>
              </select>
            </label>

            <label className="block min-w-0">
              <span className="mb-1 block text-[11px] font-semibold text-[#51657d]">
                Até
              </span>
              <select
                value={filtros.precoAte ?? ""}
                onChange={atualizar("precoAte")}
                className={campo}
              >
                <option value="">Sem limite</option>
                <option value="350000">R$ 350 mil</option>
                <option value="500000">R$ 500 mil</option>
                <option value="750000">R$ 750 mil</option>
                <option value="1000000">R$ 1 milhão</option>
              </select>
            </label>

            <button
              type="submit"
              className="pb-c-primary inline-flex h-12 min-w-28 items-center justify-center gap-2 rounded-xl bg-[#e9ad5a] px-5 text-sm font-bold text-[#08152b] transition-colors hover:bg-[#f3c47a]"
            >
              <Icon name="search" className="size-4" /> Buscar
            </button>
          </div>
        </form>

        {cidades.length > 0 && <div className="pb-home-popular"><span>Explore também:</span>{cidades.slice(0, 4).map((cidade) => <button key={cidade} type="button" onClick={() => onBuscar({ ...filtros, texto: cidade })}>{cidade}<Icon name="arrowRight" className="size-3" /></button>)}</div>}
      </div>
    </section>
  );
}
