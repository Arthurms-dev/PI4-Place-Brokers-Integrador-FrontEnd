import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Icon } from "@/components/ui/Icon";
import { useContato } from "@/components/site/ContatoProvider";
import EmpreendimentoModal from "@/components/site/EmpreendimentoModal";
import Reveal from "@/components/site/Reveal";
import Cidades from "@/components/site/home/Cidades";
import ComoFunciona from "@/components/site/home/ComoFunciona";
import Destaques from "@/components/site/home/Destaques";
import FaixaCTA from "@/components/site/home/FaixaCTA";
import HeroB from "@/components/site/home/HeroB";
import ListaEmpreendimentosB from "@/components/site/home/ListaEmpreendimentosB";
import ExplorarB from "@/components/site/home/ExplorarB";
import "@/styles/homeB.css";
import "@/styles/placeIdentityV2.css";
import "@/styles/placeHomeC.css";
import { useEmpreendimentosPublicos } from "@/data/empreendimentosPublicos";
import { usePageTitle } from "@/hooks/usePageTitle";
import { registrarEvento } from "@/services/eventos";

const norm = (s = "") => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
const irPara = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
const VAZIO = { texto: "", tag: "", quartos: "", precoAte: "" };

const CONFIANCA = [
  ["messageCircle", "Especialistas em lançamentos", "Atendimento do primeiro contato às chaves"],
  ["building", "Condições de lançamento", "Valores e tabelas sempre atualizados"],
  ["book", "Detalhes com um especialista", "Conheça plantas e condições com acompanhamento profissional"],
];

export default function HomePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { abrirContato } = useContato();
  const { itens, carregando, origem, erro } = useEmpreendimentosPublicos();
  const [filtros, setFiltros] = useState(VAZIO);

  const aberto = id ? itens.find((p) => p.id === id) ?? null : null;
  usePageTitle(aberto ? aberto.title : "Lançamentos imobiliários em Pernambuco");

  useEffect(() => {
    registrarEvento({ tipo: "visualizacao_site" });
  }, []);
  useEffect(() => {
    if (id && !carregando && !aberto) navigate("/", { replace: true });
  }, [id, carregando, aberto, navigate]);
  useEffect(() => {
    const alvo = location.state?.rolar;
    if (alvo) setTimeout(() => irPara(alvo), 120);
  }, [location.state]);

  const fechar = useCallback(() => navigate("/"), [navigate]);
  const falar = useCallback((p, canal = "home") => abrirContato(p ? { id: p.id, title: p.title } : null, canal), [abrirContato]);
  const buscar = useCallback((novos) => {
    if (novos) setFiltros(novos);
    setTimeout(() => irPara("lista"), 60);
  }, []);

  const { tags, sugestoes, cidades } = useMemo(() => {
    const porCidade = new Map();
    for (const p of itens) porCidade.set(p.cidade, (porCidade.get(p.cidade) ?? 0) + 1);
    const cs = [...porCidade.entries()].sort((a, b) => b[1] - a[1]).map(([c]) => c);
    return {
      tags: [...new Set(itens.map((p) => p.tag))],
      cidades: cs,
      sugestoes: [...new Set([...cs, ...itens.map((p) => p.title), ...itens.map((p) => p.bairro).filter(Boolean)])],
    };
  }, [itens]);

  const filtrados = useMemo(() => {
    const q = norm(filtros.texto.trim());
    return itens.filter(
      (p) =>
        (!q || norm(`${p.title} ${p.cidade} ${p.bairro} ${p.city}`).includes(q)) &&
        (!filtros.tag || p.tag === filtros.tag) &&
        (!filtros.quartos || (p.quartosMax ?? 0) >= Number(filtros.quartos)) &&
        (!filtros.precoAte || (p.precoMin != null && p.precoMin <= Number(filtros.precoAte))),
    );
  }, [itens, filtros]);

  const chips = [
    filtros.texto && ["texto", `“${filtros.texto}”`],
    filtros.tag && ["tag", filtros.tag],
    filtros.quartos && ["quartos", `${filtros.quartos}+ quartos`],
    filtros.precoAte && ["precoAte", `Até ${Number(filtros.precoAte).toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })}`],
  ].filter(Boolean);
  const filtrando = chips.length > 0;

  return (
    <main>
      {erro && <p role="alert" className="mx-auto max-w-7xl px-4 py-3 text-sm text-red-300 sm:px-6">{erro} Verifique o back-end e tente recarregar a página.</p>}
      {origem === 'mock' && <p role="status" className="bg-amber-100 px-4 py-2 text-center text-sm font-semibold text-amber-950">Modo demonstração: imóveis fictícios.</p>}
      <HeroB itens={[...itens].sort((a, b) => Number(b.destaque) - Number(a.destaque))} filtros={filtros} onFiltros={setFiltros} tags={tags} sugestoes={sugestoes} cidades={cidades} onBuscar={buscar} />

      <div className="pb-home-clara">

      <section aria-label="Por que a Place Brokers" className="pb-trust-strip border-y border-line-soft bg-side/60">
        <ul className="mx-auto grid max-w-7xl gap-px px-4 sm:grid-cols-3 sm:px-6">
          {CONFIANCA.map(([icone, titulo, texto], i) => (
            <Reveal key={titulo} atraso={i * 90}>
              <li className="flex items-center gap-4 py-5 sm:px-4">
                <span className="grid size-11 shrink-0 place-items-center rounded-full bg-gold/15 text-gold"><Icon name={icone} className="size-5" /></span>
                <div>
                  <p className="text-[14px] font-semibold">{titulo}</p>
                  <p className="text-[12px] text-ink-3">{texto}</p>
                </div>
              </li>
            </Reveal>
          ))}
        </ul>
      </section>

      <ExplorarB itens={itens} onEscolher={(novos) => buscar({ ...VAZIO, ...novos })} />

      <ListaEmpreendimentosB itens={filtrados} carregando={carregando} chips={chips} onRemoverChip={(campo) => setFiltros((f) => ({ ...f, [campo]: "" }))} onLimpar={() => setFiltros(VAZIO)} onFalar={(p) => falar(p, "lista da home")} />
      <Cidades itens={itens} ativa={filtros.texto} onEscolher={(c) => buscar({ ...filtros, texto: c })} />
      <ComoFunciona />
      <FaixaCTA onFalar={(p) => falar(p, "chamada final da home")} />
      </div>

      {aberto && <EmpreendimentoModal key={aberto.id} item={aberto} onClose={fechar} />}
    </main>
  );
}
