import { useEffect, useMemo } from "react";
import { useContato } from "@/components/site/ContatoProvider";
import FormularioVenda from "@/components/site/FormularioVenda";
import Reveal from "@/components/site/Reveal";
import { CartaoImovel } from "@/components/site/home/ListaEmpreendimentos";
import { Icon } from "@/components/ui/Icon";
import { useEmpreendimentosPublicos } from "@/data/empreendimentosPublicos";
import { usePageTitle } from "@/hooks/usePageTitle";
import { aplicarMeta, metaPadrao, NOME_SITE } from "@/lib/seo";
import { BUSCA_PRONTOS_E_USADOS, CANAL_PRONTOS_E_USADOS } from "@/lib/prontosEUsados";
import "@/styles/home.css";

const PASSOS_VENDA = [
  ["list", "Você conta como é o imóvel", "Tipo, bairro, tamanho e quanto quer. Leva 1 minuto."],
  ["phone", "Um corretor liga", "Combina a visita e faz a avaliação com base no que está sendo vendido na região."],
  ["star", "A Place prepara o anúncio", "Fotos, descrição e o imóvel aqui no site, com o nosso time oferecendo aos clientes."],
  ["home", "Venda com segurança", "Acompanhamos a proposta, a documentação e o financiamento do comprador até as chaves."],
];

export default function ProntosPage() {
  usePageTitle("Prontos e seminovos");
  const { abrirContato } = useContato();
  const { itens, carregando } = useEmpreendimentosPublicos();
  const prontos = useMemo(() => itens.filter((item) => item.tag === "Pronto"), [itens]);

  useEffect(() => {
    const base = window.location.origin;
    aplicarMeta({
      titulo: `Imóveis prontos e seminovos | ${NOME_SITE}`,
      descricao: "Imóveis prontos para morar e seminovos com a Place Brokers. Quer vender o seu? Cadastre e um corretor faz a avaliação sem compromisso.",
      imagem: `${base}/icone-512.png`,
      url: `${base}/prontos`,
    });
    return () => aplicarMeta(metaPadrao(base, "/"));
  }, []);

  const pedirBusca = () => abrirContato(BUSCA_PRONTOS_E_USADOS, CANAL_PRONTOS_E_USADOS);
  const irParaVenda = () => document.getElementById("vender")?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <main>
      <section className="mx-auto max-w-7xl px-4 pb-10 pt-12 sm:px-6 sm:pt-20">
        <Reveal>
          <p className="text-[12px] font-medium uppercase tracking-[0.22em] text-gold">Prontos e seminovos</p>
        </Reveal>
        <Reveal atraso={90}>
          <h1 className="mt-3 max-w-3xl text-4xl font-semibold leading-tight sm:text-5xl">
            Mude agora ou <span className="pb-texto-ouro">venda o seu</span> com a Place
          </h1>
        </Reveal>
        <Reveal atraso={180}>
          <p className="mt-4 max-w-2xl text-[16px] leading-relaxed text-ink-2">
            Imóveis prontos para morar, sem esperar obra, e seminovos selecionados pelo nosso time. Tem um imóvel para vender? Cadastre aqui e um corretor faz a avaliação.
          </p>
        </Reveal>
        <Reveal atraso={260}>
          <div className="mt-7 flex flex-wrap gap-3">
            <a href="#portfolio" className="inline-flex h-13 items-center gap-2 rounded-full bg-gold-gradient px-6 text-[15px] font-semibold text-[#1a1408] transition hover:-translate-y-0.5 hover:brightness-110">
              <Icon name="building" className="size-5" /> Ver imóveis prontos
            </a>
            <button type="button" onClick={irParaVenda} className="inline-flex h-13 items-center gap-2 rounded-full border border-gold/60 px-6 text-[15px] font-semibold text-gold transition hover:-translate-y-0.5 hover:bg-gold/10">
              <Icon name="home" className="size-5" /> Quero vender meu imóvel
            </button>
          </div>
        </Reveal>
      </section>

      <div className="pb-home-clara">
        <section id="portfolio" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-12 sm:px-6">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold text-[#0b203b] sm:text-3xl">Prontos para morar</h2>
              <p className="mt-1 text-[14px] text-[#4a5d74]">
                {carregando ? "Carregando imóveis..." : `${prontos.length} ${prontos.length === 1 ? "imóvel disponível" : "imóveis disponíveis"} agora, com corretor da Place.`}
              </p>
            </div>
          </div>

          {carregando ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
              {[0, 1, 2].map((i) => <div key={i} className="h-80 animate-pulse rounded-[22px] bg-[#e6ecf2]" />)}
            </div>
          ) : prontos.length ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {prontos.map((p, i) => (
                <CartaoImovel key={p.id} p={p} i={i} onFalar={(item) => abrirContato({ id: item.id, title: item.title, segmento: item.segmento, tag: item.tag }, "página prontos")} />
              ))}
            </div>
          ) : (
            <p className="rounded-2xl border border-dashed border-[#c99041] bg-[#fff8ee] px-4 py-6 text-center text-[14px] text-[#3b4f68]">
              Nenhum pronto no momento. Peça uma busca e um corretor procura para você.
            </p>
          )}

          <p className="mt-6 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 rounded-2xl border border-dashed border-[#c99041] bg-[#fff8ee] px-4 py-3 text-center text-[14px] text-[#3b4f68]">
            Procura algo específico? A Place também busca prontos e usados com as imobiliárias parceiras.
            <button type="button" onClick={pedirBusca} className="min-h-11 rounded-full bg-[#0b203b] px-5 text-[13px] font-bold text-white transition hover:bg-[#13315a]">
              Pedir uma busca
            </button>
          </p>
        </section>
      </div>

      <section id="vender" className="mx-auto grid max-w-7xl scroll-mt-24 gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_1.1fr]">
        <div>
          <p className="text-[12px] font-medium uppercase tracking-[0.22em] text-gold">Venda com a Place</p>
          <h2 className="mt-3 text-3xl font-semibold leading-tight sm:text-4xl">Quer vender o seu imóvel?</h2>
          <p className="mt-3 text-[15px] leading-relaxed text-ink-2">
            Prontos e seminovos em Recife, na Região Metropolitana, em Caruaru e no litoral. Nosso time já atende quem procura imóvel todos os dias.
          </p>
          <ol className="mt-7 space-y-4">
            {PASSOS_VENDA.map(([icone, titulo, texto], i) => (
              <Reveal key={titulo} atraso={i * 80}>
                <li className="flex gap-4">
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-gold/15 text-gold"><Icon name={icone} className="size-5" /></span>
                  <div>
                    <h3 className="text-[15px] font-semibold">{i + 1}. {titulo}</h3>
                    <p className="mt-0.5 text-[14px] leading-relaxed text-ink-2">{texto}</p>
                  </div>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
        <Reveal atraso={120}>
          <div className="rounded-3xl border border-line bg-card p-5 shadow-2xl sm:p-7">
            <h3 className="font-display text-xl font-semibold">Cadastre o seu imóvel</h3>
            <p className="mb-5 mt-1 text-[13px] text-ink-2">Avaliação sem custo. Um corretor da Place entra em contato.</p>
            <FormularioVenda />
          </div>
        </Reveal>
      </section>
    </main>
  );
}
