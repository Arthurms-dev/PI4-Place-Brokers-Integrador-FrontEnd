import { Icon } from "@/components/ui/Icon";
import { MAPA_GOOGLE, NUMEROS_DA_PLACE, PERFIL_INSTAGRAM, VIDEOS_DO_INSTAGRAM, linkDoVideo } from "@/lib/provaSocial";
import caruaru from "@/assets/instagram/caruaru.webp";
import maquinaDeVendas from "@/assets/instagram/maquina-de-vendas.webp";
import papoDeImovel from "@/assets/instagram/papo-de-imovel.webp";
import pedidoEspecial from "@/assets/instagram/pedido-especial.webp";
import pertoDoMar from "@/assets/instagram/perto-do-mar.webp";
import timeMetaDoMes from "@/assets/instagram/time-meta-do-mes.webp";
import Reveal from "../Reveal";

// Capas salvas no próprio site: sem script do Instagram (que põe cookies de terceiros) e sem link que expira.
const CAPAS = {
  caruaru,
  "maquina-de-vendas": maquinaDeVendas,
  "papo-de-imovel": papoDeImovel,
  "pedido-especial": pedidoEspecial,
  "perto-do-mar": pertoDoMar,
  "time-meta-do-mes": timeMetaDoMes,
};

const TEMAS = {
  claro: { caixa: "border-[#dfe7f0] bg-white shadow-sm", hover: "hover:border-[#d6af78]", valor: "text-[#0b203b]", rotulo: "text-[#5d7088]" },
  escuro: { caixa: "border-line bg-card", hover: "hover:border-gold/60", valor: "text-ink", rotulo: "text-ink-2" },
};

/** Números reais da Place (nota no Google, Instagram, CRECI e onde atua). */
export function NumerosDaPlace({ className = "", tema = "claro" }) {
  const t = TEMAS[tema] ?? TEMAS.claro;
  return (
    <ul className={`grid grid-cols-2 gap-2.5 ${className}`} aria-label="A Place Brokers em números">
      {NUMEROS_DA_PLACE.map((n) => {
        const conteudo = (
          <>
            <strong className={`flex items-center gap-1.5 text-[19px] font-extrabold leading-tight tracking-tight sm:text-[22px] ${t.valor}`}>
              {n.valor}
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

function Video({ video }) {
  return (
    <a
      href={linkDoVideo(video.id)}
      target="_blank"
      rel="noreferrer"
      aria-label={`Ver no Instagram: ${video.legenda}`}
      className="group relative block aspect-9/16 overflow-hidden rounded-2xl border border-[#dfe7f0] bg-[#0b203b] shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[#d6af78] hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#ad7832]"
    >
      <img src={CAPAS[video.capa]} alt="" width="360" height="640" loading="lazy" decoding="async" className="size-full object-cover transition-transform duration-700 group-hover:scale-105" />
      <span className="absolute right-2.5 top-2.5 grid size-8 place-items-center rounded-full bg-black/45 text-white backdrop-blur-sm" aria-hidden="true">
        <svg viewBox="0 0 24 24" className="ml-0.5 size-3.5" fill="currentColor"><path d="M8 5.5v13l10.5-6.5z" /></svg>
      </span>
    </a>
  );
}

/** "Quem é a Place": números reais e vídeos do time no Instagram. */
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
            A Place Brokers é uma imobiliária de Recife com time próprio de corretores. Veja o dia a dia de quem vai cuidar do seu atendimento.
          </p>
        </Reveal>
        <Reveal atraso={80}>
          <NumerosDaPlace className="lg:grid-cols-4" />
        </Reveal>
      </div>

      <Reveal atraso={120} className="mt-6">
        <ul className="-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-6" aria-label="Vídeos do time no Instagram">
          {VIDEOS_DO_INSTAGRAM.map((video) => (
            <li key={video.id} className="w-[42vw] max-w-[220px] shrink-0 snap-start sm:w-auto sm:max-w-none">
              <Video video={video} />
            </li>
          ))}
        </ul>
      </Reveal>

      <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3">
        <a href={PERFIL_INSTAGRAM.url} target="_blank" rel="noreferrer" className="inline-flex min-h-12 items-center gap-2 rounded-full bg-[#0b203b] px-6 text-[14px] font-bold text-white transition hover:bg-[#13315a]">
          <Icon name="instagram" className="size-5" /> Seguir @{PERFIL_INSTAGRAM.usuario}
        </a>
        <a href={MAPA_GOOGLE} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center gap-1.5 text-[14px] font-semibold text-[#8a5d22] underline-offset-4 hover:underline">
          Ler as avaliações no Google <Icon name="arrowRight" className="size-4" />
        </a>
      </div>
    </section>
  );
}
