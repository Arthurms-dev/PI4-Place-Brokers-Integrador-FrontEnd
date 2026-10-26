import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Icon } from "@/components/ui/Icon";
import { ETAPAS_HOME, PRAZOS_HOME, SEGMENTOS_HOME, numerosDoCatalogo, opcoesDeFaixa } from "@/lib/catalogoHome";

const campo =
  "h-12 w-full min-w-0 rounded-xl border border-[#d5dce6] bg-[#fff] px-3.5 text-[13px] text-[#102843] shadow-sm outline-none transition-[border-color,box-shadow] focus:border-[#c99041] focus:shadow-[0_0_0_3px_rgba(233,173,90,.15)]";
const rotulo = "mb-1 block text-[11px] font-semibold text-[#51657d]";

export default function Hero({ itens, filtros, onFiltros, sugestoes, cidades, onBuscar }) {
  const [comErro, setComErro] = useState([]);
  const [indice, setIndice] = useState(0);

  const fotos = itens.filter((item) => item.image && !comErro.includes(item.id)).slice(0, 5);
  const indiceAtual = indice % Math.max(fotos.length, 1);
  const destaque = fotos[indiceAtual];
  const numeros = useMemo(() => numerosDoCatalogo(itens), [itens]);
  const segmentosComItens = useMemo(
    () => SEGMENTOS_HOME.filter((s) => itens.some((item) => item.segmento === s.id)),
    [itens]
  );
  const faixas = opcoesDeFaixa(filtros.segmento);
  const destaqueTemValor = destaque && (destaque.precoMin != null || destaque.parcelaMin != null);

  const atualizar = (chave) => (evento) => onFiltros({ ...filtros, [chave]: evento.target.value });

  useEffect(() => {
    if (fotos.length < 2 || window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches) return undefined;
    const intervalo = window.setInterval(() => setIndice((atual) => (atual + 1) % fotos.length), 8500);
    return () => window.clearInterval(intervalo);
  }, [fotos.length]);

  return (
    <section className="pb-c-hero relative isolate overflow-hidden" aria-labelledby="pb-home-hero-title">
      <div className="mx-auto max-w-7xl px-4 pb-10 pt-8 sm:px-6 lg:pb-14 lg:pt-12">
        <div className="grid items-center gap-8 lg:grid-cols-[.85fr_1.15fr] lg:gap-12">
          <div className="pb-c-hero-copy relative z-10 py-4 lg:py-12">
            <p className="pb-c-overline">
              <span className="inline-block h-[2px] w-6 bg-[#bf8c47]" />
              IMÓVEIS QUE FAZEM SENTIDO PARA VOCÊ
            </p>

            <h1
              id="pb-home-hero-title"
              className="mt-6 max-w-[570px] font-sans text-[clamp(2.65rem,4.35vw,4.25rem)] font-extrabold leading-[1.065] tracking-[-.055em] text-[#0b203b]"
            >
              Encontre seu <span className="text-[#bd8741]">próximo lugar.</span>
            </h1>

            <p className="mt-5 max-w-[470px] text-[15px] leading-7 text-[#526780] sm:text-[17px]">
              Do primeiro apê com parcelas que cabem no bolso ao alto padrão: os lançamentos das melhores construtoras, com quem conhece cada detalhe.
            </p>

            {numeros.empreendimentos > 0 && (
              <ul className="pb-c-numeros mt-6 flex flex-wrap gap-x-6 gap-y-2" aria-label="O catálogo em números">
                <li><strong>{numeros.empreendimentos}</strong> empreendimentos</li>
                {numeros.construtoras > 1 && <li><strong>{numeros.construtoras}</strong> construtoras</li>}
                {numeros.menorParcela != null && <li>parcelas a partir de <strong>R$ {numeros.menorParcela}</strong></li>}
              </ul>
            )}

            <div className="mt-7 flex flex-wrap items-center gap-4">
              <button
                onClick={() => onBuscar()}
                type="button"
                className="pb-c-primary inline-flex min-h-12 items-center gap-2 rounded-full bg-[#0c2846] px-6 text-[13px] font-bold text-white shadow-lg transition-colors hover:bg-[#163c61]"
              >
                Explorar imóveis <Icon name="arrowRight" className="size-4" />
              </button>
              <a href="#acesso-exclusivo" className="text-[13px] font-semibold text-[#9a6a2c] underline-offset-4 hover:underline">
                Ver plantas e tabelas
              </a>
            </div>
          </div>

          <div className="pb-c-hero-visual relative min-w-0">
            <div className="pb-c-photo relative h-[320px] overflow-hidden rounded-[26px] bg-[#1a334f] shadow-[0_25px_65px_-30px_rgba(8,21,43,.46)] sm:h-[440px] lg:h-[500px]">
              {destaque ? (
                <img
                  key={destaque.id}
                  src={destaque.image}
                  alt={`Imagem do empreendimento ${destaque.title}`}
                  loading="eager"
                  fetchPriority="high"
                  decoding="async"
                  onError={() => setComErro((atual) => (atual.includes(destaque.id) ? atual : [...atual, destaque.id]))}
                  className="pb-c-photo-image absolute inset-0 h-full w-full object-cover"
                />
              ) : (
                <div className="grid h-full place-items-center">
                  <Icon name="building" className="size-20 text-[#e9ad5a]/70" />
                </div>
              )}

              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#06162a]/85 via-[#06162a]/10 to-transparent" />

              {destaque && (
                <div className="absolute bottom-5 left-5 right-5 flex flex-wrap items-end justify-between gap-3 text-white sm:bottom-7 sm:left-7 sm:right-7">
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-[.19em] text-[#eec37e]">EM DESTAQUE</p>
                    <h2 className="mt-1 text-lg font-extrabold sm:text-xl">{destaque.title}</h2>
                    <p className="mt-1 text-xs text-white/80">
                      {[destaque.bairro, destaque.city].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    {destaqueTemValor && (
                      <p className="hidden text-right text-[11px] leading-tight text-white/75 sm:block">
                        {destaque.precoRotulo}
                        <strong className="block text-[17px] font-extrabold text-white">{destaque.precoValor}</strong>
                      </p>
                    )}
                    <Link
                      to={`/imoveis/${destaque.id}`}
                      className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/45 bg-white/20 px-5 text-xs font-bold text-white backdrop-blur-md hover:bg-white/30"
                    >
                      Conhecer <Icon name="arrowRight" className="size-4" />
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {fotos.length > 1 && (
              <div className="absolute right-5 top-5 flex gap-1.5 rounded-full bg-[#08152b]/70 p-2 backdrop-blur">
                {fotos.map((foto, posicao) => (
                  <button
                    key={foto.id}
                    type="button"
                    aria-label={`Mostrar ${foto.title}`}
                    aria-current={posicao === indiceAtual ? "true" : undefined}
                    onClick={() => setIndice(posicao)}
                    className={`h-1.5 rounded-full transition-[width,background] duration-300 ${
                      posicao === indiceAtual ? "w-6 bg-[#e9ad5a]" : "w-1.5 bg-white/55 hover:bg-white"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <form
          onSubmit={(evento) => {
            evento.preventDefault();
            onBuscar();
          }}
          aria-label="Encontrar empreendimentos"
          className="pb-c-search mt-7 rounded-[22px] border border-[#d8e1e9] bg-white p-4 shadow-[0_15px_55px_-30px_rgba(13,37,62,.28)] sm:p-5 lg:mt-0 lg:-translate-y-5"
        >
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-[15px] font-bold text-[#102843]">Encontre o imóvel certo</h2>
            <div role="group" aria-label="Perfil do imóvel" className="pb-c-perfis flex max-w-full gap-1 overflow-x-auto rounded-full bg-[#eef3f8] p-1">
              {[{ id: "", curto: "Todos" }, ...segmentosComItens].map((segmento) => {
                const ativo = filtros.segmento === segmento.id;
                return (
                  <button
                    key={segmento.id || "todos"}
                    type="button"
                    aria-pressed={ativo}
                    onClick={() => onFiltros({ ...filtros, segmento: segmento.id, faixa: "" })}
                    className={`shrink-0 rounded-full px-3.5 py-1.5 text-[12px] font-bold transition-colors ${
                      ativo ? "bg-[#0c2846] text-white shadow" : "text-[#40566f] hover:text-[#0c2846]"
                    }`}
                  >
                    {segmento.rotulo ?? segmento.curto}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 items-end gap-3 lg:grid-cols-[1.5fr_.9fr_.9fr_1fr_.75fr_auto]">
            <label className="col-span-2 block min-w-0 lg:col-span-1">
              <span className={rotulo}>Cidade, bairro ou imóvel</span>
              <input
                list="pb-c-sugestoes"
                type="search"
                autoComplete="off"
                value={filtros.texto}
                onChange={atualizar("texto")}
                placeholder="Onde você quer morar?"
                className={campo}
              />
              <datalist id="pb-c-sugestoes">
                {sugestoes.map((sugestao) => <option key={sugestao} value={sugestao} />)}
              </datalist>
            </label>

            <label className="block min-w-0">
              <span className={rotulo}>Situação</span>
              <select value={filtros.tag} onChange={atualizar("tag")} className={campo}>
                <option value="">Todas</option>
                {ETAPAS_HOME.map((etapa) => (
                  <option key={etapa} value={etapa}>{etapa === "Pronto" ? "Pronto para morar" : etapa}</option>
                ))}
              </select>
            </label>

            <label className="block min-w-0">
              <span className={rotulo}>Prazo</span>
              <select value={filtros.prazo} onChange={atualizar("prazo")} className={campo}>
                <option value="">Qualquer</option>
                {PRAZOS_HOME.map((prazo) => <option key={prazo.valor} value={prazo.valor}>{prazo.rotulo}</option>)}
              </select>
            </label>

            <label className="block min-w-0">
              <span className={rotulo}>{filtros.segmento === "mcmv" ? "Parcela" : "Valor"}</span>
              <select value={filtros.faixa} onChange={atualizar("faixa")} className={campo}>
                <option value="">Sem limite</option>
                {faixas.map((faixa) => <option key={faixa.valor} value={faixa.valor}>{faixa.rotulo}</option>)}
              </select>
            </label>

            <label className="block min-w-0">
              <span className={rotulo}>Quartos</span>
              <select value={filtros.quartos} onChange={atualizar("quartos")} className={campo}>
                <option value="">Qualquer</option>
                <option value="1">1+</option>
                <option value="2">2+</option>
                <option value="3">3+</option>
              </select>
            </label>

            <button
              type="submit"
              className="pb-c-primary col-span-2 inline-flex h-12 min-w-28 items-center lg:col-span-1 justify-center gap-2 rounded-xl bg-[#e9ad5a] px-5 text-sm font-bold text-[#08152b] transition-colors hover:bg-[#f3c47a]"
            >
              <Icon name="search" className="size-4" /> Buscar
            </button>
          </div>
        </form>

        {cidades.length > 0 && (
          <div className="pb-c-cities mt-1 flex flex-wrap items-center gap-2 text-[#536881]">
            <span className="text-xs">Populares:</span>
            {cidades.slice(0, 5).map((cidade) => (
              <button
                key={cidade}
                type="button"
                onClick={() => onBuscar({ ...filtros, texto: cidade })}
                className="rounded-full border border-[#cdd8e3] bg-white/80 px-3 py-1.5 text-[12px] hover:border-[#be8b43] hover:text-[#986827]"
              >
                {cidade}
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
