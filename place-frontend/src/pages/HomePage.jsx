import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Icon } from "@/components/ui/Icon";
import { useContato } from "@/components/site/ContatoProvider";
import EmpreendimentoModal from "@/components/site/EmpreendimentoModal";
import Reveal from "@/components/site/Reveal";
import Cidades from "@/components/site/home/Cidades";
import ComoFunciona from "@/components/site/home/ComoFunciona";
import ExplorarRegioes from "@/components/site/home/ExplorarRegioes";
import FaixaCTA from "@/components/site/home/FaixaCTA";
import Hero from "@/components/site/home/Hero";
import ListaEmpreendimentos from "@/components/site/home/ListaEmpreendimentos";
import "@/styles/home.css";


import { useEmpreendimentosPublicos } from "@/data/empreendimentosPublicos";
import { usePageTitle } from "@/hooks/usePageTitle";
import { registrarEvento } from "@/services/eventos";

const normalizarTexto = (texto = "") =>
  texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

const irPara = (id) =>
  document.getElementById(id)?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });

const FILTROS_VAZIOS = { texto: "", tag: "", quartos: "", precoAte: "" };

const CONFIANCA = [
  ["messageCircle", "Especialistas em lançamentos", "Atendimento do primeiro contato às chaves"],
  ["building", "Condições de lançamento", "Consulte valores e condições com nossa equipe"],
  ["book", "Detalhes com um especialista", "Conheça plantas e condições com acompanhamento profissional"],
];

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
    if (id && !carregando && !erro && !aberto) {
      navigate("/", { replace: true });
    }
  }, [id, carregando, erro, aberto, navigate]);

  useEffect(() => {
    const alvo = location.state?.rolar;
    if (!alvo) return undefined;

    const temporizador = window.setTimeout(() => irPara(alvo), 120);
    return () => window.clearTimeout(temporizador);
  }, [location.state]);

  const fechar = useCallback(() => navigate("/"), [navigate]);

  const falar = useCallback(
    (item, canal = "home") =>
      abrirContato(item ? { id: item.id, title: item.title } : null, canal),
    [abrirContato]
  );

  const buscar = useCallback((novos) => {
    if (novos) setFiltros(novos);
    window.setTimeout(() => irPara("lista"), 60);
  }, []);

  const { tags, sugestoes, cidades } = useMemo(() => {
    const porCidade = new Map();

    for (const item of itens) {
      if (item.cidade) {
        porCidade.set(item.cidade, (porCidade.get(item.cidade) ?? 0) + 1);
      }
    }

    const cidadesOrdenadas = [...porCidade.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([cidade]) => cidade);

    return {
      tags: [...new Set(itens.map((item) => item.tag).filter(Boolean))],
      cidades: cidadesOrdenadas,
      sugestoes: [...new Set([
        ...cidadesOrdenadas,
        ...itens.map((item) => item.title),
        ...itens.map((item) => item.bairro),
      ].filter(Boolean))],
    };
  }, [itens]);

  const filtrados = useMemo(() => {
    const consulta = normalizarTexto(filtros.texto.trim());

    return itens.filter((item) =>
      (!consulta || normalizarTexto(
        `${item.title} ${item.cidade} ${item.bairro} ${item.city}`
      ).includes(consulta)) &&
      (!filtros.tag || item.tag === filtros.tag) &&
      (!filtros.quartos || (item.quartosMax ?? 0) >= Number(filtros.quartos)) &&
      (!filtros.precoAte || (
        item.precoMin != null && item.precoMin <= Number(filtros.precoAte)
      ))
    );
  }, [itens, filtros]);

  const chips = [
    filtros.texto && ["texto", `“${filtros.texto}”`],
    filtros.tag && ["tag", filtros.tag],
    filtros.quartos && ["quartos", `${filtros.quartos}+ quartos`],
    filtros.precoAte && [
      "precoAte",
      `Até ${Number(filtros.precoAte).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
        maximumFractionDigits: 0,
      })}`,
    ],
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

      <Hero
        itens={[...itens].sort((a, b) => Number(b.destaque) - Number(a.destaque))}
        filtros={filtros}
        onFiltros={setFiltros}
        tags={tags}
        sugestoes={sugestoes}
        cidades={cidades}
        onBuscar={buscar}
      />

      <div className="pb-home-clara">
        <section aria-label="Por que a Place Brokers" className="pb-trust-strip border-y border-line-soft bg-side/60">
          <ul className="mx-auto grid max-w-7xl gap-px px-4 sm:grid-cols-3 sm:px-6">
            {CONFIANCA.map(([icone, titulo, texto], indice) => (
              <li key={titulo}>
                <Reveal atraso={indice * 90} className="flex items-center gap-4 py-5 sm:px-4">
                  <span className="grid size-11 shrink-0 place-items-center rounded-full bg-gold/15 text-gold">
                    <Icon name={icone} className="size-5" />
                  </span>
                  <div>
                    <p className="text-[14px] font-semibold">{titulo}</p>
                    <p className="text-[12px] text-ink-3">{texto}</p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ul>
        </section>

        <ExplorarRegioes
          itens={itens}
          onEscolher={(novos) => buscar({ ...FILTROS_VAZIOS, ...novos })}
        />

        <ListaEmpreendimentos
          itens={filtrados}
          carregando={carregando}
          chips={chips}
          onRemoverChip={(campo) =>
            setFiltros((atual) => ({ ...atual, [campo]: "" }))
          }
          onLimpar={() => setFiltros(FILTROS_VAZIOS)}
          onFalar={(item) => falar(item, "lista da home")}
        />

        <Cidades
          itens={itens}
          ativa={filtros.texto}
          onEscolher={(cidade) => buscar({ ...filtros, texto: cidade })}
        />
        <ComoFunciona />
        <FaixaCTA onFalar={(item) => falar(item, "chamada final da home")} />
      </div>

      {aberto && (
        <EmpreendimentoModal key={aberto.id} item={aberto} onClose={fechar} />
      )}
    </main>
  );
}
