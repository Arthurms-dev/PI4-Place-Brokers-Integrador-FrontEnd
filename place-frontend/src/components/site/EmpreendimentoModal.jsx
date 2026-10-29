import "@/styles/empreendimentoDetalhe.css";
import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { buscarEmpreendimentoPorId, formatarFaixa } from "@/services/empreendimentos";
import { registrarEvento } from "@/services/eventos";
import { BotaoFavorito } from "./favoritos";
import FormularioContato from "./FormularioContato";
import GaleriaImovelPremium from "./GaleriaImovelPremium";
import { prepararImagensPublicas } from "@/lib/imagensPublicas";
import { useContato } from "./ContatoProvider";
import { Etiquetas } from "./home/pecas";
import TipologiasPublicas from "./TipologiasPublicas";
import { useAcessoExclusivo } from "@/hooks/useAcessoExclusivo";
import { FOTOS_LIVRES, prazoCurto } from "@/lib/catalogoHome";
import { AVISO_APROXIMADA, linkGoogleMaps } from "@/lib/localizacao";

function ConteudoExclusivo({ fotosOcultas, plantas, onLiberar }) {
  const itens = [
    fotosOcultas > 0 && `+${fotosOcultas} fotos exclusivas`,
    plantas > 0 ? `${plantas} ${plantas === 1 ? "planta" : "plantas"} e implantação` : "Plantas e implantação",
    "Tabela de preços do mês",
  ].filter(Boolean);
  return (
    <div className="pb-d-bloqueio relative overflow-hidden rounded-2xl border border-[#e9ad5a]/50 p-5 sm:p-6">
      <div className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-[#e9ad5a]/15 blur-2xl" aria-hidden="true" />
      <p className="text-[11px] font-extrabold uppercase tracking-[.14em] text-[#b07a35]">Material exclusivo</p>
      <h2 className="mt-1 text-xl font-extrabold tracking-tight">Veja o empreendimento por completo</h2>
      <ul className="mt-3 flex flex-wrap gap-2">
        {itens.map((texto) => (
          <li key={texto} className="inline-flex items-center gap-1.5 rounded-full border border-line bg-card px-3 py-1.5 text-[12.5px] font-semibold">
            <span aria-hidden="true">🔒</span> {texto}
          </li>
        ))}
      </ul>
      <button type="button" onClick={onLiberar} className="mt-4 inline-flex min-h-12 items-center gap-2 rounded-xl bg-gold-gradient px-5 text-sm font-extrabold text-[#1a1408] transition hover:brightness-110">
        Liberar acesso gratuito <Icon name="arrowRight" className="size-4" />
      </button>
      <p className="mt-2 text-[11.5px] text-ink-3">Cadastro rápido. Um especialista envia a tabela atualizada no seu WhatsApp.</p>
    </div>
  );
}

const MiniMapa = lazy(() => import("./MiniMapa"));
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default function EmpreendimentoModal({ item, onClose }) {
  const { abrirContato } = useContato();
  const [det, setDet] = useState(null);
  const [erroDetalhes, setErroDetalhes] = useState("");

  useEffect(() => {
    const aoTeclar = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", aoTeclar);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", aoTeclar);
      document.body.style.overflow = overflow;
    };
  }, [onClose]);

  useEffect(() => {
    if (item.origem !== "api") return undefined;
    let ativo = true;
    setErroDetalhes("");
    buscarEmpreendimentoPorId(item.id)
      .then((dados) => { if (ativo) setDet(dados); })
      .catch(() => {
        if (ativo) setErroDetalhes("Não foi possível consultar os detalhes atualizados. Exibindo as informações do catálogo.");
      });
    if (UUID.test(item.id)) registrarEvento({ tipo: "visualizacao_empreendimento", empreendimentoId: item.id });
    return () => {
      ativo = false;
    };
  }, [item]);

  const liberado = useAcessoExclusivo();
  // A capa já aparece no card; a galeria começa por outra foto e a capa vai para o fim.
  const todasImagens = useMemo(() => {
    const galeria = prepararImagensPublicas({ galeria: item.galeria, imagens: det?.imagens, titulo: item.title });
    const capa = prepararImagensPublicas({ capa: item.image, titulo: item.title });
    return [...galeria, ...capa.filter((c) => !galeria.some((g) => g.src === c.src))];
  }, [item, det]);
  const imagens = liberado ? todasImagens : todasImagens.slice(0, FOTOS_LIVRES);
  const fotosOcultas = todasImagens.length - imagens.length;
  const plantas = det?.tipologias ?? item.tipologias ?? [];

  const lat = det?.latitude ?? item.lat;
  const lng = det?.longitude ?? item.lng;
  const aproximada = det ? Boolean(det.localizacao_aproximada) : Boolean(item.localAproximado);
  const lazer = det?.lazer?.length ? det.lazer : item.lazer;
  const descricao = det?.descricao ?? item.description;
  const vagas = det ? formatarFaixa(det.vagas_min, det.vagas_max, "vaga", "vagas") : item.vagasTexto;
  const dados = [
    ["Quartos", item.quartosTexto],
    ["Suítes", item.suitesTexto],
    ["Tipo", item.tipoTexto],
    ["Garagem", vagas],
    ["Metragem", item.area],
    ["Prazo", prazoCurto(item)],
  ].filter(([, valor]) => valor);
  const sobre = { id: item.id, title: item.title };

  return (
    <div className="animate-fade-in fixed inset-0 z-[55] overflow-x-hidden bg-black/75 sm:flex sm:items-center sm:justify-center sm:p-6" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div role="dialog" aria-modal="true" aria-label={item.title} className="pb-detalhe animate-slide-up sm:animate-fade-up flex h-full min-w-0 w-full max-w-full flex-col overflow-x-hidden bg-page sm:h-auto sm:max-h-[94dvh] sm:max-w-6xl sm:rounded-3xl sm:border sm:border-line">
        <div className="flex items-center justify-between gap-3 border-b border-line-soft px-4 py-3">
          <button type="button" onClick={onClose} className="inline-flex h-11 items-center gap-2 rounded-full border border-line px-5 text-sm font-medium transition-colors hover:border-gold">
            <Icon name="chevronLeft" className="size-5" /> Voltar
          </button>
          <BotaoFavorito id={item.id} titulo={item.title} className="border border-line" />
        </div>

        <div className="min-w-0 flex-1 overflow-x-hidden overflow-y-auto pb-24 sm:pb-6">
          <div className="grid min-w-0 grid-cols-1 gap-6 sm:p-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
            <div className="space-y-6">
              {erroDetalhes && <p role="status" className="mx-4 rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-ink-2 sm:mx-0">{erroDetalhes}</p>}
              <GaleriaImovelPremium imagens={imagens} titulo={item.title} />

              <div className="space-y-6 px-4 sm:px-0">
                <div className="space-y-3">
                  <Etiquetas p={item} comSegmento />
                  <h1 className="text-3xl font-semibold sm:text-4xl">{item.title}</h1>
                  <p className="flex items-center gap-1.5 text-[14px] text-ink-2"><Icon name="mapPin" className="size-4 text-gold" /> {item.bairro ? `${item.bairro} · ` : ""}{item.city}{item.construtora ? ` · ${item.construtora}` : ""}</p>
                </div>

                {!item.disponivel && (
                  <p className="rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-ink-2">Unidades esgotadas neste lançamento. Fale com um especialista para conhecer opções parecidas.</p>
                )}

                {dados.length > 0 && (
                  <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {dados.map(([rotulo, valor]) => (
                      <div key={rotulo} className="rounded-xl border border-line-soft bg-card-2 p-3">
                        <dt className="text-[12px] text-ink-3">{rotulo}</dt>
                        <dd className="mt-0.5 text-[14px] font-semibold leading-snug">{valor}</dd>
                      </div>
                    ))}
                  </dl>
                )}
                <p className="px-4 text-xs leading-relaxed text-ink-3 sm:px-0">As informações descrevem o empreendimento; tipologia, condições e disponibilidade variam conforme a unidade. Confirme com um especialista.</p>

                {descricao && <p className="text-[15px] leading-relaxed text-ink-2">{descricao}</p>}
                {liberado
                  ? <TipologiasPublicas tipologias={plantas} />
                  : <ConteudoExclusivo fotosOcultas={fotosOcultas} plantas={plantas.length} onLiberar={() => abrirContato(sobre, "material exclusivo do empreendimento")} />}
                {lazer?.length > 0 && (
                  <div>
                    <h2 className="mb-2 text-[13px] font-semibold uppercase tracking-wide text-gold">Lazer e diferenciais</h2>
                    <div className="flex flex-wrap gap-2">{lazer.map((l) => <span key={l} className="rounded-full border border-line px-3 py-1.5 text-[13px] text-ink-2">{l}</span>)}</div>
                  </div>
                )}

                {lat != null && lng != null && (
                  <div className="space-y-3">
                    <h2 className="text-[13px] font-semibold uppercase tracking-wide text-gold">Localização</h2>
                    <div className="h-60 overflow-hidden rounded-2xl border border-line sm:h-72">
                      <Suspense fallback={<div className="grid size-full place-items-center text-sm text-ink-3">Carregando mapa…</div>}>
                        <MiniMapa lat={lat} lng={lng} />
                      </Suspense>
                    </div>
                    {aproximada && <p className="text-[12px] text-ink-3">{AVISO_APROXIMADA}</p>}
                    <a href={linkGoogleMaps({ nome: item.title, endereco: det?.endereco, bairro: item.bairro, cidade: item.cidade, uf: det?.uf ?? item.uf, latitude: lat, longitude: lng, aproximada })} target="_blank" rel="noreferrer" className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-line text-sm font-medium transition-colors hover:border-gold sm:w-auto sm:px-6">
                      <Icon name="mapPin" className="size-4 text-gold" /> Ver no Google Maps
                    </a>
                  </div>
                )}
              </div>
            </div>

            <aside className="pb-detalhe-lateral hidden lg:block">
              <div className="sticky top-0 space-y-4 rounded-2xl border border-gold/40 bg-card p-6 shadow-xl shadow-black/30">
                <div>
                  <p className="text-[12px] uppercase tracking-wide text-ink-3">{item.precoRotulo}</p>
                  <p className="text-3xl font-semibold text-gold">{item.precoValor}</p>
                  {prazoCurto(item) && <p className="mt-1 text-[13px] text-ink-2">Prazo: <strong className="text-ink">{prazoCurto(item)}</strong></p>}
                </div>
                <div className="hairline-gold" />
                <h2 className="text-lg font-semibold">Fale com um especialista</h2>
                <FormularioContato empreendimento={sobre} canal="detalhe do empreendimento" />
              </div>
            </aside>
          </div>
        </div>

        <div className="flex items-center gap-3 border-t border-line-soft bg-page/95 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur lg:hidden">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] uppercase tracking-wide text-ink-3">{item.precoRotulo}</p>
            <p className="truncate text-lg font-semibold text-gold">{item.precoValor}</p>
          </div>
          <button type="button" onClick={() => abrirContato(sobre, "detalhe do empreendimento")} className="min-h-12 min-w-0 shrink-0 rounded-xl bg-gold-gradient px-4 text-sm font-semibold text-[#1a1408] sm:px-6"><span className="sm:hidden">Falar agora</span><span className="hidden sm:inline">Falar com especialista</span></button>
        </div>
      </div>
    </div>
  );
}
