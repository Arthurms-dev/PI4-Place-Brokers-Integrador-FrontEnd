import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import {
  DEPOIMENTOS,
  DESTAQUES,
  MAPA_GOOGLE,
  NUMEROS_DA_PLACE,
  PERFIL_INSTAGRAM,
  PREMIACOES,
  SONHOS_REALIZADOS,
  VIDEOS_DO_INSTAGRAM,
  linkDoVideo,
} from "@/lib/provaSocial";
import caruaru from "@/assets/instagram/caruaru.webp";
import clienteChavePlace from "@/assets/instagram/cliente-chave-place.webp";
import clienteEVenda from "@/assets/instagram/cliente-e-venda.webp";
import clienteEmilyMateus from "@/assets/instagram/cliente-emily-mateus.webp";
import clienteFamiliaContrato from "@/assets/instagram/cliente-familia-contrato.webp";
import clienteJangaGarden from "@/assets/instagram/cliente-janga-garden.webp";
import clienteSonhoRealizado from "@/assets/instagram/cliente-sonho-realizado.webp";
import maquinaDeVendas from "@/assets/instagram/maquina-de-vendas.webp";
import papoDeImovel from "@/assets/instagram/papo-de-imovel.webp";
import pedidoEspecial from "@/assets/instagram/pedido-especial.webp";
import pertoDoMar from "@/assets/instagram/perto-do-mar.webp";
import premioBoraAbril2025 from "@/assets/instagram/premio-bora-abril-2025.webp";
import premioCarrilhoAbril2025 from "@/assets/instagram/premio-carrilho-abril-2025.webp";
import premioCarrilhoMelhores2025 from "@/assets/instagram/premio-carrilho-melhores-2025.webp";
import premioMaxplural2024 from "@/assets/instagram/premio-maxplural-2024.webp";
import timeMetaDoMes from "@/assets/instagram/time-meta-do-mes.webp";
import Reveal from "../Reveal";

// Imagens salvas no próprio site: sem script do Instagram (que põe cookies de terceiros) e sem link que expira.
const IMAGENS = {
  caruaru,
  "cliente-chave-place": clienteChavePlace,
  "cliente-e-venda": clienteEVenda,
  "cliente-emily-mateus": clienteEmilyMateus,
  "cliente-familia-contrato": clienteFamiliaContrato,
  "cliente-janga-garden": clienteJangaGarden,
  "cliente-sonho-realizado": clienteSonhoRealizado,
  "maquina-de-vendas": maquinaDeVendas,
  "papo-de-imovel": papoDeImovel,
  "pedido-especial": pedidoEspecial,
  "perto-do-mar": pertoDoMar,
  "premio-bora-abril-2025": premioBoraAbril2025,
  "premio-carrilho-abril-2025": premioCarrilhoAbril2025,
  "premio-carrilho-melhores-2025": premioCarrilhoMelhores2025,
  "premio-maxplural-2024": premioMaxplural2024,
  "time-meta-do-mes": timeMetaDoMes,
};

const TEMAS = {
  claro: {
    caixa: "border-[#dfe7f0] bg-white shadow-sm", hover: "hover:border-[#d6af78]",
    valor: "text-[#0b203b]", rotulo: "text-[#5d7088]", titulo: "text-[#0b203b]", texto: "text-[#516783]", link: "text-[#8a5d22]",
  },
  escuro: {
    caixa: "border-line bg-card", hover: "hover:border-gold/60",
    valor: "text-ink", rotulo: "text-ink-2", titulo: "text-ink", texto: "text-ink-2", link: "text-gold",
  },
};
const temaDe = (tema) => TEMAS[tema] ?? TEMAS.claro;

function LinkMais({ href, children, tema }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className={`inline-flex min-h-11 items-center gap-1.5 text-[14px] font-semibold underline-offset-4 hover:underline ${temaDe(tema).link}`}>
      {children} <Icon name="arrowRight" className="size-4" />
    </a>
  );
}

const NUMERO = /^(\D*)(\d+(?:,\d+)?)(\D*)$/;

/** Conta de 0 até o valor quando aparece na tela (o texto real fica para leitor de tela e sem JavaScript). */
function Contador({ valor }) {
  const ref = useRef(null);
  const [texto, setTexto] = useState(valor);
  useEffect(() => {
    const m = NUMERO.exec(valor);
    const el = ref.current;
    const semMovimento = typeof window === "undefined" || window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (!m || !el || semMovimento || typeof IntersectionObserver === "undefined") return undefined;
    const alvo = Number(m[2].replace(",", "."));
    const casas = (m[2].split(",")[1] ?? "").length;
    let quadro = 0;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const inicio = performance.now();
      const passo = (agora) => {
        const p = Math.min(1, (agora - inicio) / 1400);
        const v = alvo * (1 - (1 - p) ** 3);
        setTexto(`${m[1]}${v.toFixed(casas).replace(".", ",")}${m[3]}`);
        if (p < 1) quadro = requestAnimationFrame(passo);
      };
      quadro = requestAnimationFrame(passo);
    }, { threshold: 0.5 });
    io.observe(el);
    return () => { io.disconnect(); cancelAnimationFrame(quadro); };
  }, [valor]);
  return (
    <span ref={ref}>
      <span aria-hidden="true" className="tabular-nums">{texto}</span>
      <span className="sr-only">{valor}</span>
    </span>
  );
}

/** Números reais da Place (vendas, nota no Google, Instagram e CRECI). */
export function NumerosDaPlace({ className = "", tema = "claro" }) {
  const t = temaDe(tema);
  return (
    <ul className={`grid grid-cols-2 gap-2.5 ${className}`} aria-label="A Place Brokers em números">
      {NUMEROS_DA_PLACE.map((n) => {
        const conteudo = (
          <>
            <strong className={`flex items-center gap-1.5 text-[19px] font-extrabold leading-tight tracking-tight sm:text-[22px] ${t.valor}`}>
              {n.contar ? <Contador valor={n.valor} /> : n.valor}
              {n.estrela && <Icon name="star" className="size-4.5 fill-[#e9ad5a] text-[#e9ad5a]" />}
            </strong>
            <span className={`mt-0.5 block text-[12px] leading-snug ${t.rotulo}`}>{n.rotulo}</span>
          </>
        );
        const caixa = `block h-full rounded-2xl border p-3.5 sm:p-4 ${t.caixa}`;
        return (
          <li key={n.id}>
            {n.link ? (
              <a href={n.link} target="_blank" rel="noreferrer" className={`${caixa} ${t.hover} transition hover:-translate-y-0.5 hover:shadow-md`}>
                {conteudo}
              </a>
            ) : (
              <div className={caixa}>{conteudo}</div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

/** Prêmios que as construtoras deram à Place. */
export function Premiacoes({ tema = "claro" }) {
  const t = temaDe(tema);
  return (
    <div>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-x-6 gap-y-1">
        <h3 className={`text-xl font-extrabold tracking-tight sm:text-2xl ${t.titulo}`}>Reconhecida pelas construtoras</h3>
        <LinkMais href={DESTAQUES.premiacoes} tema={tema}>Ver as premiações</LinkMais>
      </div>
      <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {PREMIACOES.map((p, i) => (
          <li key={p.id} className="h-full">
            <Reveal atraso={i * 70} className={`group h-full overflow-hidden rounded-2xl border transition duration-300 hover:-translate-y-1 hover:shadow-xl ${t.caixa} ${t.hover}`}>
              <img src={IMAGENS[p.imagem]} alt={`Place Brokers premiada pela ${p.construtora}: ${p.titulo} (${p.quando})`} width="400" height="400" loading="lazy" decoding="async" className="aspect-square w-full object-cover transition duration-700 group-hover:scale-105" />
              <div className="p-3 sm:p-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#a77537]">{p.construtora}</p>
                <p className={`mt-1 text-[14px] font-bold leading-snug sm:text-[15px] ${t.titulo}`}>{p.titulo}</p>
                <p className={`mt-0.5 text-[12px] ${t.rotulo}`}>{p.quando}</p>
              </div>
            </Reveal>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Clientes que fecharam com a Place (fotos que a Place já publicou). */
export function SonhosRealizados({ tema = "claro" }) {
  const t = temaDe(tema);
  return (
    <div>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-x-6 gap-y-1">
        <div>
          <h3 className={`text-xl font-extrabold tracking-tight sm:text-2xl ${t.titulo}`}>Sonhos realizados</h3>
          <p className={`mt-1 text-[14px] ${t.texto}`}>Clientes no dia da compra, como a gente publicou no Instagram.</p>
        </div>
        <div className="flex flex-wrap gap-x-5">
          <LinkMais href={DEPOIMENTOS} tema={tema}>Ver depoimentos</LinkMais>
          <LinkMais href={DESTAQUES.clientes} tema={tema}>Ver mais clientes</LinkMais>
        </div>
      </div>
      <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
        {SONHOS_REALIZADOS.map((s, i) => (
          <li key={s.id}>
            <Reveal atraso={i * 60} className="overflow-hidden rounded-2xl">
              <img src={IMAGENS[s.imagem]} alt={`Clientes da Place Brokers: ${s.legenda}`} width="400" height="400" loading="lazy" decoding="async" className="aspect-square w-full object-cover" />
            </Reveal>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Video({ video }) {
  return (
    <a
      href={linkDoVideo(video.id)}
      target="_blank"
      rel="noreferrer"
      aria-label={`Ver no Instagram: ${video.legenda}`}
      className="group relative block aspect-9/16 overflow-hidden rounded-2xl border border-line bg-[#0b203b] shadow-sm transition duration-300 hover:-translate-y-1 hover:border-gold/60 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#ad7832]"
    >
      <img src={IMAGENS[video.capa]} alt="" width="360" height="640" loading="lazy" decoding="async" className="size-full object-cover transition-transform duration-700 group-hover:scale-105" />
      <span className="absolute right-2.5 top-2.5 grid size-8 place-items-center rounded-full bg-black/45 text-white backdrop-blur-sm" aria-hidden="true">
        <svg viewBox="0 0 24 24" className="ml-0.5 size-3.5" fill="currentColor"><path d="M8 5.5v13l10.5-6.5z" /></svg>
      </span>
    </a>
  );
}

/** Vídeos do time no Instagram (usado na página Sobre). */
export function VideosDoTime() {
  return (
    <ul className="-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-6" aria-label="Vídeos do time no Instagram">
      {VIDEOS_DO_INSTAGRAM.map((video) => (
        <li key={video.id} className="w-[42vw] max-w-[220px] shrink-0 snap-start sm:w-auto sm:max-w-none">
          <Video video={video} />
        </li>
      ))}
    </ul>
  );
}

/** Home: "Quem é a Place" com números, prêmios e clientes reais. */
export default function ProvaSocial() {
  return (
    <section id="a-place" aria-labelledby="titulo-a-place" className="mx-auto max-w-7xl scroll-mt-20 px-4 pt-20 sm:px-6">
      <div className="grid gap-6 lg:grid-cols-[1fr_1.15fr] lg:items-end">
        <Reveal>
          <p className="pb-site-eyebrow">Quem é a Place</p>
          <h2 id="titulo-a-place" className="text-2xl font-extrabold tracking-tight text-[#0b203b] sm:text-[29px]">
            Gente de verdade do seu lado
          </h2>
          <p className="mt-2 max-w-lg text-[15px] leading-relaxed text-[#516783]">
            Imobiliária de Recife desde 2023, com time próprio de corretores em Recife, na Região Metropolitana, em Caruaru e no litoral.
          </p>
        </Reveal>
        <Reveal atraso={80}>
          <NumerosDaPlace className="lg:grid-cols-4" />
        </Reveal>
      </div>

      <div className="mt-10">
        <Premiacoes />
      </div>

      <div className="mt-10">
        <SonhosRealizados />
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
        <a href={PERFIL_INSTAGRAM.url} target="_blank" rel="noreferrer" className="inline-flex min-h-12 items-center gap-2 rounded-full bg-[#0b203b] px-6 text-[14px] font-bold text-white transition hover:bg-[#13315a]">
          <Icon name="instagram" className="size-5" /> Seguir @{PERFIL_INSTAGRAM.usuario}
        </a>
        <LinkMais href={MAPA_GOOGLE}>Ler as avaliações no Google</LinkMais>
      </div>
    </section>
  );
}
