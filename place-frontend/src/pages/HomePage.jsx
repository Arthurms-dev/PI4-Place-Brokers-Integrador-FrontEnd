import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useContato } from "@/components/site/ContatoProvider";
import EmpreendimentoModal from "@/components/site/EmpreendimentoModal";
import AcessoExclusivo from "@/components/site/home/AcessoExclusivo";
import Cidades from "@/components/site/home/Cidades";
import ComoFunciona from "@/components/site/home/ComoFunciona";
import FaixaCTA from "@/components/site/home/FaixaCTA";
import Hero from "@/components/site/home/Hero";
import ListaEmpreendimentos from "@/components/site/home/ListaEmpreendimentos";
import SegmentosVitrine from "@/components/site/home/SegmentosVitrine";
import "@/styles/home.css";

import { useEmpreendimentosPublicos } from "@/data/empreendimentosPublicos";
import { usePageTitle } from "@/hooks/usePageTitle";
import { FILTROS_VAZIOS, PRAZOS_HOME, SEGMENTOS_HOME, filtrarCatalogo, opcoesDeFaixa } from "@/lib/catalogoHome";
import { registrarEvento } from "@/services/eventos";

const irPara = (id) =>
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

export default function HomePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { abrirContato } = useContato();
  const { itens, carregando, origem, erro } = useEmpreendimentosPublicos();
  const [filtros, setFiltros] = useState(FILTROS_VAZIOS);

  const aberto = id ? itens.find((item) => item.id === id) ?? null : null;
  usePageTitle(aberto ? aberto.title : "Lançamentos imobiliários em Pernambuco");

  useEffect(() => {
    registrarEvento({ tipo: "visualizacao_site" });
  }, []);

  useEffect(() => {
    if (id && !carregando && !erro && !aberto) navigate("/", { replace: true });
  }, [id, carregando, erro, aberto, navigate]);

  useEffect(() => {
    const alvo = location.state?.rolar;
    if (!alvo) return undefined;
    const temporizador = window.setTimeout(() => irPara(alvo), 120);
    return () => window.clearTimeout(temporizador);
  }, [location.state]);

  const fechar = useCallback(() => navigate("/"), [navigate]);
  const falar = useCallback(
    (item, canal = "home") => abrirContato(item ? { id: item.id, title: item.title } : null, canal),
    [abrirContato]
  );

  const buscar = useCallback((novos) => {
    if (novos) setFiltros(novos);
    window.setTimeout(() => irPara("lista"), 60);
  }, []);

  const escolherSegmento = useCallback(
    (segmento, rolar = false) => {
      setFiltros((atual) => ({ ...atual, segmento, faixa: "" }));
      if (rolar) window.setTimeout(() => irPara("lista"), 60);
    },
    []
  );

  const destaques = useMemo(
    () => [...itens].sort((a, b) => Number(b.destaque) - Number(a.destaque) || (b.galeria?.length ?? 0) - (a.galeria?.length ?? 0)),
    [itens]
  );

  const sugestoes = useMemo(() => {
    const valores = [
      ...itens.map((item) => item.cidade),
      ...itens.map((item) => item.bairro),
      ...itens.map((item) => item.title),
      ...itens.map((item) => item.construtora),
    ];
    return [...new Set(valores.filter((v) => v && v !== "A confirmar"))];
  }, [itens]);

  const cidades = useMemo(() => {
    const contagem = new Map();
    for (const item of itens) if (item.cidade) contagem.set(item.cidade, (contagem.get(item.cidade) ?? 0) + 1);
    return [...contagem.entries()].sort((a, b) => b[1] - a[1]).map(([cidade]) => cidade);
  }, [itens]);

  const filtrados = useMemo(() => filtrarCatalogo(itens, filtros), [itens, filtros]);

  const chips = [
    filtros.texto && ["texto", `“${filtros.texto}”`],
    filtros.segmento && ["segmento", SEGMENTOS_HOME.find((s) => s.id === filtros.segmento)?.rotulo],
    filtros.tag && ["tag", filtros.tag === "Pronto" ? "Pronto para morar" : filtros.tag],
    filtros.prazo && ["prazo", PRAZOS_HOME.find((p) => p.valor === filtros.prazo)?.rotulo],
    filtros.faixa && ["faixa", opcoesDeFaixa(filtros.segmento).find((o) => o.valor === filtros.faixa)?.rotulo],
    filtros.quartos && ["quartos", `${filtros.quartos}+ quartos`],
  ].filter(Boolean);

  return (
    <main>
      {erro && (
        <p role="alert" className="mx-auto max-w-7xl px-4 py-3 text-sm text-red-300 sm:px-6">
          {erro} Verifique o back-end e tente recarregar a página.
        </p>
      )}
      {origem === "mock" && (
        <p role="status" className="bg-amber-100 px-4 py-2 text-center text-sm font-semibold text-amber-950">
          Modo demonstração: imóveis fictícios.
        </p>
      )}

      <Hero itens={destaques} filtros={filtros} onFiltros={setFiltros} sugestoes={sugestoes} cidades={cidades} onBuscar={buscar} />

      <div className="pb-home-clara">
        <SegmentosVitrine itens={itens} ativo={filtros.segmento} onEscolher={(segmento) => escolherSegmento(segmento, true)} />

        <ListaEmpreendimentos
          itens={filtrados}
          carregando={carregando}
          chips={chips}
          segmento={filtros.segmento}
          segmentosDisponiveis={[...new Set(itens.map((item) => item.segmento).filter(Boolean))]}
          onSegmento={(segmento) => escolherSegmento(segmento)}
          onRemoverChip={(campo) =>
            setFiltros((atual) => ({ ...atual, [campo]: "", ...(campo === "segmento" ? { faixa: "" } : {}) }))
          }
          onLimpar={() => setFiltros(FILTROS_VAZIOS)}
          onFalar={(item) => falar(item, "lista da home")}
        />

        <AcessoExclusivo opcoes={itens} />

        <Cidades itens={itens} ativa={filtros.texto} onEscolher={(cidade) => buscar({ ...filtros, texto: cidade })} />
        <ComoFunciona />
        <FaixaCTA onFalar={(item) => falar(item, "chamada final da home")} />
      </div>

      {aberto && <EmpreendimentoModal key={aberto.id} item={aberto} onClose={fechar} />}
    </main>
  );
}
