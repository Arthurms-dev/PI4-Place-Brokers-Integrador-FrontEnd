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
  DIA_A_DIA,
  VIDEO_FAMILIA,
} from "@/lib/provaSocial";
import clienteCarrilho from "@/assets/instagram/cliente-carrilho.webp";
import clienteCasal from "@/assets/instagram/cliente-casal.webp";
import clienteChaveHouly from "@/assets/instagram/cliente-chave-houly.webp";
import clienteChavePlace from "@/assets/instagram/cliente-chave-place.webp";
import clienteFamiliaSonho from "@/assets/instagram/cliente-familia-sonho.webp";
import clienteFeirao from "@/assets/instagram/cliente-feirao.webp";
import diaFestaTime from "@/assets/instagram/dia-festa-time.webp";
import diaMaquete from "@/assets/instagram/dia-maquete.webp";
import diaSelfieTime from "@/assets/instagram/dia-selfie-time.webp";
import premioBoraAbril2025 from "@/assets/instagram/premio-bora-abril-2025.webp";
import premioCarrilhoAbril2025 from "@/assets/instagram/premio-carrilho-abril-2025.webp";
import premioCarrilhoMelhores2025 from "@/assets/instagram/premio-carrilho-melhores-2025.webp";
import premioMaxplural2024 from "@/assets/instagram/premio-maxplural-2024.webp";
import videoFamiliaFeliz from "@/assets/instagram/video-familia-feliz.webp";
import clienteUsina from "@/assets/instagram/cliente-usina.webp";
import clienteCasaConcreto from "@/assets/instagram/cliente-casa-concreto.webp";
import clienteHoulyTrio from "@/assets/instagram/cliente-houly-trio.webp";
import clienteHoulyEntrada from "@/assets/instagram/cliente-houly-entrada.webp";
import clienteFeira from "@/assets/instagram/cliente-feira.webp";
import clientePlaceQuatro from "@/assets/instagram/cliente-place-quatro.webp";
import premioCarrilhoAgosto2026 from "@/assets/instagram/premio-carrilho-agosto-2026.webp";
import diaAtendimento from "@/assets/instagram/dia-atendimento.webp";
import diaPlantao from "@/assets/instagram/dia-plantao.webp";
import diaEscritorio from "@/assets/instagram/dia-escritorio.webp";
import Reveal from "../Reveal";

// Imagens salvas no próprio site: sem script do Instagram (que põe cookies de terceiros) e sem link que expira.
const IMAGENS = {
  "cliente-usina": clienteUsina,
  "cliente-casa-concreto": clienteCasaConcreto,
  "cliente-houly-trio": clienteHoulyTrio,
  "cliente-houly-entrada": clienteHoulyEntrada,
  "cliente-feira": clienteFeira,
  "cliente-place-quatro": clientePlaceQuatro,
  "premio-carrilho-agosto-2026": premioCarrilhoAgosto2026,
  "dia-atendimento": diaAtendimento,
  "dia-plantao": diaPlantao,
  "dia-escritorio": diaEscritorio,
  "cliente-carrilho": clienteCarrilho,
  "cliente-casal": clienteCasal,
  "cliente-chave-houly": clienteChaveHouly,
  "cliente-chave-place": clienteChavePlace,
  "cliente-familia-sonho": clienteFamiliaSonho,
  "cliente-feirao": clienteFeirao,
  "dia-festa-time": diaFestaTime,
  "dia-maquete": diaMaquete,
  "dia-selfie-time": diaSelfieTime,
  "premio-bora-abril-2025": premioBoraAbril2025,
  "premio-carrilho-abril-2025": premioCarrilhoAbril2025,
  "premio-carrilho-melhores-2025": premioCarrilhoMelhores2025,
  "premio-maxplural-2024": premioMaxplural2024,
  "video-familia-feliz": videoFamiliaFeliz,
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
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
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
      <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {SONHOS_REALIZADOS.map((s, i) => (
          <li key={s.id}>
            <Reveal atraso={(i % 4) * 60} className="group overflow-hidden rounded-2xl">
              <img src={IMAGENS[s.imagem]} alt={`Clientes da Place Brokers: ${s.legenda}`} width="480" height="640" loading="lazy" decoding="async" className="aspect-3/4 w-full object-cover transition duration-700 group-hover:scale-105" />
            </Reveal>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** O time no dia a dia: fotos da Place e o vídeo da família recebendo as chaves (página Sobre). */
export function DiaADia() {
  return (
    <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4" aria-label="O time da Place no dia a dia">
      <li className="row-span-2">
        <a href={VIDEO_FAMILIA.url} target="_blank" rel="noreferrer" aria-label={`Ver no Instagram: ${VIDEO_FAMILIA.legenda}`}
          className="group relative block h-full min-h-[300px] overflow-hidden rounded-2xl border border-line bg-[#0b203b] transition duration-300 hover:-translate-y-1 hover:border-gold/60 hover:shadow-lg">
          <img src={IMAGENS[VIDEO_FAMILIA.capa]} alt="" width="360" height="640" loading="lazy" decoding="async" className="absolute inset-0 size-full object-cover transition-transform duration-700 group-hover:scale-105" />
          <span className="absolute right-2.5 top-2.5 grid size-9 place-items-center rounded-full bg-black/50 text-white backdrop-blur-sm" aria-hidden="true">
            <svg viewBox="0 0 24 24" className="ml-0.5 size-4" fill="currentColor"><path d="M8 5.5v13l10.5-6.5z" /></svg>
          </span>
        </a>
      </li>
      {DIA_A_DIA.map((f, i) => (
        <li key={f.id}>
          <Reveal atraso={i * 70} className="group overflow-hidden rounded-2xl">
            <img src={IMAGENS[f.imagem]} alt={f.legenda} width="480" height="480" loading="lazy" decoding="async" className="aspect-square w-full object-cover transition duration-700 group-hover:scale-105" />
          </Reveal>
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
